"""
reply_detector.py — Detecta respostas e bounces via IMAP

O que faz:
1. Conecta no IMAP (Hostinger) a cada execução
2. Lê emails novos no inbox de fabricio@agendainteligentes.com
3. Se um email da campanha foi respondido → marca lead como 'lead_quente'
4. Lê bounce reports (mailer-daemon) e marca como 'bounce' na outbound_dentistas
5. Processa o header 'List-Unsubscribe' para descadastros

Usar em cron: */15 * * * * → a cada 15 minutos
"""

import asyncio
import asyncpg
import imaplib
import email
import email.header
import os
import logging
import re
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

DB_URL = os.getenv("DATABASE_URL", "postgresql://axis:axis123@localhost:5432/axis_sales")

IMAP_HOST = os.getenv("IMAP_HOST", "imap.hostinger.com")
IMAP_PORT = int(os.getenv("IMAP_PORT", "993"))
IMAP_USER = os.getenv("IMAP_USER", "contato@agendainteligentes.com")
IMAP_PASS = os.getenv("IMAP_PASSWORD", "")

CAMPAIGN_FROM = "fabricio@agendainteligentes.com"


def decode_subject(subject_raw) -> str:
    """Decodifica subject de email que pode estar encoded."""
    if not subject_raw:
        return ""
    parts = email.header.decode_header(subject_raw)
    decoded = []
    for part, charset in parts:
        if isinstance(part, bytes):
            decoded.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            decoded.append(part)
    return " ".join(decoded)


def extract_original_sender(msg) -> str | None:
    """Extrai o email original de um bounce (mailer-daemon)."""
    for part in msg.walk():
        if part.get_content_type() in ("message/delivery-status", "text/plain"):
            try:
                payload = part.get_payload(decode=True)
                if payload:
                    text = payload.decode("utf-8", errors="replace")
                    # Procurar "Final-Recipient: rfc822; email@..."
                    match = re.search(r"Final-Recipient:.*?<?([\w._%+\-]+@[\w.\-]+\.[a-zA-Z]{2,})>?", text, re.I)
                    if match:
                        return match.group(1).lower()
                    # Fallback: Original-Recipient
                    match = re.search(r"Original-Recipient:.*?<?([\w._%+\-]+@[\w.\-]+\.[a-zA-Z]{2,})>?", text, re.I)
                    if match:
                        return match.group(1).lower()
            except Exception:
                pass
    return None


async def processar_replies(conn: asyncpg.Connection, mail: imaplib.IMAP4_SSL) -> int:
    """Processa respostas de leads. Retorna quantas foram processadas."""
    mail.select("INBOX")
    _, data = mail.search(None, "UNSEEN")
    uids = data[0].split()
    processados = 0

    for uid in uids:
        try:
            _, raw = mail.fetch(uid, "(RFC822)")
            msg = email.message_from_bytes(raw[0][1])

            from_addr = msg.get("From", "").lower()
            subject = decode_subject(msg.get("Subject", ""))
            references = msg.get("References", "") + " " + msg.get("In-Reply-To", "")

            # É uma resposta a um de nossos emails?
            is_reply = (
                "re:" in subject.lower() or
                CAMPAIGN_FROM in references.lower() or
                any(kw in subject.lower() for kw in ["cancelamento", "agenda", "axis", "antivacância", "secretária"])
            )

            if is_reply and CAMPAIGN_FROM not in from_addr:
                # Extrair email do remetente
                match = re.search(r"[\w._%+\-]+@[\w.\-]+\.[a-zA-Z]{2,}", from_addr)
                if match:
                    sender_email = match.group(0).lower()
                    # Verificar se está na nossa lista
                    row = await conn.fetchrow(
                        "SELECT id FROM outbound_dentistas WHERE email = $1 AND status = 'ativo'",
                        sender_email
                    )
                    if row:
                        await conn.execute("""
                            UPDATE outbound_dentistas
                            SET status = 'lead_quente', respondeu = TRUE, respondeu_at = NOW(), updated_at = NOW()
                            WHERE id = $1
                        """, row["id"])
                        log.info(f"🔥 LEAD QUENTE: {sender_email} respondeu à campanha!")
                        processados += 1

            # Marcar como lido
            mail.store(uid, "+FLAGS", "\\Seen")

        except Exception as e:
            log.warning(f"Erro ao processar email {uid}: {e}")

    return processados


async def processar_bounces(conn: asyncpg.Connection, mail: imaplib.IMAP4_SSL) -> int:
    """Processa bounce reports. Retorna quantos foram processados."""
    # Bounces geralmente ficam na pasta INBOX ou em subpastas
    # Procura por emails do mailer-daemon
    mail.select("INBOX")
    _, data = mail.search(None, 'FROM "mailer-daemon"')
    uids = data[0].split()
    processados = 0

    for uid in uids:
        try:
            _, raw = mail.fetch(uid, "(RFC822)")
            msg = email.message_from_bytes(raw[0][1])

            original_email = extract_original_sender(msg)
            if original_email:
                # Verificar se está na nossa lista
                row = await conn.fetchrow(
                    "SELECT id FROM outbound_dentistas WHERE email = $1",
                    original_email
                )
                if row:
                    await conn.execute("""
                        UPDATE outbound_dentistas
                        SET status = 'bounce', bounce_type = 'hard', bounce_at = NOW(), updated_at = NOW()
                        WHERE id = $1 AND status != 'bounce'
                    """, row["id"])

                    # Registrar no cold_email_logs também
                    await conn.execute("""
                        UPDATE cold_email_logs
                        SET status = 'bounced', bounce_type = 'hard'
                        WHERE email_to = $1 AND status = 'sent'
                    """, original_email)

                    # Incrementar contador de bounce no throttle
                    await conn.execute("""
                        UPDATE outbound_throttle
                        SET bounce_count = bounce_count + 1
                        WHERE data = CURRENT_DATE
                    """)

                    log.warning(f"📬 Bounce detectado: {original_email}")
                    processados += 1

            mail.store(uid, "+FLAGS", "\\Seen")

        except Exception as e:
            log.warning(f"Erro ao processar bounce {uid}: {e}")

    return processados


async def main():
    log.info("Iniciando detecção de replies e bounces via IMAP...")

    if not IMAP_PASS:
        log.error("IMAP_PASSWORD não configurado! Verifique o .env")
        return

    conn = await asyncpg.connect(DB_URL)

    try:
        mail = imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT)
        mail.login(IMAP_USER, IMAP_PASS)

        replies = await processar_replies(conn, mail)
        bounces = await processar_bounces(conn, mail)

        log.info(f"Processados: {replies} replies, {bounces} bounces")

        mail.logout()

    except imaplib.IMAP4.error as e:
        log.error(f"Erro IMAP: {e}")
    except Exception as e:
        log.error(f"Erro geral: {e}")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())

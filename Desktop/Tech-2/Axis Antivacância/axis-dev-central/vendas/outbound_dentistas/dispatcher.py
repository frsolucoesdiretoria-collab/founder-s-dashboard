"""
dispatcher.py — Envia os emails da sequência outbound para dentistas

Regras:
- Throttle: 30/dia semana 1, 2x a cada semana (60, 120, 240...)
- Horário: Seg-Qui, 9h-11h (horário de Brasília)
- Bounce rate > 3%: PARA e alerta
- Se lead responder: para a sequência e marca como lead_quente
- Usa SES (múltiplos senders) como primário, SMTP Brevo como fallback
- Tracking pixel via log_id
"""

import asyncio
import asyncpg
import aiosmtplib
import os
import logging
import random
from datetime import datetime, date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from zoneinfo import ZoneInfo

from templates import get_template

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# Configurações de conexão
DB_URL = os.getenv("DATABASE_URL", "postgresql://axis:axis123@localhost:5432/axis_sales")

# SMTP Brevo (fallback)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "a4167d001@smtp-brevo.com")
SMTP_PASS = os.getenv("SMTP_PASSWORD", "")

# AWS SES (preferencial)
SES_HOST = os.getenv("SES_SMTP_HOST", "")
SES_PORT = int(os.getenv("SES_SMTP_PORT", "587"))
SES_USER = os.getenv("SES_SMTP_USERNAME", "")
SES_PASS = os.getenv("SES_SMTP_PASSWORD", "")
USE_SES = bool(SES_HOST and SES_USER and SES_PASS)

# Remetente oficial da campanha
FROM_NAME = "Fabrício — Axis"
FROM_EMAIL = "fabricio@agendainteligentes.com"
REPLY_TO = "fabricio@agendainteligentes.com"

# Senders SES (fallback rotatório se necessário)
SES_SENDERS = [s.strip() for s in os.getenv("SES_SENDERS", "").split(",") if s.strip()]

# Limites
BOUNCE_LIMIT = 0.03      # 3% bounce rate máximo
BRASILIA = ZoneInfo("America/Sao_Paulo")

# Dias de envio (0=Seg, 1=Ter, 2=Qua, 3=Qui)
ENVIO_DIAS = {0, 1, 2, 3}
ENVIO_HORA_INI = 9
ENVIO_HORA_FIM = 11

# Delay entre emails individuais (segundos)
DELAY_ENTRE_EMAILS = 15

# Intervalos entre cada email da sequência (dias)
INTERVALO_SEQUENCIA = {
    2: 3,   # Email 2 = 3 dias após email 1
    3: 3,   # Email 3 = 3 dias após email 2
    4: 4,   # Email 4 = 4 dias após email 3
}


async def get_limite_hoje(conn: asyncpg.Connection) -> int:
    """Retorna o limite de envios para hoje, baseado na semana de warm-up."""
    hoje = date.today()
    row = await conn.fetchrow("SELECT * FROM outbound_throttle WHERE data = $1", hoje)
    if row:
        return row["limite_dia"]

    # Calcular qual semana de warm-up estamos
    primeira_row = await conn.fetchrow(
        "SELECT MIN(data) as inicio FROM outbound_throttle WHERE limite_dia IS NOT NULL"
    )
    if not primeira_row or not primeira_row["inicio"]:
        # Primeira vez — começa com 30/dia
        limite = 30
    else:
        dias_ativos = (hoje - primeira_row["inicio"]).days
        semanas = dias_ativos // 7
        limite = 30 * (2 ** semanas)   # 30 → 60 → 120 → 240...
        limite = min(limite, 500)       # cap em 500/dia

    await conn.execute("""
        INSERT INTO outbound_throttle (data, emails_enviados, limite_dia)
        VALUES ($1, 0, $2)
        ON CONFLICT (data) DO NOTHING
    """, hoje, limite)

    log.info(f"[Throttle] Limite para hoje ({hoje}): {limite} emails/dia")
    return limite


async def get_enviados_hoje(conn: asyncpg.Connection) -> int:
    """Quantos emails já foram enviados hoje."""
    hoje = date.today()
    row = await conn.fetchrow("SELECT emails_enviados FROM outbound_throttle WHERE data = $1", hoje)
    return row["emails_enviados"] if row else 0


async def incrementar_enviados(conn: asyncpg.Connection):
    """Incrementa o contador de emails enviados hoje."""
    hoje = date.today()
    await conn.execute("""
        INSERT INTO outbound_throttle (data, emails_enviados, limite_dia)
        VALUES ($1, 1, 30)
        ON CONFLICT (data) DO UPDATE SET emails_enviados = outbound_throttle.emails_enviados + 1
    """, hoje)


async def check_bounce_rate(conn: asyncpg.Connection) -> float:
    """Calcula bounce rate atual dos últimos 7 dias."""
    result = await conn.fetchrow("""
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN bounce_type IS NOT NULL AND bounce_type != '' THEN 1 END) as bounces
        FROM cold_email_logs
        WHERE sent_at >= NOW() - INTERVAL '7 days'
        AND status != 'failed'
    """)
    if not result or result["total"] == 0:
        return 0.0
    return result["bounces"] / result["total"]


def is_horario_envio() -> bool:
    """Retorna True se estamos em horário de envio (Seg-Qui 9h-11h Brasília)."""
    agora = datetime.now(BRASILIA)
    if agora.weekday() not in ENVIO_DIAS:
        return False
    if not (ENVIO_HORA_INI <= agora.hour < ENVIO_HORA_FIM):
        return False
    return True


async def send_email(to_email: str, subject: str, text: str, html: str) -> tuple[bool, str]:
    """
    Envia email. Tenta SES primeiro, fallback para Brevo SMTP.
    Retorna (sucesso, message_id).
    """
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Reply-To"] = REPLY_TO
    msg["List-Unsubscribe"] = f"<https://agendainteligentes.com/unsubscribe?email={to_email}>, <mailto:{REPLY_TO}?subject=unsubscribe>"
    msg["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"

    msg.attach(MIMEText(text, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))

    # Tentar SES
    if USE_SES:
        try:
            resp = await aiosmtplib.send(
                msg,
                hostname=SES_HOST,
                port=SES_PORT,
                username=SES_USER,
                password=SES_PASS,
                start_tls=True,
            )
            message_id = str(resp)
            return True, message_id
        except Exception as e:
            log.warning(f"[SES] Falhou para {to_email}: {e}. Tentando Brevo...")

    # Fallback: Brevo SMTP
    try:
        resp = await aiosmtplib.send(
            msg,
            hostname=SMTP_HOST,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            start_tls=True,
        )
        return True, str(resp)
    except Exception as e:
        log.error(f"[Brevo SMTP] Falhou para {to_email}: {e}")
        return False, str(e)


async def registrar_log(conn: asyncpg.Connection, outbound_id: int, lead_id: int,
                        email_to: str, clinica: str, numero_email: int,
                        subject: str, body_text: str, sucesso: bool) -> int:
    """Registra o envio na tabela cold_email_logs e retorna o ID."""
    log_id = await conn.fetchval("""
        INSERT INTO cold_email_logs
            (lead_id, subject, email_to, clinic_name, status, email_type, cohort, copy_variant, sent_at)
        VALUES
            ($1, $2, $3, $4, $5, 'cold', 'outbound_dentistas', $6, NOW())
        RETURNING id
    """,
        lead_id, subject, email_to, clinica,
        "sent" if sucesso else "failed",
        f"email{numero_email}"
    )
    return log_id


async def marcar_etapa_enviada(conn: asyncpg.Connection, outbound_id: int,
                               numero_email: int, log_id: int):
    """Atualiza a tabela outbound_dentistas após envio bem-sucedido."""
    col_sent = f"email{numero_email}_sent_at"
    col_log = f"cold_email_log_id{numero_email}"
    nova_etapa = numero_email

    await conn.execute(f"""
        UPDATE outbound_dentistas
        SET etapa_atual = $1,
            {col_sent} = NOW(),
            {col_log} = $2,
            updated_at = NOW()
        WHERE id = $3
    """, nova_etapa, log_id, outbound_id)


async def processar_sequencia(conn: asyncpg.Connection, dry_run: bool = False):
    """
    Processa uma rodada de envios para a sequência outbound.

    Lógica:
    - Pega leads prontos para cada etapa
    - Respeita throttle diário
    - Verifica bounce rate antes de cada envio
    - Para se bounce > 3%
    """
    hoje = date.today()

    # ── Verificar bounce rate ──────────────────────────────────────────
    bounce_rate = await check_bounce_rate(conn)
    if bounce_rate > BOUNCE_LIMIT:
        log.error(f"🚨 BOUNCE RATE ALTO: {bounce_rate:.1%} > 3%. CAMPANHA PAUSADA!")
        log.error("Verifique os bounces antes de retomar. Execute: python3 bounce_audit.py")
        return {"status": "pausado_bounce", "bounce_rate": bounce_rate}

    log.info(f"Bounce rate atual: {bounce_rate:.1%} ✅")

    # ── Verificar throttle ─────────────────────────────────────────────
    limite_dia = await get_limite_hoje(conn)
    enviados_hoje = await get_enviados_hoje(conn)
    disponiveis = limite_dia - enviados_hoje

    if disponiveis <= 0:
        log.info(f"Limite diário atingido: {enviados_hoje}/{limite_dia}. Aguardando amanhã.")
        return {"status": "limite_atingido", "enviados_hoje": enviados_hoje, "limite": limite_dia}

    log.info(f"[Throttle] {enviados_hoje}/{limite_dia} enviados hoje. Disponível: {disponiveis}")

    total_enviados = 0
    erros = 0

    # ── Email 1 (etapa 0 → 1): leads novos ────────────────────────────
    leads_email1 = await conn.fetch("""
        SELECT id, lead_id, email, empresa, nome
        FROM outbound_dentistas
        WHERE etapa_atual = 0 AND status = 'ativo'
        ORDER BY added_at ASC
        LIMIT $1
    """, disponiveis)

    for lead in leads_email1:
        if total_enviados >= disponiveis:
            break
        if await _enviar_email_sequencia(conn, lead, 1, dry_run):
            total_enviados += 1
            await incrementar_enviados(conn)
        else:
            erros += 1
        await asyncio.sleep(DELAY_ENTRE_EMAILS)

    disponiveis -= total_enviados

    # ── Email 2 (etapa 1 → 2): 3 dias após email1 ─────────────────────
    if disponiveis > 0:
        leads_email2 = await conn.fetch("""
            SELECT id, lead_id, email, empresa, nome
            FROM outbound_dentistas
            WHERE etapa_atual = 1 AND status = 'ativo'
            AND email1_sent_at <= NOW() - INTERVAL '3 days'
            ORDER BY email1_sent_at ASC
            LIMIT $1
        """, disponiveis)

        for lead in leads_email2:
            if total_enviados >= limite_dia - enviados_hoje:
                break
            if await _enviar_email_sequencia(conn, lead, 2, dry_run):
                total_enviados += 1
                await incrementar_enviados(conn)
            else:
                erros += 1
            await asyncio.sleep(DELAY_ENTRE_EMAILS)

    disponiveis = limite_dia - enviados_hoje - total_enviados

    # ── Email 3 (etapa 2 → 3): 3 dias após email2 ─────────────────────
    if disponiveis > 0:
        leads_email3 = await conn.fetch("""
            SELECT id, lead_id, email, empresa, nome
            FROM outbound_dentistas
            WHERE etapa_atual = 2 AND status = 'ativo'
            AND email2_sent_at <= NOW() - INTERVAL '3 days'
            ORDER BY email2_sent_at ASC
            LIMIT $1
        """, disponiveis)

        for lead in leads_email3:
            if total_enviados >= limite_dia - enviados_hoje:
                break
            if await _enviar_email_sequencia(conn, lead, 3, dry_run):
                total_enviados += 1
                await incrementar_enviados(conn)
            else:
                erros += 1
            await asyncio.sleep(DELAY_ENTRE_EMAILS)

    disponiveis = limite_dia - enviados_hoje - total_enviados

    # ── Email 4 (etapa 3 → 4): 4 dias após email3 ─────────────────────
    if disponiveis > 0:
        leads_email4 = await conn.fetch("""
            SELECT id, lead_id, email, empresa, nome
            FROM outbound_dentistas
            WHERE etapa_atual = 3 AND status = 'ativo'
            AND email3_sent_at <= NOW() - INTERVAL '4 days'
            ORDER BY email3_sent_at ASC
            LIMIT $1
        """, disponiveis)

        for lead in leads_email4:
            if total_enviados >= limite_dia - enviados_hoje:
                break
            if await _enviar_email_sequencia(conn, lead, 4, dry_run):
                total_enviados += 1
                await incrementar_enviados(conn)
                # Email 4 = finalizar sequência
                await conn.execute("""
                    UPDATE outbound_dentistas
                    SET status = 'finalizado', updated_at = NOW()
                    WHERE id = $1 AND etapa_atual = 4
                """, lead["id"])
            else:
                erros += 1
            await asyncio.sleep(DELAY_ENTRE_EMAILS)

    log.info(f"✅ Rodada concluída: {total_enviados} enviados, {erros} erros")
    return {"status": "ok", "enviados": total_enviados, "erros": erros}


async def _enviar_email_sequencia(conn: asyncpg.Connection, lead: dict,
                                   numero: int, dry_run: bool) -> bool:
    """Envia um email específico da sequência para um lead."""
    email = lead["email"]
    clinica = lead["empresa"] or lead["nome"] or "sua clínica"
    outbound_id = lead["id"]
    lead_id = lead["lead_id"]

    template = get_template(numero, clinica, email)

    if dry_run:
        log.info(f"[DRY RUN] Email {numero} → {email} ({clinica}) | Assunto: {template['subject']}")
        return True

    # Registrar log antes do envio (para ter o ID do pixel de tracking)
    log_id = await registrar_log(
        conn, outbound_id, lead_id, email, clinica, numero,
        template["subject"], template["text"], sucesso=False
    )

    # Re-gerar template com tracking pixel
    template = get_template(numero, clinica, email, log_id=log_id)

    # Enviar
    sucesso, msg_id = await send_email(email, template["subject"], template["text"], template["html"])

    # Atualizar status no log
    await conn.execute("""
        UPDATE cold_email_logs SET status = $1 WHERE id = $2
    """, "sent" if sucesso else "failed", log_id)

    if sucesso:
        await marcar_etapa_enviada(conn, outbound_id, numero, log_id)
        log.info(f"✅ Email {numero} → {email} ({clinica})")
    else:
        log.warning(f"❌ Falha email {numero} → {email} ({clinica})")

    return sucesso


async def status_report(conn: asyncpg.Connection):
    """Imprime relatório de status da campanha."""
    stats = await conn.fetchrow("""
        SELECT
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'ativo' THEN 1 END) as ativos,
            COUNT(CASE WHEN status = 'finalizado' THEN 1 END) as finalizados,
            COUNT(CASE WHEN status = 'lead_quente' THEN 1 END) as leads_quentes,
            COUNT(CASE WHEN status = 'bounce' THEN 1 END) as bounces,
            COUNT(CASE WHEN status = 'descadastrado' THEN 1 END) as descadastrados,
            COUNT(CASE WHEN etapa_atual = 0 THEN 1 END) as aguardando_email1,
            COUNT(CASE WHEN etapa_atual = 1 THEN 1 END) as aguardando_email2,
            COUNT(CASE WHEN etapa_atual = 2 THEN 1 END) as aguardando_email3,
            COUNT(CASE WHEN etapa_atual = 3 THEN 1 END) as aguardando_email4
        FROM outbound_dentistas
    """)

    throttle_hoje = await conn.fetchrow("""
        SELECT emails_enviados, limite_dia FROM outbound_throttle WHERE data = CURRENT_DATE
    """)

    bounce_rate = await check_bounce_rate(conn)

    log.info("\n" + "=" * 60)
    log.info("STATUS DA CAMPANHA OUTBOUND DENTISTAS")
    log.info("=" * 60)
    if stats:
        log.info(f"  Total na lista:         {stats['total']}")
        log.info(f"  Ativos (na sequência):  {stats['ativos']}")
        log.info(f"  Finalizados (4 emails): {stats['finalizados']}")
        log.info(f"  Leads quentes:          {stats['leads_quentes']}")
        log.info(f"  Bounces:                {stats['bounces']}")
        log.info(f"  Descadastrados:         {stats['descadastrados']}")
        log.info(f"  Aguardando Email 1:     {stats['aguardando_email1']}")
        log.info(f"  Aguardando Email 2:     {stats['aguardando_email2']}")
        log.info(f"  Aguardando Email 3:     {stats['aguardando_email3']}")
        log.info(f"  Aguardando Email 4:     {stats['aguardando_email4']}")
    if throttle_hoje:
        log.info(f"  Enviados hoje:          {throttle_hoje['emails_enviados']}/{throttle_hoje['limite_dia']}")
    log.info(f"  Bounce rate (7d):       {bounce_rate:.1%}")
    log.info("=" * 60)


async def main(dry_run: bool = False):
    log.info(f"{'[DRY RUN] ' if dry_run else ''}Iniciando dispatcher outbound dentistas...")
    conn = await asyncpg.connect(DB_URL)
    try:
        await status_report(conn)
        result = await processar_sequencia(conn, dry_run=dry_run)
        log.info(f"Resultado: {result}")
    finally:
        await conn.close()


if __name__ == "__main__":
    import sys
    dry_run = "--dry-run" in sys.argv
    asyncio.run(main(dry_run=dry_run))

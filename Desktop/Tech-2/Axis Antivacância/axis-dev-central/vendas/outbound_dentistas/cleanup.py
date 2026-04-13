#!/usr/bin/env python3
"""
cleanup.py — Limpeza e exportação de leads dentistas para outbound

O que faz:
1. Faz backup CSV de todos os leads dentistas com email
2. Remove (marca como inválido) emails com formato inválido
3. Exporta lista limpa de dentistas para a tabela outbound_dentistas
4. Gera relatório final

Uso: python3 cleanup.py
"""

import asyncio
import csv
import os
import logging
from datetime import datetime
from pathlib import Path
import asyncpg

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# Conexão com o banco (Docker, porta 5432 exposta)
DB_URL = os.getenv("DATABASE_URL", "postgresql://axis:axis123@localhost:5432/axis_sales")

# Keywords de dentistas / odontologia
DENTAL_KEYWORDS = [
    "odont", "dent", "ortodon", "implant", "endodont",
    "periodont", "sorriso", "oral", "buco", "estética dental",
    "clínica odontológica", "consultório odontológico",
]

# Domínios descartáveis conhecidos
DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com",
    "throwam.com", "yopmail.com", "maildrop.cc", "dispostable.com",
    "fakeinbox.com", "trashmail.com", "spamgourmet.com",
}

BACKUP_DIR = Path(__file__).parent / "backups"


def is_dental(lead: dict) -> bool:
    """Retorna True se o lead é de clínica odontológica."""
    fields = [
        (lead.get("especialidade") or "").lower(),
        (lead.get("empresa") or "").lower(),
        (lead.get("setor") or "").lower(),
        (lead.get("nome") or "").lower(),
    ]
    for field in fields:
        for kw in DENTAL_KEYWORDS:
            if kw in field:
                return True
    return False


def is_valid_email(email: str) -> tuple[bool, str]:
    """
    Valida o email. Retorna (valido, motivo_invalido).
    """
    if not email or not email.strip():
        return False, "vazio"

    email = email.strip().lower()

    # Email começando com ponto (ex: .@dominio.com)
    if email.startswith("."):
        return False, "inicia_com_ponto"

    # Sem @
    if "@" not in email:
        return False, "sem_arroba"

    parts = email.split("@")
    if len(parts) != 2:
        return False, "formato_invalido"

    local, domain = parts

    if not local or not domain:
        return False, "local_ou_dominio_vazio"

    # Domínio sem ponto
    if "." not in domain:
        return False, "dominio_invalido"

    # Domínio descartável
    if domain in DISPOSABLE_DOMAINS:
        return False, "dominio_descartavel"

    # Caracteres inválidos no local part
    invalid_chars = set(' ,;:()')
    if any(c in invalid_chars for c in local):
        return False, "caracteres_invalidos"

    return True, ""


async def run_cleanup():
    log.info("=" * 60)
    log.info("LIMPEZA E EXPORTAÇÃO DE LEADS DENTISTAS")
    log.info("=" * 60)

    BACKUP_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")

    conn = await asyncpg.connect(DB_URL)

    try:
        # ── 1. CARREGAR TODOS OS LEADS COM EMAIL ──────────────────────────
        log.info("Carregando leads com email do banco...")
        rows = await conn.fetch("""
            SELECT id, nome, empresa, email, especialidade, setor, status
            FROM leads
            WHERE email IS NOT NULL AND email != ''
            ORDER BY id
        """)
        log.info(f"Total leads com email: {len(rows)}")

        # ── 2. CLASSIFICAR ────────────────────────────────────────────────
        todos = [dict(r) for r in rows]
        dentistas = [r for r in todos if is_dental(r)]
        log.info(f"Dentistas identificados: {len(dentistas)}")

        # ── 3. BACKUP CSV (antes de qualquer alteração) ───────────────────
        backup_file = BACKUP_DIR / f"backup_dentistas_{ts}.csv"
        with open(backup_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["id", "nome", "empresa", "email", "especialidade", "setor", "status"])
            writer.writeheader()
            writer.writerows(dentistas)
        log.info(f"✅ Backup salvo: {backup_file} ({len(dentistas)} registros)")

        # ── 4. LIMPAR EMAILS INVÁLIDOS ────────────────────────────────────
        invalidos = []
        validos = []
        for lead in dentistas:
            ok, motivo = is_valid_email(lead["email"])
            if ok:
                validos.append(lead)
            else:
                invalidos.append({**lead, "motivo": motivo})

        log.info(f"Emails válidos: {len(validos)}")
        log.info(f"Emails inválidos para remoção: {len(invalidos)}")

        if invalidos:
            log.info("Emails inválidos encontrados:")
            for inv in invalidos:
                log.info(f"  [{inv['motivo']}] {inv['email']} — {inv['empresa']}")

            # Marcar como inválido no banco (não deletar, apenas marcar)
            invalid_ids = [inv["id"] for inv in invalidos]
            await conn.execute("""
                UPDATE leads SET status = 'email_invalido'
                WHERE id = ANY($1::int[])
            """, invalid_ids)
            log.info(f"✅ {len(invalidos)} emails marcados como inválidos no banco")

        # ── 5. VERIFICAR BOUNCES NA TABELA cold_email_logs ───────────────
        bounce_emails = await conn.fetch("""
            SELECT DISTINCT email_to
            FROM cold_email_logs
            WHERE bounce_type IS NOT NULL AND bounce_type != ''
            OR status = 'bounced'
        """)
        bounce_set = {r["email_to"] for r in bounce_emails}
        log.info(f"Bounces históricos encontrados: {len(bounce_set)}")

        # Filtrar bounces
        sem_bounce = [l for l in validos if l["email"].lower() not in bounce_set]
        log.info(f"Leads válidos sem bounce: {len(sem_bounce)}")

        # ── 6. VERIFICAR DUPLICATAS NA outbound_dentistas ─────────────────
        existing = await conn.fetch("SELECT email FROM outbound_dentistas WHERE email IS NOT NULL")
        existing_emails = {r["email"].lower() for r in existing}
        log.info(f"Já na lista outbound: {len(existing_emails)}")

        novos = [l for l in sem_bounce if l["email"].lower() not in existing_emails]
        log.info(f"Novos para adicionar: {len(novos)}")

        # ── 7. POPULAR tabela outbound_dentistas ──────────────────────────
        if novos:
            inseridos = 0
            for lead in novos:
                try:
                    await conn.execute("""
                        INSERT INTO outbound_dentistas (lead_id, email, empresa, nome, status)
                        VALUES ($1, $2, $3, $4, 'ativo')
                        ON CONFLICT DO NOTHING
                    """, lead["id"], lead["email"].strip().lower(),
                        lead["empresa"] or "", lead["nome"] or "")
                    inseridos += 1
                except Exception as e:
                    log.warning(f"Erro ao inserir {lead['email']}: {e}")

            log.info(f"✅ {inseridos} leads dentistas adicionados à lista outbound_dentistas")

        # ── 8. RELATÓRIO FINAL ────────────────────────────────────────────
        total_outbound = await conn.fetchval("SELECT COUNT(*) FROM outbound_dentistas WHERE status = 'ativo'")
        log.info("\n" + "=" * 60)
        log.info("RELATÓRIO FINAL")
        log.info("=" * 60)
        log.info(f"  Total leads com email no banco:    {len(todos)}")
        log.info(f"  Dentistas identificados:           {len(dentistas)}")
        log.info(f"  Emails inválidos removidos:        {len(invalidos)}")
        log.info(f"  Bounces históricos filtrados:      {len(bounce_set)}")
        log.info(f"  Novos adicionados ao outbound:     {len(novos)}")
        log.info(f"  TOTAL ATIVO NA LISTA OUTBOUND:     {total_outbound}")
        log.info("=" * 60)

        if total_outbound < 50:
            log.warning("⚠️  ATENÇÃO: Menos de 50 dentistas na lista. Precisa construir mais leads antes de disparar!")
        else:
            log.info(f"✅ Base suficiente. Pode iniciar campanha ({total_outbound} leads ativos).")

        return {
            "total_banco": len(todos),
            "dentistas": len(dentistas),
            "invalidos": len(invalidos),
            "bounces_filtrados": len(bounce_set),
            "novos": len(novos),
            "total_outbound_ativo": total_outbound,
        }

    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_cleanup())

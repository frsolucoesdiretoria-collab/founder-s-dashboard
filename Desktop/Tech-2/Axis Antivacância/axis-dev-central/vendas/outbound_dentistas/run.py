#!/usr/bin/env python3
"""
run.py — Script principal da campanha outbound dentistas

Comandos disponíveis:
  python3 run.py setup        — Cria tabelas + limpa + importa dentistas
  python3 run.py status       — Mostra relatório de status
  python3 run.py dispatch     — Envia emails (respeita throttle e horário)
  python3 run.py dispatch --dry-run  — Simula sem enviar
  python3 run.py replies      — Verifica respostas e bounces via IMAP
  python3 run.py all          — dispatch + replies (uso em cron)

Cron sugerido (Seg-Qui 9h30 e 10h30, Brasília):
  30 9  * * 1-4  cd /home/fabricio/axis/outbound_dentistas && /home/fabricio/axis/vendas/.venv/bin/python3 run.py all >> /home/fabricio/logs/outbound_dentistas.log 2>&1
  30 10 * * 1-4  cd /home/fabricio/axis/outbound_dentistas && /home/fabricio/axis/vendas/.venv/bin/python3 run.py all >> /home/fabricio/logs/outbound_dentistas.log 2>&1

  # Verificar replies a cada 15 minutos
  */15 * * * *   cd /home/fabricio/axis/outbound_dentistas && /home/fabricio/axis/vendas/.venv/bin/python3 run.py replies >> /home/fabricio/logs/outbound_replies.log 2>&1
"""

import asyncio
import asyncpg
import sys
import os
import logging
from pathlib import Path

# Adiciona o diretório pai (vendas/) ao path para importar modules existentes
sys.path.insert(0, str(Path(__file__).parent.parent))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
log = logging.getLogger(__name__)

DB_URL = os.getenv("DATABASE_URL", "postgresql://axis:axis123@localhost:5432/axis_sales")


async def cmd_setup():
    """Cria tabelas, limpa emails e popula lista de dentistas."""
    log.info("=== SETUP: Criando tabelas + importando dentistas ===")

    # Criar tabelas
    migration_sql = Path(__file__).parent / "migration.sql"
    if not migration_sql.exists():
        log.error(f"migration.sql não encontrado em {migration_sql}")
        return False

    conn = await asyncpg.connect(DB_URL)
    try:
        sql = migration_sql.read_text()
        # Executar cada statement separadamente
        for stmt in sql.split(";"):
            stmt = stmt.strip()
            if stmt and not stmt.startswith("--"):
                try:
                    await conn.execute(stmt)
                except Exception as e:
                    if "already exists" not in str(e).lower():
                        log.warning(f"SQL warning: {e}")
        log.info("✅ Tabelas criadas/verificadas")
    finally:
        await conn.close()

    # Limpar e importar dentistas
    from cleanup import run_cleanup
    result = await run_cleanup()

    log.info(f"\n✅ Setup concluído! {result['total_outbound_ativo']} dentistas prontos para receber emails.")
    return True


async def cmd_status():
    """Mostra relatório de status da campanha."""
    conn = await asyncpg.connect(DB_URL)
    try:
        # Verificar se tabela existe
        exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'outbound_dentistas'
            )
        """)
        if not exists:
            log.error("Tabela outbound_dentistas não existe. Execute: python3 run.py setup")
            return

        from dispatcher import status_report
        await status_report(conn)
    finally:
        await conn.close()


async def cmd_dispatch(dry_run: bool = False):
    """Envia emails respeitando throttle e horário."""
    from dispatcher import main as dispatch_main
    await dispatch_main(dry_run=dry_run)


async def cmd_replies():
    """Verifica respostas e bounces via IMAP."""
    from reply_detector import main as replies_main
    await replies_main()


async def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    cmd = sys.argv[1].lower()
    dry_run = "--dry-run" in sys.argv

    if cmd == "setup":
        await cmd_setup()
    elif cmd == "status":
        await cmd_status()
    elif cmd == "dispatch":
        await cmd_dispatch(dry_run=dry_run)
    elif cmd == "replies":
        await cmd_replies()
    elif cmd == "all":
        await cmd_dispatch(dry_run=dry_run)
        await cmd_replies()
    else:
        log.error(f"Comando desconhecido: {cmd}")
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())

"""
templates.py — Templates de email para sequência outbound dentistas

Sequência ativa:
  Email 1 (Dia 0)  — Abertura: encaixe automático quando alguém cancela
  Email 2 (Dia 3)  — Dados: 15% de cancelamentos, R$3.750/mês que podem virar atendimentos

  Email 3 (Dia 6)  — PAUSADO (aguardando aprovação de copy)
  Email 4 (Dia 10) — PAUSADO (aguardando aprovação de copy)

Remetente: Fabricio - Axis <fabricio@agendainteligentes.com>
Contato: (47) 99678-3581
"""

from typing import Optional


def _html_wrapper(body_html: str, tracking_pixel_url: Optional[str] = None) -> str:
    """Envolve o conteúdo em template HTML responsivo."""
    pixel = ""
    if tracking_pixel_url:
        pixel = f'<img src="{tracking_pixel_url}" width="1" height="1" style="display:none" alt="">'

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {{ font-family: Arial, sans-serif; font-size: 15px; color: #222; background: #fff; margin: 0; padding: 0; }}
  .container {{ max-width: 600px; margin: 0 auto; padding: 24px 20px; }}
  p {{ line-height: 1.7; margin: 0 0 16px 0; }}
  a {{ color: #1a56db; }}
  .footer {{ font-size: 12px; color: #888; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }}
  .sig {{ margin-top: 24px; }}
</style>
</head>
<body>
<div class="container">
{body_html}
<div class="footer">
  <p>Você está recebendo esta mensagem porque sua clínica foi identificada em pesquisas sobre saúde odontológica no Brasil.<br>
  Para não receber mais mensagens: <a href="https://agendainteligentes.com/unsubscribe?email={{{{email}}}}">descadastrar</a></p>
</div>
{pixel}
</div>
</body>
</html>"""


def email1_abertura(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 1 — Dia 0 — Abertura (APROVADO)
    Mostra que o Axis preenche o horário automaticamente quando alguém cancela.
    CTA: 20 minutos para ver como funciona.
    """
    clinica_display = clinica.strip() if clinica else "sua clínica"

    subject = f"{clinica_display}: quando alguém cancela, o horário se preenche?"

    text = f"""Quando um paciente cancela na {clinica_display}, o próximo da lista de espera poderia receber um convite automático no WhatsApp — e confirmar o encaixe em minutos.

Sem ligação da secretária. Sem horário parado.

O Axis faz isso. Clínicas com 80–100 consultas/mês recuperam em média R$3.000/mês que antes ficavam vazias.

Posso mostrar como funcionaria para a {clinica_display} em 20 minutos?

Fabrício / Axis — (47) 99678-3581"""

    pixel_url = f"https://dashboard.agendainteligentes.com/api/cold-email/track/open/{log_id}" if log_id else None

    body_html = f"""
<p>Quando um paciente cancela na {clinica_display}, o próximo da lista de espera poderia receber um convite automático no WhatsApp — e confirmar o encaixe em minutos.</p>
<p>Sem ligação da secretária. Sem horário parado.</p>
<p>O Axis faz isso. Clínicas com 80–100 consultas/mês recuperam em média <strong>R$3.000/mês</strong> que antes ficavam vazias.</p>
<p>Posso mostrar como funcionaria para a {clinica_display} em 20 minutos?</p>
<div class="sig">
<p>Fabrício / Axis — (47) 99678-3581</p>
</div>"""

    return {
        "subject": subject,
        "text": text,
        "html": _html_wrapper(body_html, pixel_url),
        "email_number": 1,
    }


def email2_dados(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 2 — Dia 3 — Dados (APROVADO)
    15% de cancelamentos, R$3.750/mês que podem virar atendimentos confirmados.
    CTA: 20 minutos para ver.
    """
    clinica_display = clinica.strip() if clinica else "sua clínica"

    subject = f"{clinica_display}: o número que me chamou atenção"

    text = f"""15% dos agendamentos em clínicas odontológicas são cancelados por mês.

Para uma agenda de 100 consultas a R$250: são R$3.750 que poderiam virar atendimentos confirmados.

O Axis preenche esse espaço automaticamente. Pacientes em lista de espera são avisados via WhatsApp quando um horário abre — e confirmam na hora.

O sistema custa R$350/mês. O retorno costuma aparecer na primeira semana.

Vale 20 minutos para ver? (47) 99678-3581

Fabrício / Axis"""

    pixel_url = f"https://dashboard.agendainteligentes.com/api/cold-email/track/open/{log_id}" if log_id else None

    body_html = f"""
<p><strong>15% dos agendamentos em clínicas odontológicas são cancelados por mês.</strong></p>
<p>Para uma agenda de 100 consultas a R$250: são <strong>R$3.750 que poderiam virar atendimentos confirmados.</strong></p>
<p>O Axis preenche esse espaço automaticamente. Pacientes em lista de espera são avisados via WhatsApp quando um horário abre — e confirmam na hora.</p>
<p>O sistema custa <strong>R$350/mês</strong>. O retorno costuma aparecer na primeira semana.</p>
<p>Vale 20 minutos para ver? <strong>(47) 99678-3581</strong></p>
<div class="sig">
<p>Fabrício / Axis</p>
</div>"""

    return {
        "subject": subject,
        "text": text,
        "html": _html_wrapper(body_html, pixel_url),
        "email_number": 2,
    }


def email3_objecao(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 3 — Dia 6 — PAUSADO (aguardando aprovação de copy)
    """
    raise NotImplementedError("Email 3 está pausado aguardando aprovação de copy.")


def email4_fechamento(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 4 — Dia 10 — PAUSADO (aguardando aprovação de copy)
    """
    raise NotImplementedError("Email 4 está pausado aguardando aprovação de copy.")


def get_template(numero: int, clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """Retorna o template correto pelo número (1-2 ativos)."""
    fns = {
        1: email1_abertura,
        2: email2_dados,
    }
    fn = fns.get(numero)
    if not fn:
        raise ValueError(f"Template {numero} não existe ou está pausado. Ativos: 1-2.")
    return fn(clinica, email, log_id)


if __name__ == "__main__":
    # Preview dos templates ativos
    for i in range(1, 3):
        t = get_template(i, "Clínica Dental Exemplo", "contato@clinicaexemplo.com.br")
        print(f"\n{'='*60}")
        print(f"EMAIL {i} — Assunto: {t['subject']}")
        print(f"{'='*60}")
        print(t["text"])

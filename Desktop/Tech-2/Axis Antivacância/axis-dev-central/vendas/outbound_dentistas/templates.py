"""
templates.py — 4 templates de email para sequência outbound dentistas

Sequência:
  Email 1 (Dia 0)  — Abertura: pergunta empática sobre cancelamentos
  Email 2 (Dia 3)  — Dados: custo real dos cancelamentos
  Email 3 (Dia 6)  — Objeção: "minha secretária já faz isso"
  Email 4 (Dia 10) — Fechamento: oferta final + despedida

Remetente: Fabrício — Axis <fabricio@agendainteligentes.com>
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
  .cta {{ display: inline-block; background: #1a56db; color: #fff !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 8px 0; }}
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
    Email 1 — Dia 0 — Abertura
    Pergunta empática sobre o que acontece quando um paciente cancela.
    Sem vender. CTA: responder o email.
    """
    clinica_display = clinica.strip() if clinica else "sua clínica"

    subject = f"Uma dúvida rápida sobre a {clinica_display}"

    text = f"""Olá, tudo bem?

Tenho uma pergunta direta para você:

O que acontece na {clinica_display} quando um paciente cancela a consulta com pouco aviso?

Pergunto porque conversei com muitos dentistas ultimamente e as respostas variam bastante. Alguns tentam ligar para outros pacientes na lista, outros simplesmente perdem o horário.

Não é julgamento — é genuína curiosidade sobre como cada clínica lida com isso no dia a dia.

Se tiver 2 minutos, me responde aqui no email mesmo. Pode ser bem curto.

Abraço,
Fabrício
Axis Antivacância"""

    pixel_url = f"https://dashboard.agendainteligentes.com/api/cold-email/track/open/{log_id}" if log_id else None

    body_html = f"""
<p>Olá, tudo bem?</p>
<p>Tenho uma pergunta direta para você:</p>
<p><strong>O que acontece na {clinica_display} quando um paciente cancela a consulta com pouco aviso?</strong></p>
<p>Pergunto porque conversei com muitos dentistas ultimamente e as respostas variam bastante. Alguns tentam ligar para outros pacientes na lista, outros simplesmente perdem o horário.</p>
<p>Não é julgamento — é genuína curiosidade sobre como cada clínica lida com isso no dia a dia.</p>
<p>Se tiver 2 minutos, <strong>me responde aqui no email mesmo</strong>. Pode ser bem curto.</p>
<div class="sig">
<p>Abraço,<br>
<strong>Fabrício</strong><br>
Axis Antivacância</p>
</div>"""

    return {
        "subject": subject,
        "text": text,
        "html": _html_wrapper(body_html, pixel_url),
        "email_number": 1,
    }


def email2_dados(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 2 — Dia 3 — Dados
    Custo real dos cancelamentos na odontologia (15% taxa média).
    CTA: calculadora em agendainteligentes.com/calculadora
    """
    clinica_display = clinica.strip() if clinica else "sua clínica"

    subject = f"Quanto a {clinica_display} perde por mês com cancelamentos?"

    text = f"""Oi, de novo.

Não sei se você me respondeu antes (se não, sem problemas), mas quero compartilhar um dado que me chamou atenção:

A taxa média de cancelamentos em clínicas odontológicas no Brasil é de 15% das consultas agendadas.

Para uma clínica com 100 consultas por mês a R$250 cada: são R$3.750 que simplesmente somem toda vez que a agenda não é preenchida.

Por ano: R$45.000.

E o pior é que esse dinheiro não aparece como "perda" em nenhum relatório. A cadeira ficou vazia, mas a clínica não vê esse número em lugar nenhum.

Criamos uma calculadora gratuita para você ver exatamente quanto a {clinica_display} está perdendo:

👉 agendainteligentes.com/calculadora

Leva menos de 1 minuto. Você insere as consultas por mês e o ticket médio — e o número aparece na tela.

Abraço,
Fabrício
Axis Antivacância"""

    pixel_url = f"https://dashboard.agendainteligentes.com/api/cold-email/track/open/{log_id}" if log_id else None

    body_html = f"""
<p>Oi, de novo.</p>
<p>Não sei se você me respondeu antes (se não, sem problemas), mas quero compartilhar um dado que me chamou atenção:</p>
<p><strong>A taxa média de cancelamentos em clínicas odontológicas no Brasil é de 15% das consultas agendadas.</strong></p>
<p>Para uma clínica com 100 consultas por mês a R$250 cada: são <strong>R$3.750 que simplesmente somem</strong> toda vez que a agenda não é preenchida.</p>
<p>Por ano: <strong>R$45.000.</strong></p>
<p>E o pior é que esse dinheiro não aparece como "perda" em nenhum relatório. A cadeira ficou vazia, mas a clínica não vê esse número em lugar nenhum.</p>
<p>Criamos uma calculadora gratuita para você ver exatamente quanto a {clinica_display} está perdendo:</p>
<p style="margin: 20px 0">
  <a href="https://agendainteligentes.com/calculadora?utm_source=outbound&utm_medium=email2&utm_campaign=dentistas" class="cta">
    Ver minha calculadora →
  </a>
</p>
<p>Leva menos de 1 minuto. Você insere as consultas por mês e o ticket médio — e o número aparece na tela.</p>
<div class="sig">
<p>Abraço,<br>
<strong>Fabrício</strong><br>
Axis Antivacância</p>
</div>"""

    return {
        "subject": subject,
        "text": text,
        "html": _html_wrapper(body_html, pixel_url),
        "email_number": 2,
    }


def email3_objecao(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 3 — Dia 6 — Objeção
    Aborda "minha secretária já faz isso".
    CTA: responder ou WhatsApp (47) 99647-5547
    """
    clinica_display = clinica.strip() if clinica else "sua clínica"

    subject = f"'Minha secretária já faz isso' — e o problema com essa resposta"

    text = f"""Oi,

Esta é a objeção que mais escuto quando falo de antecipação de cancelamentos:

"Minha secretária já liga para os pacientes quando alguém cancela."

Respeito isso. A secretária que liga é uma profissional dedicada.

O problema não é ela. O problema é o processo manual:

• Quando um paciente cancela às 7h, a secretária ainda não chegou.
• Quando cancela no fim de semana, ninguém liga.
• Quando 3 cancelamentos chegam ao mesmo tempo, ela tem que escolher qual resolve primeiro.
• A lista de espera não está organizada por horário, por urgência ou por disponibilidade.

O processo manual funciona razoavelmente bem para 1 ou 2 cancelamentos por semana. Mas escalar isso — atender 100 consultas por mês com zero vacância — é humanamente impossível sem automação.

Não estou dizendo para dispensar a secretária. Estou dizendo que ela tem trabalho mais importante do que ficar ligando para pacientes em lista de espera.

Se fizer sentido conversar mais sobre isso, me responde aqui ou manda um WhatsApp: (47) 99647-5547

Abraço,
Fabrício
Axis Antivacância"""

    pixel_url = f"https://dashboard.agendainteligentes.com/api/cold-email/track/open/{log_id}" if log_id else None

    body_html = f"""
<p>Oi,</p>
<p>Esta é a objeção que mais escuto quando falo de antecipação de cancelamentos:</p>
<p style="padding: 12px 16px; background: #f5f5f5; border-left: 3px solid #ccc; font-style: italic;">
  "Minha secretária já liga para os pacientes quando alguém cancela."
</p>
<p>Respeito isso. A secretária que liga é uma profissional dedicada.</p>
<p><strong>O problema não é ela. O problema é o processo manual:</strong></p>
<ul>
  <li>Quando um paciente cancela às 7h, a secretária ainda não chegou.</li>
  <li>Quando cancela no fim de semana, ninguém liga.</li>
  <li>Quando 3 cancelamentos chegam ao mesmo tempo, ela tem que escolher qual resolve primeiro.</li>
  <li>A lista de espera não está organizada por horário, por urgência ou por disponibilidade.</li>
</ul>
<p>O processo manual funciona razoavelmente bem para 1 ou 2 cancelamentos por semana. Mas escalar isso — atender 100 consultas por mês com zero vacância — é humanamente impossível sem automação.</p>
<p>Não estou dizendo para dispensar a secretária. Estou dizendo que ela tem trabalho mais importante do que ficar ligando para pacientes em lista de espera.</p>
<p>Se fizer sentido conversar mais sobre isso:</p>
<p>
  <a href="mailto:fabricio@agendainteligentes.com" class="cta" style="margin-right: 8px;">Responder por email</a>
  <a href="https://wa.me/5547996475547?text=Ol%C3%A1%20Fabr%C3%ADcio%2C%20vi%20seu%20email%20sobre%20cancelamentos" class="cta" style="background: #25d366;">WhatsApp</a>
</p>
<div class="sig">
<p>Abraço,<br>
<strong>Fabrício</strong><br>
Axis Antivacância</p>
</div>"""

    return {
        "subject": subject,
        "text": text,
        "html": _html_wrapper(body_html, pixel_url),
        "email_number": 3,
    }


def email4_fechamento(clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """
    Email 4 — Dia 10 — Fechamento
    Oferta final: R$350/mês, 14 dias grátis, garantia ROI 12 meses, implementação 3-7 dias.
    Tom de despedida respeitoso.
    """
    clinica_display = clinica.strip() if clinica else "sua clínica"

    subject = f"Último email sobre isso, {clinica_display}"

    text = f"""Oi,

Este é meu último email sobre o tema. Prometo.

Mandei 3 mensagens antes porque acredito genuinamente que cancelamentos não preenchidos são um dos maiores destruidores de faturamento silencioso em clínicas odontológicas.

Mas entendo que o timing pode não ser o certo agora, ou que simplesmente não é prioridade.

Antes de encerrar, quero deixar claro o que o Axis oferece — caso mude de ideia no futuro:

✅ R$350/mês (menos que 1 hora de clínica)
✅ 14 dias grátis, sem cartão de crédito
✅ Implementação em 3 a 7 dias úteis
✅ Garantia de ROI: se nos primeiros 12 meses você não recuperar o investimento, devolvemos tudo
✅ Sem precisar mudar seu sistema de agendamento atual

Quando um paciente cancela, o sistema avisa automaticamente os próximos da lista de espera — no WhatsApp deles, imediatamente.

Obrigado pelo tempo. Desejo muito sucesso para a {clinica_display}.

Se um dia fizer sentido, estarei aqui.

Abraço,
Fabrício
Axis Antivacância
fabricio@agendainteligentes.com
(47) 99647-5547"""

    pixel_url = f"https://dashboard.agendainteligentes.com/api/cold-email/track/open/{log_id}" if log_id else None

    body_html = f"""
<p>Oi,</p>
<p>Este é meu último email sobre o tema. Prometo.</p>
<p>Mandei 3 mensagens antes porque acredito genuinamente que cancelamentos não preenchidos são um dos maiores destruidores de faturamento silencioso em clínicas odontológicas.</p>
<p>Mas entendo que o timing pode não ser o certo agora, ou que simplesmente não é prioridade.</p>
<p>Antes de encerrar, quero deixar claro o que o Axis oferece — caso mude de ideia no futuro:</p>
<ul>
  <li>✅ <strong>R$350/mês</strong> (menos que 1 hora de clínica)</li>
  <li>✅ <strong>14 dias grátis</strong>, sem cartão de crédito</li>
  <li>✅ <strong>Implementação em 3 a 7 dias</strong> úteis</li>
  <li>✅ <strong>Garantia de ROI 12 meses</strong>: se não recuperar o investimento, devolvemos tudo</li>
  <li>✅ Sem precisar mudar seu sistema de agendamento atual</li>
</ul>
<p>Quando um paciente cancela, o sistema avisa automaticamente os próximos da lista de espera — no WhatsApp deles, imediatamente.</p>
<p style="margin: 20px 0">
  <a href="https://agendainteligentes.com/?utm_source=outbound&utm_medium=email4&utm_campaign=dentistas" class="cta">
    Conhecer o Axis →
  </a>
</p>
<p>Obrigado pelo tempo. Desejo muito sucesso para a {clinica_display}.</p>
<p>Se um dia fizer sentido, estarei aqui.</p>
<div class="sig">
<p>Abraço,<br>
<strong>Fabrício</strong><br>
Axis Antivacância<br>
<a href="mailto:fabricio@agendainteligentes.com">fabricio@agendainteligentes.com</a><br>
<a href="https://wa.me/5547996475547">WhatsApp: (47) 99647-5547</a></p>
</div>"""

    return {
        "subject": subject,
        "text": text,
        "html": _html_wrapper(body_html, pixel_url),
        "email_number": 4,
    }


def get_template(numero: int, clinica: str, email: str, log_id: Optional[int] = None) -> dict:
    """Retorna o template correto pelo número (1-4)."""
    fns = {
        1: email1_abertura,
        2: email2_dados,
        3: email3_objecao,
        4: email4_fechamento,
    }
    fn = fns.get(numero)
    if not fn:
        raise ValueError(f"Template {numero} não existe. Use 1-4.")
    return fn(clinica, email, log_id)


if __name__ == "__main__":
    # Preview dos templates
    for i in range(1, 5):
        t = get_template(i, "Clínica Dental Exemplo", "contato@clinicaexemplo.com.br")
        print(f"\n{'='*60}")
        print(f"EMAIL {i} — Assunto: {t['subject']}")
        print(f"{'='*60}")
        print(t["text"][:500])

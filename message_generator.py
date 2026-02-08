import csv
import sys

def generate_messages(input_csv):
    print("📢 GERADOR DE MENSAGENS DE OUTREACH\n")
    
    messages = []
    
    try:
        with open(input_csv, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # Filtrar apenas os top leads com Score alto ou Diagnóstico crítico
                score = float(row.get('Potencial de Fechamento', 0))
                
                if score >= 7.0:
                    nome_dono = row.get('Nome_Dono_LinkedIn', 'Sócio(a)')
                    # Limpar nome (pegar só o primeiro nome se for longo)
                    primeiro_nome = nome_dono.split(' ')[0] if nome_dono else 'Doutor(a)'
                    if primeiro_nome.lower() in ['não', 'sócio', 'sócio/proprietário', 'empresário', 'dono']:
                        primeiro_nome = 'Dr(a).'
                    
                    clinica = row['Nome']
                    perda_estimada = "R$ 900.000,00" # Valor default alto impacto
                    
                    # Tentar personalizar valor com base no score/serviço (simulação simples)
                    if score >= 9:
                        perda_estimada = "R$ 1.2 milhão"
                    elif score >= 8:
                        perda_estimada = "R$ 500 mil"
                    
                    diagnosis_link = f"https://axis-dashboard.com/relatorios/diagnostico_{clinica.lower().replace(' ', '_')}.html"
                    
                    msg = (
                        f"--- MENSAGEM PARA: {clinica} ({row.get('Link_LinkedIn_Dono', 'LinkedIn não encontrado')}) ---\n"
                        f"Olá {primeiro_nome}, vi que a {clinica} está com um vazamento de caixa estimado em {perda_estimada}/ano "
                        f"por falhas no agendamento de {row.get('Serviço Principal', 'procedimentos')}.\n"
                        f"Fiz um diagnóstico rápido aqui: [Link do Relatório].\n"
                        f"O Axis resolve isso automaticamente recuperando esses pacientes.\n"
                        f"Podemos conversar 5 minutos?"
                    )
                    
                    messages.append(msg)
                    print(msg + "\n")
                    
    except FileNotFoundError:
        print(f"Arquivo {input_csv} não encontrado.")
    except Exception as e:
        print(f"Erro ao processar: {e}")

if __name__ == "__main__":
    generate_messages('leads_com_linkedin.csv')

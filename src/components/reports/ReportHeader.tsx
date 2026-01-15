// Report Header Component
import { Card, CardContent } from '@/components/ui/card';
import type { DomaCondoClient } from '@/types/domaCondoClient';

interface ReportHeaderProps {
  cliente: DomaCondoClient;
  mesReferencia: string;
  dataEmissao: string;
}

export function ReportHeader({ cliente, mesReferencia, dataEmissao }: ReportHeaderProps) {
  const formatMesReferencia = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mesNum) - 1]}/${ano}`;
  };

  const formatData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              RELATÓRIO MENSAL DE SERVIÇOS
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
            <div>
              <span className="font-semibold">Cliente / Condomínio:</span>{' '}
              <span className="text-muted-foreground">{cliente.name}</span>
            </div>
            <div>
              <span className="font-semibold">Período de Referência:</span>{' '}
              <span className="text-muted-foreground">{formatMesReferencia(mesReferencia)}</span>
            </div>
            <div>
              <span className="font-semibold">Data de Emissão:</span>{' '}
              <span className="text-muted-foreground">{formatData(dataEmissao)}</span>
            </div>
            <div>
              <span className="font-semibold">Equipe Responsável:</span>{' '}
              <span className="text-muted-foreground">
                Doma – Assessoria, Consultoria e BPO Financeiro
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


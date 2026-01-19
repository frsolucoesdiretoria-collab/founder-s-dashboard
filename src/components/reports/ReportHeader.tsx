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
    <Card className="mb-4 sm:mb-6">
      <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
              RELATÓRIO MENSAL DE SERVIÇOS
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm md:text-base">
            <div className="space-y-1">
              <span className="font-semibold block sm:inline">Cliente / Condomínio:</span>{' '}
              <span className="text-muted-foreground block sm:inline break-words">{cliente.name}</span>
            </div>
            <div className="space-y-1">
              <span className="font-semibold block sm:inline">Período de Referência:</span>{' '}
              <span className="text-muted-foreground block sm:inline">{formatMesReferencia(mesReferencia)}</span>
            </div>
            <div className="space-y-1">
              <span className="font-semibold block sm:inline">Data de Emissão:</span>{' '}
              <span className="text-muted-foreground block sm:inline">{formatData(dataEmissao)}</span>
            </div>
            <div className="space-y-1">
              <span className="font-semibold block sm:inline">Equipe Responsável:</span>{' '}
              <span className="text-muted-foreground block sm:inline text-xs sm:text-sm">
                Doma – Assessoria, Consultoria e BPO Financeiro
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


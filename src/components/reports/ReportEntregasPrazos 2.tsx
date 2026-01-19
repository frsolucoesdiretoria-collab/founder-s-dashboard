// Report Entregas e Prazos Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Entrega, StatusEntrega } from '@/types/domaCondoClient';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportEntregasPrazosProps {
  entregas: Entrega[];
}

const statusConfig: Record<StatusEntrega, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  'Concluído': {
    label: 'Concluído',
    variant: 'default',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  'Em Andamento': {
    label: 'Em Andamento',
    variant: 'secondary',
    icon: <Clock className="h-4 w-4" />,
  },
  'Pendente': {
    label: 'Pendente',
    variant: 'outline',
    icon: <AlertCircle className="h-4 w-4" />,
  },
  'Atrasado': {
    label: 'Atrasado',
    variant: 'destructive',
    icon: <XCircle className="h-4 w-4" />,
  },
};

export function ReportEntregasPrazos({ entregas }: ReportEntregasPrazosProps) {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (entregas.length === 0) {
    return (
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">2. Entregas e Prazos</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-sm text-muted-foreground">Nenhuma entrega registrada para este período.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl">2. Entregas e Prazos</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {/* Mobile: Cards */}
        <div className="block sm:hidden space-y-3">
          {entregas.map((entrega) => {
            const config = statusConfig[entrega.status];
            return (
              <div key={entrega.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-sm">{entrega.atividade}</p>
                  <Badge variant={config.variant} className="gap-1 text-xs">
                    {config.icon}
                    {config.label}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Prevista:</span> {formatDate(entrega.dataPrevista)}
                  </div>
                  <div>
                    <span className="font-medium">Finalização:</span> {formatDate(entrega.dataFinalizacao)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop: Table */}
        <div className="hidden sm:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm">Atividade</TableHead>
                <TableHead className="text-sm">Data Prevista</TableHead>
                <TableHead className="text-sm">Data de Finalização</TableHead>
                <TableHead className="text-sm">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregas.map((entrega) => {
                const config = statusConfig[entrega.status];
                return (
                  <TableRow key={entrega.id}>
                    <TableCell className="font-medium text-sm">{entrega.atividade}</TableCell>
                    <TableCell className="text-sm">{formatDate(entrega.dataPrevista)}</TableCell>
                    <TableCell className="text-sm">{formatDate(entrega.dataFinalizacao)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1 text-xs">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


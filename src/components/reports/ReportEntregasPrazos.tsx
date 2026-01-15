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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">2. Entregas e Prazos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhuma entrega registrada para este período.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">2. Entregas e Prazos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atividade</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Data de Finalização</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregas.map((entrega) => {
                const config = statusConfig[entrega.status];
                return (
                  <TableRow key={entrega.id}>
                    <TableCell className="font-medium">{entrega.atividade}</TableCell>
                    <TableCell>{formatDate(entrega.dataPrevista)}</TableCell>
                    <TableCell>{formatDate(entrega.dataFinalizacao)}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
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


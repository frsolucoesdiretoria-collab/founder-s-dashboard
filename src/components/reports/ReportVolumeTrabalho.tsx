// Report Volume de Trabalho Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { VolumeTrabalho } from '@/types/domaCondoClient';

interface ReportVolumeTrabalhoProps {
  volumeTrabalho: VolumeTrabalho;
}

export function ReportVolumeTrabalho({ volumeTrabalho }: ReportVolumeTrabalhoProps) {
  const forecastData = volumeTrabalho.forecastLancamentos.map(item => ({
    name: item.administradora,
    quantidade: item.quantidade,
  }));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">3. Volume de Trabalho Executado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Quantidade de lançamentos realizados:
            </div>
            <div className="text-2xl font-bold text-foreground">
              {volumeTrabalho.lancamentosRealizados.toLocaleString('pt-BR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Quantidade de documentos processados:
            </div>
            <div className="text-2xl font-bold text-foreground">
              {volumeTrabalho.documentosProcessados.toLocaleString('pt-BR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Contas / centros de custo movimentados:
            </div>
            <div className="text-2xl font-bold text-foreground">
              {volumeTrabalho.contasMovimentadas.toLocaleString('pt-BR')}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Fornecedores ativos no período:
            </div>
            <div className="text-2xl font-bold text-foreground">
              {volumeTrabalho.fornecedoresAtivos.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {volumeTrabalho.forecastLancamentos.length > 0 && (
          <div>
            <div className="text-sm font-semibold mb-4">
              Forecast de lançamentos financeiros (contas a pagar) por administradora de condomínio:
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" fill="hsl(var(--primary))" name="Lançamentos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


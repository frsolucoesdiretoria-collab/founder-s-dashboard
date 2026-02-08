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
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl">3. Volume de Trabalho Executado</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 border rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Lançamentos realizados:
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {volumeTrabalho.lancamentosRealizados.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="p-3 sm:p-4 border rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Documentos processados:
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {volumeTrabalho.documentosProcessados.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="p-3 sm:p-4 border rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Contas movimentadas:
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {volumeTrabalho.contasMovimentadas.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="p-3 sm:p-4 border rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Fornecedores ativos:
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {volumeTrabalho.fornecedoresAtivos.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {volumeTrabalho.forecastLancamentos.length > 0 && (
          <div>
            <div className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
              Forecast de lançamentos financeiros por administradora:
            </div>
            <div className="h-[250px] sm:h-[300px] md:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
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


// DOMA CONDO Client Report Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DomaCondoClientLayout } from '@/components/DomaCondoClientLayout';
import { DomaCondoClientKPICardV2 } from '@/components/DomaCondoClientKPICardV2';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { ReportResumoExecutivo } from '@/components/reports/ReportResumoExecutivo';
import { ReportEntregasPrazos } from '@/components/reports/ReportEntregasPrazos';
import { ReportVolumeTrabalho } from '@/components/reports/ReportVolumeTrabalho';
import { ReportQualidadeControle } from '@/components/reports/ReportQualidadeControle';
import { ReportMelhorias } from '@/components/reports/ReportMelhorias';
import { ReportChamadosDemandas } from '@/components/reports/ReportChamadosDemandas';
import { ReportFeedbacks } from '@/components/reports/ReportFeedbacks';
import { ReportRecomendacoes } from '@/components/reports/ReportRecomendacoes';
import { ReportEncerramento } from '@/components/reports/ReportEncerramento';
import { ReportPDFGenerator } from '@/components/reports/ReportPDFGenerator';
import {
  getCurrentClient,
  getRelatorioMensal,
  updateRelatorioTexto,
  isClientAuthenticated,
} from '@/services/domaCondoClient.service';
import { getFenixKPIMensal } from '@/mocks/domaCondoClientReport';
import type { DomaCondoClient, RelatorioMensal } from '@/types/domaCondoClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, RefreshCw } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function DomaCondoClientReport() {
  const [cliente, setCliente] = useState<DomaCondoClient | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioMensal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const navigate = useNavigate();

  // Obter mês/ano atual
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [mesReferencia, setMesReferencia] = useState(currentMonth);

  // Gerar lista de meses/anos disponíveis (últimos 12 meses)
  const getAvailableMonths = () => {
    const months: string[] = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);
    }
    return months;
  };

  const formatMesReferencia = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mesNum) - 1]}/${ano}`;
  };

  useEffect(() => {
    // Verificar autenticação
    if (!isClientAuthenticated()) {
      navigate('/doma-condo-clientes/login');
      return;
    }

    // Carregar dados do cliente
    const loadCliente = async () => {
      try {
        const clienteData = await getCurrentClient();
        setCliente(clienteData);
      } catch (error) {
        toast.error('Erro ao carregar dados do cliente');
        navigate('/doma-condo-clientes/login');
      } finally {
        setLoading(false);
      }
    };

    loadCliente();
  }, [navigate]);

  useEffect(() => {
    // Carregar relatório quando cliente ou mês mudar
    if (cliente) {
      loadRelatorio();
    }
  }, [cliente, mesReferencia]);

  const loadRelatorio = async () => {
    if (!cliente) return;
    
    setLoadingRelatorio(true);
    try {
      const relatorioData = await getRelatorioMensal(mesReferencia);
      setRelatorio(relatorioData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar relatório');
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const handleUpdateTexto = async (campo: string, valor: string) => {
    if (!relatorio) return;

    try {
      await updateRelatorioTexto(mesReferencia, {
        [campo]: valor,
      });
      
      // Atualizar estado local
      setRelatorio({
        ...relatorio,
        textos: {
          ...relatorio.textos,
          [campo]: valor,
        },
      });
      
      toast.success('Relatório atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar relatório');
    }
  };

  const handleUpdateChamados = async (data: {
    chamadosRelevantes: number;
    demandasAtencaoEspecial: string;
    pontosRecorrentes: string;
    pendenciasProximoPeriodo: string;
  }) => {
    if (!relatorio) return;

    try {
      await updateRelatorioTexto(mesReferencia, data);
      
      setRelatorio({
        ...relatorio,
        textos: {
          ...relatorio.textos,
          ...data,
        },
      });
      
      toast.success('Relatório atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar relatório');
    }
  };

  if (loading || !cliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!relatorio) {
    return (
      <DomaCondoClientLayout cliente={cliente}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {loadingRelatorio ? 'Carregando relatório...' : 'Nenhum relatório disponível para este período.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </DomaCondoClientLayout>
    );
  }

  return (
    <DomaCondoClientLayout cliente={cliente}>
      <div className="space-y-6">
        {/* Controles */}
        <Card>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                <div className="space-y-2 flex-1 sm:flex-initial">
                  <Label htmlFor="mes" className="text-sm">Período</Label>
                  <Select value={mesReferencia} onValueChange={setMesReferencia}>
                    <SelectTrigger id="mes" className="w-full sm:w-[200px] h-11 sm:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableMonths().map((mes) => (
                        <SelectItem key={mes} value={mes}>
                          {formatMesReferencia(mes)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 sm:gap-4">
                  <Button
                    variant="outline"
                    onClick={loadRelatorio}
                    disabled={loadingRelatorio}
                    className="gap-2 flex-1 sm:flex-initial h-11 sm:h-10"
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingRelatorio ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Atualizar</span>
                    <span className="sm:hidden">Atualizar</span>
                  </Button>
                  <div className="flex-1 sm:flex-initial">
                    <ReportPDFGenerator relatorio={relatorio} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Card do Topo */}
        {!loadingRelatorio && relatorio && (() => {
          const kpiMensal = getFenixKPIMensal(mesReferencia);
          if (kpiMensal && cliente.id === '1') {
            return (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 sm:gap-6">
                <DomaCondoClientKPICardV2 clientKPI={kpiMensal} />
              </div>
            );
          }
          return null;
        })()}

        {/* Relatório */}
        {loadingRelatorio ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando relatório...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <ReportHeader
              cliente={relatorio.cliente}
              mesReferencia={relatorio.mesReferencia}
              dataEmissao={relatorio.dataEmissao}
            />
            <ReportResumoExecutivo
              resumoExecutivo={relatorio.textos.resumoExecutivo}
              editable={false}
            />
            <ReportEntregasPrazos entregas={relatorio.entregas} />
            <ReportVolumeTrabalho volumeTrabalho={relatorio.volumeTrabalho} />
            <ReportQualidadeControle qualidadeControle={relatorio.qualidadeControle} />
            <ReportMelhorias
              melhoriasImplementadas={relatorio.textos.melhoriasImplementadas}
              editable={false}
            />
            <ReportChamadosDemandas
              chamadosRelevantes={relatorio.textos.chamadosRelevantes}
              demandasAtencaoEspecial={relatorio.textos.demandasAtencaoEspecial}
              pontosRecorrentes={relatorio.textos.pontosRecorrentes}
              pendenciasProximoPeriodo={relatorio.textos.pendenciasProximoPeriodo}
              editable={false}
            />
            <ReportFeedbacks
              feedbacksPositivos={relatorio.textos.feedbacksPositivos}
              pontosAlinhamento={relatorio.textos.pontosAlinhamento}
              editable={false}
            />
            <ReportRecomendacoes
              recomendacoes={relatorio.textos.recomendacoes}
              editable={false}
            />
            <ReportEncerramento />
          </div>
        )}
      </div>
    </DomaCondoClientLayout>
  );
}


// AXIS V3 — Home / Landing (Dashboard + Conteúdo V3)

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EnzoLayout } from '@/components/EnzoLayout';
import { 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Zap, 
  Shield, 
  CheckCircle2,
  BarChart3,
  Users,
  Cog,
  Sparkles
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AxisV3Home: React.FC = () => {
  const beneficios = [
    {
      icon: Target,
      titulo: 'Diagnóstico Estratégico',
      descricao: 'Identificação precisa de gargalos, oportunidades e pontos críticos no processo comercial'
    },
    {
      icon: TrendingUp,
      titulo: 'Soluções Escaláveis',
      descricao: 'Tecnologia preparada para crescer junto com sua operação, sem retrabalho'
    },
    {
      icon: Zap,
      titulo: 'Implementação Consultiva',
      descricao: 'Não apenas entregamos tecnologia, garantimos adoção e resultados reais'
    },
    {
      icon: Shield,
      titulo: 'Gestão Baseada em Dados',
      descricao: 'Decisões embasadas em métricas reais, não em sensações ou achismos'
    }
  ];

  const resultados = [
    'Aumento médio de 40% na taxa de conversão',
    'Redução de 60% no tempo gasto em tarefas operacionais',
    'Previsibilidade de receita com margem de erro inferior a 15%',
    'Diminuição de 70% na dependência do fundador no operacional',
    'ROI positivo em até 6 meses de implementação'
  ];

  return (
    <EnzoLayout>
      <div className="space-y-8 md:space-y-12 pb-8">
        {/* Hero Section */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  AXIS V3 — Tecnologia para Crescimento B2B
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 tracking-tight leading-tight">
                Transforme seu Processo Comercial em uma Máquina Previsível de Resultados
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
                Consultoria estratégica + Tecnologia de ponta para empresas que querem 
                estruturar vendas, aumentar conversão e escalar com inteligência.
              </p>
              
              <div className="flex gap-4 flex-wrap pt-4">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/diagnostico'}
                  className="h-14 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-base"
                >
                  Fazer Diagnóstico Gratuito
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/axis-v3/portfolio'}
                  variant="outline"
                  className="h-14 px-10 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-200 font-medium text-base"
                >
                  Ver Portfólio de Soluções
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Para quem é */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
              Para Empresas que Querem Crescer com Estrutura
            </h2>
            <p className="text-base md:text-lg text-gray-500 font-light">
              Se você reconhece algum destes cenários, a AXIS V3 foi feita para você:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  <BarChart3 className="w-12 h-12 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                    Falta de Previsibilidade
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Você não consegue prever a receita dos próximos meses com confiança. 
                    Cada mês é uma surpresa (boa ou ruim).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  <Users className="w-12 h-12 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                    Dependência do Fundador
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O fundador ainda fecha vendas, resolve problemas e toma decisões operacionais. 
                    A empresa não funciona sem ele.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-all duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  <Cog className="w-12 h-12 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
                    Processo Desestruturado
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    O processo comercial vive na cabeça dos vendedores. Leads são perdidos, 
                    follow-ups são inconsistentes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Como Funciona */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
              Como Funciona a AXIS V3
            </h2>
            <p className="text-base md:text-lg text-gray-500 font-light">
              Metodologia consultiva que combina diagnóstico estratégico com 
              implementação de tecnologia sob medida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beneficios.map((beneficio, index) => (
              <Card key={index} className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] transition-all duration-300">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
                      <beneficio.icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                        {beneficio.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {beneficio.descricao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Resultados Comprovados */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
              Resultados Comprovados
            </h2>
            <p className="text-base md:text-lg text-gray-500 font-light">
              Empresas que implementaram a metodologia AXIS V3 alcançaram:
            </p>
          </div>

          <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl">
            <CardContent className="p-8">
              <div className="space-y-4">
                {resultados.map((resultado, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-base text-gray-700 leading-relaxed">{resultado}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Portfólio Overview */}
        <Card className="overflow-hidden border-0 shadow-[0_10px_50px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.1)] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl">
          <CardContent className="p-8 md:p-12 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-3 text-center">
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  20 Produtos de Tecnologia Estratégica
                </h2>
                <p className="text-base md:text-lg text-white/90 font-light max-w-3xl mx-auto">
                  Do topo do funil até a escala operacional, cobrimos toda a jornada 
                  de estruturação e crescimento comercial.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">4</div>
                  <div className="text-sm text-white/90">Aquisição & Topo de Funil</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">4</div>
                  <div className="text-sm text-white/90">Funil & Processo Comercial</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">4</div>
                  <div className="text-sm text-white/90">Conversão & Fechamento</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">4</div>
                  <div className="text-sm text-white/90">Gestão & Decisão</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-white mb-2">4</div>
                  <div className="text-sm text-white/90">Escala & Eficiência</div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/portfolio'}
                  variant="secondary"
                  className="h-14 px-10 bg-white text-blue-700 hover:bg-white/90 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-base"
                >
                  Explorar Portfólio Completo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                Pronto para Estruturar sua Operação Comercial?
              </h2>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light max-w-3xl mx-auto">
                Comece com um diagnóstico estratégico gratuito. Em 20 minutos, 
                você terá clareza sobre onde investir para gerar mais resultados.
              </p>
              <div className="flex flex-col items-center gap-4 pt-4">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/diagnostico'}
                  className="h-14 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-base"
                >
                  Iniciar Diagnóstico Gratuito Agora
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
                <p className="text-sm text-gray-400 font-light">
                  Sem compromisso. Confidencial. Personalizado para sua realidade.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnzoLayout>
  );
};

export default AxisV3Home;

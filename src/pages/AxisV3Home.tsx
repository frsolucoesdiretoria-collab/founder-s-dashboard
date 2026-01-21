// AXIS V3 — Home / Landing (Visual Premium Apple-like)

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
      <div className="space-y-12 md:space-y-16 pb-12">
        {/* Hero Section - Premium */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-3xl transition-all duration-200 hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.06)]">
          <CardContent className="p-10 md:p-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium tracking-wide uppercase">
                  AXIS V3 — Tecnologia para Crescimento B2B
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-slate-900 tracking-tight leading-[1.1] max-w-4xl">
                Transforme seu Processo Comercial em uma Máquina Previsível de Resultados
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-light max-w-3xl tracking-tight">
                Consultoria estratégica + Tecnologia de ponta para empresas que querem 
                estruturar vendas, aumentar conversão e escalar com inteligência.
              </p>
              
              <div className="flex gap-4 flex-wrap pt-6">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/diagnostico'}
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm tracking-wide"
                >
                  Fazer Diagnóstico Gratuito
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/axis-v3/portfolio'}
                  variant="outline"
                  className="h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200 font-medium text-sm"
                >
                  Ver Portfólio de Soluções
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-slate-100" />

        {/* Para quem é */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
              Para Empresas que Querem Crescer com Estrutura
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-light tracking-tight">
              Se você reconhece algum destes cenários, a AXIS V3 foi feita para você:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] transition-all duration-200 border-l-4 border-l-blue-500">
              <CardContent className="p-8">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                    Falta de Previsibilidade
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    Você não consegue prever a receita dos próximos meses com confiança. 
                    Cada mês é uma surpresa (boa ou ruim).
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] transition-all duration-200 border-l-4 border-l-orange-500">
              <CardContent className="p-8">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                    Dependência do Fundador
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    O fundador ainda fecha vendas, resolve problemas e toma decisões operacionais. 
                    A empresa não funciona sem ele.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] transition-all duration-200 border-l-4 border-l-green-500">
              <CardContent className="p-8">
                <div className="space-y-5">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    <Cog className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                    Processo Desestruturado
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    O processo comercial vive na cabeça dos vendedores. Leads são perdidos, 
                    follow-ups são inconsistentes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Como Funciona */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
              Como Funciona a AXIS V3
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-light tracking-tight">
              Metodologia consultiva que combina diagnóstico estratégico com 
              implementação de tecnologia sob medida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beneficios.map((beneficio, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] transition-all duration-200"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                      <beneficio.icon className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-slate-900 tracking-tight">
                        {beneficio.titulo}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed font-light">
                        {beneficio.descricao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Resultados Comprovados */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
              Resultados Comprovados
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-light tracking-tight">
              Empresas que implementaram a metodologia AXIS V3 alcançaram:
            </p>
          </div>

          <Card className="border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl">
            <CardContent className="p-10">
              <div className="space-y-1">
                {resultados.map((resultado, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors duration-150"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <p className="text-base text-slate-700 leading-relaxed font-light tracking-tight">{resultado}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-slate-100" />

        {/* Portfólio Overview */}
        <Card className="overflow-hidden border-0 shadow-[0_8px_30px_0_rgba(0,0,0,0.12)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl">
          <CardContent className="p-10 md:p-16 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>

            <div className="relative z-10 space-y-10">
              <div className="space-y-4 text-center">
                <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
                  20 Produtos de Tecnologia Estratégica
                </h2>
                <p className="text-lg md:text-xl text-white/80 font-light max-w-3xl mx-auto tracking-tight">
                  Do topo do funil até a escala operacional, cobrimos toda a jornada 
                  de estruturação e crescimento comercial.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  'Aquisição & Topo de Funil',
                  'Funil & Processo Comercial',
                  'Conversão & Fechamento',
                  'Gestão & Decisão',
                  'Escala & Eficiência'
                ].map((label, index) => (
                  <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10 hover:bg-white/10 transition-all duration-200">
                    <div className="text-4xl font-light text-white mb-2">4</div>
                    <div className="text-xs text-white/70 font-light tracking-wide">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-6">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/portfolio'}
                  variant="secondary"
                  className="h-12 px-8 bg-white text-slate-900 hover:bg-white/90 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                >
                  Explorar Portfólio Completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Final */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-3xl">
          <CardContent className="p-10 md:p-16 text-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
                Pronto para Estruturar sua Operação Comercial?
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-3xl mx-auto tracking-tight">
                Comece com um diagnóstico estratégico gratuito. Em 20 minutos, 
                você terá clareza sobre onde investir para gerar mais resultados.
              </p>
              <div className="flex flex-col items-center gap-5 pt-6">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/diagnostico'}
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                >
                  Iniciar Diagnóstico Gratuito Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-slate-400 font-light tracking-wide">
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

// AXIS V3 — Diagnóstico Estratégico (Dashboard + UX Premium)

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EnzoLayout } from '@/components/EnzoLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowRight, 
  User, 
  Building, 
  FileText, 
  Phone, 
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getDiagnosticoV3Questions } from '@/mocks/axis-v3-diagnostico.mock';
import { getAllProdutosTechV3 } from '@/mocks/axis-v3-produtos.mock';
import type { DiagnosticoV3Response } from '@/types/axis-v3';

const AxisV3Diagnostico: React.FC = () => {
  const questions = getDiagnosticoV3Questions();
  const produtos = getAllProdutosTechV3();
  
  const [clientInfo, setClientInfo] = useState({
    nome: '',
    empresa: '',
    segmento: '',
    telefone: ''
  });

  const [respostas, setRespostas] = useState<Record<string, DiagnosticoV3Response>>({});
  const [showResult, setShowResult] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionToggle = (questionId: string, option: string, isMultiple: boolean) => {
    const current = respostas[questionId] || { questionId, opcoesSelecionadas: [], respostaAberta: '' };
    
    if (isMultiple) {
      const updated = current.opcoesSelecionadas.includes(option)
        ? current.opcoesSelecionadas.filter(o => o !== option)
        : [...current.opcoesSelecionadas, option];
      
      setRespostas({
        ...respostas,
        [questionId]: { ...current, opcoesSelecionadas: updated }
      });
    } else {
      setRespostas({
        ...respostas,
        [questionId]: { ...current, opcoesSelecionadas: [option] }
      });
    }
  };

  const handleTextChange = (questionId: string, text: string) => {
    const current = respostas[questionId] || { questionId, opcoesSelecionadas: [], respostaAberta: '' };
    setRespostas({
      ...respostas,
      [questionId]: { ...current, respostaAberta: text }
    });
  };

  const isAllFieldsValid = (): boolean => {
    if (!clientInfo.nome || !clientInfo.empresa || !clientInfo.telefone) return false;
    
    for (const q of questions) {
      const resp = respostas[q.id];
      if (!resp) return false;
      if (!resp.respostaAberta || !resp.respostaAberta.trim()) return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!isAllFieldsValid()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalQuestions = questions.length;
  const answeredQuestions = Object.values(respostas).filter(r => r.respostaAberta?.trim()).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const getRecommendations = () => {
    return produtos.slice(0, 3).map(p => ({
      nome: p.produto,
      dor: p.dorEstrategica,
      como: p.comoSoluciona,
      investimento: p.investimentoMedio,
      impacto: p.impactoEsperado
    }));
  };

  if (showResult) {
    const recommended = getRecommendations();

    return (
      <EnzoLayout>
        <div className="space-y-8 md:space-y-12 pb-8">
          <Card className="overflow-hidden border-0 shadow-[0_10px_50px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.1)] bg-white rounded-3xl">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start justify-between mb-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                      Análise Estratégica Concluída
                    </h2>
                  </div>
                  <p className="text-sm md:text-base text-gray-500 font-light ml-[60px]">
                    Diagnóstico para <strong>{clientInfo.empresa}</strong>
                  </p>
                </div>
              </div>

              <div className="mb-10 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    Leitura do Cenário Atual
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-3 p-6 bg-gradient-to-br from-blue-50/50 to-gray-50/30 rounded-2xl border border-blue-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Situação Atual</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      A empresa possui oportunidades claras de estruturação e ganho de eficiência com tecnologia.
                    </p>
                  </div>

                  <div className="space-y-3 p-6 bg-gradient-to-br from-orange-50/50 to-gray-50/30 rounded-2xl border border-orange-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Maior Gargalo</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Processos comerciais e operacionais podem ser otimizados para ganhar previsibilidade e escala.
                    </p>
                  </div>

                  <div className="space-y-3 p-6 bg-gradient-to-br from-green-50/50 to-gray-50/30 rounded-2xl border border-green-100/50">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-600"></div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Oportunidade Rápida</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-light">
                      Implementar tecnologia estratégica pode gerar impacto imediato nos resultados.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-10 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    Oportunidades Prioritárias
                  </h3>
                </div>
                
                <div className="grid gap-4">
                  {recommended.map((produto, index) => (
                    <Card 
                      key={index}
                      className={`border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl transition-all duration-300 hover:shadow-[0_10px_30px_0_rgba(0,0,0,0.12)] overflow-hidden ${
                        index === 0 ? 'ring-2 ring-blue-500/20 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <CardContent className="p-6 md:p-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {index === 0 && (
                              <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                                Recomendação Principal
                              </span>
                            )}
                            <h4 className="text-lg font-semibold text-gray-900 tracking-tight">
                              {produto.nome}
                            </h4>
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div className="flex gap-2">
                              <span className="font-medium text-gray-700 min-w-[80px]">Dor:</span>
                              <span className="text-gray-600">{produto.dor}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium text-gray-700 min-w-[80px]">Como:</span>
                              <span className="text-gray-600">{produto.como}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium text-gray-700 min-w-[80px]">Investimento:</span>
                              <span className="text-blue-700 font-semibold">{produto.investimento}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="font-medium text-gray-700 min-w-[80px]">Impacto:</span>
                              <span className="text-green-700 font-medium">{produto.impacto}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="relative p-8 md:p-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl shadow-2xl border border-blue-600/20 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '24px 24px'
                    }}></div>
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-6 w-6 text-white/90" />
                      <h3 className="text-lg md:text-xl font-semibold text-white tracking-tight">
                        Próximo Passo Recomendado
                      </h3>
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-white/95 leading-relaxed">
                      Agendar reunião de apresentação e proposta personalizada
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/portfolio'}
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98]"
                >
                  Ver Portfólio Completo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => {
                    setShowResult(false);
                    setRespostas({});
                    setClientInfo({ nome: '', empresa: '', segmento: '', telefone: '' });
                  }}
                  variant="outline"
                  className="h-12 px-8 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-200 font-medium"
                >
                  Iniciar Novo Diagnóstico
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </EnzoLayout>
    );
  }

  return (
    <EnzoLayout>
      <div className="space-y-8 md:space-y-12 pb-8">
        {/* Header */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                    Diagnóstico Estratégico AXIS V3
                  </h1>
                  <p className="text-sm md:text-base text-gray-500 font-light mt-1">
                    Assessment empresarial para identificar oportunidades de tecnologia
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                  <span>Pergunta {answeredQuestions} de {totalQuestions}</span>
                  <span>{Math.round(progress)}% completo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identificação do Cliente */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                  Informações da Empresa
                </h2>
                <p className="text-sm md:text-base text-gray-500 font-light">
                  Essas informações vinculam o diagnóstico a um lead real
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client-nome" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Nome do Cliente
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      id="client-nome"
                      value={clientInfo.nome}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome completo"
                      className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-empresa" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Empresa
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      id="client-empresa"
                      value={clientInfo.empresa}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, empresa: e.target.value }))}
                      placeholder="Nome da empresa"
                      className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-segmento" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Segmento / Setor
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      id="client-segmento"
                      value={clientInfo.segmento}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, segmento: e.target.value }))}
                      placeholder="Ex: Consultoria B2B, E-commerce"
                      className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-telefone" className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    WhatsApp / Telefone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <Input
                      id="client-telefone"
                      value={clientInfo.telefone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="pl-12 h-14 rounded-xl border-gray-200 bg-white text-base transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Perguntas do Diagnóstico - UX Premium */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              {questions.map((question, index) => {
                const resposta = respostas[question.id];
                
                return (
                  <Card 
                    key={question.id}
                    className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl transition-all duration-300 hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] overflow-hidden"
                  >
                    <CardContent className="p-6 md:p-8">
                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Label className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                              {question.pergunta}
                            </Label>
                            <p className="text-sm text-gray-500 mt-2 font-light">
                              {question.textoApoio}
                            </p>
                          </div>
                        </div>

                        {/* Opções - Multi-select com linha clicável */}
                        <div className="space-y-2">
                          {question.opcoes.map((opcao) => {
                            const isSelected = resposta?.opcoesSelecionadas.includes(opcao) || false;
                            
                            return (
                              <div
                                key={opcao}
                                onClick={() => handleOptionToggle(question.id, opcao, question.permitirMultiplo)}
                                className={`
                                  flex items-center space-x-4 cursor-pointer p-4 rounded-xl border 
                                  transition-all duration-150 ease-out
                                  ${isSelected 
                                    ? 'border-blue-300 bg-blue-50/50 shadow-sm' 
                                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/20'
                                  }
                                `}
                              >
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                  transition-all duration-150
                                  ${isSelected 
                                    ? 'bg-blue-600 border-blue-600' 
                                    : 'bg-white border-gray-300'
                                  }
                                `}>
                                  {isSelected && (
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <Label
                                  className={`
                                    text-base font-normal cursor-pointer flex-1 leading-relaxed
                                    transition-colors duration-150
                                    ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}
                                  `}
                                >
                                  {opcao}
                                </Label>
                              </div>
                            );
                          })}
                        </div>

                        {/* Campo de Texto Aberto - Sempre Visível */}
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                          <Label htmlFor={`${question.id}-texto`} className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                            <span className="text-red-500">* </span>
                            Conte mais sobre sua situação (obrigatório):
                          </Label>
                          <Textarea
                            id={`${question.id}-texto`}
                            value={resposta?.respostaAberta || ''}
                            onChange={(e) => handleTextChange(question.id, e.target.value)}
                            placeholder={question.campoAberto.placeholder}
                            className="w-full min-h-[120px] rounded-xl border-gray-200 bg-gray-50 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:bg-white resize-none placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !isAllFieldsValid()}
                className="w-full md:w-auto h-14 px-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/30 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Finalizar Diagnóstico
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnzoLayout>
  );
};

export default AxisV3Diagnostico;

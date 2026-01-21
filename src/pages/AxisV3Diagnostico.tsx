// AXIS V3 — Diagnóstico Estratégico (Visual Premium Apple-like)

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
  Loader2,
  AlertCircle,
  Zap
} from 'lucide-react';
import { getDiagnosticoV3Questions } from '@/mocks/axis-v3-diagnostico.mock';
import { getAllProdutosTechV3 } from '@/mocks/axis-v3-produtos.mock';
import type { DiagnosticoV3Response } from '@/types/axis-v3';
import { analyzeDiagnostic, type DiagnosticInsight } from '@/lib/axis-v3-intelligence';

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
  const [diagnosticInsight, setDiagnosticInsight] = useState<DiagnosticInsight | null>(null);

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
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analisa o diagnóstico com a Sales Intelligence Engine
    const insight = analyzeDiagnostic(respostas, clientInfo.empresa);
    setDiagnosticInsight(insight);
    
    setIsSubmitting(false);
    setShowResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalQuestions = questions.length;
  const answeredQuestions = Object.values(respostas).filter(r => r.respostaAberta?.trim()).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  if (showResult && diagnosticInsight) {

    return (
      <EnzoLayout>
        <div className="space-y-10 md:space-y-12 pb-12">
          <Card className="overflow-hidden border-0 shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] bg-white rounded-3xl">
            <CardContent className="p-10 md:p-16">
              <div className="flex items-start justify-between mb-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
                      Análise Estratégica Concluída
                    </h2>
                  </div>
                  <p className="text-base md:text-lg text-slate-500 font-light ml-[64px] tracking-tight">
                    Diagnóstico para <strong className="font-medium text-slate-700">{clientInfo.empresa}</strong>
                  </p>
                </div>
              </div>

              {/* Resumo Executivo */}
              <div className="mb-12 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Target className="h-5 w-5 text-slate-700" />
                  <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                    Resumo Executivo
                  </h3>
                </div>
                
                <div className="p-8 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/50">
                  <p className="text-base text-slate-700 leading-relaxed font-light">
                    {diagnosticInsight.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Principais Gargalos */}
              {diagnosticInsight.mainBottlenecks.length > 0 && (
                <div className="mb-12 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                      Principais Gargalos Identificados
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {diagnosticInsight.mainBottlenecks.map((bottleneck, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-5 bg-orange-50/30 rounded-xl border border-orange-100/50"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-light flex-1">
                          {bottleneck}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Soluções Tecnológicas Recomendadas */}
              <div className="mb-12 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="h-5 w-5 text-slate-700" />
                  <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                    Soluções Tecnológicas Recomendadas
                  </h3>
                </div>
                
                <div className="grid gap-5">
                  {diagnosticInsight.recommendedProducts.map((recommendation, index) => {
                    const isPrincipal = recommendation.priority === 1 && index === 0;
                    
                    return (
                      <Card 
                        key={recommendation.produto.id}
                        className={`border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl transition-all duration-200 hover:shadow-[0_8px_30px_0_rgba(0,0,0,0.08)] overflow-hidden ${
                          isPrincipal ? 'ring-2 ring-slate-900/10 border-l-[3px] border-l-slate-900' : ''
                        }`}
                      >
                        <CardContent className="p-8 md:p-10">
                          <div className="space-y-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {isPrincipal && (
                                    <span className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-full">
                                      Recomendação Principal
                                    </span>
                                  )}
                                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    recommendation.priority === 1 
                                      ? 'bg-orange-100 text-orange-700'
                                      : recommendation.priority === 2
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    Relevância: {recommendation.relevanceScore}%
                                  </span>
                                </div>
                                <h4 className="text-lg font-medium text-slate-900 tracking-tight">
                                  {recommendation.produto.produto}
                                </h4>
                              </div>
                            </div>
                            
                            <div className="space-y-4 text-sm">
                              <div className="p-4 bg-orange-50/50 rounded-xl">
                                <span className="font-medium text-orange-900 block mb-1">Por que recomendamos:</span>
                                <span className="text-orange-800 font-light">{recommendation.reason}</span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex gap-3">
                                  <span className="font-medium text-slate-700 min-w-[120px]">Dor Resolvida:</span>
                                  <span className="text-slate-600 font-light">{recommendation.produto.dorEstrategica}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="font-medium text-slate-700 min-w-[120px]">Como Soluciona:</span>
                                  <span className="text-slate-600 font-light">{recommendation.produto.comoSoluciona}</span>
                                </div>
                                <div className="flex gap-3">
                                  <span className="font-medium text-slate-700 min-w-[120px]">Impacto Esperado:</span>
                                  <span className="text-green-700 font-medium">{recommendation.produto.impactoEsperado}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Caminho Estratégico Recomendado */}
              {diagnosticInsight.strategicPath.length > 0 && (
                <div className="mb-12 space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="h-5 w-5 text-slate-700" />
                    <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                      Caminho Estratégico Recomendado
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {diagnosticInsight.strategicPath.map((step, index) => (
                      <div
                        key={step.order}
                        className="relative p-7 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/50"
                      >
                        <div className="flex gap-5">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
                              {step.order}
                            </div>
                          </div>
                          <div className="flex-1 space-y-3">
                            <h4 className="text-lg font-medium text-slate-900 tracking-tight">
                              {step.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-light">
                              {step.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium">Produtos incluídos:</span>
                              <span>{step.productsIncluded.length} solução(ões)</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Linha conectora */}
                        {index < diagnosticInsight.strategicPath.length - 1 && (
                          <div className="absolute left-[34px] top-full w-0.5 h-4 bg-slate-200"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-10">
                <div className="relative p-10 md:p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-lg border border-slate-700/20 overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '32px 32px'
                    }}></div>
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-6 w-6 text-white/90" />
                      <h3 className="text-xl md:text-2xl font-medium text-white tracking-tight">
                        Próximo Passo Recomendado
                      </h3>
                    </div>
                    <p className="text-xl md:text-2xl font-light text-white/90 leading-relaxed tracking-tight">
                      Agendar reunião de apresentação e proposta personalizada
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center pt-8 border-t border-slate-100">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/portfolio'}
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                >
                  Ver Portfólio Completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => {
                    setShowResult(false);
                    setRespostas({});
                    setClientInfo({ nome: '', empresa: '', segmento: '', telefone: '' });
                  }}
                  variant="outline"
                  className="h-12 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-xl transition-all duration-200 font-medium text-sm"
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
      <div className="space-y-10 md:space-y-12 pb-12">
        {/* Header */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-3xl">
          <CardContent className="p-10 md:p-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
                    Diagnóstico Estratégico AXIS V3
                  </h1>
                  <p className="text-base md:text-lg text-slate-500 font-light mt-1 tracking-tight">
                    Assessment empresarial para identificar oportunidades de tecnologia
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs text-slate-400 font-medium tracking-wide">
                  <span>Pergunta {answeredQuestions} de {totalQuestions}</span>
                  <span>{Math.round(progress)}% completo</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identificação do Cliente */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-3xl">
          <CardContent className="p-10 md:p-16">
            <div className="space-y-10">
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">
                  Informações da Empresa
                </h2>
                <p className="text-base md:text-lg text-slate-500 font-light tracking-tight">
                  Essas informações vinculam o diagnóstico a um lead real
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client-nome" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nome do Cliente
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <Input
                      id="client-nome"
                      value={clientInfo.nome}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Nome completo"
                      className="pl-12 h-12 rounded-xl border-slate-200 bg-white text-base transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 focus:outline-none placeholder:text-slate-400 font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-empresa" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Empresa
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <Input
                      id="client-empresa"
                      value={clientInfo.empresa}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, empresa: e.target.value }))}
                      placeholder="Nome da empresa"
                      className="pl-12 h-12 rounded-xl border-slate-200 bg-white text-base transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 focus:outline-none placeholder:text-slate-400 font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-segmento" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Segmento / Setor
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <Input
                      id="client-segmento"
                      value={clientInfo.segmento}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, segmento: e.target.value }))}
                      placeholder="Ex: Consultoria B2B, E-commerce"
                      className="pl-12 h-12 rounded-xl border-slate-200 bg-white text-base transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 focus:outline-none placeholder:text-slate-400 font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-telefone" className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    WhatsApp / Telefone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <Input
                      id="client-telefone"
                      value={clientInfo.telefone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="pl-12 h-12 rounded-xl border-slate-200 bg-white text-base transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 focus:outline-none placeholder:text-slate-400 font-light"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-slate-100" />

        {/* Perguntas do Diagnóstico - UX Premium */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-3xl">
          <CardContent className="p-10 md:p-16">
            <div className="space-y-8">
              {questions.map((question, index) => {
                const resposta = respostas[question.id];
                
                return (
                  <Card 
                    key={question.id}
                    className="border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl transition-all duration-200 hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.06)] overflow-hidden"
                  >
                    <CardContent className="p-8 md:p-10">
                      <div className="space-y-7">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <Label className="text-xl md:text-2xl font-medium text-slate-900 leading-tight tracking-tight">
                              {question.pergunta}
                            </Label>
                            <p className="text-sm text-slate-500 mt-2 font-light tracking-tight">
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
                                    ? 'border-slate-300 bg-slate-50 shadow-sm' 
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40'
                                  }
                                `}
                              >
                                <div className={`
                                  w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                                  transition-all duration-150
                                  ${isSelected 
                                    ? 'bg-slate-900 border-slate-900' 
                                    : 'bg-white border-slate-300'
                                  }
                                `}>
                                  {isSelected && (
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <Label
                                  className={`
                                    text-base font-light cursor-pointer flex-1 leading-relaxed tracking-tight
                                    transition-colors duration-150
                                    ${isSelected ? 'text-slate-900 font-normal' : 'text-slate-700'}
                                  `}
                                >
                                  {opcao}
                                </Label>
                              </div>
                            );
                          })}
                        </div>

                        {/* Campo de Texto Aberto - Sempre Visível */}
                        <div className="space-y-2 pt-6 border-t border-slate-100">
                          <Label htmlFor={`${question.id}-texto`} className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            <span className="text-red-500">* </span>
                            Conte mais sobre sua situação (obrigatório):
                          </Label>
                          <Textarea
                            id={`${question.id}-texto`}
                            value={resposta?.respostaAberta || ''}
                            onChange={(e) => handleTextChange(question.id, e.target.value)}
                            placeholder={question.campoAberto.placeholder}
                            className="w-full min-h-[140px] rounded-xl border-slate-200 bg-slate-50 text-sm transition-all duration-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 focus:outline-none focus:bg-white resize-none placeholder:text-slate-400 font-light leading-relaxed"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="pt-10 mt-10 border-t border-slate-100">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !isAllFieldsValid()}
                className="w-full md:w-auto h-12 px-10 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-900/10 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Finalizar Diagnóstico
                    <ArrowRight className="ml-2 h-4 w-4" />
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

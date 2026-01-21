// AXIS V3 — Portfólio de Produtos (Visual Premium Apple-like)

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnzoLayout } from '@/components/EnzoLayout';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { getAllProdutosTechV3, getProdutosTechV3ByCategoria } from '@/mocks/axis-v3-produtos.mock';
import type { ProdutoTechV3 } from '@/types/axis-v3';
import { Separator } from '@/components/ui/separator';

const AxisV3Portfolio: React.FC = () => {
  const [selectedCategoria, setSelectedCategoria] = useState<ProdutoTechV3['categoria'] | 'todas'>('todas');
  const [selectedProdutos, setSelectedProdutos] = useState<Set<string>>(new Set());
  
  const produtos = selectedCategoria === 'todas' 
    ? getAllProdutosTechV3() 
    : getProdutosTechV3ByCategoria(selectedCategoria);

  const categorias = [
    { value: 'todas', label: 'Todos', count: getAllProdutosTechV3().length },
    { value: 'aquisicao', label: 'Aquisição', count: 4 },
    { value: 'funil', label: 'Funil', count: 4 },
    { value: 'conversao', label: 'Conversão', count: 4 },
    { value: 'gestao', label: 'Gestão', count: 4 },
    { value: 'escala', label: 'Escala', count: 4 }
  ] as const;

  const categoriaLabels: Record<ProdutoTechV3['categoria'], string> = {
    aquisicao: 'Aquisição & Topo',
    funil: 'Funil & Processo',
    conversao: 'Conversão & Fechamento',
    gestao: 'Gestão & Decisão',
    escala: 'Escala & Eficiência'
  };

  const handleProdutoToggle = (produtoId: string) => {
    setSelectedProdutos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(produtoId)) {
        newSet.delete(produtoId);
      } else {
        newSet.add(produtoId);
      }
      return newSet;
    });
  };

  return (
    <EnzoLayout>
      <div className="space-y-10 md:space-y-12 pb-12">
        {/* Header */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-3xl">
          <CardContent className="p-10 md:p-16">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-medium text-slate-900 tracking-tight">
                  Portfólio de Produtos de Tecnologia
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-light tracking-tight max-w-3xl">
                20 soluções estratégicas para estruturar, automatizar e escalar 
                sua operação comercial com tecnologia de ponta.
              </p>
              
              <Button 
                onClick={() => window.location.href = '/axis-v3/diagnostico'}
                className="h-11 px-7 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
              >
                Iniciar Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategoria === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategoria(cat.value as any)}
              className={`whitespace-nowrap rounded-xl transition-all duration-200 font-medium text-sm h-10 ${
                selectedCategoria === cat.value 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat.label}
              <Badge 
                variant="secondary" 
                className={`ml-2 ${
                  selectedCategoria === cat.value 
                    ? 'bg-slate-800 text-white border-0' 
                    : 'bg-slate-100 text-slate-600 border-0'
                }`}
              >
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Tabela de Produtos - UX Premium */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl">
          <CardHeader className="pb-6 pt-8 px-8">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl md:text-2xl font-medium text-slate-900 tracking-tight">
                {categorias.find(c => c.value === selectedCategoria)?.label || 'Produtos'} 
                <span className="text-slate-400 ml-3 font-light">({produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'})</span>
              </CardTitle>
              {selectedProdutos.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-slate-900" />
                  <span className="font-medium">{selectedProdutos.size} selecionado{selectedProdutos.size > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0 px-8 pb-8">
            <div className="overflow-x-auto -mx-8 px-8">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[auto,200px,1fr,1fr,auto] gap-6 pb-4 border-b border-slate-100">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider"></div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Produto</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Dor Estratégica</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">ICP (Perfil Ideal)</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Investimento</div>
                </div>

                {/* Table Body */}
                <div className="space-y-0">
                  {produtos.map((produto) => {
                    const isSelected = selectedProdutos.has(produto.id);
                    
                    return (
                      <div
                        key={produto.id}
                        onClick={() => handleProdutoToggle(produto.id)}
                        className={`
                          grid grid-cols-[auto,200px,1fr,1fr,auto] gap-6 py-5 
                          border-b border-slate-50 cursor-pointer
                          transition-all duration-150 ease-out
                          ${isSelected 
                            ? 'bg-slate-50/70 border-l-[3px] border-l-slate-900 pl-5 -ml-5' 
                            : 'hover:bg-slate-50/40 border-l-[3px] border-l-transparent pl-5 -ml-5'
                          }
                        `}
                      >
                        {/* Checkbox Visual Indicator */}
                        <div className="flex items-center">
                          <div className={`
                            w-5 h-5 rounded-md border-2 flex items-center justify-center
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
                        </div>

                        {/* Categoria Badge */}
                        <div className="flex items-center">
                          <Badge className="bg-slate-100 text-slate-700 text-xs whitespace-nowrap border-0 font-medium">
                            {categoriaLabels[produto.categoria]}
                          </Badge>
                        </div>

                        {/* Produto Nome */}
                        <div className={`
                          flex items-center font-medium text-sm
                          transition-colors duration-150
                          ${isSelected ? 'text-slate-900' : 'text-slate-800'}
                        `}>
                          {produto.produto}
                        </div>

                        {/* Dor Estratégica */}
                        <div className="flex items-center text-sm text-slate-600 font-light">
                          {produto.dorEstrategica}
                        </div>

                        {/* Investimento */}
                        <div className={`
                          flex items-center text-sm font-medium whitespace-nowrap
                          transition-colors duration-150
                          ${isSelected ? 'text-slate-900' : 'text-slate-700'}
                        `}>
                          {produto.investimentoMedio}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {produtos.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-slate-400 text-sm font-light">
                    Nenhum produto encontrado nesta categoria.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-slate-100" />

        {/* Detalhes Expandidos - Cards por Produto */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-medium text-slate-900 tracking-tight">
              Detalhamento Completo
            </h2>
            <p className="text-base text-slate-500 font-light tracking-tight">
              Veja como cada solução funciona e o impacto esperado
            </p>
          </div>

          <div className="grid gap-5">
            {produtos.map((produto, index) => {
              const isSelected = selectedProdutos.has(produto.id);
              
              return (
                <Card 
                  key={produto.id}
                  className={`
                    border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] 
                    bg-white rounded-2xl transition-all duration-200
                    ${isSelected 
                      ? 'ring-2 ring-slate-900/10 shadow-[0_8px_30px_0_rgba(0,0,0,0.08)]' 
                      : 'hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.06)]'
                    }
                  `}
                >
                  <CardContent className="p-8 md:p-10">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`
                            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
                            transition-colors duration-200
                            ${isSelected 
                              ? 'bg-slate-900 text-white' 
                              : 'bg-slate-100 text-slate-700'
                            }
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-medium text-slate-900 tracking-tight">
                              {produto.produto}
                            </h3>
                            <Badge className="bg-slate-100 text-slate-700 text-xs mt-2 border-0 font-medium">
                              {categoriaLabels[produto.categoria]}
                            </Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-6 w-6 text-slate-900 flex-shrink-0" />
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Dor Estratégica
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed font-light">
                            {produto.dorEstrategica}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Perfil Ideal de Cliente
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed font-light">
                            {produto.icp}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Como a Tecnologia Soluciona
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed font-light">
                          {produto.comoSoluciona}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1 p-5 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Investimento Médio
                          </div>
                          <p className="text-base font-medium text-slate-900">
                            {produto.investimentoMedio}
                          </p>
                        </div>

                        <div className="space-y-1 p-5 bg-green-50/50 rounded-xl border border-green-100/50">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Impacto Esperado
                          </div>
                          <p className="text-sm text-green-700 font-medium leading-relaxed">
                            {produto.impactoEsperado}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* CTA Final */}
        <Card className="overflow-hidden border-0 shadow-[0_8px_30px_0_rgba(0,0,0,0.12)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl">
          <CardContent className="p-10 md:p-16 relative">
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>

            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
                Pronto para Transformar sua Operação Comercial?
              </h2>
              <p className="text-lg md:text-xl text-white/80 font-light max-w-3xl mx-auto tracking-tight">
                Faça o diagnóstico estratégico gratuito e descubra quais produtos 
                são mais adequados para o momento da sua empresa.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-6">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/diagnostico'}
                  variant="secondary"
                  className="h-12 px-8 bg-white text-slate-900 hover:bg-white/90 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                >
                  Iniciar Diagnóstico
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  className="h-12 px-8 bg-transparent border-white/20 border-2 text-white hover:bg-white/5 hover:border-white/30 font-medium rounded-xl transition-all duration-200 text-sm"
                >
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Investimento Personalizado',
              description: 'Cada projeto é dimensionado de acordo com a realidade e necessidades específicas da sua empresa.'
            },
            {
              title: 'Implementação Consultiva',
              description: 'Não entregamos apenas tecnologia. Garantimos adoção, treinamento e transferência de conhecimento.'
            },
            {
              title: 'Suporte Contínuo',
              description: 'Acompanhamento pós-implementação para garantir resultados sustentáveis e evolução constante.'
            }
          ].map((item, index) => (
            <Card key={index} className="border-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-white rounded-2xl hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.06)] transition-all duration-200">
              <CardContent className="p-7">
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </EnzoLayout>
  );
};

export default AxisV3Portfolio;

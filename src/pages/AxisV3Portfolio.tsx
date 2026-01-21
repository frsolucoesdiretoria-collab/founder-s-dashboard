// AXIS V3 — Portfólio de Produtos (Dashboard + UX Premium)

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
      <div className="space-y-6 md:space-y-8 pb-8">
        {/* Header */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-3xl">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                  Portfólio de Produtos de Tecnologia
                </h1>
              </div>
              
              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
                20 soluções estratégicas para estruturar, automatizar e escalar 
                sua operação comercial com tecnologia de ponta.
              </p>
              
              <Button 
                onClick={() => window.location.href = '/axis-v3/diagnostico'}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-sm"
              >
                Iniciar Diagnóstico Gratuito
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {categorias.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategoria === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategoria(cat.value as any)}
              className={`whitespace-nowrap rounded-xl transition-all duration-200 font-medium text-sm h-10 ${
                selectedCategoria === cat.value 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat.label}
              <Badge 
                variant="secondary" 
                className={`ml-2 ${
                  selectedCategoria === cat.value 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Tabela de Produtos - UX Premium */}
        <Card className="overflow-hidden border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
                {categorias.find(c => c.value === selectedCategoria)?.label || 'Produtos'} 
                <span className="text-gray-400 ml-2">({produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'})</span>
              </CardTitle>
              {selectedProdutos.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{selectedProdutos.size} selecionado{selectedProdutos.size > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto -mx-6 px-6">
              <div className="min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-[auto,200px,1fr,1fr,auto] gap-4 pb-3 border-b border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider"></div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Produto</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dor Estratégica</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ICP (Perfil Ideal)</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Investimento</div>
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
                          grid grid-cols-[auto,200px,1fr,1fr,auto] gap-4 py-4 
                          border-b border-gray-50 cursor-pointer
                          transition-all duration-150 ease-out
                          ${isSelected 
                            ? 'bg-blue-50/50 border-l-4 border-l-blue-500 pl-3 -ml-3' 
                            : 'hover:bg-gray-50/70 border-l-4 border-l-transparent pl-3 -ml-3'
                          }
                        `}
                      >
                        {/* Checkbox Visual Indicator */}
                        <div className="flex items-center">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center
                            transition-all duration-150
                            ${isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'bg-white border-gray-300 group-hover:border-gray-400'
                            }
                          `}>
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>

                        {/* Categoria Badge */}
                        <div className="flex items-center">
                          <Badge className="bg-blue-100 text-blue-700 text-xs whitespace-nowrap">
                            {categoriaLabels[produto.categoria]}
                          </Badge>
                        </div>

                        {/* Produto Nome */}
                        <div className={`
                          flex items-center font-medium text-sm
                          transition-colors duration-150
                          ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                        `}>
                          {produto.produto}
                        </div>

                        {/* Dor Estratégica */}
                        <div className="flex items-center text-sm text-gray-700 font-normal">
                          {produto.dorEstrategica}
                        </div>

                        {/* Investimento */}
                        <div className={`
                          flex items-center text-sm font-semibold whitespace-nowrap
                          transition-colors duration-150
                          ${isSelected ? 'text-blue-700' : 'text-gray-700'}
                        `}>
                          {produto.investimentoMedio}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {produtos.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-sm">
                    Nenhum produto encontrado nesta categoria.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Detalhes Expandidos - Cards por Produto */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 tracking-tight">
              Detalhamento Completo
            </h2>
            <p className="text-sm text-gray-500 font-light">
              Veja como cada solução funciona e o impacto esperado
            </p>
          </div>

          <div className="grid gap-4">
            {produtos.map((produto, index) => {
              const isSelected = selectedProdutos.has(produto.id);
              
              return (
                <Card 
                  key={produto.id}
                  className={`
                    border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] 
                    bg-white rounded-2xl transition-all duration-300
                    ${isSelected 
                      ? 'ring-2 ring-blue-500/20 shadow-[0_4px_12px_0_rgba(59,130,246,0.15)]' 
                      : 'hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.08)]'
                    }
                  `}
                >
                  <CardContent className="p-6 md:p-8">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`
                            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                            transition-colors duration-200
                            ${isSelected 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-100 text-blue-600'
                            }
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                              {produto.produto}
                            </h3>
                            <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                              {categoriaLabels[produto.categoria]}
                            </Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Dor Estratégica
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {produto.dorEstrategica}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Perfil Ideal de Cliente
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {produto.icp}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Como a Tecnologia Soluciona
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {produto.comoSoluciona}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1 p-4 bg-blue-50/50 rounded-xl">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Investimento Médio
                          </div>
                          <p className="text-base font-semibold text-blue-700">
                            {produto.investimentoMedio}
                          </p>
                        </div>

                        <div className="space-y-1 p-4 bg-green-50/50 rounded-xl">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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

        <Separator />

        {/* CTA Final */}
        <Card className="overflow-hidden border-0 shadow-[0_10px_50px_0_rgba(0,0,0,0.08),0_1px_3px_0_rgba(0,0,0,0.1)] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl">
          <CardContent className="p-8 md:p-12 relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px'
              }}></div>
            </div>

            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
                Pronto para Transformar sua Operação Comercial?
              </h2>
              <p className="text-base md:text-lg text-white/90 font-light max-w-3xl mx-auto">
                Faça o diagnóstico estratégico gratuito e descubra quais produtos 
                são mais adequados para o momento da sua empresa.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => window.location.href = '/axis-v3/diagnostico'}
                  variant="secondary"
                  className="h-14 px-10 bg-white text-blue-700 hover:bg-white/90 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-[0.98] text-base"
                >
                  Iniciar Diagnóstico
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  className="h-14 px-10 bg-transparent border-white border-2 text-white hover:bg-white/10 font-medium rounded-xl transition-all duration-200 text-base"
                >
                  Falar com Especialista
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Investimento Personalizado
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Cada projeto é dimensionado de acordo com a realidade e necessidades 
                  específicas da sua empresa.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Implementação Consultiva
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Não entregamos apenas tecnologia. Garantimos adoção, treinamento 
                  e transferência de conhecimento.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] bg-white rounded-2xl">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                  Suporte Contínuo
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Acompanhamento pós-implementação para garantir resultados sustentáveis 
                  e evolução constante.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EnzoLayout>
  );
};

export default AxisV3Portfolio;

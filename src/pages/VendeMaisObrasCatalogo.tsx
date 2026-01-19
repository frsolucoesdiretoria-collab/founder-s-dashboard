import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServicos } from '@/services/vendeMaisObras.service';
import type { Servico } from '@/types/vendeMaisObras';
import { 
  Search, 
  Edit, 
  Trash2, 
  Hammer, 
  Building2, 
  Zap, 
  Droplet, 
  Flame, 
  Wind, 
  Paintbrush, 
  Grid3x3,
  CheckSquare2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dados mockados para fallback (caso API não esteja disponível)
const servicosMock: Servico[] = [
  // Demolições
  { id: '1', Codigo: 'DEM-001', Nome: 'Demolição de Paredes', Descricao: 'Demolição de paredes de alvenaria', Categoria: 'Demolições', Preco: 45.00, Unidade: 'm²', Ativo: true },
  { id: '2', Codigo: 'DEM-002', Nome: 'Demolição de Pisos', Descricao: 'Demolição de pisos cerâmicos e cimentícios', Categoria: 'Demolições', Preco: 35.00, Unidade: 'm²', Ativo: true },
  { id: '3', Codigo: 'DEM-003', Nome: 'Demolição de Forros', Descricao: 'Demolição de forros de gesso e madeira', Categoria: 'Demolições', Preco: 25.00, Unidade: 'm²', Ativo: true },
  
  // Alvenaria
  { id: '4', Codigo: 'ALV-001', Nome: 'Parede de Blocos', Descricao: 'Construção de paredes com blocos cerâmicos', Categoria: 'Alvenaria', Preco: 85.00, Unidade: 'm²', Ativo: true },
  { id: '5', Codigo: 'ALV-002', Nome: 'Parede de Tijolos', Descricao: 'Construção de paredes com tijolos comuns', Categoria: 'Alvenaria', Preco: 75.00, Unidade: 'm²', Ativo: true },
  { id: '6', Codigo: 'ALV-003', Nome: 'Parede de Concreto', Descricao: 'Construção de paredes de concreto armado', Categoria: 'Alvenaria', Preco: 150.00, Unidade: 'm²', Ativo: true },
  
  // Elétrica
  { id: '7', Codigo: 'ELT-001', Nome: 'Instalação de Tomadas', Descricao: 'Instalação de tomadas elétricas', Categoria: 'Elétrica', Preco: 45.00, Unidade: 'unidade', Ativo: true },
  { id: '8', Codigo: 'ELT-002', Nome: 'Instalação de Interruptores', Descricao: 'Instalação de interruptores simples e paralelos', Categoria: 'Elétrica', Preco: 35.00, Unidade: 'unidade', Ativo: true },
  { id: '9', Codigo: 'ELT-003', Nome: 'Instalação de Luminárias', Descricao: 'Instalação de luminárias e lustres', Categoria: 'Elétrica', Preco: 60.00, Unidade: 'unidade', Ativo: true },
  
  // Hidráulica
  { id: '10', Codigo: 'HID-001', Nome: 'Instalação de Torneiras', Descricao: 'Instalação de torneiras e misturadores', Categoria: 'Hidráulica', Preco: 80.00, Unidade: 'unidade', Ativo: true },
  { id: '11', Codigo: 'HID-002', Nome: 'Instalação de Chuveiros', Descricao: 'Instalação de chuveiros e duchas', Categoria: 'Hidráulica', Preco: 100.00, Unidade: 'unidade', Ativo: true },
  { id: '12', Codigo: 'HID-003', Nome: 'Instalação de Vasos', Descricao: 'Instalação de vasos sanitários', Categoria: 'Hidráulica', Preco: 150.00, Unidade: 'unidade', Ativo: true },
  
  // Gás
  { id: '13', Codigo: 'GAS-001', Nome: 'Instalação de Tubulações', Descricao: 'Instalação de tubulações de gás', Categoria: 'Gás', Preco: 25.00, Unidade: 'm', Ativo: true },
  { id: '14', Codigo: 'GAS-002', Nome: 'Instalação de Fogões', Descricao: 'Instalação de fogões a gás', Categoria: 'Gás', Preco: 120.00, Unidade: 'unidade', Ativo: true },
  { id: '15', Codigo: 'GAS-003', Nome: 'Instalação de Aquecedores', Descricao: 'Instalação de aquecedores a gás', Categoria: 'Gás', Preco: 350.00, Unidade: 'unidade', Ativo: true },
  
  // Ar Condicionado
  { id: '16', Codigo: 'AC-001', Nome: 'Instalação Split', Descricao: 'Instalação de ar condicionado split', Categoria: 'Ar Condicionado', Preco: 300.00, Unidade: 'unidade', Ativo: true },
  { id: '17', Codigo: 'AC-002', Nome: 'Instalação Central', Descricao: 'Instalação de ar condicionado central', Categoria: 'Ar Condicionado', Preco: 800.00, Unidade: 'unidade', Ativo: true },
  { id: '18', Codigo: 'AC-003', Nome: 'Instalação Janela', Descricao: 'Instalação de ar condicionado de janela', Categoria: 'Ar Condicionado', Preco: 200.00, Unidade: 'unidade', Ativo: true },
  
  // Pinturas
  { id: '19', Codigo: 'PINT-001', Nome: 'Pintura Interna', Descricao: 'Pintura de paredes internas', Categoria: 'Pinturas', Preco: 25.00, Unidade: 'm²', Ativo: true },
  { id: '20', Codigo: 'PINT-002', Nome: 'Pintura Externa', Descricao: 'Pintura de paredes externas', Categoria: 'Pinturas', Preco: 35.00, Unidade: 'm²', Ativo: true },
  { id: '21', Codigo: 'PINT-003', Nome: 'Pintura de Teto', Descricao: 'Pintura de forros e tetos', Categoria: 'Pinturas', Preco: 20.00, Unidade: 'm²', Ativo: true },
  
  // Pisos e Revestimentos
  { id: '22', Codigo: 'PISO-001', Nome: 'Piso Cerâmico', Descricao: 'Instalação de piso cerâmico', Categoria: 'Pisos e Revestimentos', Preco: 45.00, Unidade: 'm²', Ativo: true },
  { id: '23', Codigo: 'PISO-002', Nome: 'Piso Porcelanato', Descricao: 'Instalação de piso porcelanato', Categoria: 'Pisos e Revestimentos', Preco: 65.00, Unidade: 'm²', Ativo: true },
  { id: '24', Codigo: 'PISO-003', Nome: 'Piso Laminado', Descricao: 'Instalação de piso laminado', Categoria: 'Pisos e Revestimentos', Preco: 55.00, Unidade: 'm²', Ativo: true },
];

const categorias = [
  { id: 'todos', label: 'Todos', icon: CheckSquare2 },
  { id: 'Demolições', label: 'Demolições', icon: Hammer },
  { id: 'Alvenaria', label: 'Alvenaria', icon: Building2 },
  { id: 'Elétrica', label: 'Elétrica', icon: Zap },
  { id: 'Hidráulica', label: 'Hidráulica', icon: Droplet },
  { id: 'Gás', label: 'Gás', icon: Flame },
  { id: 'Ar Condicionado', label: 'Ar Condicionado', icon: Wind },
  { id: 'Pinturas', label: 'Pinturas', icon: Paintbrush },
  { id: 'Pisos e Revestimentos', label: 'Pisos e Revestimentos', icon: Grid3x3 },
];

const getCategoriaIcon = (categoria: string) => {
  const cat = categorias.find(c => c.id === categoria);
  return cat?.icon || CheckSquare2;
};

const getCategoriaColor = (categoria: string): string => {
  const colors: Record<string, string> = {
    'Demolições': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Alvenaria': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Elétrica': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Hidráulica': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Gás': 'bg-red-500/20 text-red-400 border-red-500/30',
    'Ar Condicionado': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Pinturas': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Pisos e Revestimentos': 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  return colors[categoria] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

export default function VendeMaisObrasCatalogo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todos');

  // Buscar serviços da API
  const { data: servicos = [], isLoading, error } = useQuery({
    queryKey: ['servicos', categoriaSelecionada === 'todos' ? undefined : categoriaSelecionada],
    queryFn: () => getServicos(categoriaSelecionada === 'todos' ? undefined : categoriaSelecionada, true),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Usar dados da API ou fallback para mock (sempre mostrar algo)
  const servicosDisponiveis = servicos && servicos.length > 0 ? servicos : servicosMock;

  const servicosFiltrados = servicosDisponiveis.filter(servico => {
    if (!servico) return false;
    const nome = servico.Nome || '';
    const descricao = servico.Descricao || '';
    const matchSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaSelecionada === 'todos' || servico.Categoria === categoriaSelecionada;
    return matchSearch && matchCategoria;
  });

  const servicosPorCategoria = categorias.filter(c => c.id !== 'todos').map(cat => ({
    ...cat,
    count: servicosDisponiveis.filter(s => s.Categoria === cat.id).length,
  }));

  const totalServicos = servicosDisponiveis.length;

  return (
    <VendeMaisObrasLayout
      title="Catálogo de Serviços"
      subtitle="Gerencie seus serviços e preços"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1f1f1f] border-[#2a2a2a] text-white placeholder:text-gray-500"
          />
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => {
            const Icon = cat.icon;
            const isSelected = categoriaSelecionada === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setCategoriaSelecionada(cat.id)}
                disabled={isLoading}
                className={cn(
                  isSelected && 'bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90',
                  !isSelected && 'bg-[#1f1f1f] border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a]'
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FFD700]">{totalServicos}</div>
            </CardContent>
          </Card>
          {servicosPorCategoria.map((cat) => (
            <Card key={cat.id} className="bg-[#1f1f1f] border-[#2a2a2a]">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">{cat.count} {cat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <cat.icon className="h-8 w-8 text-[#FFD700]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#FFD700] mx-auto mb-4" />
            <p className="text-gray-400">Carregando serviços...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-2">Erro ao carregar serviços</p>
            <p className="text-gray-400 text-sm">Usando dados de exemplo</p>
          </div>
        )}

        {/* Grid de Serviços */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {servicosFiltrados.map((servico) => {
                if (!servico) return null;
                const Icon = getCategoriaIcon(servico.Categoria || '');
                const categoria = servico.Categoria || 'Outros';
                const preco = servico.Preco || 0;
                const unidade = servico.Unidade || 'unidade';
                
                return (
                  <Card key={servico.id} className="bg-[#1f1f1f] border-[#2a2a2a] hover:border-[#FFD700]/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#FFD700]" />
                          <Badge className={getCategoriaColor(categoria)}>
                            {categoria}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-bold text-white text-lg mb-1">{servico.Nome || 'Sem nome'}</h3>
                      <p className="text-sm text-gray-400 mb-4">{servico.Descricao || 'Sem descrição'}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#FFD700]">
                          R$ {preco.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-sm text-gray-400">por {unidade} / unidade</span>
                      </div>
                      {servico.Codigo && (
                        <p className="text-xs text-gray-500 mt-2">Código: {servico.Codigo}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {servicosFiltrados.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400">Nenhum serviço encontrado.</p>
              </div>
            )}
          </>
        )}
      </div>
    </VendeMaisObrasLayout>
  );
}

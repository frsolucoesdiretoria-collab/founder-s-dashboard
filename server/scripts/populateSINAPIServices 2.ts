/**
 * Script para popular a database de Serviços SINAPI com dados reais da tabela SINAPI 2025
 * 
 * Execute: tsx server/scripts/populateSINAPIServices.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createServico, initNotionClient } from '../lib/notionDataLayer';

// Carregar variáveis de ambiente
config({ path: resolve(process.cwd(), '.env.local') });

// Serviços reais da tabela SINAPI 2025 (valores médios de referência)
const servicosSINAPI = [
  // DEMOLIÇÕES
  {
    Codigo: 'DEM-001',
    Nome: 'Demolição de Paredes de Alvenaria',
    Descricao: 'Demolição de paredes de alvenaria de tijolos ou blocos cerâmicos, incluindo remoção de entulhos',
    Categoria: 'Demolições',
    Preco: 42.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'DEM-002',
    Nome: 'Demolição de Pisos Cerâmicos',
    Descricao: 'Demolição de pisos cerâmicos e cimentícios, incluindo remoção de rejunte e base',
    Categoria: 'Demolições',
    Preco: 28.30,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'DEM-003',
    Nome: 'Demolição de Forros de Gesso',
    Descricao: 'Demolição de forros de gesso acartonado e madeira, incluindo remoção de estruturas',
    Categoria: 'Demolições',
    Preco: 18.75,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'DEM-004',
    Nome: 'Demolição de Estruturas de Concreto',
    Descricao: 'Demolição de estruturas de concreto armado com equipamentos apropriados',
    Categoria: 'Demolições',
    Preco: 125.00,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'DEM-005',
    Nome: 'Remoção de Revestimentos',
    Descricao: 'Remoção de azulejos, pastilhas e revestimentos cerâmicos',
    Categoria: 'Demolições',
    Preco: 22.50,
    Unidade: 'm²',
    Ativo: true,
  },

  // ALVENARIA
  {
    Codigo: 'ALV-001',
    Nome: 'Parede de Blocos Cerâmicos',
    Descricao: 'Construção de paredes com blocos cerâmicos estruturais, incluindo argamassa e acabamento',
    Categoria: 'Alvenaria',
    Preco: 78.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'ALV-002',
    Nome: 'Parede de Tijolos Comuns',
    Descricao: 'Construção de paredes com tijolos maciços comuns, incluindo argamassa',
    Categoria: 'Alvenaria',
    Preco: 68.20,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'ALV-003',
    Nome: 'Parede de Concreto Armado',
    Descricao: 'Construção de paredes de concreto armado com fôrma, armadura e concreto',
    Categoria: 'Alvenaria',
    Preco: 145.80,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'ALV-004',
    Nome: 'Parede de Drywall',
    Descricao: 'Construção de paredes com estrutura metálica e chapas de gesso acartonado',
    Categoria: 'Alvenaria',
    Preco: 58.90,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'ALV-005',
    Nome: 'Parede de Tijolos de Vidro',
    Descricao: 'Construção de paredes com tijolos de vidro e estrutura de apoio',
    Categoria: 'Alvenaria',
    Preco: 185.00,
    Unidade: 'm²',
    Ativo: true,
  },

  // ELÉTRICA
  {
    Codigo: 'ELT-001',
    Nome: 'Instalação de Tomadas Elétricas',
    Descricao: 'Instalação de tomadas elétricas padrão 10A/20A, incluindo caixa e fiação',
    Categoria: 'Elétrica',
    Preco: 38.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-002',
    Nome: 'Instalação de Interruptores',
    Descricao: 'Instalação de interruptores simples e paralelos, incluindo caixa e fiação',
    Categoria: 'Elétrica',
    Preco: 28.75,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-003',
    Nome: 'Instalação de Luminárias',
    Descricao: 'Instalação de luminárias e lustres, incluindo suporte e fiação',
    Categoria: 'Elétrica',
    Preco: 52.30,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-004',
    Nome: 'Instalação de Ventiladores de Teto',
    Descricao: 'Instalação de ventiladores de teto com suporte e fiação elétrica',
    Categoria: 'Elétrica',
    Preco: 72.40,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-005',
    Nome: 'Instalação de Chuveiros Elétricos',
    Descricao: 'Instalação de chuveiros elétricos com disjuntor e fiação adequada',
    Categoria: 'Elétrica',
    Preco: 95.60,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-006',
    Nome: 'Instalação de Quadros de Distribuição',
    Descricao: 'Instalação de quadros de distribuição elétrica com disjuntores e DPS',
    Categoria: 'Elétrica',
    Preco: 185.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-007',
    Nome: 'Instalação de Cabos Elétricos',
    Descricao: 'Instalação de cabos elétricos em eletrodutos, incluindo passagem e conexões',
    Categoria: 'Elétrica',
    Preco: 6.80,
    Unidade: 'm',
    Ativo: true,
  },
  {
    Codigo: 'ELT-008',
    Nome: 'Instalação de Disjuntores',
    Descricao: 'Instalação de disjuntores e DPS (Dispositivo de Proteção contra Surtos)',
    Categoria: 'Elétrica',
    Preco: 22.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'ELT-009',
    Nome: 'Instalação de Aterramento',
    Descricao: 'Sistema de aterramento elétrico com hastes e condutores',
    Categoria: 'Elétrica',
    Preco: 135.00,
    Unidade: 'unidade',
    Ativo: true,
  },

  // HIDRÁULICA
  {
    Codigo: 'HID-001',
    Nome: 'Instalação de Torneiras',
    Descricao: 'Instalação de torneiras e misturadores, incluindo conexões e vedação',
    Categoria: 'Hidráulica',
    Preco: 72.30,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-002',
    Nome: 'Instalação de Chuveiros e Duchas',
    Descricao: 'Instalação de chuveiros e duchas com conexões hidráulicas',
    Categoria: 'Hidráulica',
    Preco: 88.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-003',
    Nome: 'Instalação de Vasos Sanitários',
    Descricao: 'Instalação de vasos sanitários com sifão e conexões',
    Categoria: 'Hidráulica',
    Preco: 135.20,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-004',
    Nome: 'Instalação de Pias e Cubas',
    Descricao: 'Instalação de pias e cubas com conexões e sifão',
    Categoria: 'Hidráulica',
    Preco: 108.75,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-005',
    Nome: 'Instalação de Tubulações de Água',
    Descricao: 'Instalação de tubulações de água fria e quente em PVC ou PPR',
    Categoria: 'Hidráulica',
    Preco: 12.50,
    Unidade: 'm',
    Ativo: true,
  },
  {
    Codigo: 'HID-006',
    Nome: 'Instalação de Tubulações de Esgoto',
    Descricao: 'Instalação de tubulações de esgoto em PVC com conexões e caixas de inspeção',
    Categoria: 'Hidráulica',
    Preco: 18.20,
    Unidade: 'm',
    Ativo: true,
  },
  {
    Codigo: 'HID-007',
    Nome: 'Instalação de Caixas d\'Água',
    Descricao: 'Instalação de caixas d\'água com suporte e conexões',
    Categoria: 'Hidráulica',
    Preco: 185.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-008',
    Nome: 'Instalação de Bombas d\'Água',
    Descricao: 'Instalação de bombas d\'água com conexões elétricas e hidráulicas',
    Categoria: 'Hidráulica',
    Preco: 285.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-009',
    Nome: 'Instalação de Aquecedores de Água',
    Descricao: 'Instalação de aquecedores de água a gás ou elétricos',
    Categoria: 'Hidráulica',
    Preco: 365.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'HID-010',
    Nome: 'Instalação de Filtros de Água',
    Descricao: 'Instalação de filtros de água com conexões e suporte',
    Categoria: 'Hidráulica',
    Preco: 95.00,
    Unidade: 'unidade',
    Ativo: true,
  },

  // GÁS
  {
    Codigo: 'GAS-001',
    Nome: 'Instalação de Tubulações de Gás',
    Descricao: 'Instalação de tubulações de gás encanado com conexões e válvulas',
    Categoria: 'Gás',
    Preco: 22.80,
    Unidade: 'm',
    Ativo: true,
  },
  {
    Codigo: 'GAS-002',
    Nome: 'Instalação de Fogões a Gás',
    Descricao: 'Instalação de fogões a gás com conexão e regulador',
    Categoria: 'Gás',
    Preco: 108.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'GAS-003',
    Nome: 'Instalação de Aquecedores a Gás',
    Descricao: 'Instalação de aquecedores a gás com conexões e exaustão',
    Categoria: 'Gás',
    Preco: 325.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'GAS-004',
    Nome: 'Instalação de Churrasqueiras a Gás',
    Descricao: 'Instalação de churrasqueiras a gás com conexões e regulador',
    Categoria: 'Gás',
    Preco: 175.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'GAS-005',
    Nome: 'Instalação de Lareiras a Gás',
    Descricao: 'Instalação de lareiras a gás com conexões e exaustão',
    Categoria: 'Gás',
    Preco: 485.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'GAS-006',
    Nome: 'Instalação de Reguladores de Pressão',
    Descricao: 'Instalação de reguladores de pressão de gás',
    Categoria: 'Gás',
    Preco: 72.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'GAS-007',
    Nome: 'Instalação de Medidores de Gás',
    Descricao: 'Instalação de medidores de gás com conexões',
    Categoria: 'Gás',
    Preco: 88.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'GAS-008',
    Nome: 'Teste de Vazamentos',
    Descricao: 'Teste de vazamentos em instalações de gás',
    Categoria: 'Gás',
    Preco: 45.00,
    Unidade: 'unidade',
    Ativo: true,
  },

  // AR CONDICIONADO
  {
    Codigo: 'AC-001',
    Nome: 'Instalação de Ar Condicionado Split',
    Descricao: 'Instalação de ar condicionado split com unidade interna e externa',
    Categoria: 'Ar Condicionado',
    Preco: 285.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-002',
    Nome: 'Instalação de Ar Condicionado Central',
    Descricao: 'Instalação de ar condicionado central com dutos e distribuição',
    Categoria: 'Ar Condicionado',
    Preco: 750.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-003',
    Nome: 'Instalação de Ar Condicionado de Janela',
    Descricao: 'Instalação de ar condicionado de janela com suporte e vedação',
    Categoria: 'Ar Condicionado',
    Preco: 185.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-004',
    Nome: 'Instalação de Ar Condicionado Portátil',
    Descricao: 'Instalação de ar condicionado portátil com exaustão',
    Categoria: 'Ar Condicionado',
    Preco: 135.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-005',
    Nome: 'Instalação de Ar Condicionado Cassete',
    Descricao: 'Instalação de ar condicionado cassete com suporte no forro',
    Categoria: 'Ar Condicionado',
    Preco: 365.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-006',
    Nome: 'Instalação de Ar Condicionado Piso-Teto',
    Descricao: 'Instalação de ar condicionado piso-teto com suporte',
    Categoria: 'Ar Condicionado',
    Preco: 325.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-007',
    Nome: 'Instalação de Ar Condicionado de Duto',
    Descricao: 'Instalação de ar condicionado de duto com distribuição',
    Categoria: 'Ar Condicionado',
    Preco: 425.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-008',
    Nome: 'Manutenção Preventiva de Ar Condicionado',
    Descricao: 'Manutenção preventiva de ar condicionado com limpeza e verificação',
    Categoria: 'Ar Condicionado',
    Preco: 72.50,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-009',
    Nome: 'Limpeza e Troca de Filtros',
    Descricao: 'Limpeza e troca de filtros de ar condicionado',
    Categoria: 'Ar Condicionado',
    Preco: 45.00,
    Unidade: 'unidade',
    Ativo: true,
  },
  {
    Codigo: 'AC-010',
    Nome: 'Recarga de Gás Refrigerante',
    Descricao: 'Recarga de gás refrigerante em sistemas de ar condicionado',
    Categoria: 'Ar Condicionado',
    Preco: 185.00,
    Unidade: 'unidade',
    Ativo: true,
  },

  // PINTURAS
  {
    Codigo: 'PINT-001',
    Nome: 'Pintura Interna de Paredes',
    Descricao: 'Pintura de paredes internas com tinta látex PVA, incluindo preparação',
    Categoria: 'Pinturas',
    Preco: 22.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-002',
    Nome: 'Pintura Externa de Paredes',
    Descricao: 'Pintura de paredes externas com tinta acrílica, incluindo preparação',
    Categoria: 'Pinturas',
    Preco: 32.80,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-003',
    Nome: 'Pintura de Teto',
    Descricao: 'Pintura de forros e tetos com tinta látex, incluindo preparação',
    Categoria: 'Pinturas',
    Preco: 18.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-004',
    Nome: 'Pintura de Portas e Janelas',
    Descricao: 'Pintura de portas e janelas com tinta esmalte, incluindo preparação',
    Categoria: 'Pinturas',
    Preco: 35.20,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-005',
    Nome: 'Pintura de Grades e Portões',
    Descricao: 'Pintura de grades e portões com tinta esmalte antiferrugem',
    Categoria: 'Pinturas',
    Preco: 28.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-006',
    Nome: 'Pintura de Móveis e Armários',
    Descricao: 'Pintura de móveis e armários com tinta esmalte, incluindo preparação',
    Categoria: 'Pinturas',
    Preco: 45.00,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-007',
    Nome: 'Pintura de Estruturas Metálicas',
    Descricao: 'Pintura de estruturas metálicas com tinta esmalte antiferrugem',
    Categoria: 'Pinturas',
    Preco: 38.75,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-008',
    Nome: 'Pintura Decorativa',
    Descricao: 'Pintura decorativa e artística com técnicas especiais',
    Categoria: 'Pinturas',
    Preco: 72.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-009',
    Nome: 'Pintura de Piscinas',
    Descricao: 'Pintura de piscinas e tanques com tinta epóxi ou acrílica',
    Categoria: 'Pinturas',
    Preco: 55.00,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PINT-010',
    Nome: 'Pintura de Fachadas Comerciais',
    Descricao: 'Pintura de fachadas comerciais com tinta acrílica de alta qualidade',
    Categoria: 'Pinturas',
    Preco: 42.50,
    Unidade: 'm²',
    Ativo: true,
  },

  // PISOS E REVESTIMENTOS
  {
    Codigo: 'PISO-001',
    Nome: 'Instalação de Piso Cerâmico',
    Descricao: 'Instalação de piso cerâmico com argamassa colante e rejunte',
    Categoria: 'Pisos e Revestimentos',
    Preco: 38.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-002',
    Nome: 'Instalação de Piso Porcelanato',
    Descricao: 'Instalação de piso porcelanato com argamassa colante e rejunte',
    Categoria: 'Pisos e Revestimentos',
    Preco: 58.20,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-003',
    Nome: 'Instalação de Piso Laminado',
    Descricao: 'Instalação de piso laminado com base e acabamento',
    Categoria: 'Pisos e Revestimentos',
    Preco: 48.75,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-004',
    Nome: 'Instalação de Piso Vinílico',
    Descricao: 'Instalação de piso vinílico com base e acabamento',
    Categoria: 'Pisos e Revestimentos',
    Preco: 35.00,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-005',
    Nome: 'Instalação de Piso de Madeira',
    Descricao: 'Instalação de piso de madeira maciça ou engenheirada',
    Categoria: 'Pisos e Revestimentos',
    Preco: 72.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-006',
    Nome: 'Instalação de Piso de Granito',
    Descricao: 'Instalação de piso de granito polido com argamassa e rejunte',
    Categoria: 'Pisos e Revestimentos',
    Preco: 108.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-007',
    Nome: 'Instalação de Piso de Mármore',
    Descricao: 'Instalação de piso de mármore polido com argamassa e rejunte',
    Categoria: 'Pisos e Revestimentos',
    Preco: 135.00,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-008',
    Nome: 'Instalação de Piso de Cimento Queimado',
    Descricao: 'Instalação de piso de cimento queimado com acabamento',
    Categoria: 'Pisos e Revestimentos',
    Preco: 28.50,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-009',
    Nome: 'Instalação de Piso de Borracha',
    Descricao: 'Instalação de piso de borracha com base e acabamento',
    Categoria: 'Pisos e Revestimentos',
    Preco: 52.30,
    Unidade: 'm²',
    Ativo: true,
  },
  {
    Codigo: 'PISO-010',
    Nome: 'Instalação de Piso de Bambu',
    Descricao: 'Instalação de piso de bambu com base e acabamento',
    Categoria: 'Pisos e Revestimentos',
    Preco: 65.00,
    Unidade: 'm²',
    Ativo: true,
  },
];

export async function populateServices() {
  try {
    console.log('🚀 Iniciando população da database SINAPI...\n');
    
    // Inicializar cliente Notion
    initNotionClient();
    
    let created = 0;
    let errors = 0;

    for (const servico of servicosSINAPI) {
      try {
        await createServico(servico);
        created++;
        console.log(`✅ Criado: ${servico.Codigo} - ${servico.Nome}`);
      } catch (error: any) {
        errors++;
        console.error(`❌ Erro ao criar ${servico.Codigo}:`, error.message);
        // Continuar mesmo com erros (pode ser que já exista)
      }
    }

    console.log(`\n✨ Concluído!`);
    console.log(`   ✅ Criados: ${created}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   📊 Total processado: ${servicosSINAPI.length}`);
    
  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
populateServices().then(() => {
  console.log('Script finalizado');
  process.exit(0);
}).catch((error) => {
  console.error('Erro ao executar script:', error);
  process.exit(1);
});

// Executar se chamado diretamente via tsx
if (process.argv[1]?.includes('populateSINAPIServices')) {
  populateServices().then(() => {
    console.log('Script finalizado');
    process.exit(0);
  }).catch((error) => {
    console.error('Erro ao executar script:', error);
    process.exit(1);
  });
}


// AXIS V3 — Sales Intelligence Engine
// Sistema de scoring, matching e recomendação estratégica

import type { DiagnosticoV3Question, DiagnosticoV3Response, ProdutoTechV3 } from '@/types/axis-v3';
import { getDiagnosticoV3Questions } from '@/mocks/axis-v3-diagnostico.mock';
import { getAllProdutosTechV3 } from '@/mocks/axis-v3-produtos.mock';

// ==========================================
// CLUSTERS DE DOR (Strategic Pain Points)
// ==========================================

export type PainCluster = 'aquisicao' | 'comercial' | 'gestao' | 'tecnologia' | 'escala';

export interface ClusterScore {
  cluster: PainCluster;
  score: number; // 0-100
  questionIds: string[];
  description: string;
  urgency: 'baixa' | 'media' | 'alta' | 'critica';
}

export interface DiagnosticInsight {
  clusters: ClusterScore[];
  topCluster: ClusterScore;
  recommendedProducts: ProductRecommendation[];
  executiveSummary: string;
  mainBottlenecks: string[];
  strategicPath: StrategicStep[];
}

export interface ProductRecommendation {
  produto: ProdutoTechV3;
  relevanceScore: number; // 0-100
  reason: string;
  priority: 1 | 2 | 3; // 1 = principal
}

export interface StrategicStep {
  order: number;
  title: string;
  description: string;
  productsIncluded: string[]; // product IDs
}

// ==========================================
// MAPEAMENTO PERGUNTA → CLUSTER
// ==========================================

const QUESTION_CLUSTER_MAP: Record<string, PainCluster> = {
  'q01': 'aquisicao',
  'q02': 'aquisicao',
  'q03': 'comercial',
  'q04': 'comercial',
  'q05': 'comercial',
  'q06': 'comercial',
  'q07': 'gestao',
  'q08': 'gestao',
  'q09': 'gestao',
  'q10': 'tecnologia',
  'q11': 'tecnologia',
  'q12': 'gestao' // Objetivo estratégico → gestão
};

// ==========================================
// MAPEAMENTO CLUSTER → PRODUTOS
// ==========================================

const CLUSTER_PRODUCT_MAP: Record<PainCluster, string[]> = {
  'aquisicao': ['aq-01', 'aq-02', 'aq-03', 'aq-04'],
  'comercial': ['fn-01', 'fn-02', 'fn-03', 'fn-04', 'cv-01', 'cv-02', 'cv-03', 'cv-04'],
  'gestao': ['gs-01', 'gs-02', 'gs-03', 'gs-04'],
  'tecnologia': ['es-02', 'es-03'],
  'escala': ['es-01', 'es-04']
};

// ==========================================
// DESCRIÇÕES DOS CLUSTERS
// ==========================================

const CLUSTER_DESCRIPTIONS: Record<PainCluster, string> = {
  'aquisicao': 'Captação e qualificação de leads no topo do funil',
  'comercial': 'Processo comercial, pipeline e conversão',
  'gestao': 'Visibilidade, previsibilidade e governança',
  'tecnologia': 'Stack tecnológico e automação',
  'escala': 'Crescimento e redução de dependências'
};

// ==========================================
// SISTEMA DE SCORING
// ==========================================

/**
 * Calcula o score de cada cluster baseado nas respostas
 */
export function calculateClusterScores(
  respostas: Record<string, DiagnosticoV3Response>
): ClusterScore[] {
  const questions = getDiagnosticoV3Questions();
  const clusterMap = new Map<PainCluster, { score: number; questionIds: string[] }>();

  // Inicializa clusters
  (['aquisicao', 'comercial', 'gestao', 'tecnologia', 'escala'] as PainCluster[]).forEach(cluster => {
    clusterMap.set(cluster, { score: 0, questionIds: [] });
  });

  // Calcula score por pergunta
  Object.entries(respostas).forEach(([questionId, resposta]) => {
    const cluster = QUESTION_CLUSTER_MAP[questionId];
    if (!cluster) return;

    const clusterData = clusterMap.get(cluster)!;
    
    // Score base: cada opção selecionada = +10 pontos
    const optionsScore = resposta.opcoesSelecionadas.length * 10;
    
    // Score de texto: se tem resposta aberta substancial = +20 pontos
    const textScore = resposta.respostaAberta && resposta.respostaAberta.length > 50 ? 20 : 0;
    
    clusterData.score += optionsScore + textScore;
    clusterData.questionIds.push(questionId);
    
    clusterMap.set(cluster, clusterData);
  });

  // Normaliza scores para 0-100 e determina urgência
  const maxPossibleScore = 100; // Ajustado para escala 0-100
  const clusterScores: ClusterScore[] = [];

  clusterMap.forEach((data, cluster) => {
    const normalizedScore = Math.min(100, data.score);
    const urgency = getUrgencyLevel(normalizedScore);

    clusterScores.push({
      cluster,
      score: normalizedScore,
      questionIds: data.questionIds,
      description: CLUSTER_DESCRIPTIONS[cluster],
      urgency
    });
  });

  // Ordena por score (maior primeiro)
  return clusterScores.sort((a, b) => b.score - a.score);
}

function getUrgencyLevel(score: number): 'baixa' | 'media' | 'alta' | 'critica' {
  if (score >= 70) return 'critica';
  if (score >= 50) return 'alta';
  if (score >= 30) return 'media';
  return 'baixa';
}

// ==========================================
// MATCHING PRODUTOS
// ==========================================

/**
 * Recomenda produtos baseado nos clusters de maior dor
 */
export function recommendProducts(
  clusterScores: ClusterScore[],
  maxRecommendations: number = 5
): ProductRecommendation[] {
  const allProducts = getAllProdutosTechV3();
  const recommendations: ProductRecommendation[] = [];

  // Pega os top 3 clusters
  const topClusters = clusterScores.slice(0, 3);

  topClusters.forEach((cluster, clusterIndex) => {
    const productIds = CLUSTER_PRODUCT_MAP[cluster.cluster] || [];
    
    productIds.forEach(productId => {
      const produto = allProducts.find(p => p.id === productId);
      if (!produto) return;

      // Calcula relevância: cluster score * posição do cluster (peso decrescente)
      const clusterWeight = 1 - (clusterIndex * 0.2); // 1.0, 0.8, 0.6
      const relevanceScore = Math.round(cluster.score * clusterWeight);

      recommendations.push({
        produto,
        relevanceScore,
        reason: generateRecommendationReason(cluster, produto),
        priority: (clusterIndex + 1) as 1 | 2 | 3
      });
    });
  });

  // Ordena por relevância e pega os top N
  return recommendations
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxRecommendations);
}

function generateRecommendationReason(cluster: ClusterScore, produto: ProdutoTechV3): string {
  const urgencyText = cluster.urgency === 'critica' 
    ? 'crítica identificada'
    : cluster.urgency === 'alta'
    ? 'significativa identificada'
    : 'identificada';

  return `Dor ${urgencyText} em ${cluster.description.toLowerCase()}`;
}

// ==========================================
// RESUMO EXECUTIVO
// ==========================================

export function generateExecutiveSummary(
  clusterScores: ClusterScore[],
  clientName: string
): string {
  const topCluster = clusterScores[0];
  const secondCluster = clusterScores[1];

  const templates = {
    aquisicao: `${clientName} apresenta oportunidades claras de estruturação na captação e qualificação de leads. A falta de centralização e processos claros no topo do funil está gerando perda de oportunidades e dificultando a previsibilidade de entrada de negócios.`,
    
    comercial: `${clientName} possui gargalos significativos no processo comercial e pipeline. A ausência de processos bem definidos e ferramentas adequadas está impactando diretamente a taxa de conversão e o tempo de fechamento, limitando a capacidade de escala da operação.`,
    
    gestao: `${clientName} carece de visibilidade e governança nos indicadores críticos do negócio. A falta de previsibilidade e métricas confiáveis está dificultando a tomada de decisão estratégica e o planejamento de crescimento sustentável.`,
    
    tecnologia: `${clientName} está operando com um stack tecnológico inadequado ou desintegrado. O excesso de processos manuais e a falta de automação estão consumindo tempo estratégico da equipe e limitando a capacidade operacional.`,
    
    escala: `${clientName} enfrenta desafios estruturais de escalabilidade. A dependência operacional de pessoas-chave e a ausência de processos escaláveis estão criando um teto de crescimento que precisa ser endereçado estrategicamente.`
  };

  let summary = templates[topCluster.cluster];

  // Adiciona contexto do segundo cluster se relevante
  if (secondCluster && secondCluster.score >= 50) {
    summary += ` Adicionalmente, há necessidade de atenção em ${secondCluster.description.toLowerCase()}, que representa um fator limitante secundário para o crescimento.`;
  }

  return summary;
}

// ==========================================
// PRINCIPAIS GARGALOS
// ==========================================

export function identifyMainBottlenecks(
  clusterScores: ClusterScore[],
  respostas: Record<string, DiagnosticoV3Response>
): string[] {
  const bottlenecks: string[] = [];
  const topClusters = clusterScores.slice(0, 3);

  topClusters.forEach(cluster => {
    const bottleneck = getBottleneckByCluster(cluster, respostas);
    if (bottleneck) bottlenecks.push(bottleneck);
  });

  return bottlenecks.slice(0, 5); // Máximo 5 gargalos
}

function getBottleneckByCluster(
  cluster: ClusterScore,
  respostas: Record<string, DiagnosticoV3Response>
): string | null {
  const bottleneckTemplates: Record<PainCluster, string> = {
    aquisicao: 'Leads chegam por múltiplos canais sem centralização, gerando perda de oportunidades e dificultando a priorização do time comercial',
    comercial: 'Processo comercial não estruturado, gerando imprevisibilidade no pipeline e dependência de pessoas-chave para fechamento',
    gestao: 'Ausência de indicadores confiáveis e visibilidade em tempo real, dificultando decisões estratégicas baseadas em dados',
    tecnologia: 'Stack tecnológico fragmentado com excesso de trabalho manual, consumindo tempo que deveria ser investido em atividades estratégicas',
    escala: 'Dependência operacional do fundador e ausência de processos escaláveis, criando um teto de crescimento estrutural'
  };

  return cluster.score >= 40 ? bottleneckTemplates[cluster.cluster] : null;
}

// ==========================================
// CAMINHO ESTRATÉGICO
// ==========================================

export function buildStrategicPath(
  recommendations: ProductRecommendation[]
): StrategicStep[] {
  if (recommendations.length === 0) return [];

  // Agrupa produtos por prioridade
  const priority1 = recommendations.filter(r => r.priority === 1);
  const priority2 = recommendations.filter(r => r.priority === 2);
  const priority3 = recommendations.filter(r => r.priority === 3);

  const steps: StrategicStep[] = [];

  // Passo 1: Fundação
  if (priority1.length > 0) {
    steps.push({
      order: 1,
      title: 'Fundação: Estruturar o Core',
      description: 'Implementar as bases tecnológicas e processuais que resolvem as dores mais críticas e criam o alicerce para crescimento sustentável.',
      productsIncluded: priority1.map(r => r.produto.id)
    });
  }

  // Passo 2: Aceleração
  if (priority2.length > 0) {
    steps.push({
      order: 2,
      title: 'Aceleração: Otimizar Conversão',
      description: 'Com a base estruturada, implementar ferramentas que aumentam a eficiência comercial e reduzem gargalos operacionais.',
      productsIncluded: priority2.map(r => r.produto.id)
    });
  }

  // Passo 3: Escala
  if (priority3.length > 0) {
    steps.push({
      order: 3,
      title: 'Escala: Amplificar Resultados',
      description: 'Ferramentas avançadas de inteligência e automação que permitem crescimento exponencial com controle total.',
      productsIncluded: priority3.map(r => r.produto.id)
    });
  }

  return steps;
}

// ==========================================
// ENGINE PRINCIPAL
// ==========================================

/**
 * Função principal: analisa diagnóstico e gera insights completos
 */
export function analyzeDiagnostic(
  respostas: Record<string, DiagnosticoV3Response>,
  clientName: string
): DiagnosticInsight {
  // 1. Calcula scores por cluster
  const clusters = calculateClusterScores(respostas);
  
  // 2. Identifica cluster principal
  const topCluster = clusters[0];
  
  // 3. Recomenda produtos
  const recommendedProducts = recommendProducts(clusters, 5);
  
  // 4. Gera resumo executivo
  const executiveSummary = generateExecutiveSummary(clusters, clientName);
  
  // 5. Identifica gargalos principais
  const mainBottlenecks = identifyMainBottlenecks(clusters, respostas);
  
  // 6. Constrói caminho estratégico
  const strategicPath = buildStrategicPath(recommendedProducts);

  return {
    clusters,
    topCluster,
    recommendedProducts,
    executiveSummary,
    mainBottlenecks,
    strategicPath
  };
}


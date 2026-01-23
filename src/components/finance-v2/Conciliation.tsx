// Conciliation - Sistema de Conciliação de Transações (Preparado para IA)

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  ACCOUNT_PLANS,
  COST_CENTERS,
  type EntityType
} from '@/lib/finance-v2-data';
import { toast } from 'sonner';

// Mock de transações importadas (simulando extrato bancário)
const MOCK_IMPORTED_TRANSACTIONS = [
  {
    id: 'imp-1',
    date: '2026-01-22',
    description: 'PAGTO CARTAO CREDITO',
    amount: -450.00,
    entity: 'PF' as EntityType,
    suggestedAccountPlan: 'div-pf-cartao',
    suggestedCostCenter: 'cc-pf-pessoal',
    confidence: 0.85
  },
  {
    id: 'imp-2',
    date: '2026-01-22',
    description: 'SUPERMERCADO BRASIL LTDA',
    amount: -320.50,
    entity: 'PF' as EntityType,
    suggestedAccountPlan: 'desp-pf-alimentacao',
    suggestedCostCenter: 'cc-pf-pessoal',
    confidence: 0.92
  },
  {
    id: 'imp-3',
    date: '2026-01-23',
    description: 'TED RECEBIDA - CLIENTE XYZ',
    amount: 5000.00,
    entity: 'PJ' as EntityType,
    suggestedAccountPlan: 'rec-pj-servicos',
    suggestedCostCenter: 'cc-pj-comercial',
    confidence: 0.78
  },
  {
    id: 'imp-4',
    date: '2026-01-23',
    description: 'PAGAMENTO FORNECEDOR ABC',
    amount: -1200.00,
    entity: 'PJ' as EntityType,
    suggestedAccountPlan: 'desp-pj-fornecedores',
    suggestedCostCenter: 'cc-pj-operacional',
    confidence: 0.88
  },
  {
    id: 'imp-5',
    date: '2026-01-21',
    description: 'NETFLIX.COM',
    amount: -49.90,
    entity: 'PF' as EntityType,
    suggestedAccountPlan: 'desp-pf-assinaturas',
    suggestedCostCenter: 'cc-pf-pessoal',
    confidence: 0.95
  },
];

interface ImportedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  entity: EntityType;
  suggestedAccountPlan: string;
  suggestedCostCenter: string;
  confidence: number;
}

export function Conciliation() {
  const [transactions, setTransactions] = useState<ImportedTransaction[]>(MOCK_IMPORTED_TRANSACTIONS);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  const handleConfirmTransaction = (transactionId: string) => {
    setTransactions(transactions.filter(t => t.id !== transactionId));
    toast.success('Transação confirmada e lançada!');
  };

  const handleConfirmSelected = () => {
    if (selectedTransactions.size === 0) {
      toast.error('Selecione pelo menos uma transação');
      return;
    }
    
    setTransactions(transactions.filter(t => !selectedTransactions.has(t.id)));
    setSelectedTransactions(new Set());
    toast.success(`${selectedTransactions.size} transação(ões) confirmada(s)!`);
  };

  const handleUpdateSuggestion = (transactionId: string, field: 'accountPlan' | 'costCenter', value: string) => {
    setTransactions(transactions.map(t => {
      if (t.id === transactionId) {
        return {
          ...t,
          ...(field === 'accountPlan' ? { suggestedAccountPlan: value } : { suggestedCostCenter: value })
        };
      }
      return t;
    }));
  };

  const toggleTransaction = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge className="bg-green-500">Alta ({(confidence * 100).toFixed(0)}%)</Badge>;
    } else if (confidence >= 0.75) {
      return <Badge className="bg-yellow-500">Média ({(confidence * 100).toFixed(0)}%)</Badge>;
    } else {
      return <Badge variant="destructive">Baixa ({(confidence * 100).toFixed(0)}%)</Badge>;
    }
  };

  const getAccountPlanName = (id: string) => {
    return ACCOUNT_PLANS.find(ap => ap.id === id)?.name || 'Desconhecido';
  };

  const getCostCenterName = (id: string) => {
    return COST_CENTERS.find(cc => cc.id === id)?.name || 'Desconhecido';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6" />
            Conciliação Bancária
          </h2>
          <p className="text-muted-foreground">
            Transações importadas aguardando classificação
          </p>
        </div>
        <Button 
          className="gap-2"
          onClick={handleConfirmSelected}
          disabled={selectedTransactions.size === 0}
        >
          <CheckCircle2 className="h-4 w-4" />
          Confirmar Selecionadas ({selectedTransactions.size})
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Sistema Preparado para IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta tela está pronta para integração com IA. No futuro, as sugestões de plano de contas 
            e centro de custo serão geradas automaticamente com base no histórico de transações e 
            padrões de gastos. Por enquanto, você pode revisar e ajustar as sugestões manualmente.
          </p>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">transações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alta Confiança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {transactions.filter(t => t.confidence >= 0.9).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">≥ 90% de confiança</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revisão Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {transactions.filter(t => t.confidence < 0.9).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">&lt; 90% de confiança</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2">Tudo conciliado!</h3>
              <p className="text-muted-foreground">
                Não há transações pendentes de classificação
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const isSelected = selectedTransactions.has(transaction.id);
            const isIncome = transaction.amount > 0;
            
            return (
              <Card 
                key={transaction.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => toggleTransaction(transaction.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTransaction(transaction.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{transaction.entity}</Badge>
                          <Badge variant={isIncome ? 'default' : 'destructive'}>
                            {isIncome ? 'Entrada' : 'Saída'}
                          </Badge>
                          {getConfidenceBadge(transaction.confidence)}
                        </div>
                        <CardTitle className="text-base">
                          {transaction.description}
                        </CardTitle>
                        <CardDescription>
                          {formatDate(transaction.date)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        isIncome ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Sugestões da IA</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plano de Contas</label>
                        <Select
                          value={transaction.suggestedAccountPlan}
                          onValueChange={(value) => handleUpdateSuggestion(transaction.id, 'accountPlan', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ACCOUNT_PLANS
                              .filter(ap => 
                                ap.entity.includes(transaction.entity) && 
                                (isIncome ? ap.type === 'Receita' : ap.type === 'Despesa')
                              )
                              .map(ap => (
                                <SelectItem key={ap.id} value={ap.id}>
                                  {ap.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Sugerido: {getAccountPlanName(transaction.suggestedAccountPlan)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Centro de Custo</label>
                        <Select
                          value={transaction.suggestedCostCenter}
                          onValueChange={(value) => handleUpdateSuggestion(transaction.id, 'costCenter', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COST_CENTERS
                              .filter(cc => cc.entity.includes(transaction.entity))
                              .map(cc => (
                                <SelectItem key={cc.id} value={cc.id}>
                                  {cc.name}
                                </SelectItem>
                              ))
                            }
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Sugerido: {getCostCenterName(transaction.suggestedCostCenter)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleConfirmTransaction(transaction.id)}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar e Lançar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

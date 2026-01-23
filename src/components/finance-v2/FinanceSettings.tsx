// FinanceSettings - Configurações do Sistema Financeiro

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  CreditCard, 
  FolderTree, 
  Target,
  Info
} from 'lucide-react';
import {
  ACCOUNT_PLANS,
  COST_CENTERS,
  BANK_ACCOUNTS,
  type EntityType
} from '@/lib/finance-v2-data';

export function FinanceSettings() {
  const renderAccountPlans = (entity: EntityType) => {
    const plans = ACCOUNT_PLANS.filter(ap => ap.entity.includes(entity));
    const receitas = plans.filter(ap => ap.type === 'Receita');
    const despesas = plans.filter(ap => ap.type === 'Despesa');
    
    return (
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 text-green-600">Receitas</h4>
          <div className="space-y-2">
            {receitas.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="font-medium">{plan.name}</span>
                </div>
                <Badge variant="outline">{plan.category}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-red-600">Despesas</h4>
          <div className="space-y-2">
            {despesas.map(plan => (
              <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: plan.color }}
                  />
                  <span className="font-medium">{plan.name}</span>
                </div>
                <Badge variant="outline">{plan.category}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configurações
        </h2>
        <p className="text-muted-foreground">
          Visualize e entenda a estrutura do sistema financeiro
        </p>
      </div>

      {/* Info sobre o sistema */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Sobre o Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Este é um sistema completo de controle financeiro pessoal (PF) e empresarial (PJ).
            </p>
            <p>
              <strong>Recursos principais:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Separação total entre PF e PJ</li>
              <li>Plano de contas estruturado por categoria</li>
              <li>Centros de custo para rastreamento detalhado</li>
              <li>Orçamentos mensais com acompanhamento em tempo real</li>
              <li>Conciliação bancária preparada para IA</li>
              <li>Múltiplas contas bancárias</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Contas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Plano de Contas
          </CardTitle>
          <CardDescription>
            Estrutura de categorização de receitas e despesas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Física (PF)</h3>
              {renderAccountPlans('PF')}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Jurídica (PJ)</h3>
              {renderAccountPlans('PJ')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Centros de Custo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Centros de Custo
          </CardTitle>
          <CardDescription>
            Áreas para rastreamento detalhado de gastos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Física (PF)</h3>
              <div className="space-y-2">
                {COST_CENTERS.filter(cc => cc.entity.includes('PF')).map(cc => (
                  <div key={cc.id} className="p-3 rounded-lg border">
                    <div className="font-medium">{cc.name}</div>
                    <div className="text-sm text-muted-foreground">{cc.description}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Jurídica (PJ)</h3>
              <div className="space-y-2">
                {COST_CENTERS.filter(cc => cc.entity.includes('PJ')).map(cc => (
                  <div key={cc.id} className="p-3 rounded-lg border">
                    <div className="font-medium">{cc.name}</div>
                    <div className="text-sm text-muted-foreground">{cc.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contas Bancárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Contas Bancárias
          </CardTitle>
          <CardDescription>
            Contas cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Física (PF)</h3>
              <div className="space-y-2">
                {BANK_ACCOUNTS.filter(ba => ba.entity === 'PF').map(ba => (
                  <div key={ba.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{ba.name}</div>
                      <div className="text-sm text-muted-foreground">{ba.type}</div>
                    </div>
                    <Badge variant="outline">{ba.entity}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Pessoa Jurídica (PJ)</h3>
              <div className="space-y-2">
                {BANK_ACCOUNTS.filter(ba => ba.entity === 'PJ').map(ba => (
                  <div key={ba.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{ba.name}</div>
                      <div className="text-sm text-muted-foreground">{ba.type}</div>
                    </div>
                    <Badge variant="outline">{ba.entity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estatísticas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">{ACCOUNT_PLANS.length}</div>
              <div className="text-sm text-muted-foreground">Planos de Contas</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">{COST_CENTERS.length}</div>
              <div className="text-sm text-muted-foreground">Centros de Custo</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">{BANK_ACCOUNTS.length}</div>
              <div className="text-sm text-muted-foreground">Contas Bancárias</div>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Entidades (PF/PJ)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

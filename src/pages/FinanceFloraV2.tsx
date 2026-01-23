// Finance Flora V2 - Sistema Completo de Controle Financeiro PF + PJ
// Rota isolada: /finance/flora-v2

import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, User, TrendingUp, FileText, GitCompare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

// Importar componentes de cada seção
import { OverviewPF } from '@/components/finance-v2/OverviewPF';
import { OverviewPJ } from '@/components/finance-v2/OverviewPJ';
import { Transactions } from '@/components/finance-v2/Transactions';
import { Budgets } from '@/components/finance-v2/Budgets';
import { Conciliation } from '@/components/finance-v2/Conciliation';
import { FinanceSettings } from '@/components/finance-v2/FinanceSettings';

export default function FinanceFloraV2() {
  const [activeTab, setActiveTab] = useState<string>('overview-pf');

  return (
    <AppLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Controle Financeiro V2
            </h1>
            <p className="text-muted-foreground">
              Sistema completo de gestão financeira PF + PJ
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview-pf" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Visão PF</span>
            </TabsTrigger>
            <TabsTrigger value="overview-pj" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão PJ</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Lançamentos</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Orçamentos</span>
            </TabsTrigger>
            <TabsTrigger value="conciliation" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              <span className="hidden sm:inline">Conciliação</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="overview-pf" className="space-y-6">
            <OverviewPF />
          </TabsContent>

          <TabsContent value="overview-pj" className="space-y-6">
            <OverviewPJ />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Transactions />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <Budgets />
          </TabsContent>

          <TabsContent value="conciliation" className="space-y-6">
            <Conciliation />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <FinanceSettings />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

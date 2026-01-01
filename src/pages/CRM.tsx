import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, TrendingUp, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getPipelineKPIs, getContactsPipeline, getContactsByStatus } from '@/services';
import type { ContactPipeline, PipelineKPIs } from '@/types/crm';

const statusColors: Record<string, string> = {
  'Contato Ativado': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Café Agendado': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'Café Executado': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  'Proposta Enviada': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Follow-up Ativo': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'Venda Fechada': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Perdido': 'bg-red-500/10 text-red-500 border-red-500/20',
};

const statusIcons: Record<string, React.ReactNode> = {
  'Contato Ativado': <Users className="h-4 w-4" />,
  'Café Agendado': <Calendar className="h-4 w-4" />,
  'Café Executado': <CheckCircle className="h-4 w-4" />,
  'Proposta Enviada': <FileText className="h-4 w-4" />,
  'Follow-up Ativo': <Clock className="h-4 w-4" />,
  'Venda Fechada': <CheckCircle className="h-4 w-4" />,
  'Perdido': <XCircle className="h-4 w-4" />,
};

export default function CRMPage() {
  const [kpis, setKpis] = useState<PipelineKPIs | null>(null);
  const [contacts, setContacts] = useState<ContactPipeline[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [kpisData, contactsData] = await Promise.all([
        getPipelineKPIs(),
        getContactsPipeline()
      ]);
      setKpis(kpisData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  // Group contacts by status for Kanban
  const contactsByStatus = contacts.reduce((acc, contact) => {
    if (!acc[contact.status]) {
      acc[contact.status] = [];
    }
    acc[contact.status].push(contact);
    return acc;
  }, {} as Record<string, ContactPipeline[]>);

  const kanbanColumns: ContactPipeline['status'][] = [
    'Contato Ativado',
    'Café Agendado',
    'Café Executado',
    'Proposta Enviada',
    'Follow-up Ativo',
    'Venda Fechada',
    'Perdido'
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            CRM
          </h1>
          <p className="text-muted-foreground">
            Visão estratégica do pipeline comercial e das conversões de vendas.
          </p>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Leads no Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {kpis?.totalLeads ?? '--'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversão Café → Proposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {kpis?.conversionCoffeeToProposal ?? '--'}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversão Proposta → Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {kpis?.conversionProposalToSale ?? '--'}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ciclo Médio de Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {kpis?.averageSalesCycle ?? '--'} dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Pipeline Geral</h2>
            
            {/* Kanban View */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {kanbanColumns.map((status) => {
                  const statusContacts = contactsByStatus[status] || [];
                  return (
                    <div key={status} className="flex-shrink-0 w-64">
                      <div className="mb-2">
                        <Badge variant="outline" className={statusColors[status] || ''}>
                          {statusIcons[status]}
                          <span className="ml-1">{status}</span>
                          <span className="ml-2 text-xs">({statusContacts.length})</span>
                        </Badge>
                      </div>
                      <div className="space-y-2 min-h-[200px]">
                        {statusContacts.map((contact) => (
                          <Card key={contact.id} className="p-3 hover:border-primary/50 transition-colors">
                            <div className="space-y-1">
                              <p className="font-medium text-sm text-foreground">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.company}</p>
                              {contact.coffeeDate && (
                                <p className="text-xs text-muted-foreground">
                                  Café: {new Date(contact.coffeeDate).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              {contact.proposalDate && (
                                <p className="text-xs text-muted-foreground">
                                  Proposta: {new Date(contact.proposalDate).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Atualizado: {new Date(contact.lastUpdate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </Card>
                        ))}
                        {statusContacts.length === 0 && (
                          <div className="text-center text-xs text-muted-foreground py-8">
                            Nenhum contato
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filtered Views */}
          <Tabs defaultValue="cafes-agendados" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cafes-agendados">Cafés Agendados</TabsTrigger>
              <TabsTrigger value="propostas-enviadas">Propostas Enviadas</TabsTrigger>
              <TabsTrigger value="follow-ups-ativos">Follow-ups Ativos</TabsTrigger>
              <TabsTrigger value="vendas-fechadas">Vendas Fechadas</TabsTrigger>
            </TabsList>

            <TabsContent value="cafes-agendados" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cafés Agendados</CardTitle>
                  <CardDescription>Contatos com café agendado</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Data do Café</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Atualização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsByStatus['Café Agendado']?.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.company}</TableCell>
                          <TableCell>
                            {contact.coffeeDate 
                              ? new Date(contact.coffeeDate).toLocaleDateString('pt-BR')
                              : '--'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[contact.status] || ''}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(contact.lastUpdate).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhum café agendado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="propostas-enviadas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Propostas Enviadas</CardTitle>
                  <CardDescription>Contatos com proposta enviada</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Data da Proposta</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Atualização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsByStatus['Proposta Enviada']?.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.company}</TableCell>
                          <TableCell>
                            {contact.proposalDate 
                              ? new Date(contact.proposalDate).toLocaleDateString('pt-BR')
                              : '--'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[contact.status] || ''}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(contact.lastUpdate).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhuma proposta enviada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="follow-ups-ativos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Follow-ups Ativos</CardTitle>
                  <CardDescription>Contatos em acompanhamento ativo</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Atualização</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsByStatus['Follow-up Ativo']?.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.company}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[contact.status] || ''}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(contact.lastUpdate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {contact.notes || '--'}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhum follow-up ativo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vendas-fechadas" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vendas Fechadas</CardTitle>
                  <CardDescription>Contatos que fecharam venda</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Última Atualização</TableHead>
                        <TableHead>Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactsByStatus['Venda Fechada']?.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.company}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[contact.status] || ''}>
                              {contact.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(contact.lastUpdate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {contact.notes || '--'}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Nenhuma venda fechada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}


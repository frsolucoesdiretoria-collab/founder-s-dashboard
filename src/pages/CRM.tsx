import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Users, TrendingUp, Calendar, FileText, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { getPipelineKPIs, getContactsPipeline, getContactsByStatus, updateContactStatus } from '@/services';
import type { ContactPipeline, PipelineKPIs } from '@/types/crm';
import { toast } from 'sonner';
import { useSyncCRMGoals } from '@/hooks/useSyncCRMGoals';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Componente para o card arrastável
function DraggableContactCard({ contact }: { contact: ContactPipeline }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: contact.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-3 hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing">
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
    </div>
  );
}

// Componente para a coluna do Kanban (droppable)
function KanbanColumn({ 
  status, 
  contacts, 
  statusColors, 
  statusIcons 
}: { 
  status: ContactPipeline['status'];
  contacts: ContactPipeline[];
  statusColors: Record<string, string>;
  statusIcons: Record<string, React.ReactNode>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex-shrink-0 w-64" ref={setNodeRef}>
      <div className="mb-2">
        <Badge variant="outline" className={statusColors[status] || ''}>
          {statusIcons[status]}
          <span className="ml-1">{status}</span>
          <span className="ml-2 text-xs">({contacts.length})</span>
        </Badge>
      </div>
      <div className={`space-y-2 min-h-[200px] bg-muted/30 rounded-lg p-2 transition-colors ${isOver ? 'bg-primary/10 border-2 border-primary border-dashed' : ''}`}>
        <SortableContext items={contacts.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {contacts.map((contact) => (
            <DraggableContactCard key={contact.id} contact={contact} />
          ))}
        </SortableContext>
        {contacts.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">
            Nenhum contato
          </div>
        )}
      </div>
    </div>
  );
}

export default function CRMPage() {
  const [kpis, setKpis] = useState<PipelineKPIs | null>(null);
  const [contacts, setContacts] = useState<ContactPipeline[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactPipeline[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sincronizar Goals do CRM automaticamente
  useSyncCRMGoals(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpisData, contactsData] = await Promise.all([
        getPipelineKPIs(),
        getContactsPipeline()
      ]);
      setKpis(kpisData);
      setContacts(contactsData);
      setFilteredContacts(contactsData);
    } catch (error: any) {
      console.error('Error loading CRM data:', error);
      toast.error(`Erro ao carregar dados do CRM: ${error.message || 'Erro desconhecido'}`);
      // Definir valores padrão para evitar quebra da UI
      setKpis({
        totalLeads: 0,
        conversionActivatedToCoffee: 0,
        conversionCoffeeToProposal: 0,
        conversionProposalToSale: 0,
        averageSalesCycle: 0
      });
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          contact =>
            contact.name?.toLowerCase().includes(query) ||
            contact.company?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, contacts]);

  // Define kanban columns
  const kanbanColumns: ContactPipeline['status'][] = [
    'Contato Ativado',
    'Café Agendado',
    'Café Executado',
    'Proposta Enviada',
    'Follow-up Ativo',
    'Venda Fechada',
    'Perdido'
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback durante o drag
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const contactId = active.id as string;
    const overId = over.id as string;

    // Primeiro, verificar se o over é uma coluna (status) válida
    let newStatus = kanbanColumns.find(col => col === overId) as ContactPipeline['status'] | undefined;
    
    // Se não for uma coluna, pode ser outro contato - encontrar a coluna pai
    if (!newStatus) {
      // Verificar se overId é um ID de contato
      const overContact = contacts.find(c => c.id === overId);
      if (overContact) {
        // Se for um contato, usar o status desse contato (mesma coluna)
        newStatus = overContact.status;
      } else {
        // Se não for nem coluna nem contato, não fazer nada
        return;
      }
    }

    // Encontrar o contato atual
    const contact = contacts.find(c => c.id === contactId);
    if (!contact || contact.status === newStatus) {
      return;
    }

    // Atualização otimista
    const previousContacts = [...contacts];
    setContacts(prev => 
      prev.map(c => 
        c.id === contactId ? { ...c, status: newStatus! } : c
      )
    );

    setIsUpdating(true);

    try {
      // Atualizar no backend
      await updateContactStatus(contactId, newStatus!);
      
      // Recarregar dados para garantir sincronização e atualizar KPIs
      await loadData();
      
      toast.success(`Contato movido para ${newStatus}`);
    } catch (error: any) {
      // Rollback em caso de erro
      setContacts(previousContacts);
      const errorMessage = error?.message || 'Erro desconhecido';
      toast.error(`Erro ao atualizar status: ${errorMessage}`);
      console.error('Error updating contact status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </AppLayout>
    );
  }

  // Group contacts by status for Kanban (using filtered contacts)
  const contactsByStatus = filteredContacts.reduce((acc, contact) => {
    if (!acc[contact.status]) {
      acc[contact.status] = [];
    }
    acc[contact.status].push(contact);
    return acc;
  }, {} as Record<string, ContactPipeline[]>);

  const activeContact = activeId ? contacts.find(c => c.id === activeId) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              CRM
            </h1>
            <p className="text-muted-foreground">
              Visão estratégica do pipeline comercial e das conversões de vendas.
            </p>
          </div>
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar contatos por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                Conversão Contatos Ativados → Cafés Agendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {kpis?.conversionActivatedToCoffee ?? '--'}%
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
            
            {/* Kanban View com Drag and Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {kanbanColumns.map((status) => {
                    const statusContacts = contactsByStatus[status] || [];
                    return (
                      <KanbanColumn
                        key={status}
                        status={status}
                        contacts={statusContacts}
                        statusColors={statusColors}
                        statusIcons={statusIcons}
                      />
                    );
                  })}
                </div>
              </div>
              
              <DragOverlay>
                {activeContact ? (
                  <Card className="p-3 w-64 opacity-90 shadow-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm text-foreground">{activeContact.name}</p>
                      <p className="text-xs text-muted-foreground">{activeContact.company}</p>
                    </div>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
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


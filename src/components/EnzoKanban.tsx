import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Users, Calendar, CheckCircle, FileText, TrendingUp, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface EnzoContact {
  id: string;
  name: string;
  whatsapp?: string;
  status?: string;
}

interface EnzoKanbanProps {
  contacts: EnzoContact[];
  onUpdateContactStatus: (id: string, status: string) => void;
}

const STATUSES = [
  { id: 'Contato Ativado', label: 'Contato Ativado', icon: Users, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'Café Agendado', label: 'Café Agendado', icon: Calendar, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'Café Executado', label: 'Café Executado', icon: CheckCircle, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'Proposta Enviada', label: 'Proposta Enviada', icon: FileText, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  { id: 'Venda Fechada', label: 'Venda Fechada', icon: TrendingUp, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { id: 'Perdido', label: 'Perdido', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
];

function DraggableContactCard({ contact }: { contact: EnzoContact }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: contact.id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-3 hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing mb-2">
        <div className="space-y-1">
          <p className="font-medium text-sm text-foreground">{contact.name || 'Sem nome'}</p>
          {contact.whatsapp && (
            <p className="text-xs text-muted-foreground">{contact.whatsapp}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function KanbanColumn({ 
  status, 
  contacts 
}: { 
  status: typeof STATUSES[0]; 
  contacts: EnzoContact[];
}) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: status.id,
    data: {
      status: status.id
    }
  });
  const Icon = status.icon;
  const contactIds = contacts.map(c => c.id);

  return (
    <div className="flex-1 min-w-[200px]">
      <Card className={isOver ? 'border-primary border-2' : ''}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{status.label}</span>
            <Badge variant="secondary" className="ml-auto">{contacts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent ref={setNodeRef} className={`min-h-[200px] ${isOver ? 'bg-primary/5' : ''}`} data-status={status.id}>
          <SortableContext items={contactIds} strategy={verticalListSortingStrategy}>
            {contacts.map(contact => (
              <DraggableContactCard key={contact.id} contact={contact} />
            ))}
            {contacts.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Arraste contatos aqui
              </p>
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

export function EnzoKanban({ contacts, onUpdateContactStatus }: EnzoKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Agrupar contatos por status
  const contactsByStatus = STATUSES.reduce((acc, status) => {
    acc[status.id] = contacts.filter(c => (c.status || 'Contato Ativado') === status.id);
    return acc;
  }, {} as Record<string, EnzoContact[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      console.log('Drag cancelled - no drop target');
      return;
    }

    const contactId = active.id as string;
    const overId = over.id as string;
    
    console.log('Drag end event:', { contactId, overId, overData: over.data?.current });

    // Verificar se o over.id é um status válido (coluna)
    const statusMatch = STATUSES.find(s => s.id === overId);
    let newStatus: string | null = null;

    if (statusMatch) {
      // Arrastou diretamente para a coluna
      newStatus = statusMatch.id;
    } else {
      // Arrastou para dentro de um card ou área da coluna
      const overData = over.data?.current as any;
      
      // Tentar buscar o status da coluna através dos dados
      if (overData?.status) {
        newStatus = overData.status;
      } else {
        // Se arrastou para outro card, buscar o status desse card
        const targetContact = contacts.find(c => c.id === overId);
        if (targetContact) {
          newStatus = targetContact.status || 'Contato Ativado';
        } else {
          // Buscar em qual coluna esse card está
          for (const [status, statusContacts] of Object.entries(contactsByStatus)) {
            if (statusContacts.some(c => c.id === overId)) {
              newStatus = status;
              break;
            }
          }
        }
      }
    }

    if (!newStatus) {
      console.warn('Could not determine new status:', { contactId, overId, overData: over.data?.current });
      toast.error('Não foi possível determinar a coluna de destino. Tente arrastar diretamente para o título da coluna.');
      return;
    }

    // Encontrar o contato
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) {
      console.warn('Contact not found:', contactId);
      return;
    }

    // Verificar se o status realmente mudou
    const currentStatus = contact.status || 'Contato Ativado';
    if (currentStatus === newStatus) {
      console.log('Status unchanged, skipping update');
      return;
    }

    console.log(`✅ Updating contact ${contactId} from "${currentStatus}" to "${newStatus}"`);
    
    // Atualizar status
    onUpdateContactStatus(contactId, newStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Funil de Vendas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Arraste os contatos entre as colunas para avançar no funil
          </p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status.id}
              status={status}
              contacts={contactsByStatus[status.id] || []}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeId ? (
          <Card className="p-3 opacity-90">
            <p className="font-medium text-sm">
              {contacts.find(c => c.id === activeId)?.name || 'Contato'}
            </p>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}


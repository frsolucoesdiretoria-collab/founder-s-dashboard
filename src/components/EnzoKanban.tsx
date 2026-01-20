import { useState, useEffect } from 'react';
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
import { Users, Calendar, CheckCircle, FileText, TrendingUp, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface EnzoContact {
  id: string;
  name: string;
  whatsapp?: string;
  status?: string;
  saleValue?: number;
}

interface EnzoKanbanProps {
  contacts: EnzoContact[];
  onUpdateContactStatus: (id: string, status: string) => void;
  onUpdateContactSaleValue?: (id: string, saleValue: number | null) => void;
  onDeleteContact?: (id: string) => void;
}

const STATUSES = [
  { id: 'Contato Ativado', label: 'Contato Ativado', icon: Users, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'Café Agendado', label: 'Café Agendado', icon: Calendar, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { id: 'Café Executado', label: 'Reunião 1:1 Feita', icon: CheckCircle, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { id: 'Venda Feita', label: 'Venda Feita', icon: TrendingUp, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
];

function DraggableContactCard({ 
  contact, 
  onUpdateSaleValue,
  onDelete
}: { 
  contact: EnzoContact;
  onUpdateSaleValue?: (id: string, saleValue: number | null) => void;
  onDelete?: (id: string) => void;
}) {
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

  const isInVendaFeita = contact.status === 'Venda Feita';
  const [saleValue, setSaleValue] = useState<string>(contact.saleValue?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaleValueChange = (value: string) => {
    setSaleValue(value);
  };

  const handleSaleValueBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(saleValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdateSaleValue?.(contact.id, numValue);
    } else if (saleValue.trim() === '') {
      onUpdateSaleValue?.(contact.id, null);
    } else {
      // Reverter para valor original se inválido
      setSaleValue(contact.saleValue?.toString() || '');
    }
  };

  // Atualizar valor local quando prop mudar
  useEffect(() => {
    if (contact.saleValue !== undefined) {
      setSaleValue(contact.saleValue.toString());
    } else {
      setSaleValue('');
    }
  }, [contact.saleValue]);

  // Handler para impedir drag quando interagindo com o input
  const handleInputPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleInputMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (onDelete && window.confirm(`Tem certeza que deseja excluir o contato "${contact.name || 'Sem nome'}"? Esta ação não pode ser desfeita.`)) {
      onDelete(contact.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-3 hover:border-primary/50 transition-colors mb-2 relative group">
        {/* Botão de deletar - aparece ao passar o mouse */}
        {onDelete && (
          <button
            onClick={handleDelete}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-destructive/10 text-destructive hover:text-destructive/80"
            title="Excluir contato"
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
        
        {/* Área arrastável - aplica listeners apenas aqui */}
        <div {...listeners} className="cursor-grab active:cursor-grabbing pr-6">
          <div className="space-y-2">
            <p className="font-medium text-sm text-foreground">{contact.name || 'Sem nome'}</p>
            {contact.whatsapp && (
              <p className="text-xs text-muted-foreground">{contact.whatsapp}</p>
            )}
          </div>
        </div>
        
        {/* Área do input - sem listeners de drag */}
        {isInVendaFeita && onUpdateSaleValue && (
          <div 
            className="pt-2 border-t" 
            onClick={(e) => e.stopPropagation()} 
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <label className="text-xs text-muted-foreground block mb-1">
              Valor da venda (R$)
            </label>
            <input
              type="number"
              value={saleValue}
              onChange={(e) => {
                e.stopPropagation();
                handleSaleValueChange(e.target.value);
                setIsEditing(true);
              }}
              onBlur={(e) => {
                e.stopPropagation();
                handleSaleValueBlur();
              }}
              onFocus={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              onPointerDown={handleInputPointerDown}
              onMouseDown={handleInputMouseDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="0,00"
              className="w-full px-2 py-1 text-xs border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              min="0"
              step="0.01"
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function KanbanColumn({ 
  status, 
  contacts,
  onUpdateSaleValue,
  onDeleteContact
}: { 
  status: typeof STATUSES[0]; 
  contacts: EnzoContact[];
  onUpdateSaleValue?: (id: string, saleValue: number | null) => void;
  onDeleteContact?: (id: string) => void;
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
              <DraggableContactCard 
                key={contact.id} 
                contact={contact}
                onUpdateSaleValue={onUpdateSaleValue}
                onDelete={onDeleteContact}
              />
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

export function EnzoKanban({ contacts, onUpdateContactStatus, onUpdateContactSaleValue, onDeleteContact }: EnzoKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
        // Não ativar drag se o evento vem de um input, textarea ou botão
        tolerance: 5,
        delay: 0,
        interval: 0,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Agrupar contatos por status (normalizar status antigos)
  const contactsByStatus = STATUSES.reduce((acc, status) => {
    acc[status.id] = contacts.filter(c => {
      const contactStatus = c.status || 'Contato Ativado';
      // Migrar status antigos para novos
      const normalizedStatus = contactStatus === 'Proposta Enviada' || contactStatus === 'Venda Fechada' 
        ? 'Venda Feita' 
        : contactStatus;
      return normalizedStatus === status.id;
    });
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

    // Verificar se o status realmente mudou (normalizar antes de comparar)
    const currentStatus = contact.status || 'Contato Ativado';
    const normalizedCurrentStatus = currentStatus === 'Proposta Enviada' || currentStatus === 'Venda Fechada' 
      ? 'Venda Feita' 
      : currentStatus;
    
    // Normalizar novo status também
    let normalizedNewStatus = newStatus;
    if (newStatus === 'Proposta Enviada' || newStatus === 'Venda Fechada') {
      normalizedNewStatus = 'Venda Feita';
    }
    
    if (normalizedCurrentStatus === normalizedNewStatus) {
      console.log('Status unchanged, skipping update');
      return;
    }

    console.log(`✅ Updating contact ${contactId} from "${currentStatus}" to "${normalizedNewStatus}"`);
    
    // Atualizar status (usar status normalizado)
    onUpdateContactStatus(contactId, normalizedNewStatus);
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
              onUpdateSaleValue={onUpdateContactSaleValue}
              onDeleteContact={onDeleteContact}
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


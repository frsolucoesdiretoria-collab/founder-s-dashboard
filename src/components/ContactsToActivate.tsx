import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  whatsapp?: string;
}

interface ContactsToActivateProps {
  contacts: Contact[];
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
  onAddContact: () => void;
}

// Contatos pré-definidos do exemplo
const PREDEFINED_CONTACTS: Omit<Contact, 'id'>[] = [
  { name: 'Jeferson Boss' },
  { name: 'Leo ames' },
  { name: 'Tarcisio STZ' },
  { name: 'Machado consórcios' },
  { name: 'José Carlos' },
  { name: 'Melkis' },
  { name: 'Natan' },
  { name: 'Cavali' },
  { name: 'Julia Hermes' },
  { name: 'Mariana da Procedere' },
  { name: 'André da ayty' },
];

export function ContactsToActivate({ contacts, onUpdateContact, onAddContact }: ContactsToActivateProps) {
  const completedCount = contacts.filter(c => c.name && c.whatsapp).length;
  const totalTarget = 20;

  return (
    <Card>
      <CardHeader className="pb-2 md:pb-3 px-3 md:px-6 pt-3 md:pt-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm md:text-lg flex items-center gap-2">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Contatos para Ativar
            </CardTitle>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Meta: {completedCount}/{totalTarget} contatos completos
            </p>
          </div>
          <Badge variant="secondary" className="text-xs md:text-sm">
            {contacts.length}/{totalTarget}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-3 md:pb-6 space-y-2 md:space-y-3">
        {contacts.map((contact, index) => {
          const isPredefined = index < PREDEFINED_CONTACTS.length;
          const isComplete = contact.name && contact.whatsapp;
          
          return (
            <div
              key={contact.id}
              className={cn(
                "p-2.5 md:p-3 rounded-lg border transition-colors",
                isComplete 
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" 
                  : "bg-card border-border"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs md:text-sm font-medium text-muted-foreground min-w-[24px]">
                  {index + 1}.
                </span>
                {isPredefined && (
                  <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                    Exemplo
                  </Badge>
                )}
                {isComplete && (
                  <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                    Completo
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Nome do contato"
                  value={contact.name}
                  onChange={(e) => onUpdateContact(contact.id, { name: e.target.value })}
                  className="text-xs md:text-sm h-8 md:h-9"
                  disabled={isPredefined}
                />
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    type="tel"
                    placeholder="WhatsApp (ex: 11987654321)"
                    value={contact.whatsapp || ''}
                    onChange={(e) => onUpdateContact(contact.id, { whatsapp: e.target.value })}
                    className="text-xs md:text-sm h-8 md:h-9"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {contacts.length < totalTarget && (
          <Button
            onClick={onAddContact}
            variant="outline"
            className="w-full h-9 md:h-10 text-xs md:text-sm"
          >
            <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            Adicionar Contato ({contacts.length + 1}/{totalTarget})
          </Button>
        )}

        {contacts.length >= totalTarget && contacts.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs md:text-sm text-muted-foreground text-center">
              {completedCount === totalTarget 
                ? '✅ Todos os contatos estão completos!'
                : `Faltam ${totalTarget - completedCount} contato(s) com WhatsApp para completar a meta.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


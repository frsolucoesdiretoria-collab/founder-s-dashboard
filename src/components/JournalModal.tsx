import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Sparkles, AlertTriangle, Lightbulb, MessageSquare, Cog } from 'lucide-react';
import { toast } from 'sonner';
import type { NotionJournal } from '@/lib/notion/types';

interface JournalModalProps {
  open: boolean;
  onClose?: () => void;
  onSubmit: (journal: Partial<NotionJournal>) => Promise<void>;
  date: string;
  required?: boolean; // Se true, não pode fechar sem preencher
}

export function JournalModal({ open, onClose, onSubmit, date, required = false }: JournalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Summary: '',
    WhatWorked: '',
    WhatFailed: '',
    Insights: '',
    Objections: '',
    ProcessIdeas: '',
  });

  const handleSubmit = async () => {
    if (!formData.Summary.trim()) {
      toast.error('O resumo é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        Date: date,
        Filled: true,
        ...formData,
      });
      toast.success('Diário salvo com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar diário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Dialog open={open} onOpenChange={required ? undefined : onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" onPointerDownOutside={required ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Diário de {formattedDate}
            {required && (
              <span className="ml-2 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                Obrigatório
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {required ? (
              <span className="text-destructive font-medium">
                ⚠️ Execução bloqueada: Preencha o diário de ontem para continuar.
              </span>
            ) : (
              'Preencha seu diário antes de continuar. Isso alimenta seu RAG para insights futuros.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary - Required */}
          <div className="space-y-2">
            <Label htmlFor="summary" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Resumo do dia *
            </Label>
            <Textarea
              id="summary"
              placeholder="O que aconteceu de mais importante?"
              value={formData.Summary}
              onChange={(e) => setFormData(prev => ({ ...prev, Summary: e.target.value }))}
              className="min-h-[80px] text-base"
            />
          </div>

          {/* What Worked */}
          <div className="space-y-2">
            <Label htmlFor="worked" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-chart-1" />
              O que funcionou
            </Label>
            <Textarea
              id="worked"
              placeholder="Vitórias, acertos, coisas que deram certo..."
              value={formData.WhatWorked}
              onChange={(e) => setFormData(prev => ({ ...prev, WhatWorked: e.target.value }))}
              className="min-h-[60px] text-base"
            />
          </div>

          {/* What Failed */}
          <div className="space-y-2">
            <Label htmlFor="failed" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              O que não funcionou
            </Label>
            <Textarea
              id="failed"
              placeholder="Erros, falhas, o que poderia ser melhor..."
              value={formData.WhatFailed}
              onChange={(e) => setFormData(prev => ({ ...prev, WhatFailed: e.target.value }))}
              className="min-h-[60px] text-base"
            />
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <Label htmlFor="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-chart-2" />
              Insights
            </Label>
            <Textarea
              id="insights"
              placeholder="Aprendizados e descobertas..."
              value={formData.Insights}
              onChange={(e) => setFormData(prev => ({ ...prev, Insights: e.target.value }))}
              className="min-h-[60px] text-base"
            />
          </div>

          {/* Objections */}
          <div className="space-y-2">
            <Label htmlFor="objections" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-chart-3" />
              Objeções encontradas
            </Label>
            <Textarea
              id="objections"
              placeholder="Objeções de clientes ou prospects..."
              value={formData.Objections}
              onChange={(e) => setFormData(prev => ({ ...prev, Objections: e.target.value }))}
              className="min-h-[60px] text-base"
            />
          </div>

          {/* Process Ideas */}
          <div className="space-y-2">
            <Label htmlFor="process" className="flex items-center gap-2">
              <Cog className="h-4 w-4 text-chart-4" />
              Ideias de processo
            </Label>
            <Textarea
              id="process"
              placeholder="Melhorias de processo, automações..."
              value={formData.ProcessIdeas}
              onChange={(e) => setFormData(prev => ({ ...prev, ProcessIdeas: e.target.value }))}
              className="min-h-[60px] text-base"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.Summary.trim()}
            className="w-full"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Diário'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

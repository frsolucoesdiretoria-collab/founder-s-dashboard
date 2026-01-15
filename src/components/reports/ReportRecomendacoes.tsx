// Report Recomendações e Próximos Passos Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportRecomendacoesProps {
  recomendacoes: string;
  editable?: boolean;
  onUpdate?: (texto: string) => void;
}

export function ReportRecomendacoes({
  recomendacoes,
  editable = false,
  onUpdate,
}: ReportRecomendacoesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [texto, setTexto] = useState(recomendacoes);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(texto);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTexto(recomendacoes);
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">8. Recomendações e Próximos Passos</CardTitle>
          {editable && !isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Editar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing && editable ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recomendacoes">Recomendações e Próximos Passos</Label>
              <Textarea
                id="recomendacoes"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={8}
                className="mt-2"
                placeholder="Com base na análise do período, destacamos as seguintes recomendações e próximos passos..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="gap-2">
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-line">
              {texto || 'Nenhuma recomendação registrada para este período.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


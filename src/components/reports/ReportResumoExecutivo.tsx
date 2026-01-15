// Report Resumo Executivo Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportResumoExecutivoProps {
  resumoExecutivo: string;
  editable?: boolean;
  onUpdate?: (texto: string) => void;
}

export function ReportResumoExecutivo({
  resumoExecutivo,
  editable = false,
  onUpdate,
}: ReportResumoExecutivoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [texto, setTexto] = useState(resumoExecutivo);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(texto);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTexto(resumoExecutivo);
    setIsEditing(false);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">1. Resumo Executivo</CardTitle>
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
              <Label htmlFor="resumo">Resumo Executivo</Label>
              <Textarea
                id="resumo"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={8}
                className="mt-2"
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
            <p className="text-muted-foreground whitespace-pre-line">{texto || 'Não informado'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


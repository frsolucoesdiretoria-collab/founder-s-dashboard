// Report Feedbacks Importantes Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportFeedbacksProps {
  feedbacksPositivos: string;
  pontosAlinhamento: string;
  editable?: boolean;
  onUpdate?: (data: { feedbacksPositivos: string; pontosAlinhamento: string }) => void;
}

export function ReportFeedbacks({
  feedbacksPositivos,
  pontosAlinhamento,
  editable = false,
  onUpdate,
}: ReportFeedbacksProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [feedbacks, setFeedbacks] = useState(feedbacksPositivos);
  const [alinhamentos, setAlinhamentos] = useState(pontosAlinhamento);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        feedbacksPositivos: feedbacks,
        pontosAlinhamento: alinhamentos,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFeedbacks(feedbacksPositivos);
    setAlinhamentos(pontosAlinhamento);
    setIsEditing(false);
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">7. Feedbacks Importantes</CardTitle>
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
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        {isEditing && editable ? (
          <>
            <div>
              <Label htmlFor="feedbacks">Feedbacks positivos recebidos:</Label>
              <Textarea
                id="feedbacks"
                value={feedbacks}
                onChange={(e) => setFeedbacks(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="alinhamentos">Pontos de alinhamento ou ajustes identificados:</Label>
              <Textarea
                id="alinhamentos"
                value={alinhamentos}
                onChange={(e) => setAlinhamentos(e.target.value)}
                rows={4}
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
          </>
        ) : (
          <>
            <div>
              <div className="text-xs sm:text-sm font-semibold mb-2">
                Feedbacks positivos recebidos:
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                  {feedbacksPositivos || 'Nenhum feedback registrado.'}
                </p>
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold mb-2">
                Pontos de alinhamento ou ajustes identificados:
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                  {pontosAlinhamento || 'Nenhum ponto de alinhamento registrado.'}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


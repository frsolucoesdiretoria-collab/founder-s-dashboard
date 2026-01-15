// Report Chamados, Demandas e Pontos de Atenção Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportChamadosDemandasProps {
  chamadosRelevantes: number;
  demandasAtencaoEspecial: string;
  pontosRecorrentes: string;
  pendenciasProximoPeriodo: string;
  editable?: boolean;
  onUpdate?: (data: {
    chamadosRelevantes: number;
    demandasAtencaoEspecial: string;
    pontosRecorrentes: string;
    pendenciasProximoPeriodo: string;
  }) => void;
}

export function ReportChamadosDemandas({
  chamadosRelevantes,
  demandasAtencaoEspecial,
  pontosRecorrentes,
  pendenciasProximoPeriodo,
  editable = false,
  onUpdate,
}: ReportChamadosDemandasProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [chamados, setChamados] = useState(chamadosRelevantes.toString());
  const [demandas, setDemandas] = useState(demandasAtencaoEspecial);
  const [pontos, setPontos] = useState(pontosRecorrentes);
  const [pendencias, setPendencias] = useState(pendenciasProximoPeriodo);

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        chamadosRelevantes: parseInt(chamados) || 0,
        demandasAtencaoEspecial: demandas,
        pontosRecorrentes: pontos,
        pendenciasProximoPeriodo: pendencias,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setChamados(chamadosRelevantes.toString());
    setDemandas(demandasAtencaoEspecial);
    setPontos(pontosRecorrentes);
    setPendencias(pendenciasProximoPeriodo);
    setIsEditing(false);
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">6. Chamados, Demandas e Pontos de Atenção</CardTitle>
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
              <Label htmlFor="chamados">Quantidade de chamados relevantes no período:</Label>
              <Input
                id="chamados"
                type="number"
                value={chamados}
                onChange={(e) => setChamados(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="demandas">Demandas que exigiram atenção especial:</Label>
              <Textarea
                id="demandas"
                value={demandas}
                onChange={(e) => setDemandas(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="pontos">Pontos recorrentes identificados:</Label>
              <Textarea
                id="pontos"
                value={pontos}
                onChange={(e) => setPontos(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="pendencias">Pendências para o próximo período (se houver):</Label>
              <Textarea
                id="pendencias"
                value={pendencias}
                onChange={(e) => setPendencias(e.target.value)}
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
              <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                Quantidade de chamados relevantes no período:
              </div>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{chamadosRelevantes}</div>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold mb-2">
                Demandas que exigiram atenção especial:
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                  {demandasAtencaoEspecial || 'Nenhuma demanda especial registrada.'}
                </p>
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold mb-2">
                Pontos recorrentes identificados:
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                  {pontosRecorrentes || 'Nenhum ponto recorrente identificado.'}
                </p>
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold mb-2">
                Pendências para o próximo período (se houver):
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
                  {pendenciasProximoPeriodo || 'Nenhuma pendência registrada.'}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}


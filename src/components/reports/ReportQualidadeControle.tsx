// Report Qualidade e Controle Component
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { QualidadeControle } from '@/types/domaCondoClient';

interface ReportQualidadeControleProps {
  qualidadeControle: QualidadeControle;
}

export function ReportQualidadeControle({ qualidadeControle }: ReportQualidadeControleProps) {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl">4. Qualidade e Controle dos Lançamentos</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="p-3 sm:p-4 border rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Erros identificados:
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {qualidadeControle.errosIdentificados}
            </div>
          </div>
          <div className="p-3 sm:p-4 border rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
              Percentual de erros:
            </div>
            <div className="text-xl sm:text-2xl font-bold text-foreground">
              {qualidadeControle.percentualErros.toFixed(2)}%
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
            Correções realizadas no mesmo período:
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={qualidadeControle.correcoesRealizadas} disabled />
              <Label className="text-sm">Sim</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!qualidadeControle.correcoesRealizadas} disabled />
              <Label className="text-sm">Não</Label>
            </div>
          </div>
        </div>

        {qualidadeControle.errosIdentificados > 0 && (
          <div>
            <div className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
              Origem dos ajustes (quando aplicável):
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.documentacaoIncompleta} disabled />
                <Label className="text-sm">Documentação incompleta</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.informacoesDivergentes} disabled />
                <Label className="text-sm">Informações divergentes</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.ajustesSolicitados} disabled />
                <Label className="text-sm">Ajustes solicitados pelo cliente</Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.outros} disabled className="mt-1" />
                <div className="flex-1">
                  <Label className="text-sm">Outros</Label>
                  {qualidadeControle.origemAjustes.outros && qualidadeControle.origemAjustes.outrosDescricao && (
                    <span className="text-xs text-muted-foreground ml-2 block sm:inline">
                      ({qualidadeControle.origemAjustes.outrosDescricao})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


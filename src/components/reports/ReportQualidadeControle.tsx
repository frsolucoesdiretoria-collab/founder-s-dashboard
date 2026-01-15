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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">4. Qualidade e Controle dos Lançamentos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Quantidade de erros identificados:
            </div>
            <div className="text-2xl font-bold text-foreground">
              {qualidadeControle.errosIdentificados}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">
              Percentual de erros sobre o total de lançamentos:
            </div>
            <div className="text-2xl font-bold text-foreground">
              {qualidadeControle.percentualErros.toFixed(2)}%
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3">
            Correções realizadas no mesmo período:
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={qualidadeControle.correcoesRealizadas} disabled />
            <Label>Sim</Label>
            <Checkbox checked={!qualidadeControle.correcoesRealizadas} disabled />
            <Label>Não</Label>
          </div>
        </div>

        {qualidadeControle.errosIdentificados > 0 && (
          <div>
            <div className="text-sm font-semibold mb-3">
              Origem dos ajustes (quando aplicável):
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.documentacaoIncompleta} disabled />
                <Label>Documentação incompleta</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.informacoesDivergentes} disabled />
                <Label>Informações divergentes</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.ajustesSolicitados} disabled />
                <Label>Ajustes solicitados pelo cliente</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={qualidadeControle.origemAjustes.outros} disabled />
                <Label>Outros</Label>
                {qualidadeControle.origemAjustes.outros && qualidadeControle.origemAjustes.outrosDescricao && (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({qualidadeControle.origemAjustes.outrosDescricao})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


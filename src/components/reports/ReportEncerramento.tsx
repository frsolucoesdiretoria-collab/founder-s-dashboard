// Report Encerramento Component
import { Card, CardContent } from '@/components/ui/card';

export function ReportEncerramento() {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">9. Encerramento</h3>
            <p className="text-muted-foreground">
              Permanecemos à disposição para esclarecimentos adicionais e reforçamos nosso
              compromisso com a transparência, organização e excelência na gestão financeira.
            </p>
          </div>
          <div className="pt-4 border-t">
            <p className="font-semibold text-foreground">
              Doma – Assessoria, Consultoria e BPO Financeiro
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


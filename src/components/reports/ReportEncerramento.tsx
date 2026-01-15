// Report Encerramento Component
import { Card, CardContent } from '@/components/ui/card';

export function ReportEncerramento() {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">9. Encerramento</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Permanecemos à disposição para esclarecimentos adicionais e reforçamos nosso
              compromisso com a transparência, organização e excelência na gestão financeira.
            </p>
          </div>
          <div className="pt-3 sm:pt-4 border-t">
            <p className="text-sm sm:text-base font-semibold text-foreground">
              Doma – Assessoria, Consultoria e BPO Financeiro
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


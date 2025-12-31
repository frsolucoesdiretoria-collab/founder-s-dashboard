import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function ActionsCreatePage() {
  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6 pb-6">
        <div className="px-1">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Tarefas</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerenciamento de tarefas e ações
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            A página de criação de tarefas está em desenvolvimento. 
            As tarefas são criadas automaticamente através do sistema de KPIs e Metas.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Tarefas do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As tarefas do dia aparecem no Dashboard principal. 
              Você pode visualizar e marcar como concluídas diretamente no Dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


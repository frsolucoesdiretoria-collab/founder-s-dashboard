import { useState, useEffect } from 'react';
import { runSelfTests, validateAdminPasscode } from '@/services';
import type { SelfTestResult } from '@/types/health';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Play, Lock, ArrowLeft, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SelfTest() {
  const [passcode, setPasscode] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [testResult, setTestResult] = useState<SelfTestResult | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = async () => {
    setRunning(true);
    try { setTestResult(await runSelfTests()); } catch (e) { console.error(e); }
    finally { setRunning(false); }
  };

  const handleAuth = () => { if (validateAdminPasscode(passcode)) setAuthenticated(true); };

  useEffect(() => { if (authenticated) runTests(); }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Self Test</CardTitle><CardDescription>Entre com o passcode (admin123)</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" placeholder="Passcode" value={passcode} onChange={(e) => setPasscode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAuth()} />
            <Button className="w-full" onClick={handleAuth}>Entrar</Button>
            <Link to="/dashboard"><Button variant="ghost" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-foreground">Self Test</h1><p className="text-muted-foreground">Testes automatizados</p></div>
          <Button onClick={runTests} disabled={running}><Play className={`h-4 w-4 mr-2 ${running ? 'animate-pulse' : ''}`} />{running ? 'Executando...' : 'Executar'}</Button>
        </div>
        {testResult && (
          <>
            <Card className={testResult.passed ? 'border-primary/20' : 'border-destructive/20'}>
              <CardHeader><div className="flex items-center justify-between"><CardTitle>Resultado</CardTitle><Badge variant="outline" className={testResult.passed ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>{testResult.passed ? <><CheckCircle className="h-4 w-4 mr-1" />Passou</> : <><XCircle className="h-4 w-4 mr-1" />Falhou</>}</Badge></div></CardHeader>
            </Card>
            <Card><CardHeader><CardTitle>Testes</CardTitle></CardHeader><CardContent className="space-y-2">{testResult.tests.map((test, i) => (<div key={i} className={`p-3 rounded-lg border ${test.passed ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5'}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3">{test.passed ? <CheckCircle className="h-5 w-5 text-primary" /> : <XCircle className="h-5 w-5 text-destructive" />}<span className="font-medium text-foreground text-sm">{test.name}</span></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{test.duration}ms</div></div>{test.error && <p className="text-xs text-destructive mt-2 pl-8">{test.error}</p>}</div>))}</CardContent></Card>
            <div className="grid grid-cols-2 gap-4"><Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Passou</p><p className="text-2xl font-bold text-primary">{testResult.tests.filter(t => t.passed).length}</p></Card><Card className="p-4"><p className="text-xs text-muted-foreground uppercase">Falhou</p><p className="text-2xl font-bold text-destructive">{testResult.tests.filter(t => !t.passed).length}</p></Card></div>
          </>
        )}
        <Link to="/dashboard"><Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button></Link>
      </div>
    </div>
  );
}

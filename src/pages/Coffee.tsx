import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coffee, User, Building, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createCoffeeDiagnostic } from '@/services';
import type { CoffeeFormData } from '@/types/coffee';

export default function CoffeePage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<CoffeeFormData>({
    contactName: '',
    contactRole: '',
    company: '',
    source: '',
    mainChallenge: '',
    currentSituation: '',
    desiredOutcome: '',
    urgency: '',
    nextSteps: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.contactName.trim() || !formData.mainChallenge.trim()) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createCoffeeDiagnostic(formData);
      setSubmitted(true);
      toast.success('Diagnóstico de café registrado!');
    } catch (error) {
      toast.error('Erro ao registrar café');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setFormData({
      contactName: '',
      contactRole: '',
      company: '',
      source: '',
      mainChallenge: '',
      currentSituation: '',
      desiredOutcome: '',
      urgency: '',
      nextSteps: '',
      notes: '',
    });
  };

  if (submitted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Café Registrado!</h1>
          <p className="text-muted-foreground mb-6">
            O diagnóstico foi salvo e a ação foi criada.
          </p>
          <Button onClick={resetForm}>
            <Coffee className="h-4 w-4 mr-2" />
            Registrar outro café
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-lg mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            Café de Diagnóstico
          </h1>
          <p className="text-muted-foreground">
            Registre as informações do café para análise posterior
          </p>
        </div>

        {/* Progress */}
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Informações do Contato
              </CardTitle>
              <CardDescription>
                Quem participou do café?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nome do contato *</Label>
                <Input
                  id="contactName"
                  placeholder="João Silva"
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactRole">Cargo</Label>
                <Input
                  id="contactRole"
                  placeholder="CEO, Diretor, Gerente..."
                  value={formData.contactRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactRole: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    placeholder="Empresa ABC"
                    className="pl-10"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source">Como chegou até você?</Label>
                <Select 
                  value={formData.source} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="conteudo">Conteúdo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full mt-4"
                onClick={() => setStep(2)}
                disabled={!formData.contactName.trim()}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Diagnostic */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5" />
                Diagnóstico
              </CardTitle>
              <CardDescription>
                O que você descobriu na conversa?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainChallenge">Principal desafio *</Label>
                <Textarea
                  id="mainChallenge"
                  placeholder="Qual é o maior problema que ele quer resolver?"
                  value={formData.mainChallenge}
                  onChange={(e) => setFormData(prev => ({ ...prev, mainChallenge: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentSituation">Situação atual</Label>
                <Textarea
                  id="currentSituation"
                  placeholder="Como está funcionando hoje?"
                  value={formData.currentSituation}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentSituation: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desiredOutcome">Resultado desejado</Label>
                <Textarea
                  id="desiredOutcome"
                  placeholder="O que ele quer alcançar?"
                  value={formData.desiredOutcome}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredOutcome: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgência</Label>
                <Select 
                  value={formData.urgency} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qual a urgência?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta - precisa resolver agora</SelectItem>
                    <SelectItem value="media">Média - próximos meses</SelectItem>
                    <SelectItem value="baixa">Baixa - explorando opções</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!formData.mainChallenge.trim()}
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Next Steps */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Próximos Passos</CardTitle>
              <CardDescription>
                O que foi combinado?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nextSteps">Próximos passos combinados</Label>
                <Textarea
                  id="nextSteps"
                  placeholder="O que ficou de ação? Reunião de follow-up? Proposta?"
                  value={formData.nextSteps}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionais</Label>
                <Textarea
                  id="notes"
                  placeholder="Outras observações importantes..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Registrar Café'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Coffee, User, Building, MessageSquare, Target, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { createCoffeeDiagnostic, searchContacts, type Contact } from '@/services';
import type { CoffeeFormData, CoffeeSummary } from '@/types/coffee';
import { cn } from '@/lib/utils';

export default function CoffeePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState<CoffeeSummary | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  
  const [formData, setFormData] = useState<CoffeeFormData & { contactName?: string }>({
    contactId: '',
    contactName: '',
    segment: '',
    teamSize: '' as any,
    channels: [],
    whatsAppPrimary: false,
    responseSpeed: '',
    mainPain: '',
    symptoms: '',
    funnelLeak: '',
    goal30: '',
    goal60: '',
    goal90: '',
    scopeLockAccepted: false,
    additivesPolicyAccepted: false,
    nextStepAgreed: '',
    notes: ''
  });

  // Load contacts on mount and when search changes
  useEffect(() => {
    const loadContacts = async () => {
      const results = await searchContacts(contactSearch || undefined);
      setContacts(results);
    };
    
    const debounce = setTimeout(() => {
      loadContacts();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [contactSearch]);

  const handleSubmit = async () => {
    if (!formData.contactId && !formData.contactName) {
      toast.error('Selecione ou digite o nome do contato');
      return;
    }
    
    if (!formData.scopeLockAccepted || !formData.additivesPolicyAccepted) {
      toast.error('Você deve aceitar ScopeLock e AdditivesPolicy para continuar');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createCoffeeDiagnostic(formData);
      setSummary(result);
      toast.success('Café registrado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar café');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSummary(null);
    setFormData({
      contactId: '',
      contactName: '',
      segment: '',
      teamSize: '' as any,
      channels: [],
      whatsAppPrimary: false,
      responseSpeed: '',
      mainPain: '',
      symptoms: '',
      funnelLeak: '',
      goal30: '',
      goal60: '',
      goal90: '',
      scopeLockAccepted: false,
      additivesPolicyAccepted: false,
      nextStepAgreed: '',
      notes: ''
    });
    setContactSearch('');
  };

  // Summary screen
  if (summary) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <CardTitle className="text-2xl">Pronto para proposta</CardTitle>
              </div>
              <CardDescription>
                Resumo do diagnóstico de café
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Pain */}
              {summary.mainPain && (
                <div>
                  <h3 className="font-semibold mb-2">Principal dor</h3>
                  <p className="text-muted-foreground">{summary.mainPain}</p>
                </div>
              )}

              {/* Funnel Leak */}
              {summary.funnelLeak && (
                <div>
                  <h3 className="font-semibold mb-2">Vazamento no funil</h3>
                  <p className="text-muted-foreground">{summary.funnelLeak}</p>
                </div>
              )}

              {/* Response Speed */}
              {summary.responseSpeed && (
                <div>
                  <h3 className="font-semibold mb-2">Velocidade de resposta</h3>
                  <p className="text-muted-foreground">{summary.responseSpeed}</p>
                </div>
              )}

              {/* Goals */}
              {(summary.goals.goal30 || summary.goals.goal60 || summary.goals.goal90) && (
                <div>
                  <h3 className="font-semibold mb-3">Objetivos</h3>
                  <div className="space-y-2">
                    {summary.goals.goal30 && (
                      <div>
                        <span className="text-sm font-medium">30 dias: </span>
                        <span className="text-muted-foreground">{summary.goals.goal30}</span>
                      </div>
                    )}
                    {summary.goals.goal60 && (
                      <div>
                        <span className="text-sm font-medium">60 dias: </span>
                        <span className="text-muted-foreground">{summary.goals.goal60}</span>
                      </div>
                    )}
                    {summary.goals.goal90 && (
                      <div>
                        <span className="text-sm font-medium">90 dias: </span>
                        <span className="text-muted-foreground">{summary.goals.goal90}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scope Risk Alert */}
              {summary.scopeRisk && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive mb-1">RISCO DE ESCOPO INFINITO</h4>
                      <p className="text-sm text-muted-foreground">
                        ScopeLock ou AdditivesPolicy não foram aceitos. Recomendamos revisar antes de criar proposta.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Goal Warning */}
              {summary.goalWarning && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-600 mb-1">Meta não encontrada</h4>
                      <p className="text-sm text-muted-foreground">{summary.goalWarning}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommended Modules */}
              {summary.recommendedModules && summary.recommendedModules.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Módulos recomendados</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {summary.recommendedModules.map((module, idx) => (
                      <li key={idx}>{module}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">
                  <X className="h-4 w-4 mr-2" />
                  Novo café
                </Button>
                <Button className="flex-1" disabled>
                  Criar GrowthProposal rascunho
                  <span className="text-xs ml-2 opacity-70">(em breve)</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Coffee className="h-6 w-6 text-primary" />
            Formulário pós-café
          </h1>
          <p className="text-muted-foreground">
            Registre as informações do café para análise e geração de proposta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico de café</CardTitle>
            <CardDescription>
              Preencha todas as seções abaixo. Campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['identification']} className="w-full">
              {/* Identificação */}
              <AccordionItem value="identification">
                <AccordionTrigger className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Identificação
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contato *</Label>
                    <Popover open={contactOpen} onOpenChange={setContactOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {formData.contactId 
                            ? contacts.find(c => c.id === formData.contactId)?.Name || formData.contactName
                            : formData.contactName || "Selecione ou digite um contato..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar contato..." 
                            value={contactSearch}
                            onValueChange={setContactSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {contactSearch ? (
                                <div className="py-4 text-center">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Nenhum contato encontrado
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setFormData(prev => ({ ...prev, contactName: contactSearch, contactId: '' }));
                                      setContactOpen(false);
                                    }}
                                  >
                                    Criar "{contactSearch}"
                                  </Button>
                                </div>
                              ) : (
                                'Digite para buscar...'
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {contacts.map((contact) => (
                                <CommandItem
                                  key={contact.id}
                                  value={contact.Name}
                                  onSelect={() => {
                                    setFormData(prev => ({ ...prev, contactId: contact.id, contactName: contact.Name }));
                                    setContactOpen(false);
                                  }}
                                >
                                  {contact.Name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="segment">Segmento</Label>
                    <Input
                      id="segment"
                      placeholder="Ex: SaaS, E-commerce, Serviços..."
                      value={formData.segment}
                      onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Tamanho do time</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      placeholder="Ex: 10"
                      value={formData.teamSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value ? Number(e.target.value) : '' as any }))}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Canais */}
              <AccordionItem value="channels">
                <AccordionTrigger className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Canais
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="responseSpeed">Velocidade de resposta</Label>
                    <Select 
                      value={formData.responseSpeed} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, responseSpeed: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imediata">Imediata (&lt;1h)</SelectItem>
                        <SelectItem value="rapida">Rápida (1-4h)</SelectItem>
                        <SelectItem value="media">Média (4-24h)</SelectItem>
                        <SelectItem value="lenta">Lenta (&gt;24h)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsAppPrimary"
                      checked={formData.whatsAppPrimary}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, whatsAppPrimary: checked === true }))}
                    />
                    <Label htmlFor="whatsAppPrimary" className="font-normal cursor-pointer">
                      WhatsApp como canal primário
                    </Label>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Diagnóstico */}
              <AccordionItem value="diagnostic">
                <AccordionTrigger className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Diagnóstico
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainPain">Principal dor *</Label>
                    <Textarea
                      id="mainPain"
                      placeholder="Qual é o maior problema que ele quer resolver?"
                      value={formData.mainPain}
                      onChange={(e) => setFormData(prev => ({ ...prev, mainPain: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="symptoms">Sintomas</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Como essa dor se manifesta?"
                      value={formData.symptoms}
                      onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="funnelLeak">Vazamento no funil</Label>
                    <Textarea
                      id="funnelLeak"
                      placeholder="Onde está perdendo oportunidades?"
                      value={formData.funnelLeak}
                      onChange={(e) => setFormData(prev => ({ ...prev, funnelLeak: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Objetivos */}
              <AccordionItem value="goals">
                <AccordionTrigger className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivos
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal30">Objetivo 30 dias</Label>
                    <Textarea
                      id="goal30"
                      placeholder="O que ele quer alcançar em 30 dias?"
                      value={formData.goal30}
                      onChange={(e) => setFormData(prev => ({ ...prev, goal30: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal60">Objetivo 60 dias</Label>
                    <Textarea
                      id="goal60"
                      placeholder="O que ele quer alcançar em 60 dias?"
                      value={formData.goal60}
                      onChange={(e) => setFormData(prev => ({ ...prev, goal60: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal90">Objetivo 90 dias</Label>
                    <Textarea
                      id="goal90"
                      placeholder="O que ele quer alcançar em 90 dias?"
                      value={formData.goal90}
                      onChange={(e) => setFormData(prev => ({ ...prev, goal90: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Compromisso */}
              <AccordionItem value="commitment">
                <AccordionTrigger className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Compromisso
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="scopeLockAccepted"
                        checked={formData.scopeLockAccepted}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, scopeLockAccepted: checked === true }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="scopeLockAccepted" className="font-normal cursor-pointer">
                          ScopeLock aceito *
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confirma que o escopo está travado e não haverá expansão sem aprovação formal
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="additivesPolicyAccepted"
                        checked={formData.additivesPolicyAccepted}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, additivesPolicyAccepted: checked === true }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="additivesPolicyAccepted" className="font-normal cursor-pointer">
                          AdditivesPolicy aceita *
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confirma que aditivos/modificações seguem política estabelecida
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Próximo passo */}
              <AccordionItem value="nextStep">
                <AccordionTrigger className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Próximo passo
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="nextStepAgreed">Próximo passo acordado</Label>
                    <Textarea
                      id="nextStepAgreed"
                      placeholder="O que foi combinado como próximo passo?"
                      value={formData.nextStepAgreed}
                      onChange={(e) => setFormData(prev => ({ ...prev, nextStepAgreed: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas adicionais</Label>
                    <Textarea
                      id="notes"
                      placeholder="Outras observações importantes..."
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-6 pt-6 border-t">
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.scopeLockAccepted || !formData.additivesPolicyAccepted}
                size="lg"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar diagnóstico'}
              </Button>
              {(!formData.scopeLockAccepted || !formData.additivesPolicyAccepted) && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Você deve aceitar ScopeLock e AdditivesPolicy para salvar
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

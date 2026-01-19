import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Trash2, Save, Download, Edit, X, ChevronUp, ChevronDown, Calendar, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getProposals, createProposal, updateProposal, deleteProposal } from '@/services/proposals.service';
import { getContacts } from '@/services/contacts.service';
import type { Proposal, ProposalFormData, ProposalService, ProposalPaymentTerm } from '@/types/proposal';
import type { Contact } from '@/types/contact';
import jsPDF from 'jspdf';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Format currency to Brazilian Real
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Parse currency string to number
const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
};

// Format currency input (for display in input field when not editing)
const formatCurrencyInput = (value: number): string => {
  if (value === 0) return '';
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).replace('.', ',');
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [showCalculateDialog, setShowCalculateDialog] = useState(false);
  const [numInstallments, setNumInstallments] = useState<string>('1');
  const [rejectionReason, setRejectionReason] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<{ id: string; status: Proposal['status'] } | null>(null);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  
  // Raw values for currency inputs (to avoid formatting issues during typing)
  const [rawUnitValues, setRawUnitValues] = useState<Record<number, string>>({});
  const [rawPaymentValues, setRawPaymentValues] = useState<Record<number, string>>({});

  const [formData, setFormData] = useState<ProposalFormData>({
    proposalNumber: '',
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    status: 'Em criação',
    clientName: '',
    clientCompany: '',
    clientCNPJ: '',
    clientAddress: '',
    clientCity: '',
    clientState: '',
    clientCEP: '',
    clientPhone: '',
    clientEmail: '',
    services: [],
    subtotal: 0,
    discountType: 'percent',
    discountPercent: 0,
    discountAmount: 0,
    taxType: 'percent',
    taxPercent: 0,
    taxAmount: 0,
    total: 0,
    paymentTerms: [],
    observations: '',
    materialsNotIncluded: '',
    relatedContactId: '',
    relatedClientId: '',
    relatedCoffeeDiagnosticId: ''
  });

  // Load proposals and contacts
  useEffect(() => {
    loadProposals();
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      // Don't show error toast, just log it
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setFormData(prev => ({
      ...prev,
      clientName: contact.Name || '',
      clientCompany: contact.Company || '',
      clientCity: contact.City || '',
      clientPhone: contact.WhatsApp || '',
      relatedContactId: contact.id
    }));
    setContactSearchOpen(false);
    toast.success('Dados do contato preenchidos!');
  };

  const loadProposals = async () => {
    setLoading(true);
    try {
      const data = await getProposals();
      setProposals(data);
    } catch (error) {
      toast.error('Erro ao carregar propostas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const calculatedValues = useMemo(() => {
    const subtotal = formData.services.reduce((sum, s) => sum + (s.quantity * s.unitValue), 0);
    const discount = formData.discountType === 'percent'
      ? subtotal * (formData.discountPercent || 0) / 100
      : (formData.discountAmount || 0);
    const afterDiscount = subtotal - discount;
    const tax = formData.taxType === 'percent'
      ? afterDiscount * (formData.taxPercent || 0) / 100
      : (formData.taxAmount || 0);
    const total = afterDiscount + tax;

    return { subtotal, discount, tax, total };
  }, [formData.services, formData.discountType, formData.discountPercent, formData.discountAmount, formData.taxType, formData.taxPercent, formData.taxAmount]);

  // Update form data when calculations change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subtotal: calculatedValues.subtotal,
      discountAmount: calculatedValues.discount,
      taxAmount: calculatedValues.tax,
      total: calculatedValues.total
    }));
  }, [calculatedValues]);

  const handleAddService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        name: '',
        description: '',
        procedures: '',
        materialsIncluded: '',
        quantity: 1,
        unitValue: 0,
        subtotal: 0
      }]
    }));
  };

  const handleUpdateService = (index: number, updates: Partial<ProposalService>) => {
    setFormData(prev => {
      const newServices = [...prev.services];
      const updated = { ...newServices[index], ...updates };
      updated.subtotal = updated.quantity * updated.unitValue;
      newServices[index] = updated;
      return { ...prev, services: newServices };
    });
  };

  const handleUnitValueChange = (index: number, rawValue: string) => {
    // Store raw value for editing
    setRawUnitValues(prev => ({ ...prev, [index]: rawValue }));
    
    // Parse and update the actual value
    const numericValue = parseCurrency(rawValue);
    handleUpdateService(index, { unitValue: numericValue });
  };

  const handleUnitValueBlur = (index: number) => {
    // Format on blur
    const service = formData.services[index];
    if (service) {
      const formatted = formatCurrencyInput(service.unitValue);
      setRawUnitValues(prev => ({ ...prev, [index]: formatted }));
    }
  };

  const handlePaymentAmountChange = (index: number, rawValue: string) => {
    // Store raw value for editing
    setRawPaymentValues(prev => ({ ...prev, [index]: rawValue }));
    
    // Parse and update the actual value
    const numericValue = parseCurrency(rawValue);
    handleUpdatePaymentTerm(index, { amount: numericValue });
  };

  const handlePaymentAmountBlur = (index: number) => {
    // Format on blur
    const term = formData.paymentTerms[index];
    if (term) {
      const formatted = formatCurrencyInput(term.amount);
      setRawPaymentValues(prev => ({ ...prev, [index]: formatted }));
    }
  };

  const handleRemoveService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleMoveService = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.services.length - 1) return;

    setFormData(prev => {
      const newServices = [...prev.services];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
      return { ...prev, services: newServices };
    });
  };

  const handleAddPaymentTerm = () => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: [...prev.paymentTerms, {
        dueDate: '',
        amount: 0,
        paymentMethod: 'PIX',
        observation: ''
      }]
    }));
  };

  const handleUpdatePaymentTerm = (index: number, updates: Partial<ProposalPaymentTerm>) => {
    setFormData(prev => {
      const newTerms = [...prev.paymentTerms];
      newTerms[index] = { ...newTerms[index], ...updates };
      return { ...prev, paymentTerms: newTerms };
    });
  };

  const handleRemovePaymentTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.filter((_, i) => i !== index)
    }));
  };

  const handleCalculatePaymentTerms = () => {
    if (formData.total <= 0) {
      toast.error('O total deve ser maior que zero para calcular parcelas');
      return;
    }
    setShowCalculateDialog(true);
  };

  const confirmCalculatePaymentTerms = () => {
    const num = parseInt(numInstallments);
    if (!num || num <= 0) {
      toast.error('Número de parcelas inválido');
      return;
    }

    const amountPerTerm = formData.total / num;

    const terms: ProposalPaymentTerm[] = [];
    const today = new Date();
    for (let i = 0; i < num; i++) {
      const dueDate = new Date(today);
      dueDate.setMonth(dueDate.getMonth() + i);
      const amount = i === num - 1 
        ? Math.round((formData.total - (amountPerTerm * (num - 1))) * 100) / 100 // Last term gets remainder
        : Math.round(amountPerTerm * 100) / 100;
      
      terms.push({
        dueDate: dueDate.toISOString().split('T')[0],
        amount: amount,
        paymentMethod: 'PIX',
        observation: ''
      });
    }

    setFormData(prev => ({ ...prev, paymentTerms: terms }));
    setShowCalculateDialog(false);
    setNumInstallments('1');
    toast.success(`${num} parcela(s) calculada(s) com sucesso!`);
  };

  const handleSave = async () => {
    if (!formData.clientName.trim()) {
      toast.error('Nome do cliente é obrigatório');
      return;
    }
    if (formData.services.length === 0) {
      toast.error('Adicione pelo menos um serviço');
      return;
    }
    if (formData.total <= 0) {
      toast.error('Total deve ser maior que zero');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateProposal(editingId, formData);
        toast.success('Proposta atualizada!');
      } else {
        await createProposal(formData);
        toast.success('Proposta criada!');
      }
      await loadProposals();
      handleResetForm();
      setActiveTab('list');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (proposal: Proposal) => {
    setFormData({
      proposalNumber: proposal.proposalNumber || '',
      date: proposal.date,
      validUntil: proposal.validUntil || '',
      status: proposal.status,
      clientName: proposal.clientName,
      clientCompany: proposal.clientCompany || '',
      clientCNPJ: proposal.clientCNPJ || '',
      clientAddress: proposal.clientAddress || '',
      clientCity: proposal.clientCity || '',
      clientState: proposal.clientState || '',
      clientCEP: proposal.clientCEP || '',
      clientPhone: proposal.clientPhone || '',
      clientEmail: proposal.clientEmail || '',
      services: proposal.services,
      subtotal: proposal.subtotal,
      discountType: proposal.discountType,
      discountPercent: proposal.discountPercent,
      discountAmount: proposal.discountAmount,
      taxType: proposal.taxType,
      taxPercent: proposal.taxPercent,
      taxAmount: proposal.taxAmount,
      total: proposal.total,
      paymentTerms: proposal.paymentTerms,
      observations: proposal.observations || '',
      materialsNotIncluded: proposal.materialsNotIncluded || '',
      relatedContactId: proposal.relatedContactId || '',
      relatedClientId: proposal.relatedClientId || '',
      relatedCoffeeDiagnosticId: proposal.relatedCoffeeDiagnosticId || '',
      rejectionReason: proposal.rejectionReason
    });
    setEditingId(proposal.id);
    setActiveTab('create');
    // Reset raw values when editing
    setRawUnitValues({});
    setRawPaymentValues({});
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;

    setLoading(true);
    try {
      await deleteProposal(id);
      toast.success('Proposta excluída!');
      await loadProposals();
    } catch (error) {
      toast.error('Erro ao excluir proposta');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Proposal['status']) => {
    if (newStatus === 'Recusada') {
      setPendingStatusChange({ id, status: newStatus });
      setShowRejectionDialog(true);
      return;
    }

    setLoading(true);
    try {
      await updateProposal(id, { status: newStatus });
      toast.success('Status atualizado!');
      await loadProposals();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!pendingStatusChange || !rejectionReason.trim()) {
      toast.error('Motivo da recusa é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await updateProposal(pendingStatusChange.id, {
        status: 'Recusada',
        rejectionReason
      });
      toast.success('Status atualizado!');
      await loadProposals();
      setShowRejectionDialog(false);
      setRejectionReason('');
      setPendingStatusChange(null);
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      proposalNumber: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: '',
      status: 'Em criação',
      clientName: '',
      clientCompany: '',
      clientCNPJ: '',
      clientAddress: '',
      clientCity: '',
      clientState: '',
      clientCEP: '',
      clientPhone: '',
      clientEmail: '',
      services: [],
      subtotal: 0,
      discountType: 'percent',
      discountPercent: 0,
      discountAmount: 0,
      taxType: 'percent',
      taxPercent: 0,
      taxAmount: 0,
      total: 0,
      paymentTerms: [],
      observations: '',
      materialsNotIncluded: '',
      relatedContactId: '',
      relatedClientId: '',
      relatedCoffeeDiagnosticId: ''
    });
    setEditingId(null);
    setRawUnitValues({});
    setRawPaymentValues({});
    setContactSearchOpen(false);
  };

  const handleGeneratePDF = (proposal: Proposal) => {
    const doc = new jsPDF();
    let yPos = 20;

    // Header
    doc.setFontSize(16);
    doc.text('AXIS', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text('CNPJ: [CNPJ DA EMPRESA]', 20, yPos);
    yPos += 5;
    doc.text('Endereço: [ENDEREÇO]', 20, yPos);
    yPos += 5;
    doc.text('Telefone: [TELEFONE] | E-mail: [EMAIL]', 20, yPos);
    yPos += 10;

    // Proposal number and date
    doc.setFontSize(14);
    doc.text(`ORÇAMENTO N° ${proposal.proposalNumber || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(proposal.date).toLocaleDateString('pt-BR')}`, 20, yPos);
    yPos += 10;

    // Client data
    doc.setFontSize(12);
    doc.text('DADOS DO CLIENTE', 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Cliente: ${proposal.clientName}`, 20, yPos);
    yPos += 5;
    if (proposal.clientCompany) {
      doc.text(`Empresa: ${proposal.clientCompany}`, 20, yPos);
      yPos += 5;
    }
    if (proposal.clientCNPJ) {
      doc.text(`CNPJ/CPF: ${proposal.clientCNPJ}`, 20, yPos);
      yPos += 5;
    }
    if (proposal.clientAddress) {
      doc.text(`Endereço: ${proposal.clientAddress}`, 20, yPos);
      yPos += 5;
    }
    if (proposal.clientCity || proposal.clientState) {
      doc.text(`${proposal.clientCity || ''} ${proposal.clientState || ''}`, 20, yPos);
      yPos += 5;
    }
    yPos += 5;

    // Services
    doc.setFontSize(12);
    doc.text('SERVIÇOS', 20, yPos);
    yPos += 7;

    proposal.services.forEach((service, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}) ${service.name}`, 20, yPos);
      yPos += 5;

      if (service.description) {
        doc.setFont(undefined, 'normal');
        const descriptionLines = doc.splitTextToSize(service.description, 170);
        doc.text(descriptionLines, 25, yPos);
        yPos += descriptionLines.length * 5;
      }

      doc.text(`Quantidade: ${service.quantity} | Valor Unitário: ${formatCurrency(service.unitValue)} | Subtotal: ${formatCurrency(service.subtotal)}`, 25, yPos);
      yPos += 7;
    });

    yPos += 5;

    // Summary
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMO', 20, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Subtotal: ${formatCurrency(proposal.subtotal)}`, 20, yPos);
    yPos += 5;
    if (proposal.discountAmount > 0) {
      doc.text(`Desconto: ${formatCurrency(proposal.discountAmount)}`, 20, yPos);
      yPos += 5;
    }
    if (proposal.taxAmount > 0) {
      doc.text(`Impostos: ${formatCurrency(proposal.taxAmount)}`, 20, yPos);
      yPos += 5;
    }
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: ${formatCurrency(proposal.total)}`, 20, yPos);
    yPos += 10;

    // Payment terms
    if (proposal.paymentTerms.length > 0) {
      doc.setFontSize(12);
      doc.text('FORMA DE PAGAMENTO', 20, yPos);
      yPos += 7;

      doc.setFontSize(9);
      proposal.paymentTerms.forEach((term) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(
          `${new Date(term.dueDate).toLocaleDateString('pt-BR')} - ${formatCurrency(term.amount)} - ${term.paymentMethod}`,
          20,
          yPos
        );
        yPos += 5;
      });
    }

    // Observations
    if (proposal.observations) {
      yPos += 5;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('OBSERVAÇÕES', 20, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const obsLines = doc.splitTextToSize(proposal.observations, 170);
      doc.text(obsLines, 20, yPos);
    }

    // Save PDF
    doc.save(`Orcamento_${proposal.proposalNumber || 'novo'}.pdf`);
    toast.success('PDF gerado com sucesso!');
  };

  const statusBadgeVariant = (status: Proposal['status']) => {
    switch (status) {
      case 'Aprovada': return 'default';
      case 'Enviada': return 'secondary';
      case 'Recusada': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Propostas de Crescimento
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie orçamentos para consultoria
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'create')}>
          <TabsList>
            <TabsTrigger value="list">Lista de Propostas</TabsTrigger>
            <TabsTrigger value="create">{editingId ? 'Editar Proposta' : 'Nova Proposta'}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Propostas</CardTitle>
                <CardDescription>
                  {proposals.length} proposta(s) encontrada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma proposta encontrada. Crie uma nova proposta para começar.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Número</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proposals.map((proposal) => (
                          <TableRow key={proposal.id}>
                            <TableCell className="font-medium">
                              {proposal.proposalNumber || 'N/A'}
                            </TableCell>
                            <TableCell>{proposal.clientName}</TableCell>
                            <TableCell>
                              {new Date(proposal.date).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusBadgeVariant(proposal.status)}>
                                {proposal.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(proposal.total)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGeneratePDF(proposal)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(proposal)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Select
                                  value={proposal.status}
                                  onValueChange={(value) => handleStatusChange(proposal.id, value as Proposal['status'])}
                                >
                                  <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Em criação">Em criação</SelectItem>
                                    <SelectItem value="Enviada">Enviada</SelectItem>
                                    <SelectItem value="Aprovada">Aprovada</SelectItem>
                                    <SelectItem value="Recusada">Recusada</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(proposal.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposalNumber">Número do Orçamento</Label>
                    <Input
                      id="proposalNumber"
                      placeholder="2025-0001"
                      value={formData.proposalNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, proposalNumber: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data de Emissão *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="validUntil">Validade</Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Proposal['status'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em criação">Em criação</SelectItem>
                      <SelectItem value="Enviada">Enviada</SelectItem>
                      <SelectItem value="Aprovada">Aprovada</SelectItem>
                      <SelectItem value="Recusada">Recusada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados do Cliente</CardTitle>
                <CardDescription>
                  Busque um contato cadastrado para preencher os dados automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Buscar Contato Cadastrado</Label>
                  <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {formData.relatedContactId 
                          ? contacts.find(c => c.id === formData.relatedContactId)?.Name || 'Selecione um contato...'
                          : 'Buscar contato...'}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar contato..." />
                        <CommandList>
                          <CommandEmpty>Nenhum contato encontrado.</CommandEmpty>
                          <CommandGroup>
                            {contacts.map((contact) => (
                              <CommandItem
                                key={contact.id}
                                value={contact.Name}
                                onSelect={() => handleContactSelect(contact)}
                              >
                                <div className="flex flex-col">
                                  <span>{contact.Name}</span>
                                  {contact.Company && (
                                    <span className="text-xs text-muted-foreground">{contact.Company}</span>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nome do Cliente *</Label>
                    <Input
                      id="clientName"
                      placeholder="Nome completo"
                      value={formData.clientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCompany">Empresa</Label>
                    <Input
                      id="clientCompany"
                      placeholder="Nome da empresa"
                      value={formData.clientCompany}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientCompany: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCNPJ">CNPJ/CPF</Label>
                    <Input
                      id="clientCNPJ"
                      placeholder="00.000.000/0000-00"
                      value={formData.clientCNPJ}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientCNPJ: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientPhone">Telefone</Label>
                    <Input
                      id="clientPhone"
                      placeholder="(00) 00000-0000"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">E-mail</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCEP">CEP</Label>
                    <Input
                      id="clientCEP"
                      placeholder="00000-000"
                      value={formData.clientCEP}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientCEP: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="clientAddress">Endereço</Label>
                    <Input
                      id="clientAddress"
                      placeholder="Rua, número, complemento"
                      value={formData.clientAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCity">Cidade</Label>
                    <Input
                      id="clientCity"
                      placeholder="Cidade"
                      value={formData.clientCity}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientCity: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientState">Estado</Label>
                    <Input
                      id="clientState"
                      placeholder="UF"
                      value={formData.clientState}
                      onChange={(e) => setFormData(prev => ({ ...prev, clientState: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Serviços</CardTitle>
                  <Button onClick={handleAddService} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.
                  </div>
                ) : (
                  formData.services.map((service, index) => (
                    <Card key={index} className="border-muted">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Serviço {index + 1}</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveService(index, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveService(index, 'down')}
                              disabled={index === formData.services.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveService(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nome do Serviço *</Label>
                            <Input
                              value={service.name}
                              onChange={(e) => handleUpdateService(index, { name: e.target.value })}
                              placeholder="Ex: Consultoria Estratégica"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-2">
                              <Label>Qtd.</Label>
                              <Input
                                type="number"
                                min="1"
                                value={service.quantity}
                                onChange={(e) => handleUpdateService(index, { quantity: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Valor Unit.</Label>
                              <Input
                                value={rawUnitValues[index] !== undefined ? rawUnitValues[index] : (service.unitValue > 0 ? formatCurrencyInput(service.unitValue) : '')}
                                onChange={(e) => handleUnitValueChange(index, e.target.value)}
                                onBlur={() => handleUnitValueBlur(index)}
                                onFocus={() => {
                                  if (!rawUnitValues[index]) {
                                    setRawUnitValues(prev => ({ ...prev, [index]: service.unitValue > 0 ? service.unitValue.toString().replace('.', ',') : '' }));
                                  }
                                }}
                                placeholder="0,00"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Subtotal</Label>
                              <Input
                                value={formatCurrency(service.subtotal)}
                                disabled
                                className="font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Descrição Técnica</Label>
                          <Textarea
                            value={service.description || ''}
                            onChange={(e) => handleUpdateService(index, { description: e.target.value })}
                            placeholder="Descrição detalhada do serviço..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Procedimentos (opcional)</Label>
                          <Textarea
                            value={service.procedures || ''}
                            onChange={(e) => handleUpdateService(index, { procedures: e.target.value })}
                            placeholder="Procedimentos a serem executados..."
                            rows={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Materiais Inclusos (opcional)</Label>
                          <Textarea
                            value={service.materialsIncluded || ''}
                            onChange={(e) => handleUpdateService(index, { materialsIncluded: e.target.value })}
                            placeholder="Materiais e recursos inclusos..."
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input
                    value={formatCurrency(formData.subtotal)}
                    disabled
                    className="font-semibold text-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Desconto</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, discountType: value as 'percent' | 'fixed' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {formData.discountType === 'percent' ? 'Percentual de Desconto (%)' : 'Valor do Desconto (R$)'}
                    </Label>
                    <Input
                      type="number"
                      step={formData.discountType === 'percent' ? '1' : '0.01'}
                      value={formData.discountType === 'percent' ? formData.discountPercent : formData.discountAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (formData.discountType === 'percent') {
                          setFormData(prev => ({ ...prev, discountPercent: value }));
                        } else {
                          setFormData(prev => ({ ...prev, discountAmount: value }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Desconto Aplicado</Label>
                  <Input
                    value={formatCurrency(calculatedValues.discount)}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Imposto</Label>
                    <Select
                      value={formData.taxType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, taxType: value as 'percent' | 'fixed' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percentual (%)</SelectItem>
                        <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {formData.taxType === 'percent' ? 'Percentual de Imposto (%)' : 'Valor do Imposto (R$)'}
                    </Label>
                    <Input
                      type="number"
                      step={formData.taxType === 'percent' ? '1' : '0.01'}
                      value={formData.taxType === 'percent' ? formData.taxPercent : formData.taxAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        if (formData.taxType === 'percent') {
                          setFormData(prev => ({ ...prev, taxPercent: value }));
                        } else {
                          setFormData(prev => ({ ...prev, taxAmount: value }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Impostos</Label>
                  <Input
                    value={formatCurrency(calculatedValues.tax)}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-lg font-semibold">TOTAL</Label>
                  <Input
                    value={formatCurrency(formData.total)}
                    disabled
                    className="font-bold text-xl"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Forma de Pagamento</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleCalculatePaymentTerms} size="sm" variant="outline">
                      Calcular Parcelas
                    </Button>
                    <Button onClick={handleAddPaymentTerm} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Parcela
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.paymentTerms.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhuma parcela adicionada. Clique em "Calcular Parcelas" ou "Adicionar Parcela".
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Forma de Pagamento</TableHead>
                          <TableHead>Observação</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.paymentTerms.map((term, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                type="date"
                                value={term.dueDate}
                                onChange={(e) => handleUpdatePaymentTerm(index, { dueDate: e.target.value })}
                                className="w-[150px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={rawPaymentValues[index] !== undefined ? rawPaymentValues[index] : (term.amount > 0 ? formatCurrencyInput(term.amount) : '')}
                                onChange={(e) => handlePaymentAmountChange(index, e.target.value)}
                                onBlur={() => handlePaymentAmountBlur(index)}
                                onFocus={() => {
                                  if (!rawPaymentValues[index]) {
                                    setRawPaymentValues(prev => ({ ...prev, [index]: term.amount > 0 ? term.amount.toString().replace('.', ',') : '' }));
                                  }
                                }}
                                className="w-[120px]"
                                placeholder="0,00"
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={term.paymentMethod}
                                onValueChange={(value) => handleUpdatePaymentTerm(index, { paymentMethod: value as any })}
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PIX">PIX</SelectItem>
                                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                                  <SelectItem value="Boleto">Boleto</SelectItem>
                                  <SelectItem value="Transferência">Transferência</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={term.observation || ''}
                                onChange={(e) => handleUpdatePaymentTerm(index, { observation: e.target.value })}
                                placeholder="Observação"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePaymentTerm(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {formData.paymentTerms.length > 0 && (
                  <div className="text-right text-sm text-muted-foreground">
                    Total das parcelas: {formatCurrency(formData.paymentTerms.reduce((sum, t) => sum + t.amount, 0))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observations">Observações Gerais</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Observações adicionais sobre a proposta..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialsNotIncluded">Materiais Não Inclusos</Label>
                  <Textarea
                    id="materialsNotIncluded"
                    value={formData.materialsNotIncluded}
                    onChange={(e) => setFormData(prev => ({ ...prev, materialsNotIncluded: e.target.value }))}
                    placeholder="Liste os materiais ou serviços não inclusos nesta proposta..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  handleResetForm();
                  setActiveTab('list');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar Proposta'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Motivo da Recusa</DialogTitle>
              <DialogDescription>
                Informe o motivo da recusa desta proposta para mapearmos objeções.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Motivo *</Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Ex: Valor acima do orçamento disponível..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason('');
                setPendingStatusChange(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmRejection} disabled={!rejectionReason.trim() || loading}>
                Confirmar Recusa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCalculateDialog} onOpenChange={setShowCalculateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Calcular Parcelas</DialogTitle>
              <DialogDescription>
                Informe quantas parcelas deseja e o sistema calculará automaticamente os valores.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numInstallments">Número de Parcelas *</Label>
                <Input
                  id="numInstallments"
                  type="number"
                  min="1"
                  value={numInstallments}
                  onChange={(e) => setNumInstallments(e.target.value)}
                  placeholder="Ex: 12"
                />
                <p className="text-sm text-muted-foreground">
                  Total a dividir: {formatCurrency(formData.total)}
                </p>
                {parseInt(numInstallments) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Valor por parcela: {formatCurrency(formData.total / parseInt(numInstallments))}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCalculateDialog(false);
                setNumInstallments('1');
              }}>
                Cancelar
              </Button>
              <Button onClick={confirmCalculatePaymentTerms} disabled={!numInstallments || parseInt(numInstallments) <= 0}>
                Calcular
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}


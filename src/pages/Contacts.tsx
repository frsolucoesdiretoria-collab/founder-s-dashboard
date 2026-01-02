import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, Plus, Edit2, Trash2, Search, Phone, Building, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { getContacts, createContact, updateContact, deleteContact } from '@/services';
import type { Contact } from '@/types/contact';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  
  const [formData, setFormData] = useState<Partial<Contact>>({
    Name: '',
    Company: '',
    WhatsApp: '',
    Status: '',
    Segment: '',
    City: '',
    Source: '',
    Priority: '',
    Notes: ''
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast.error('Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredContacts(
        contacts.filter(
          contact =>
            contact.Name?.toLowerCase().includes(query) ||
            contact.Company?.toLowerCase().includes(query) ||
            contact.WhatsApp?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, contacts]);

  const handleOpenDialog = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        Name: contact.Name || '',
        Company: contact.Company || '',
        WhatsApp: contact.WhatsApp || '',
        Status: contact.Status || '',
        Segment: contact.Segment || '',
        City: contact.City || '',
        Source: contact.Source || '',
        Priority: contact.Priority || '',
        Notes: contact.Notes || ''
      });
    } else {
      setEditingContact(null);
      setFormData({
        Name: '',
        Company: '',
        WhatsApp: '',
        Status: '',
        Segment: '',
        City: '',
        Source: '',
        Priority: '',
        Notes: ''
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingContact(null);
    setFormData({
      Name: '',
      Company: '',
      WhatsApp: '',
      Status: '',
      Segment: '',
      City: '',
      Source: '',
      Priority: '',
      Notes: ''
    });
  };

  const handleSubmit = async () => {
    if (!formData.Name?.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        toast.success('Contato atualizado com sucesso!');
      } else {
        await createContact(formData as Omit<Contact, 'id'>);
        toast.success('Contato criado com sucesso!');
      }
      handleCloseDialog();
      loadContacts();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar contato');
    }
  };

  const handleDeleteClick = (contact: Contact) => {
    setDeletingContact(contact);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deletingContact) return;

    try {
      await deleteContact(deletingContact.id);
      toast.success('Contato deletado com sucesso!');
      setShowDeleteDialog(false);
      setDeletingContact(null);
      loadContacts();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar contato');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
            <p className="text-muted-foreground">
              Gerencie seus contatos e leads
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, empresa ou WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Carregando contatos...</p>
            </CardContent>
          </Card>
        ) : filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {searchQuery ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{contact.Name}</CardTitle>
                      {contact.WhatsApp && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3" />
                          {contact.WhatsApp}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(contact)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(contact)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm text-muted-foreground"
                    onClick={() => handleOpenDialog(contact)}
                  >
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContact ? 'Editar Contato' : 'Novo Contato'}
              </DialogTitle>
              <DialogDescription>
                {editingContact
                  ? 'Atualize as informações do contato'
                  : 'Preencha as informações do novo contato'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    placeholder="Nome da empresa"
                    value={formData.Company}
                    onChange={(e) => setFormData({ ...formData, Company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+55 48 99999-9999"
                    value={formData.WhatsApp}
                    onChange={(e) => setFormData({ ...formData, WhatsApp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Cidade"
                    value={formData.City || ''}
                    onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.Status || ''}
                    onValueChange={(value) => setFormData({ ...formData, Status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contato Ativado">Contato Ativado</SelectItem>
                      <SelectItem value="Café Agendado">Café Agendado</SelectItem>
                      <SelectItem value="Café Executado">Café Executado</SelectItem>
                      <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
                      <SelectItem value="Follow-up Ativo">Follow-up Ativo</SelectItem>
                      <SelectItem value="Venda Fechada">Venda Fechada</SelectItem>
                      <SelectItem value="Perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segment">Segmento</Label>
                  <Input
                    id="segment"
                    placeholder="Segmento"
                    value={formData.Segment || ''}
                    onChange={(e) => setFormData({ ...formData, Segment: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="source">Origem</Label>
                  <Input
                    id="source"
                    placeholder="Origem do contato"
                    value={formData.Source}
                    onChange={(e) => setFormData({ ...formData, Source: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Input
                    id="priority"
                    placeholder="Prioridade"
                    value={formData.Priority}
                    onChange={(e) => setFormData({ ...formData, Priority: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionais sobre o contato"
                  value={formData.Notes}
                  onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingContact ? 'Salvar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o contato "{deletingContact?.Name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingContact(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VendeMaisObrasLayout } from '@/components/VendeMaisObrasLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCliente } from '@/services/vendeMaisObras.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const estadosBrasil = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function VendeMaisObrasNovoCliente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    Nome: '',
    Email: '',
    Telefone: '',
    Documento: '',
    Endereco: '',
    Cidade: '',
    Estado: '',
  });

  const createMutation = useMutation({
    mutationFn: createCliente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente cadastrado com sucesso!');
      navigate('/vende-mais-obras/clientes');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao cadastrar cliente');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    createMutation.mutate({
      ...formData,
      UsuarioId: user.id, // Backend usa do token, mas interface TypeScript exige
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <VendeMaisObrasLayout title="Novo Cliente" subtitle="Cadastre um novo cliente">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/vende-mais-obras/clientes')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="bg-[#1f1f1f] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="nome" className="text-gray-300">
                    Nome <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={formData.Nome}
                    onChange={(e) => handleChange('Nome', e.target.value)}
                    placeholder="Nome completo"
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.Email}
                    onChange={(e) => handleChange('Email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-gray-300">
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    type="tel"
                    value={formData.Telefone}
                    onChange={(e) => handleChange('Telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Documento */}
                <div className="space-y-2">
                  <Label htmlFor="documento" className="text-gray-300">
                    CPF/CNPJ
                  </Label>
                  <Input
                    id="documento"
                    value={formData.Documento}
                    onChange={(e) => handleChange('Documento', e.target.value)}
                    placeholder="000.000.000-00"
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco" className="text-gray-300">
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    value={formData.Endereco}
                    onChange={(e) => handleChange('Endereco', e.target.value)}
                    placeholder="Rua, número, complemento"
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                  <Label htmlFor="cidade" className="text-gray-300">
                    Cidade
                  </Label>
                  <Input
                    id="cidade"
                    value={formData.Cidade}
                    onChange={(e) => handleChange('Cidade', e.target.value)}
                    placeholder="Nome da cidade"
                    className="bg-[#0a0a0a] border-[#2a2a2a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="estado" className="text-gray-300">
                    Estado
                  </Label>
                  <Select value={formData.Estado} onValueChange={(value) => handleChange('Estado', value)}>
                    <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a] text-white">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1f1f1f] border-[#2a2a2a]">
                      {estadosBrasil.map((estado) => (
                        <SelectItem key={estado} value={estado} className="text-white">
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/vende-mais-obras/clientes')}
                  className="text-gray-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FFD700] text-[#0a0a0a] hover:bg-[#FFD700]/90"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </VendeMaisObrasLayout>
  );
}


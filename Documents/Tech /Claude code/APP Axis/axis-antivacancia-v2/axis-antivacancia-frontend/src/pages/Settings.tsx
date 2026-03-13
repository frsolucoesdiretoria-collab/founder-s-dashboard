import { type ChangeEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import { useGoogleCalendarAuthUrl, useGoogleCalendarStatus, useSyncGoogleCalendar, useDisconnectGoogleCalendar } from '@/hooks';
import { formatPhone } from '@/utils/masks';
import {
    Settings as SettingsIcon,
    Calendar as CalendarIcon,
    FileText,
    Users,
    CheckCircle,
    XCircle,
    RefreshCw,
    ExternalLink,
    Trash2,
    Plus,
    Unplug,
    MessageSquare,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const clinicSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    cnpj: z.string(),
    phone: z.string().min(8, 'Telefone inválido'),
    email: z.string().email('Email inválido'),
});

type ClinicForm = z.infer<typeof clinicSchema>;

const subUserSchema = z.object({
    email: z.string().email('Email inválido'),
    full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    role: z.enum(['admin', 'receptionist', 'doctor', 'viewer']),
});

type SubUserForm = z.infer<typeof subUserSchema>;

// ---------------------------------------------------------------------------
// Default templates
// ---------------------------------------------------------------------------

const DEFAULT_WHATSAPP_TEMPLATE =
    'Olá {paciente_nome}! Temos uma vaga disponível com {profissional_nome} no dia {horario} para {tipo_servico}. Deseja agendar? Responda SIM para confirmar.';

const DEFAULT_SMS_TEMPLATE =
    'Vaga disponível: {tipo_servico} com {profissional_nome} em {horario}. Responda SIM para {paciente_nome} confirmar.';

const DEFAULT_EMAIL_TEMPLATE =
    'Prezado(a) {paciente_nome},\n\nInformamos que surgiu uma vaga para {tipo_servico} com {profissional_nome} no dia {horario}.\n\nCaso tenha interesse, responda este email ou entre em contato conosco.\n\nAtenciosamente,\nEquipe da Clínica';

const TEMPLATE_VARIABLES = [
    { variable: '{paciente_nome}', description: 'Nome do paciente' },
    { variable: '{profissional_nome}', description: 'Nome do profissional' },
    { variable: '{horario}', description: 'Data/hora da vaga' },
    { variable: '{tipo_servico}', description: 'Tipo de serviço' },
];

// ---------------------------------------------------------------------------
// Role labels
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrador',
    receptionist: 'Recepcionista',
    doctor: 'Médico/Dentista',
    viewer: 'Visualizador',
};

// ---------------------------------------------------------------------------
// Settings component
// ---------------------------------------------------------------------------

export function Settings() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary-900">Configurações</h1>
                <p className="text-primary-500">Gerencie as preferências da sua clínica e integrações.</p>
            </div>

            <div className="grid gap-6">
                <ClinicDataSection />
                <GoogleCalendarSection />
                <MessageTemplatesSection />
                <WhatsAppAgentsSection />
                <SubUsersSection />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Section: Dados da Clínica
// ---------------------------------------------------------------------------

function ClinicDataSection() {
    const organization = useAuthStore((s) => s.organization);
    const setAuth = useAuthStore((s) => s.setAuth);
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const refreshToken = useAuthStore((s) => s.refreshToken);

    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ClinicForm>({
        resolver: zodResolver(clinicSchema),
        defaultValues: {
            name: organization?.name || '',
            cnpj: organization?.cnpj || '',
            phone: organization?.phone ? formatPhone(organization.phone) : '',
            email: organization?.email || '',
        },
    });

    const onSubmit = async (data: ClinicForm) => {
        try {
            setSaveStatus('idle');
            const payload = { ...data, phone: data.phone.replace(/\D/g, '') };
            const response = await api.patch('/api/organizations', payload);
            const updatedOrg = response.data.data || response.data;

            // Update the auth store with the new organization data
            if (user && accessToken) {
                setAuth({
                    user,
                    organization: { ...organization!, ...updatedOrg },
                    accessToken,
                    refreshToken: refreshToken || undefined,
                });
            }

            setSaveStatus('success');
            setSaveMessage('Dados da clínica atualizados com sucesso.');
            setTimeout(() => setSaveStatus('idle'), 4000);
        } catch (error: any) {
            setSaveStatus('error');
            setSaveMessage(
                error.response?.data?.message || 'Erro ao salvar dados da clínica. Tente novamente.'
            );
            setTimeout(() => setSaveStatus('idle'), 5000);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <SettingsIcon className="h-5 w-5 text-primary-500" />
                    <CardTitle className="text-primary-900">Dados da Clínica</CardTitle>
                </div>
                <CardDescription className="text-primary-500">Informações básicas sobre o seu estabelecimento.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Nome da Clínica"
                            placeholder="Nome da clínica"
                            {...register('name')}
                            error={errors.name?.message}
                        />
                        <Input
                            label="CNPJ"
                            placeholder="00.000.000/0001-00"
                            {...register('cnpj')}
                            disabled
                            helperText="CNPJ não pode ser alterado"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Telefone Principal"
                            placeholder="(11) 99999-9999"
                            {...register('phone', {
                                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                                    setValue('phone', formatPhone(e.target.value));
                                },
                            })}
                            error={errors.phone?.message}
                        />
                        <Input
                            label="Email de Contato"
                            type="email"
                            placeholder="contato@clinica.com"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                    </div>

                    {saveStatus === 'success' && (
                        <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-700 border border-success-200">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            {saveMessage}
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="flex items-center gap-2 rounded-lg bg-danger-50 p-3 text-sm text-danger-700 border border-danger-200">
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                            {saveMessage}
                        </div>
                    )}

                    <Button type="submit" className="h-10 bg-accent-600 hover:bg-accent-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-200" isLoading={isSubmitting}>
                        Salvar Alterações
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Section: Google Calendar
// ---------------------------------------------------------------------------

function GoogleCalendarSection() {
    const { data: authUrlData, isLoading: isLoadingUrl } = useGoogleCalendarAuthUrl();
    const { data: statusData, isLoading: isLoadingStatus } = useGoogleCalendarStatus();
    const syncMutation = useSyncGoogleCalendar();
    const disconnectMutation = useDisconnectGoogleCalendar();

    const [syncMessage, setSyncMessage] = useState('');

    const connected = statusData?.connected ?? false;

    const handleConnect = () => {
        if (authUrlData?.url) {
            window.open(authUrlData.url, '_blank', 'width=600,height=700');
        }
    };

    const handleSync = () => {
        setSyncMessage('');
        syncMutation.mutate(undefined, {
            onSuccess: (data) => {
                const parts: string[] = [];
                parts.push(`${data.synced_events} eventos verificados`);
                if (data.new_appointments_created > 0) parts.push(`${data.new_appointments_created} novos agendamentos importados`);
                if (data.cancellations_detected > 0) parts.push(`${data.cancellations_detected} cancelamentos detectados`);
                if (data.new_vacancies_created > 0) parts.push(`${data.new_vacancies_created} novas vagas criadas`);
                setSyncMessage(`Sincronização concluída: ${parts.join(', ')}.`);
            },
            onError: (error: any) => {
                setSyncMessage(
                    error.response?.data?.message || 'Erro ao sincronizar. Tente novamente.'
                );
            },
        });
    };

    const handleDisconnect = () => {
        disconnectMutation.mutate(undefined, {
            onSuccess: () => {
                setSyncMessage('');
            },
        });
    };

    const formatLastSync = (isoString?: string) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-accent-600" />
                    <CardTitle className="text-primary-900">Integração Google Calendar</CardTitle>
                </div>
                <CardDescription className="text-primary-500">
                    Sincronize sua agenda para leitura de vagas em tempo real.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Connection status */}
                <div className="flex items-start gap-3 rounded-lg border border-primary-200 p-4">
                    {isLoadingStatus ? (
                        <>
                            <RefreshCw className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0 animate-spin" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-primary-700">
                                    Verificando conexão...
                                </h4>
                            </div>
                        </>
                    ) : connected ? (
                        <>
                            <CheckCircle className="h-5 w-5 text-success-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-success-800">
                                        Google Calendar Conectado
                                    </h4>
                                    <Badge variant="success">Ativo</Badge>
                                </div>
                                {statusData?.email && (
                                    <p className="text-sm text-primary-600 mt-1">
                                        {statusData.email}
                                    </p>
                                )}
                                {statusData?.last_sync && (
                                    <p className="text-xs text-primary-400 mt-0.5">
                                        Último sync: {formatLastSync(statusData.last_sync)}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <XCircle className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-primary-700">
                                    Google Calendar Desconectado
                                </h4>
                                <p className="text-sm text-primary-500 mt-1">
                                    Conecte sua conta Google para sincronizar a agenda automaticamente.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Sync result message */}
                {syncMessage && (
                    <div
                        className={`flex items-center gap-2 rounded-lg p-3 text-sm border ${syncMutation.isError
                            ? 'bg-danger-50 text-danger-700 border-danger-200'
                            : 'bg-success-50 text-success-700 border-success-200'
                            }`}
                    >
                        {syncMutation.isError ? (
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                        ) : (
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        {syncMessage}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                    {!connected ? (
                        <Button
                            className="bg-accent-600 hover:bg-accent-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-200"
                            onClick={handleConnect}
                            disabled={isLoadingUrl || isLoadingStatus || !authUrlData?.url}
                            isLoading={isLoadingUrl}
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Conectar Google Calendar
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                className="hover:bg-primary-50 transition-colors duration-200"
                                onClick={handleSync}
                                isLoading={syncMutation.isPending}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Sincronizar Agora
                            </Button>
                            <Button
                                variant="danger"
                                className="hover:shadow-[0_4px_12px_rgba(239,68,68,0.3)] transition-all duration-200"
                                onClick={handleDisconnect}
                                isLoading={disconnectMutation.isPending}
                            >
                                <Unplug className="h-4 w-4 mr-2" />
                                Desconectar
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Section: Templates de Mensagem
// ---------------------------------------------------------------------------

function MessageTemplatesSection() {
    const [whatsappTemplate, setWhatsappTemplate] = useState(DEFAULT_WHATSAPP_TEMPLATE);
    const [smsTemplate, setSmsTemplate] = useState(DEFAULT_SMS_TEMPLATE);
    const [emailTemplate, setEmailTemplate] = useState(DEFAULT_EMAIL_TEMPLATE);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    const handleSaveTemplates = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            await api.patch('/api/organizations', {
                notification_templates: {
                    whatsapp: whatsappTemplate,
                    sms: smsTemplate,
                    email: emailTemplate,
                },
            });
            setSaveStatus('success');
            setSaveMessage('Templates salvos com sucesso.');
            setTimeout(() => setSaveStatus('idle'), 4000);
        } catch (error: any) {
            setSaveStatus('error');
            setSaveMessage(
                error.response?.data?.message || 'Erro ao salvar templates. Tente novamente.'
            );
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-primary-900">Templates de Mensagem</CardTitle>
                </div>
                <CardDescription className="text-primary-500">
                    Personalize os textos enviados por cada canal de notificação.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Available variables */}
                <div className="rounded-lg border border-primary-200 bg-primary-50/50 p-4">
                    <h4 className="mb-2 text-sm font-semibold text-primary-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent-600" />
                        Variáveis Disponíveis
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {TEMPLATE_VARIABLES.map((v) => (
                            <span
                                key={v.variable}
                                className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-1 text-xs font-mono text-primary-700"
                                title={v.description}
                            >
                                {v.variable}
                            </span>
                        ))}
                    </div>
                    <p className="text-xs text-primary-500 mt-2">
                        Clique para copiar. Elas serão substituídas automaticamente ao enviar.
                    </p>
                </div>

                {/* WhatsApp template */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-primary-700">
                        WhatsApp
                    </label>
                    <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200"
                        value={whatsappTemplate}
                        onChange={(e) => setWhatsappTemplate(e.target.value)}
                        rows={3}
                    />
                </div>

                {/* SMS template */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-primary-700">
                        SMS
                    </label>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200"
                        value={smsTemplate}
                        onChange={(e) => setSmsTemplate(e.target.value)}
                        rows={2}
                    />
                    <p className="text-xs text-primary-500">
                        Máximo recomendado: 160 caracteres ({smsTemplate.length}/160)
                    </p>
                </div>

                {/* Email template */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-primary-700">
                        Email
                    </label>
                    <textarea
                        className="flex min-h-[140px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200"
                        value={emailTemplate}
                        onChange={(e) => setEmailTemplate(e.target.value)}
                        rows={5}
                    />
                </div>

                {/* Status messages */}
                {saveStatus === 'success' && (
                    <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-700 border border-success-200">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        {saveMessage}
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg bg-danger-50 p-3 text-sm text-danger-700 border border-danger-200">
                        <XCircle className="h-4 w-4 flex-shrink-0" />
                        {saveMessage}
                    </div>
                )}

                <div className="flex gap-2">
                    <Button onClick={handleSaveTemplates} isLoading={saving} className="bg-accent-600 hover:bg-accent-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-200">
                        Salvar Templates
                    </Button>
                    <Button
                        variant="outline"
                        type="button"
                        className="hover:bg-primary-50 transition-colors duration-200"
                        onClick={() => {
                            setWhatsappTemplate(DEFAULT_WHATSAPP_TEMPLATE);
                            setSmsTemplate(DEFAULT_SMS_TEMPLATE);
                            setEmailTemplate(DEFAULT_EMAIL_TEMPLATE);
                        }}
                    >
                        Restaurar Padrão
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Section: Agentes de WhatsApp
// ---------------------------------------------------------------------------

function WhatsAppAgentsSection() {
    const organization = useAuthStore((s) => s.organization);
    const setAuth = useAuthStore((s) => s.setAuth);
    const user = useAuthStore((s) => s.user);
    const accessToken = useAuthStore((s) => s.accessToken);
    const refreshToken = useAuthStore((s) => s.refreshToken);

    const [confirmacaoEnabled, setConfirmacaoEnabled] = useState<boolean>(
        (organization as any)?.agente_confirmacao_enabled ?? true
    );
    const [antecipacaoEnabled, setAntecipacaoEnabled] = useState<boolean>(
        (organization as any)?.agente_antecipacao_enabled ?? true
    );
    const [confirmacaoPrompt, setConfirmacaoPrompt] = useState<string>(
        (organization as any)?.agente_confirmacao_prompt || ''
    );
    const [antecipacaoPrompt, setAntecipacaoPrompt] = useState<string>(
        (organization as any)?.agente_antecipacao_prompt || ''
    );
    const [notifyNumber, setNotifyNumber] = useState<string>(
        (organization as any)?.whatsapp_notify_number || ''
    );
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');

    const handleSaveAgents = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const response = await api.patch('/api/organizations', {
                agente_confirmacao_enabled: confirmacaoEnabled,
                agente_antecipacao_enabled: antecipacaoEnabled,
                agente_confirmacao_prompt: confirmacaoPrompt || null,
                agente_antecipacao_prompt: antecipacaoPrompt || null,
                whatsapp_notify_number: notifyNumber || null,
            });
            const updatedOrg = response.data.data || response.data;
            if (user && accessToken) {
                setAuth({
                    user,
                    organization: { ...organization!, ...updatedOrg },
                    accessToken,
                    refreshToken: refreshToken || undefined,
                });
            }
            setSaveStatus('success');
            setSaveMessage('Configurações dos agentes salvas com sucesso.');
            setTimeout(() => setSaveStatus('idle'), 4000);
        } catch (error: any) {
            setSaveStatus('error');
            setSaveMessage(error.response?.data?.message || 'Erro ao salvar. Tente novamente.');
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-accent-600" />
                    <CardTitle className="text-primary-900">Agentes de WhatsApp</CardTitle>
                </div>
                <CardDescription className="text-primary-500">
                    Configure os agentes automáticos de confirmação e antecipação via WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Agente de Confirmação */}
                <div className="rounded-lg border border-primary-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-primary-900">Agente de Confirmação</h4>
                            <p className="text-xs text-primary-500 mt-0.5">
                                Envia lembretes 48h, 24h e 3h antes da consulta e processa a resposta do paciente.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConfirmacaoEnabled(!confirmacaoEnabled)}
                            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                        >
                            {confirmacaoEnabled ? (
                                <><ToggleRight className="h-6 w-6 text-accent-600" /><span className="text-accent-600">Ativo</span></>
                            ) : (
                                <><ToggleLeft className="h-6 w-6 text-primary-400" /><span className="text-primary-500">Inativo</span></>
                            )}
                        </button>
                    </div>
                    {confirmacaoEnabled && (
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-primary-700">
                                Template personalizado <span className="text-primary-400">(opcional)</span>
                            </label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 resize-y transition-all duration-200"
                                placeholder="Olá {paciente_nome}! Lembrando da sua consulta de {tipo_servico} com {profissional_nome} às {horario}. Responda SIM para confirmar ou NÃO para cancelar."
                                value={confirmacaoPrompt}
                                onChange={(e) => setConfirmacaoPrompt(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                {/* Agente de Antecipação */}
                <div className="rounded-lg border border-primary-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-semibold text-primary-900">Agente de Antecipação</h4>
                            <p className="text-xs text-primary-500 mt-0.5">
                                Convida pacientes da fila de espera quando surgem vagas, respeitando tipo de serviço.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAntecipacaoEnabled(!antecipacaoEnabled)}
                            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                        >
                            {antecipacaoEnabled ? (
                                <><ToggleRight className="h-6 w-6 text-accent-600" /><span className="text-accent-600">Ativo</span></>
                            ) : (
                                <><ToggleLeft className="h-6 w-6 text-primary-400" /><span className="text-primary-500">Inativo</span></>
                            )}
                        </button>
                    </div>
                    {antecipacaoEnabled && (
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-primary-700">
                                Template personalizado <span className="text-primary-400">(opcional)</span>
                            </label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 resize-y transition-all duration-200"
                                placeholder="Olá {paciente_nome}! Surgiu uma vaga de {tipo_servico} com {profissional_nome} para {horario}. Responda SIM para confirmar ou NÃO para recusar."
                                value={antecipacaoPrompt}
                                onChange={(e) => setAntecipacaoPrompt(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                {/* Número de notificação do dono */}
                <div className="space-y-1">
                    <label className="block text-sm font-medium text-primary-700">
                        WhatsApp para notificações da clínica
                    </label>
                    <input
                        type="tel"
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 transition-all duration-200"
                        placeholder="5511999999999"
                        value={notifyNumber}
                        onChange={(e) => setNotifyNumber(e.target.value)}
                    />
                    <p className="text-xs text-primary-500">
                        Número que receberá alertas quando uma antecipação for confirmada. Formato: 55 + DDD + número.
                    </p>
                </div>

                {/* Status */}
                {saveStatus === 'success' && (
                    <div className="flex items-center gap-2 rounded-lg bg-success-50 p-3 text-sm text-success-700 border border-success-200">
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        {saveMessage}
                    </div>
                )}
                {saveStatus === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg bg-danger-50 p-3 text-sm text-danger-700 border border-danger-200">
                        <XCircle className="h-4 w-4 flex-shrink-0" />
                        {saveMessage}
                    </div>
                )}

                <Button
                    onClick={handleSaveAgents}
                    isLoading={saving}
                    className="bg-accent-600 hover:bg-accent-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-200"
                >
                    Salvar Configurações dos Agentes
                </Button>
            </CardContent>
        </Card>
    );
}

// ---------------------------------------------------------------------------
// Section: Sub-usuários
// ---------------------------------------------------------------------------

function SubUsersSection() {
    const organization = useAuthStore((s) => s.organization);
    const currentUser = useAuthStore((s) => s.user);

    const [showAddForm, setShowAddForm] = useState(false);
    const [addingUser, setAddingUser] = useState(false);
    const [users, setUsers] = useState<
        Array<{ id: string; full_name: string; email: string; role: string }>
    >(
        currentUser
            ? [
                {
                    id: currentUser.id,
                    full_name: currentUser.full_name,
                    email: currentUser.email,
                    role: currentUser.role,
                },
            ]
            : []
    );
    const [actionMessage, setActionMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SubUserForm>({
        resolver: zodResolver(subUserSchema),
        defaultValues: {
            role: 'receptionist',
        },
    });

    const onAddUser = async (data: SubUserForm) => {
        setAddingUser(true);
        setActionMessage(null);
        try {
            const response = await api.post('/api/organizations/users', {
                ...data,
                organization_id: organization?.id,
            });
            const newUser = response.data.data || response.data;
            setUsers((prev) => [...prev, newUser]);
            setActionMessage({ type: 'success', text: `Usuário ${data.full_name} adicionado com sucesso.` });
            reset();
            setShowAddForm(false);
        } catch (error: any) {
            const msg = error.response?.data?.message;
            if (error.response?.status === 404) {
                setActionMessage({
                    type: 'error',
                    text: 'Funcionalidade de gerenciamento de sub-usuários ainda não disponível no servidor.',
                });
            } else {
                setActionMessage({
                    type: 'error',
                    text: msg || 'Erro ao adicionar usuário. Tente novamente.',
                });
            }
        } finally {
            setAddingUser(false);
        }
    };

    const handleRemoveUser = async (userId: string) => {
        if (userId === currentUser?.id) return;
        setActionMessage(null);
        try {
            await api.delete(`/api/organizations/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setActionMessage({ type: 'success', text: 'Usuário removido com sucesso.' });
        } catch (error: any) {
            if (error.response?.status === 404) {
                setActionMessage({
                    type: 'error',
                    text: 'Funcionalidade de remoção de sub-usuários ainda não disponível no servidor.',
                });
            } else {
                setActionMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Erro ao remover usuário.',
                });
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-accent-600" />
                        <CardTitle className="text-primary-900">Sub-usuários</CardTitle>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        className="hover:bg-primary-50 transition-colors duration-200"
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            setTimeout(() => document.getElementById('add-user-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar
                    </Button>
                </div>
                <CardDescription className="text-primary-500">
                    Gerencie os usuários que têm acesso ao painel da sua clínica.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add user form */}
                {showAddForm && (
                    <form
                        id="add-user-form"
                        onSubmit={handleSubmit(onAddUser)}
                        className="rounded-lg border border-dashed border-primary-200 p-4 space-y-4 bg-primary-50"
                    >
                        <h4 className="text-sm font-semibold text-primary-700">Novo usuário</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Nome completo"
                                placeholder="Maria Silva"
                                {...register('full_name')}
                                error={errors.full_name?.message}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="maria@clinica.com"
                                {...register('email')}
                                error={errors.email?.message}
                            />
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="mb-1 block text-sm font-medium text-primary-700">
                                Função
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 transition-all duration-200"
                                {...register('role')}
                            >
                                <option value="admin">Administrador</option>
                                <option value="receptionist">Recepcionista</option>
                                <option value="doctor">Médico/Dentista</option>
                                <option value="viewer">Visualizador</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-danger-700">{errors.role.message}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" isLoading={addingUser} className="bg-accent-600 hover:bg-accent-700 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all duration-200">
                                Adicionar Usuário
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="hover:bg-primary-100 transition-colors duration-200"
                                onClick={() => {
                                    setShowAddForm(false);
                                    reset();
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                )}

                {/* Messages */}
                {actionMessage && (
                    <div
                        className={`flex items-center gap-2 rounded-lg p-3 text-sm border ${actionMessage.type === 'success'
                            ? 'bg-success-50 text-success-700 border-success-200'
                            : 'bg-danger-50 text-danger-700 border-danger-200'
                            }`}
                    >
                        {actionMessage.type === 'success' ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                        ) : (
                            <XCircle className="h-4 w-4 flex-shrink-0" />
                        )}
                        {actionMessage.text}
                    </div>
                )}

                {/* User list */}
                <div className="space-y-2">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className="flex items-center justify-between rounded-lg border border-primary-100 p-3 hover:bg-primary-50 hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-semibold">
                                    {u.full_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .slice(0, 2)
                                        .join('')
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary-900">
                                        {u.full_name}
                                        {u.id === currentUser?.id && (
                                            <span className="ml-2 text-xs text-primary-400">(você)</span>
                                        )}
                                    </p>
                                    <p className="text-xs text-primary-500">{u.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="capitalize">
                                    {ROLE_LABELS[u.role] || u.role}
                                </Badge>
                                {u.id !== currentUser?.id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-danger-50 transition-colors duration-200"
                                        onClick={() => handleRemoveUser(u.id)}
                                        title="Remover usuário"
                                    >
                                        <Trash2 className="h-4 w-4 text-danger-500" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    {users.length === 0 && (
                        <p className="text-sm text-primary-500 text-center py-4">
                            Nenhum usuário cadastrado.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}


import React from 'react';
import {
    Zap,
    TrendingUp,
    Heart,
    Settings,
    Check,
    ArrowRight,
    Bell,
    Calendar as CalendarIcon,
    MessageCircle,
    Clock // Using Clock instead of Speed
} from 'lucide-react';

const CTA_LINK = "https://wa.me/5511999999999?text=Gostaria%20de%20uma%20demonstração%20do%20Axis%20Premium";

export default function AxisV492Page() {
    return (
        <main className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">

            {/* 1. HERO SECTION */}
            <section className="relative pt-24 pb-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100/50 via-[#FDFDFD] to-[#FDFDFD] -z-10"></div>

                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/80 border border-slate-200/50 rounded-full text-sm font-medium text-slate-600 mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            A escolha de +2.000 clínicas modernas
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                            A Tecnologia que Mantém sua <span className="text-slate-900">Agenda Lotada</span> e sua Clínica em Capacidade Máxima.
                        </h1>

                        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto mb-10 font-light">
                            Automatize a confirmação de consultas e preencha horários vagos instantaneamente com nossa IA. Transforme sua lista de espera em receita garantida.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <a
                                href={CTA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-8 py-4 bg-[#0F172A] hover:bg-[#1E293B] text-white text-base font-semibold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 gap-2"
                            >
                                QUERO MODERNIZAR MINHA CLÍNICA
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            {/* <button className="inline-flex items-center justify-center px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-base font-medium rounded-2xl transition-all">
                Ver Demonstração
              </button> */}
                        </div>
                    </div>

                    {/* Hero Visual - Dashboard Mockup */}
                    <div className="relative mx-auto max-w-5xl">
                        <div className="relative bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-100 p-2 overflow-hidden">
                            {/* Chrome/Browser Header */}
                            <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                            </div>

                            {/* Mockup Content */}
                            <div className="p-8 md:p-12 bg-white flex flex-col items-center justify-center md:min-h-[400px]">
                                <div className="relative w-full max-w-md">
                                    {/* Notification Toast */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 flex items-center gap-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <div className="w-12 h-12 bg-emerald-100/50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 text-lg">Vaga de 14:00h preenchida</h4>
                                                <p className="text-slate-500">Paciente Ricardo confirmou via AXIS IA.</p>
                                            </div>
                                            <div className="ml-auto text-xs text-slate-400 font-medium">Agora</div>
                                        </div>
                                    </div>

                                    {/* Background Elements to add depth */}
                                    <div className="absolute -top-20 -left-20 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>
                                    <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                                </div>
                            </div>
                        </div>

                        {/* Soft Glow behind mockup */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-100 to-blue-50 rounded-[2.5rem] blur-2xl -z-10 opacity-40"></div>
                    </div>

                    {/* Social Proof Logos */}
                    <div className="mt-16 pt-8 border-t border-slate-100">
                        <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-wider">A escolha de clínicas que lideram</p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholder Logos */}
                            <div className="h-8 w-24 bg-slate-200 rounded"></div>
                            <div className="h-8 w-24 bg-slate-200 rounded"></div>
                            <div className="h-8 w-24 bg-slate-200 rounded"></div>
                            <div className="h-8 w-24 bg-slate-200 rounded"></div>
                            <div className="h-8 w-24 bg-slate-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. BENEFITS - BENTO GRID */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Por que as Melhores Clínicas Usam o AXIS?</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Tecnologia desenvolvida para eliminar ineficiências e potenciar resultados.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large Card - Efficiency */}
                        <div className="md:col-span-2 bg-[#F8F9FA] rounded-3xl p-10 border border-slate-100 hover:shadow-lg transition-shadow duration-300 group">
                            <div className="flex flex-col h-full justify-between">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Zero Ociosidade</h3>
                                    <p className="text-slate-500 text-lg leading-relaxed">
                                        O sistema identifica cancelamentos em tempo real e aciona o próximo paciente interessado em segundos. Transforme buracos na agenda em oportunidades de atendimento imediato.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tall Card - Faturamento */}
                        <div className="md:row-span-2 bg-indigo-950 rounded-3xl p-10 text-white flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 group overflow-hidden relative">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="w-6 h-6 text-indigo-300" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Receita Previsível</h3>
                                <p className="text-indigo-200 text-lg leading-relaxed">
                                    Garanta que cada horário na agenda seja convertido em faturamento, eliminando a instabilidade financeira causada por faltas.
                                </p>
                            </div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-0"></div>
                        </div>

                        {/* Medium Card - Experiência */}
                        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                            <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Heart className="w-6 h-6 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Experiência Premium</h3>
                            <p className="text-slate-500">
                                Seus pacientes recebem lembretes elegantes e oportunos via WhatsApp, reduzindo o atrito e elevando a percepção de valor.
                            </p>
                        </div>

                        {/* Medium Card - Gestão */}
                        <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 group">
                            <div className="w-14 h-14 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Settings className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Sua Secretária Focada</h3>
                            <p className="text-slate-500">
                                Tire o telefone da mão da sua equipe. Deixe o robô agendar e sua equipe focar no atendimento presencial de excelência.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. COMO FUNCIONA - TIMELINE */}
            <section className="py-32 bg-[#FDFDFD]">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col md:flex-row gap-16 items-start">
                        <div className="md:w-1/3 sticky top-32">
                            <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Inteligência Artificial trabalhando pela sua Agenda.</h2>
                            <p className="text-lg text-slate-500">Um fluxo contínuo e silencioso que garante a máxima eficiência operacional da sua clínica.</p>
                        </div>

                        <div className="md:w-2/3 relative pl-8 border-l border-slate-200 space-y-20">
                            {/* Step 1 */}
                            <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Monitoramento 24/7</h3>
                                    </div>
                                    <p className="text-slate-500 text-lg">O AXIS monitora sua agenda e envia lembretes estratégicos (48h, 24h e 3h antes) para garantir a confirmação.</p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Detecção Inteligente</h3>
                                    </div>
                                    <p className="text-slate-500 text-lg">Se um paciente cancela, o sistema identifica a lacuna imediatamente, sem necessidade de intervenção humana.</p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                                <div className="absolute -left-[45px] top-0 w-8 h-8 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
                                </div>
                                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900">Preenchimento Automático</h3>
                                    </div>
                                    <p className="text-slate-500 text-lg">A Lista de Espera é acionada instantaneamente. O primeiro paciente a confirmar assume a vaga. Agenda cheia novamente.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. PROVA SOCIAL - CLÁSSICA */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Resultados Reais de Quem Modernizou a Gestão</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-[#F8F9FA] p-10 rounded-3xl">
                            <p className="text-xl text-slate-700 italic mb-8 font-medium leading-relaxed">
                                "O AXIS trouxe uma previsibilidade que eu nunca tive em 10 anos de clínica. A agenda está sempre cheia e minha equipe trabalha muito mais tranquila."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                <div>
                                    <p className="font-bold text-slate-900">Dr. Ricardo M.</p>
                                    <p className="text-slate-500 text-sm">Ortodontista</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#F8F9FA] p-10 rounded-3xl">
                            <p className="text-xl text-slate-700 italic mb-8 font-medium leading-relaxed">
                                "Simplesmente funciona. Aumentamos nosso faturamento em 20% apenas recuperando horários que seriam perdidos. Um investimento essencial."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                <div>
                                    <p className="font-bold text-slate-900">Clínica Dermato & Co.</p>
                                    <p className="text-slate-500 text-sm">Gestão</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. OFFER SECTION - PREMIUM CARD */}
            <section className="py-32 bg-[#0F172A] text-white">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-[2.5rem] border border-slate-700/50 p-12 md:p-16 text-center relative overflow-hidden backdrop-blur-xl">
                        {/* Glow effects */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">O Upgrade que sua Clínica Merece</h2>
                            <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">Invista na eficiência da sua clínica por um valor menor que uma única consulta recuperada.</p>

                            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-left mb-12">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-slate-200 text-lg">Integração total com WhatsApp</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-slate-200 text-lg">Lista de Espera Automática</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-slate-200 text-lg">Lembretes Personalizados</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-slate-200 text-lg">Setup e Treinamento Inclusos</span>
                                </div>
                            </div>

                            <a
                                href={CTA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-900 text-lg font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 gap-2 w-full md:w-auto"
                            >
                                SOLICITAR DEMONSTRAÇÃO E VALORES
                                <ArrowRight className="w-5 h-5" />
                            </a>

                            <p className="mt-8 text-slate-500 text-sm font-medium flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Garantia de Satisfação de 7 Dias
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-2xl font-bold tracking-tighter text-slate-900">
                        AXIS<span className="text-indigo-600">.</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © 2026 AXIS Antivacância. Tecnologia para a saúde.
                    </div>
                </div>
            </footer>
        </main>
    );
}

import React, { useState } from 'react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    DollarSign,
    ChevronDown,
    ChevronUp,
    MessageSquare,
    Smartphone,
    ShieldCheck,
    Star,
    Users,
    ArrowRight,
    TrendingDown,
    X
} from 'lucide-react';

const CTA_LINK = "https://wa.me/5511999999999?text=Quero%20testar%20o%20Axis%20na%20minha%20clínica";

export default function AxisV491Page() {
    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* SEÇÃO 1: HERO */}
            <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Texto à esquerda */}
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Exclusivo para Clínicas e Consultórios</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                                Nunca Mais Perca Dinheiro com Pacientes que <span className="text-red-500">Faltam</span> ou <span className="text-red-500">Cancelam</span> de Última Hora.
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                                Nossa Inteligência Artificial detecta o cancelamento e aciona instantaneamente sua Lista de Espera.
                                O primeiro paciente a responder assume a vaga. Sua agenda fica cheia, sua secretária fica livre e seu faturamento não para.
                            </p>

                            <div className="space-y-4">
                                <a
                                    href={CTA_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-blue-200 transform hover:-translate-y-1 gap-2"
                                >
                                    QUERO BLINDAR MINHA AGENDA
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    Implementação simples + Teste sem riscos
                                </p>
                            </div>
                        </div>

                        {/* Visual à direita - Split Screen */}
                        <div className="relative animate-fade-in-right">
                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                {/* Lado Esquerdo: Cancelamento */}
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-red-100 transform -rotate-2 mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Cancelamento</span>
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                            <Users className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">Paciente João</p>
                                            <p className="text-sm text-slate-500">Consulta às 14:00</p>
                                        </div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700">
                                        "Oi, não vou conseguir ir hoje..."
                                    </div>
                                </div>

                                {/* Lado Direito: Solução */}
                                <div className="bg-white p-6 rounded-2xl shadow-xl border border-emerald-100 transform rotate-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Recuperado</span>
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                            <Smartphone className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">Paciente Maria</p>
                                            <p className="text-sm text-slate-500">Lista de Espera</p>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-700 font-medium">
                                        "Sim! Pode confirmar pra mim!"
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50/50 px-2 py-1 rounded w-fit">
                                        <Clock className="w-3 h-3" />
                                        <span>Vaga preenchida em 2 min</span>
                                    </div>
                                </div>
                            </div>

                            {/* Círculo decorativo */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full -z-0 blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ticker */}
            <div className="bg-slate-900 py-3 overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <p className="text-emerald-400 font-medium text-sm md:text-base flex items-center justify-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Mais de <span className="font-bold text-white">R$ 500.000,00</span> recuperados para clínicas parceiras este mês.
                    </p>
                </div>
            </div>

            {/* SEÇÃO 2: O PROBLEMA */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Você Sabe Quanto Custa Um <span className="text-red-500">"Buraco"</span> na Sua Agenda?
                    </h2>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-12">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div className="text-left space-y-4">
                                <p className="text-lg text-slate-600">Vamos fazer uma conta rápida:</p>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <span className="text-slate-600">Valor da Consulta</span>
                                        <span className="font-bold text-slate-900 text-lg">R$ 300,00</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                        <span className="text-slate-600">Cancelamentos/Semana</span>
                                        <span className="font-bold text-red-500 text-lg">3</span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-2"></div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-900 font-medium">Prejuízo Mensal</span>
                                        <span className="font-black text-red-600 text-2xl">R$ 3.600,00</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <TrendingDown className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-slate-600 mb-2">Em um ano, são</p>
                                <p className="text-4xl font-black text-slate-900 mb-2">R$ 43.200,00</p>
                                <p className="text-sm text-red-500 font-medium">Que deixam de entrar no seu caixa.</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-slate-600 max-w-2xl mx-auto">
                        E o pior: sua secretária perde horas preciosas ligando um por um na lista de espera,
                        muitas vezes sem sucesso, enquanto a vaga continua vazia.
                    </p>
                </div>
            </section>

            {/* SEÇÃO 3: A SOLUÇÃO */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 px-4">
                        <span className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Automático e Inteligente</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
                            O Fim da Ociosidade: Como o Sistema Preenche Vagas em Segundos
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8 relative">
                        {/* Linha conectora (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-blue-100 -z-0"></div>

                        {/* Passo 1 */}
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-200 mb-6 mx-auto">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">O Gatilho</h3>
                            <p className="text-slate-500 text-center text-sm">
                                Paciente cancela a consulta (via WhatsApp ou Link).
                            </p>
                        </div>

                        {/* Passo 2 */}
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg mb-6 mx-auto">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">A Ação</h3>
                            <p className="text-slate-500 text-center text-sm">
                                O Robô dispara um aviso simultâneo para sua Lista de Espera.
                            </p>
                        </div>

                        {/* Passo 3 */}
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white border-2 border-blue-600 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg mb-6 mx-auto">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">A Disputa</h3>
                            <p className="text-slate-500 text-center text-sm">
                                "Olá! Surgiu uma vaga para AMANHÃ às 14h. O primeiro a confirmar garante."
                            </p>
                        </div>

                        {/* Passo 4 */}
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-200 mb-6 mx-auto">
                                4
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3 text-center">O Resultado</h3>
                            <p className="text-slate-500 text-center text-sm">
                                O Paciente confirma. A agenda é atualizada automaticamente.
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 bg-blue-50 rounded-xl p-6 text-center max-w-2xl mx-auto">
                        <p className="text-blue-800 font-medium">
                            💡 <span className="font-bold">Senso de Urgência Real:</span> Seus pacientes sabem que precisam ser rápidos para conseguir o horário. Isso educa sua base e garante a vaga ocupada.
                        </p>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 4: PREVENÇÃO */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Reduza as Faltas em até 80%
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg">
                        Não dependa da memória do paciente. Nossa automação envia lembretes inteligentes em cascata.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">48 Horas Antes</h3>
                            <p className="text-slate-400">Confirmação inicial para garantir agendamento.</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">24 Horas Antes</h3>
                            <p className="text-slate-400">Lembrete de reforço para manter o compromisso.</p>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-colors">
                            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">3 Horas Antes</h3>
                            <p className="text-slate-400">Aviso final. Se cancelar, a lista de espera é acionada.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 5: PROVA SOCIAL */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 mb-16">
                        O Investimento que se Paga com <span className="text-emerald-500">2 Consultas Recuperadas</span>.
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Depoimento Destaque */}
                        <div className="md:col-span-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-8 md:p-10 rounded-3xl shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="w-24 h-24 bg-slate-200 rounded-full shrink-0 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200" alt="Dra. Ana Silva" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex justify-center md:justify-start gap-1 mb-4 text-emerald-500">
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                    <p className="text-xl text-slate-700 italic mb-6 font-medium">
                                        "A Clínica Sorriso Perfeito tinha 15% de vacância. A secretária passava 2 horas por dia tentando reagendar.
                                        Após o AXIS, a vacância caiu para 2% e o faturamento aumentou R$ 8.000 no primeiro mês, apenas preenchendo os buracos."
                                    </p>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Dra. Ana Silva</h4>
                                        <p className="text-slate-500">Proprietária da Clínica Sorriso Perfeito</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Outros depoimentos */}
                        <div className="bg-slate-50 p-6 rounded-2xl">
                            <div className="flex gap-1 text-emerald-500 mb-4"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                            <p className="text-slate-600 mb-4 text-sm">"Minha secretária agora foca em atender bem o paciente na recepção, não em ficar pendurada no telefone."</p>
                            <p className="font-bold text-slate-900 text-sm">Dr. Carlos Mendes</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl">
                            <div className="flex gap-1 text-emerald-500 mb-4"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                            <p className="text-slate-600 mb-4 text-sm">"O sistema se pagou na primeira semana. Simplesmente funciona."</p>
                            <p className="font-bold text-slate-900 text-sm">Dra. Patrícia Lima</p>
                        </div>

                        <div className="bg-slate-50 p-6 rounded-2xl">
                            <div className="flex gap-1 text-emerald-500 mb-4"><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /></div>
                            <p className="text-slate-600 mb-4 text-sm">"Pacientes adoram a agilidade. Eu adoro a agenda cheia."</p>
                            <p className="font-bold text-slate-900 text-sm">Dr. Roberto Souza</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 6: A OFERTA */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-blue-600 relative">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white xs:text-xs md:text-sm font-bold px-4 py-1 rounded-bl-xl">
                            OFERTA ESPECIAL
                        </div>

                        <div className="p-8 md:p-12 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                                Instalação Plug & Play: Funciona na Sua Clínica em 24 Horas
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto mb-10">
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700">Sistema de Lembretes Automáticos</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700">Gestão Inteligente de Lista de Espera</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700">Integração Simples com WhatsApp</span>
                                    </li>
                                </ul>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span className="text-slate-700">Treinamento Expresso para Secretária</span>
                                    </li>
                                    <li className="flex items-center gap-3 bg-yellow-50 p-2 rounded-lg -ml-2">
                                        <div className="bg-yellow-100 p-1 rounded">
                                            <Star className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <span className="text-slate-800 font-bold text-sm">BÔNUS: Script de Reativação</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 inline-block">
                                <p className="text-slate-500 mb-1 line-through text-sm">De R$ 1.500/mês</p>
                                <p className="text-slate-600 text-lg">Por menos de <span className="font-bold text-blue-600">UMA consulta particular</span> por mês.</p>
                            </div>

                            <div>
                                <a
                                    href={CTA_LINK}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center w-full md:w-auto px-8 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl rounded-xl transition-all shadow-lg hover:shadow-emerald-200 transform hover:-translate-y-1 gap-2"
                                >
                                    QUERO TESTAR NA MINHA CLÍNICA
                                    <ArrowRight className="w-6 h-6" />
                                </a>
                                <p className="mt-4 text-sm text-slate-500">
                                    Blinde sua agenda inteira hoje mesmo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEÇÃO 7: GARANTIA E FAQ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 max-w-3xl">
                    {/* Garantia */}
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-16">
                        <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Garantia Blindada de 7 Dias</h3>
                            <p className="text-slate-600">Teste sem riscos. Se não gostar, devolvemos seu dinheiro. Simples assim.</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Perguntas Frequentes</h2>

                    <div className="space-y-4">
                        <FaqItem
                            question="Preciso instalar algum programa no computador?"
                            answer="Não, é tudo em nuvem. Você acessa de qualquer lugar, pelo computador ou celular."
                        />
                        <FaqItem
                            question="Funciona para dentistas e psicólogos?"
                            answer="Sim! O sistema funciona para qualquer profissional de saúde que atenda com agenda (Médicos, Dentistas, Fisioterapeutas, Psicólogos, Nutricionistas, etc)."
                        />
                        <FaqItem
                            question="Minha secretária vai conseguir usar?"
                            answer="Sim, é extremamente intuitivo. Damos um treinamento completo e o sistema faz 90% do trabalho sozinho."
                        />
                    </div>
                </div>
            </section>

            {/* Footer Simples */}
            <footer className="py-8 bg-slate-900 text-slate-400 text-center text-sm border-t border-slate-800">
                <p>© 2026 AXIS Antivacância. Todos os direitos reservados.</p>
            </footer>
        </main>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-white text-left hover:bg-slate-50 transition-colors"
            >
                <span className="font-semibold text-slate-800 pr-4">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {isOpen && (
                <div className="p-5 bg-slate-50 text-slate-600 border-t border-slate-100">
                    {answer}
                </div>
            )}
        </div>
    );
}

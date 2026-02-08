import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Import todas as imagens
import heroDoctor from './images/hero-doctor.webp';
import waitingRoom from './images/waiting-room.webp';
import clockMotion from './images/clock-motion.webp';
import radarHud from './images/radar-hud.webp';
import targetHud from './images/target-hud.webp';
import executeHud from './images/execute-hud.webp';
import dataDissolving from './images/data-dissolving.webp';
import avatarDrRoberto from './images/avatar-dr-roberto.webp';
import avatarDraJuliana from './images/avatar-dra-juliana.webp';
import corridorLight from './images/corridor-light.webp';

export default function AxisLanding() {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className="bg-black text-white font-sans overflow-hidden">
            {/* HERO SECTION */}
            <section className="relative min-h-screen w-full flex items-center justify-between px-8 py-20 bg-black overflow-hidden">
                {/* Hero Image - Left Side (Desktop) */}
                <div className="absolute left-0 top-0 w-1/2 h-full hidden lg:flex items-center justify-center overflow-hidden">
                    <img
                        src={heroDoctor}
                        alt="Doctor"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-transparent"></div>
                </div>

                {/* Content - Right Side */}
                <div className="w-full lg:w-1/2 lg:ml-auto relative z-10 pr-0 lg:pr-12">
                    <div className="mb-8">
                        <p className="text-green-500 text-sm font-mono tracking-widest mb-4">AXIS PROTOCOL v5-3-2</p>
                        <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                            Você não estudou<br />
                            <span className="text-green-500">15 anos</span> para ficar<br />
                            esperando na sala<br />
                            de consulta.
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-xl mb-8">
                            Enquanto você estuda diagnósticos, a Axis estuda sua agenda. 24h por dia, 7 dias por semana. Sem descanso.
                        </p>
                        <button className="px-8 py-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition">
                            COMEÇAR AGORA
                        </button>
                    </div>
                </div>
            </section>

            {/* THE FALL SECTION */}
            <section className="relative min-h-screen w-full py-24 px-8 bg-black overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src={waitingRoom}
                        alt="Empty Waiting Room"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl font-black text-red-500 mb-4">A Taxa Silenciosa</h2>
                    <p className="text-2xl text-white font-bold leading-tight mb-12">
                        O Som Mais Caro do Mundo é o Silêncio da Sua Sala de Espera.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        {/* Text Left */}
                        <div>
                            <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                <strong>No-show rate:</strong> 23% em consultórios brasileiros
                                <br /><br />
                                <strong>Preço médio de uma consulta:</strong> R$ 250 a R$ 800
                                <br /><br />
                                <strong>Impacto anual:</strong> Você está queimando dinheiro todos os dias.
                            </p>
                        </div>

                        {/* Clock Image Right */}
                        <div className="flex justify-center">
                            <img
                                src={clockMotion}
                                alt="Tempo Passando"
                                className="w-96 h-96 object-cover rounded-lg border border-gray-600"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* THE MECHANISM SECTION */}
            <section className="relative min-h-screen w-full py-24 px-8 bg-black">
                <div className="max-w-5xl mx-auto relative z-10">
                    <h2 className="text-4xl font-black text-green-500 mb-4">O Mecanismo</h2>
                    <p className="text-2xl text-white font-bold leading-tight mb-16">
                        Axis Não Agenda. Ele Caça.
                    </p>

                    <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mb-20">
                        Imagine que você tivesse um atirador de elite monitorando sua agenda 24h por dia. Analisando padrões. Antecipando vazios. Disparando reminders no momento exato.
                    </p>

                    {/* Three-Step Mechanism Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* STEP 1: SCANNING */}
                        <div
                            className="bg-gray-900 border border-green-500 rounded-lg overflow-hidden hover:border-green-400 transition cursor-pointer"
                            onMouseEnter={() => setActiveStep(0)}
                        >
                            <div className="bg-black h-64 border-b border-green-500 flex items-center justify-center overflow-hidden">
                                <img
                                    src={radarHud}
                                    alt="Radar HUD"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-green-500 mb-3">PASSO 1: SCANNING</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Axis monitora sua agenda em tempo real. Detecta padrões. Identifica oportunidades de preenchimento.
                                </p>
                            </div>
                        </div>

                        {/* STEP 2: TARGETING */}
                        <div
                            className="bg-gray-900 border border-red-500 rounded-lg overflow-hidden hover:border-red-400 transition cursor-pointer"
                            onMouseEnter={() => setActiveStep(1)}
                        >
                            <div className="bg-black h-64 border-b border-red-500 flex items-center justify-center overflow-hidden">
                                <img
                                    src={targetHud}
                                    alt="Target HUD"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-red-500 mb-3">PASSO 2: TARGETING</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Identifica o paciente ideal. Calcula probabilidade de aceitar o novo horário. Travação total.
                                </p>
                            </div>
                        </div>

                        {/* STEP 3: EXECUTING */}
                        <div
                            className="bg-gray-900 border border-green-500 rounded-lg overflow-hidden hover:border-green-400 transition cursor-pointer"
                            onMouseEnter={() => setActiveStep(2)}
                        >
                            <div className="bg-black h-64 border-b border-green-500 flex items-center justify-center overflow-hidden">
                                <img
                                    src={executeHud}
                                    alt="Execute HUD"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-green-500 mb-3">PASSO 3: EXECUTING</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    Disparo preciso. Notificação entregue. Slot preenchido. Missão cumprida.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* THE CLIMAX SECTION */}
            <section className="relative min-h-96 w-full py-24 px-8 bg-black overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <img
                        src={dataDissolving}
                        alt="Data Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto relative z-10">
                    <h2 className="text-3xl font-black text-white mb-4">O Custo Real</h2>
                    <p className="text-lg text-gray-300 leading-relaxed mb-8">
                        Você tem coragem de ver o quanto estávamos queimando?
                    </p>

                    {/* Calculator Component */}
                    <div className="bg-gray-900 border border-green-500 rounded-lg p-8 max-w-2xl">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Consultas agendadas por semana</p>
                                <input
                                    type="number"
                                    defaultValue="40"
                                    className="w-full bg-black border border-green-500 rounded px-4 py-2 text-white text-lg"
                                />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-2">No-show rate (%)</p>
                                <input
                                    type="number"
                                    defaultValue="23"
                                    className="w-full bg-black border border-green-500 rounded px-4 py-2 text-white text-lg"
                                />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Valor médio consulta (R$)</p>
                                <input
                                    type="number"
                                    defaultValue="550"
                                    className="w-full bg-black border border-green-500 rounded px-4 py-2 text-white text-lg"
                                />
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Semanas por ano</p>
                                <input
                                    type="number"
                                    defaultValue="52"
                                    className="w-full bg-black border border-green-500 rounded px-4 py-2 text-white text-lg"
                                />
                            </div>
                        </div>

                        <div className="bg-black border border-red-500 rounded p-6 text-center">
                            <p className="text-red-500 text-sm mb-2">Perda Anual</p>
                            <p className="text-5xl font-black text-red-500">R$ 261.120</p>
                            <p className="text-gray-400 text-xs mt-4">De receita sendo queimada</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF SECTION */}
            <section className="relative min-h-screen w-full py-24 px-8 bg-black">
                <div className="max-w-5xl mx-auto relative z-10">
                    <h2 className="text-4xl font-black text-green-500 mb-4">Quem Confia em Axis</h2>
                    <p className="text-xl text-gray-300 leading-relaxed mb-16 max-w-2xl">
                        Especialistas que entendem que o tempo é a moeda mais valiosa.
                    </p>

                    {/* Testimonials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Testimonial 1 */}
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 hover:border-green-500 transition">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={avatarDrRoberto}
                                    alt="Dr. Roberto M."
                                    className="w-20 h-20 rounded-full border-2 border-green-500 flex-shrink-0 object-cover"
                                />
                                <div>
                                    <p className="text-white font-bold text-lg">Dr. Roberto M.</p>
                                    <p className="text-gray-400 text-sm">Cirurgião Cardiovascular</p>
                                    <p className="text-green-500 text-xs mt-1">Clínica Vitalis</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed italic">
                                "Perdíamos R$ 15 mil por mês com no-shows. Axis recuperou minha agenda em 3 semanas."
                            </p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 hover:border-green-500 transition">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={avatarDraJuliana}
                                    alt="Dra. Juliana S."
                                    className="w-20 h-20 rounded-full border-2 border-green-500 flex-shrink-0 object-cover"
                                />
                                <div>
                                    <p className="text-white font-bold text-lg">Dra. Juliana S.</p>
                                    <p className="text-gray-400 text-sm">Dermatologista & Sócia</p>
                                    <p className="text-green-500 text-xs mt-1">Clínica Aurum</p>
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed italic">
                                "Elegância em eficiência. Axis faz a máquina rodar sem eu ter que ficar checando."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section className="relative min-h-screen w-full py-24 px-8 bg-black flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 opacity-30">
                    <img
                        src={corridorLight}
                        alt="Corridor Decision"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black to-black opacity-50"></div>
                </div>

                {/* CTA Content */}
                <div className="relative z-10 text-center max-w-2xl">
                    <h2 className="text-5xl font-black text-white mb-6">A Decisão é Sua</h2>
                    <p className="text-2xl text-green-500 font-bold mb-12">O Custo Também.</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-8 py-4 bg-green-500 text-black font-bold text-lg rounded hover:bg-green-400 transition">
                            COMEÇAR PERÍODO DE TESTES
                        </button>
                        <button className="px-8 py-4 border-2 border-green-500 text-green-500 font-bold text-lg rounded hover:bg-green-500 hover:text-black transition">
                            FALAR COM ESPECIALISTA
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
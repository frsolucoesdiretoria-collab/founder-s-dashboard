# Axis Design System & Performance Hub (v3.1)

Este documento é a autoridade visual e técnica. Foco: Estética Premium + Nota 100 no PageSpeed.

---

## 1. Engenharia de Performance (Core Web Vitals)
Para garantir velocidade máxima e conversão, o agente deve seguir estas regras:

* **Imagens Atômicas**: Use exclusivamente formato `.webp`. Toda imagem deve ter atributos `width` e `height` definidos no código para evitar CLS (Cumulative Layout Shift).
* **LCP (Largest Contentful Paint)**: A imagem do Hero deve ter a tag `fetchpriority="high"` e nunca deve usar `loading="lazy"`. O restante das imagens deve usar `loading="lazy"`.
* **CSS Crítico**: Estilos necessários para o "acima da dobra" devem ser inlined no `critical.css`. O restante deve ser carregado de forma assíncrona.
* **Animações**: Use apenas propriedades que não disparam "reflow" (ex: `transform` e `opacity`). Use `will-change: transform` no botão de pulsação.

---

## 2. Paleta de Cores (Dark Mode Luxo)
Baseado na v5.3.5, com foco em contraste para acessibilidade.

* **Fundo (Canvas)**: `#000000` (Preto Absoluto - economiza bateria em telas OLED).
* **Camadas (Cards)**: `#121212` (Cinza Elevado) com bordas de `1px solid rgba(255,255,255,0.08)`.
* **Destaque (Action)**: `#FFFFFF` (Branco Puro para CTAs).
* **Texto Primário**: `#FFFFFF` (Leitura clara).
* **Texto Secundário**: `rgba(255, 255, 255, 0.65)` (Suave para descrições).

---

## 3. Tipografia e Escala
Foco em autoridade e velocidade de renderização.

* **Fonte**: `'Futura Md BT'`, sans-serif. Se a fonte não carregar em 0.5s, use a fonte do sistema (Arial/Inter) temporariamente (`font-display: swap`).
* **Títulos (H1/H2)**: Sempre `UPPERCASE` com `letter-spacing: -0.02em`.
* **Corpo**: `line-height: 1.6` para máxima legibilidade.

---

## 4. Componentes de Conversão (CTAs)
Botões desenhados para o clique instintivo.

* **Primary CTA (O Botão de Ouro)**:
  - **Estilo**: Fundo Branco, Texto Preto, Bold, Uppercase.
  - **Arredondamento**: `50px` (Pílula).
  - **Animação**: `pulse-custom`. O Agente deve garantir que a animação pare se o usuário não interagir por 30 segundos (preservação de bateria).
* **Formulários**: Campos com fundo escuro, borda branca sutil e `font-size: 16px` (mínimo para evitar que o iOS dê zoom automático ao clicar).

---

## 5. Regras de Ouro para Agentes (CTO Rule)
1. **Velocidade é Venda**: Se um elemento visual (vídeo pesado, animação complexa) reduzir a nota do PageSpeed para baixo de 90, ele deve ser otimizado ou removido.
2. **Consistência Atômica**: Use as mesmas variáveis de espaçamento (`gap-4`, `p-8`) em todas as 100 landing pages.
3. **Mobile-First**: O design deve ser perfeito no celular antes de ser testado no desktop. 80% dos seus leads virão do Google Ads via mobile.
4. **Teste de Botão**: Antes de entregar, o Agente deve confirmar: "O link de WhatsApp contém o parâmetro de rastreio da persona correta?".

## 6. Elementos Dinâmicos e Interatividade
Para manter o visual premium e o engajamento (High-Tech Aesthetic), o uso de partículas é obrigatório.

* **Efeito Particles.js**: Deve ser implementado via componente `BackgroundEffects.tsx`.
* **Performance de Background**: 
    - O script `particles-v2.min.js` deve ser carregado com `async` e `lazy loading` para não impactar o LCP (carregamento inicial).
    - O `zIndex` deve ser mantido em `1` com `pointerEvents: 'none'` para não atrapalhar o clique nos botões de conversão.
* **Configuração Visual**:
    - **Quantidade**: 70 partículas (equilíbrio entre estética e performance).
    - **Interação**: Ativar `repulse` no hover (as bolinhas fogem do mouse) para gerar interatividade.
    - **Overlay**: Manter a imagem de ruído/textura com `opacity: 0.08` para profundidade visual.

## 7. Regras de Performance para Scripts
* **Pre-render**: Elementos de canvas e partículas não devem bloquear a renderização do texto principal.
* **Cache**: O sufixo `-v2` no arquivo JS deve ser mantido para evitar problemas de cache na VPS ao fazer atualizações.


---

## 8. Biblioteca de Componentes Atômicos
Esta biblioteca contém os elementos de alto impacto que podem ser reutilizados em qualquer Landing Page do projeto.

* **PulsingButton.tsx**: Botão CTA principal com animação de pulsação e estilo pílula.
* **TestimonialCard.tsx**: Card premium para depoimentos com suporte a avatar, nome, cargo e texto em itálico.
* **RevenueCalculator.tsx**: Calculadora interativa de perda e recuperação de faturamento (Lead Magnet).
* **LeadCaptureForm.tsx**: Formulário de captura de leads com design glassmorphism e inputs otimizados para mobile.

**Localização**: /src/components/shared/

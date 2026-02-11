# Sistema de Design - Axis Antivacância (v5.3.5)

Este documento estabelece as diretrizes visuais obrigatórias para todas as landing pages e interfaces do ecossistema Axis. Ele foi extraído diretamente da versão aprovada **v5.3.5**, servindo como a "lei visual" para garantir consistência, autoridade e estética premium.

---

## 1. Paleta de Cores
O design utiliza um esquema de alto contraste fundamentado em um **Dark Mode Luxuoso**.

### **Backgrounds (Fundos)**
- **Fundo Principal:** `#000000` (Preto Puro)
- **Fundo Secundário (Cards/Painéis):** `#212121` (Cinza muito escuro / Materialize *grey darken-4*)
- **Sobreposição (Overlay):** Gradientes radiais com `#8b5cf6` (Roxo) em baixa opacidade (10-15%) para criar profundidade.

### **Textos**
- **Título Principal:** `#FFFFFF` (Branco Puro)
- **Subtítulos e Corpo:** `rgba(255, 255, 255, 0.7)` (Branco com 70% de opacidade)
- **Textos de Menor Ênfase:** `rgba(255, 255, 255, 0.4)` (Branco com 40% de opacidade)

### **Acentos e Destaques**
- **Ícones de Sucesso:** `#4CAF50` (Verde) ou `#FFFFFF` (Branco).
- **Linhas e Divisores:** `rgba(255, 255, 255, 0.1)` (Bordas sutis).

---

## 2. Tipografia
A tipografia é focada em autoridade e legibilidade moderna.

- **Fonte Principal:** `'Futura Md BT'`, sans-serif.
- **Peso dos Títulos:** `800` (Extra Bold).
- **Transformação:** Títulos principais devem ser sempre em **UPPERCASE** (Caixa Alta).

### **Escala de Tamanhos**
- **H1 (Hero):** Dinâmico entre `2.5rem` e `5rem` (conforme tamanho da tela).
- **H2 (Seções):** Dinâmico entre `1.8rem` e `4rem`.
- **Subtítulos:** `1.2rem` a `1.4rem`.
- **Corpo de Texto:** `1.1rem` (Desktop) | `0.95rem` (Mobile).
- **Textos de Botão:** `0.85rem` (Sempre em negrito).

---

## 3. Estilo de Botões (CTA)
Os botões de "Chamada para Ação" são o elemento de maior contraste na página.

- **Estilo Padrão (Primary CTA):**
  - **Fundo:** `#FFFFFF` (Branco).
  - **Texto:** `#000000` (Preto).
  - **Peso da Fonte:** Bold.
  - **Letramento:** Uppercase.
- **Arredondamento:** `50px` (Formato Pílula).
- **Espaçamento (Padding):** `16px 40px`.
- **Estados:**
  - **Hover:** Aumento de escala para `1.05` e leve deslocamento para cima (`translateY(-2px)`).
  - **Animação:** Efeito `pulse-custom` (pulsação suave com sombra branca externa).

---

## 4. Arredondamentos e Sombras
Padrões de borda para criar uma interface suave e moderna.

- **Painéis (Cards):** `12px`.
- **Imagens do Hero:** `16px`.
- **Bordas de Passo/Números:** `50%` (Círculos perfeitos).
- **Sombras de Imagem:** `0 25px 80px rgba(0, 0, 0, 0.6)` (Sombras profundas para criar flutuação).
- **Sombras de Botão:** `0 4px 12px rgba(255, 255, 255, 0.1)` (Padrão sutil).

---

## 5. Elementos de Interface e Layout
- **Container:** Largura máxima de `1200px` com preenchimento lateral de `20px`.
- **Espaçamento entre Seções:** Margens verticais de `80px` a `100px` para dar "respiro" ao conteúdo.
- **Imagens:** Devem utilizar o formato `.webp` para performance, com cantos arredondados (`16px`).

---

## 6. Regras de Ouro para Próximas Páginas
1. **Contraste Extremo:** O fundo deve ser sempre escuro e o botão principal deve ser branco.
2. **Menos é Mais:** Use bordas sutis (`rgba(255,255,255,0.1)`) em vez de linhas sólidas e pesadas.
3. **Pulsar Chamadas:** Todo botão de conversão crítica deve ter a animação `pulse-custom`.
4. **Respiro:** Nunca esprema textos; mantenha o `line-height` em `1.6` para o corpo e `1.1` para títulos.

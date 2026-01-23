# 🚀 Guia Rápido - Finance V2

## Acesso

```
http://localhost:5176/finance/flora-v2
```

## O Que Você Pode Fazer AGORA

### 1. Ver Seu Dinheiro
- **Visão PF:** Veja quanto você tem, quanto gasta, capacidade de poupar
- **Visão PJ:** Veja o caixa da empresa, margem de lucro, runway

### 2. Lançar Gastos/Receitas
1. Clique em **Lançamentos**
2. Botão **Novo Lançamento**
3. Preencha tudo (não deixe nada em branco)
4. Salve

**Dica:** O sistema só aceita se você classificar tudo direitinho.

### 3. Definir Orçamentos
1. Clique em **Orçamentos**
2. Escolha PF ou PJ
3. Botão **Novo Orçamento**
4. Defina quanto quer gastar em cada categoria no mês

**Exemplo:**
- Alimentação: R$ 2.000
- Lazer: R$ 600
- Marketing PJ: R$ 3.000

### 4. Ver Onde o Dinheiro Vai
- **Gráficos de pizza:** Mostram % de cada categoria
- **Top 5 Despesas:** Maiores gastos do mês
- **Orçamento vs Realidade:** Barra verde/amarela/vermelha

### 5. Conciliar Extratos (IA)
1. **Conciliação** tab
2. Veja as sugestões automáticas
3. Ajuste se necessário
4. Confirme

## Estrutura Básica

### Você Precisa Saber 3 Coisas:

1. **Plano de Contas:** ONDE o dinheiro vai
   - Ex: Alimentação, Aluguel, Marketing

2. **Centro de Custo:** PARA QUE o dinheiro vai
   - Ex: Casa, Pessoal, Projeto A

3. **Conta Bancária:** DE ONDE sai o dinheiro
   - Ex: Nubank PF, Banco Inter PJ

## Exemplo Prático: Lançar Uma Despesa

**Situação:** Você pagou R$ 2.200 de aluguel no Nubank PF

1. Ir em **Lançamentos** → **Novo Lançamento**
2. Preencher:
   - **Entidade:** Pessoa Física
   - **Tipo:** Despesa
   - **Data:** 10/01/2026
   - **Conta:** Nubank PF
   - **Plano de Contas:** Moradia (Aluguel/Financiamento)
   - **Centro de Custo:** Casa
   - **Valor:** 2200.00
   - **Descrição:** Aluguel Janeiro
3. Salvar

✅ Pronto! Agora aparece na **Visão PF** nos gráficos e no orçamento.

## Exemplo: Criar Orçamento

**Situação:** Você quer gastar no máximo R$ 2.000 em alimentação por mês

1. Ir em **Orçamentos** → tab **PF** → **Novo Orçamento**
2. Preencher:
   - **Entidade:** Pessoa Física
   - **Mês:** 2026-01
   - **Plano de Contas:** Alimentação
   - **Valor:** 2000.00
3. Salvar

✅ Agora o sistema mostra quanto você já gastou vs. quanto pode gastar.

## Cores e Sinais

| Cor | Significa |
|-----|-----------|
| 🟢 Verde | Receitas / Tudo OK / Abaixo de 70% do orçamento |
| 🟡 Amarelo | Atenção / 70-90% do orçamento |
| 🔴 Vermelho | Despesas / Alerta / Acima de 90% do orçamento |
| 🔵 Azul | Informação / Investimentos |

## Dicas de Uso Diário

### Manhã:
- Abrir **Visão PF** ou **Visão PJ**
- Ver o saldo do mês
- Conferir se está dentro do orçamento

### Quando Gastar:
- Ir em **Lançamentos**
- Adicionar o gasto na hora (não deixe acumular)
- Classificar corretamente

### Fim da Semana:
- Ir em **Orçamentos**
- Ver o que está amarelo/vermelho
- Ajustar gastos da próxima semana

### Quando Chega Extrato:
- Ir em **Conciliação**
- Confirmar as sugestões da IA
- Tudo que você confirmar vira lançamento automático

## FAQs Rápidos

**Q: Posso misturar PF e PJ?**  
A: Não! O sistema separa 100%. Cada lançamento é OU PF OU PJ.

**Q: Preciso cadastrar tudo de novo?**  
A: Não! Plano de contas, centros de custo e contas bancárias já vêm prontos.

**Q: E se eu errar um lançamento?**  
A: Por enquanto, não tem edição. Crie um novo corrigindo. (Futura funcionalidade: editar)

**Q: Os dados ficam salvos?**  
A: Por enquanto são MOCKS. Quando fechar e abrir, volta ao estado inicial.  
   (Futuro: backend real com persistência)

**Q: Funciona no celular?**  
A: Sim! O layout é responsivo.

## Resumão: 3 Ações Principais

1. 📊 **VER:** Abrir Visão PF/PJ pra saber como está
2. ➕ **LANÇAR:** Adicionar gastos/receitas na hora que acontecem
3. 🎯 **CONTROLAR:** Criar orçamentos e acompanhar

---

**É só isso.** Use diariamente por 1 semana e vira automático. 🚀

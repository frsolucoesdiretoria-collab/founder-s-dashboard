# 🚀 DEPLOY AXIS TEMPO REAL — Todas as Versões (V1.0 → V1.5)

## ✅ Status do Código

- ✅ Código commitado e pushed para GitHub (branch `main`)
- ✅ Todas as 5 versões implementadas
- ✅ Build testado localmente (sucesso)
- ✅ Copy lock validado
- ✅ Pronto para produção

---

## 🎯 O QUE VAI SER DEPLOYADO

Este deploy vai disponibilizar **5 versões** da landing page AXIS Tempo Real na sua VPS:

| Versão | Rota | Descrição |
|--------|------|-----------|
| V1.0 | `/axis/tempo-real/v1` | Baseline (copy pura) |
| V1.2 | `/axis/tempo-real/v1-2` | Design system + prose renderer |
| V1.3 | `/axis/tempo-real/v1-3` | + SVG illustrations + motion |
| V1.4 | `/axis/tempo-real/v1-4` | + Scroll storytelling + CTA system |
| **V1.5** | `/axis/tempo-real/v1-5` | **PRODUCTION POLISH** ⭐ |

---

## 📋 INSTRUÇÕES PARA EXECUTAR O DEPLOY

### Opção 1: Script Automatizado (RECOMENDADO)

**Passo 1:** Conecte-se na VPS via SSH

```bash
ssh seu-usuario@seu-servidor
```

**Passo 2:** Execute o script de deploy

```bash
cd /var/www/founder-dashboard
bash DEPLOY_AXIS_TEMPO_REAL.sh
```

O script vai:
1. ✅ Salvar alterações locais (se houver)
2. ✅ Baixar código atualizado do GitHub
3. ✅ Instalar dependências
4. ✅ Fazer build da aplicação
5. ✅ Reiniciar servidor (PM2)
6. ✅ Validar deploy
7. ✅ Mostrar URLs de todas as versões

---

### Opção 2: Comando Único (Alternativa)

Se preferir, execute este comando único:

```bash
cd /var/www/founder-dashboard && \
git stash && \
git fetch origin main && \
git reset --hard origin/main && \
npm install && \
npm run build && \
pm2 restart founder-dashboard && \
pm2 save && \
echo "✅ Deploy concluído!"
```

---

## 🌐 URLs DISPONÍVEIS APÓS DEPLOY

Após executar o deploy, as seguintes páginas estarão disponíveis:

### V1.0 — Baseline
```
https://frtechltda.com.br/axis/tempo-real/v1
```

### V1.2 — Design System
```
https://frtechltda.com.br/axis/tempo-real/v1-2
```

### V1.3 — Illustrations
```
https://frtechltda.com.br/axis/tempo-real/v1-3
```

### V1.4 — Storytelling
```
https://frtechltda.com.br/axis/tempo-real/v1-4
```

### V1.5 — PRODUCTION ⭐
```
https://frtechltda.com.br/axis/tempo-real/v1-5
```

---

## 🔍 VALIDAÇÃO PÓS-DEPLOY

Após o deploy, valide:

1. **Teste as URLs no navegador**
   - Abra cada URL acima
   - Verifique se as páginas carregam
   - Teste scroll, animações, CTAs

2. **Verifique PM2**
   ```bash
   pm2 list
   pm2 logs founder-dashboard --lines 20
   ```

3. **Teste API Health**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Deve retornar: `{"status":"ok"}`

4. **Verifique Build**
   ```bash
   ls -la dist/
   ```
   A pasta `dist/` deve existir e estar atualizada

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro: "vite: not found"

**Causa:** Dependências de dev não instaladas

**Solução:**
```bash
cd /var/www/founder-dashboard
npm install  # SEM --production
npm run build
pm2 restart founder-dashboard
```

---

### Erro: PM2 não está rodando

**Solução:**
```bash
cd /var/www/founder-dashboard
pm2 start ecosystem.config.cjs
pm2 save
```

---

### Erro: Build falhou

**Solução:**
```bash
cd /var/www/founder-dashboard
rm -rf node_modules
npm install
npm run build
pm2 restart founder-dashboard
```

---

### Página não carrega (erro 502/503)

**Verificar:**
1. PM2 status: `pm2 list`
2. Logs: `pm2 logs founder-dashboard`
3. Porta: `lsof -ti:3001`

**Reiniciar:**
```bash
pm2 restart founder-dashboard
```

---

## 💡 COMANDOS ÚTEIS

```bash
# Ver status
pm2 list

# Ver logs em tempo real
pm2 logs founder-dashboard

# Reiniciar app
pm2 restart founder-dashboard

# Parar app
pm2 stop founder-dashboard

# Monitor interativo
pm2 monit

# Ver últimas 50 linhas de log
pm2 logs founder-dashboard --lines 50 --nostream
```

---

## 📊 O QUE FOI IMPLEMENTADO NESTE CHAT

### Versões Criadas:

1. **V1.4 (Scroll Storytelling)**
   - Hero forte com 2 CTAs
   - Scroll progress discreto
   - Sticky CTA (30% threshold)
   - Sticky illustrations (desktop)
   - Config system centralizado
   - Timeline estruturado

2. **V1.5 (Production Polish)**
   - A11Y compliance (WCAG 2.1 AA)
   - Focus visible em todos elementos
   - Touch targets 44px+
   - Press depth nos botões
   - Numbered badges (clarity section)
   - Timeline cards
   - Secondary contact links
   - High contrast mode support
   - Performance optimization
   - GPU acceleration strategic
   - Responsive 320px → 3840px

### Arquivos Modificados/Criados:

**Componentes:**
- `src/components/axis/Hero.tsx`
- `src/components/axis/ScrollProgress.tsx`
- `src/components/axis/StickyCTA.tsx`
- `src/components/axis/StickyIllustrationLayout.tsx`

**Páginas:**
- `src/pages/AxisTempoRealV1_4.tsx`
- `src/pages/AxisTempoRealV1_5.tsx`

**Config:**
- `src/config/axisTempoReal.ts`

**Styles:**
- `src/index.css` (100+ linhas de utilities A11Y/Performance)

**Documentação:**
- `content/AXIS_TEMPO_REAL_V1.4_VALIDATION.md`
- `content/AXIS_TEMPO_REAL_V1.5_VALIDATION.md`

**Deploy:**
- `DEPLOY_AXIS_TEMPO_REAL.sh`
- Este arquivo de instruções

---

## ✅ CHECKLIST FINAL

Antes de considerar completo:

- [x] Código commitado no Git
- [x] Push realizado para GitHub (branch `main`)
- [ ] Deploy executado na VPS
- [ ] URLs testadas no navegador
- [ ] PM2 status verificado
- [ ] Logs sem erros críticos
- [ ] V1.5 (production) testada em mobile
- [ ] CTAs funcionando (WhatsApp link)

---

## 🎉 PRÓXIMOS PASSOS

1. **Execute o deploy** usando uma das opções acima
2. **Teste todas as versões** no navegador
3. **Valide V1.5** em dispositivos móveis reais
4. **Configure env vars de produção** (se necessário):
   - WhatsApp number real
   - Calendly URL real
   - Email real

5. **Compartilhe a V1.5** com stakeholders para feedback

---

## 📞 SUPORTE

Se algo não funcionar:

1. Copie o erro completo dos logs: `pm2 logs founder-dashboard`
2. Verifique status: `pm2 list`
3. Verifique build: `ls -la dist/`
4. Teste health: `curl http://localhost:3001/api/health`

---

**Desenvolvido com excelência — 2026-01-24**

✅ **TUDO PRONTO PARA PRODUÇÃO!** 🚀

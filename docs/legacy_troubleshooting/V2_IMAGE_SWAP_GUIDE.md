# AXIS TEMPO REAL V2 — GUIA DE IMAGENS

## 📍 Localização dos Assets
Todas as imagens da V2 devem estar em:
```
/public/axis-tempo-real/v2/
```

## 📦 Arquivos Esperados

### 1. Hero Background (Seção Principal)
- **Nome:** `hero-background.webp`
- **Dimensões:** 1920x1080 (desktop) / 768x1024 (mobile)
- **Uso:** Background principal da primeira seção
- **Formato:** WebP (recomendado para performance)

### 2. Product Demo
- **Nome:** `product-demo.webp`
- **Dimensões:** 1200x800
- **Uso:** Screenshot/mockup do produto em uso
- **Formato:** WebP

### 3. Section Backgrounds
- **Nome:** `section-bg-01.webp`, `section-bg-02.webp`
- **Dimensões:** 1920x600
- **Uso:** Backgrounds decorativos em seções intermediárias
- **Formato:** WebP

### 4. Illustration/Icon
- **Nome:** `illustration-main.webp`
- **Dimensões:** 800x600
- **Uso:** Ilustração conceitual (ex: raio-x, tempo, etc.)
- **Formato:** WebP

### 5. CTA Background
- **Nome:** `cta-background.webp`
- **Dimensões:** 1920x400
- **Uso:** Background da seção final de Call-to-Action
- **Formato:** WebP

## 🎨 Especificações Técnicas

### Formato
- Preferencial: **WebP** (menor tamanho, melhor performance)
- Alternativa: PNG (para transparências complexas)
- Evitar: JPEG (menor qualidade)

### Otimização
- Compressão: 80-85% (WebP)
- Tamanho máximo por arquivo: 500KB
- Usar ferramentas como Squoosh, TinyPNG, ou ImageOptim

### Responsividade
- Desktop: usar imagens full resolution
- Mobile: considerar versions @2x para telas Retina
- Lazy loading será implementado automaticamente

## 🔄 Como Trocar Imagens

1. Colocar o arquivo na pasta `/public/axis-tempo-real/v2/`
2. Usar o nome exato especificado acima
3. O código referenciará automaticamente: `/axis-tempo-real/v2/hero-background.webp`

## ⚠️ Importante
- **NÃO** usar imagens da V1 (pasta `/public/axis-tempo-real/v1/` se existir)
- **NÃO** referenciar assets fora da pasta V2
- Manter nomes consistentes para facilitar manutenção

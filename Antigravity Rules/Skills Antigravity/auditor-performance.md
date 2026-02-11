# Skill: Auditor de Performance & Infra
[cite_start]Missão: Garantir nota 100 no PageSpeed e resolver falhas de cache/infraestrutura. 

## Regras de Execução:
- [cite_start]**Verificação de Cache**: Se o deploy for concluído mas a URL pública não atualizar, force a invalidação de cache via terminal na VPS (Nginx/Cloudflare). 
- [cite_start]**Otimização de Assets**: Verifique se todas as imagens novas estão em `.webp` e se o `BackgroundEffects` está sendo carregado via `next/dynamic`. 
- [cite_start]**Diagnóstico de Bundle**: Analise o tamanho dos arquivos JS e CSS para garantir que o LCP (Largest Contentful Paint) ocorra em menos de 1.2s no mobile. [cite: 16]

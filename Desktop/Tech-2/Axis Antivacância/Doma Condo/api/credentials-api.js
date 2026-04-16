/**
 * DOMA CONDO — API de Credenciais
 * Porta: 3010
 *
 * Endpoints:
 *   GET  /api/credentials-status  → retorna campos já preenchidos
 *   POST /api/save-credentials     → salva no .env
 */

import http from 'http';
import fs   from 'fs';
import path from 'path';
import url  from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT      = 3010;
const ENV_PATH  = '/home/fabricio/doma-condo/infra/.env';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerEnv() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const result = {};
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    result[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return result;
}

function salvarEnv(updates) {
  let conteudo = '';
  if (fs.existsSync(ENV_PATH)) {
    conteudo = fs.readFileSync(ENV_PATH, 'utf8');
  }

  let linhas = conteudo.split('\n');

  for (const [key, value] of Object.entries(updates)) {
    if (!value || value.trim() === '') continue;
    let encontrou = false;
    linhas = linhas.map(linha => {
      const t = linha.trim();
      if (t.startsWith('#') || !t.includes('=')) return linha;
      const i = t.indexOf('=');
      if (t.slice(0, i).trim() === key) {
        encontrou = true;
        return `${key}=${value}`;
      }
      return linha;
    });
    if (!encontrou) {
      linhas.push(`${key}=${value}`);
    }
  }

  fs.writeFileSync(ENV_PATH, linhas.join('\n'), 'utf8');
}

function lerBody(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', c => { body += c.toString(); });
    req.on('end', () => res(body));
    req.on('error', rej);
  });
}

function json(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// ─── Server ───────────────────────────────────────────────────────────────────

http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // ── GET /api/credentials-status ──────────────────────────────────────────
  if (req.method === 'GET' && pathname === '/api/credentials-status') {
    try {
      json(res, 200, lerEnv());
    } catch (e) {
      json(res, 500, { error: e.message });
    }
    return;
  }

  // ── POST /api/save-credentials ────────────────────────────────────────────
  if (req.method === 'POST' && pathname === '/api/save-credentials') {
    try {
      const body    = await lerBody(req);
      const updates = JSON.parse(body);

      // Garantir que o diretório existe
      const dir = path.dirname(ENV_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Se o arquivo não existe, criar com cabeçalho
      if (!fs.existsSync(ENV_PATH)) {
        fs.writeFileSync(ENV_PATH, '# DOMA CONDO — Variáveis de Ambiente\n# Gerado automaticamente\n\n', 'utf8');
      }

      salvarEnv(updates);

      const chaves = Object.keys(updates).filter(k => updates[k]);
      console.log(`[SAVED] ${chaves.join(', ')}`);
      json(res, 200, { ok: true, savedKeys: chaves });
    } catch (e) {
      console.error('[ERROR]', e.message);
      json(res, 500, { ok: false, error: e.message });
    }
    return;
  }

  json(res, 404, { error: 'Not found' });

}).listen(PORT, '127.0.0.1', () => {
  console.log(`[DOMA CONDO] Credentials API rodando na porta ${PORT}`);
  console.log(`[DOMA CONDO] Salvando em: ${ENV_PATH}`);
});

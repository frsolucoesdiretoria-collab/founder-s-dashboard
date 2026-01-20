#!/usr/bin/env node

/**
 * Script para extrair IDs das databases do Notion a partir dos links
 * e atualizar o arquivo .env.local
 * 
 * Uso: node scripts/extract-notion-ids.js <link1> <link2> <link3>
 * 
 * Exemplo:
 * node scripts/extract-notion-ids.js \
 *   "https://www.notion.so/KPIs_Enzo-abc123..." \
 *   "https://www.notion.so/Goals_Enzo-def456..." \
 *   "https://www.notion.so/Actions_Enzo-ghi789..."
 */

const fs = require('fs');
const path = require('path');

/**
 * Extrai o ID de uma URL do Notion
 * Formato: https://www.notion.so/Nome-ID32chars ou https://www.notion.so/ID32chars
 */
function extractNotionId(url) {
  try {
    // Remove espaços e quebras de linha
    url = url.trim();
    
    // Extrai a parte final da URL (após o último /)
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Remove query params se existirem
    const cleanPart = lastPart.split('?')[0];
    
    // O ID do Notion tem 32 caracteres (hexadecimal)
    // Pode estar com ou sem hífens
    const idMatch = cleanPart.match(/([a-f0-9]{32})/i);
    
    if (idMatch) {
      // Retorna o ID sem hífens (formato correto para env vars)
      return idMatch[1].replace(/-/g, '');
    }
    
    // Tenta extrair da última parte diretamente
    const idWithoutHyphens = cleanPart.replace(/-/g, '');
    if (idWithoutHyphens.match(/^[a-f0-9]{32}$/i)) {
      return idWithoutHyphens;
    }
    
    // Se não encontrou, retorna a última parte (pode ser só o ID)
    if (cleanPart.length === 32 && cleanPart.match(/^[a-f0-9]+$/i)) {
      return cleanPart;
    }
    
    throw new Error(`Não foi possível extrair o ID da URL: ${url}`);
  } catch (error) {
    throw new Error(`Erro ao processar URL: ${url}\n${error.message}`);
  }
}

/**
 * Atualiza o arquivo .env.local com os IDs das databases do Enzo
 */
function updateEnvLocal(kpisId, goalsId, actionsId) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  // Verifica se o arquivo existe
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado!');
    console.log('💡 Criando arquivo .env.local...');
    fs.writeFileSync(envPath, '');
  }
  
  // Lê o conteúdo atual
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Função para atualizar ou adicionar variável
  function setEnvVar(name, value) {
    const regex = new RegExp(`^${name}=.*$`, 'm');
    const newLine = `${name}=${value}`;
    
    if (regex.test(envContent)) {
      // Atualiza existente
      envContent = envContent.replace(regex, newLine);
    } else {
      // Adiciona nova (no final)
      if (envContent && !envContent.endsWith('\n')) {
        envContent += '\n';
      }
      envContent += `${newLine}\n`;
    }
  }
  
  // Atualiza as variáveis do Enzo
  setEnvVar('NOTION_DB_KPIS_ENZO', kpisId);
  setEnvVar('NOTION_DB_GOALS_ENZO', goalsId);
  setEnvVar('NOTION_DB_ACTIONS_ENZO', actionsId);
  
  // Salva o arquivo
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Arquivo .env.local atualizado!`);
}

// Main
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length !== 3) {
    console.error('❌ Erro: Forneça exatamente 3 links do Notion');
    console.log('\n📖 Uso:');
    console.log('   node scripts/extract-notion-ids.js <link_kpis> <link_goals> <link_actions>');
    console.log('\n💡 Exemplo:');
    console.log('   node scripts/extract-notion-ids.js \\');
    console.log('     "https://www.notion.so/KPIs_Enzo-abc..." \\');
    console.log('     "https://www.notion.so/Goals_Enzo-def..." \\');
    console.log('     "https://www.notion.so/Actions_Enzo-ghi..."');
    process.exit(1);
  }
  
  try {
    const [kpisLink, goalsLink, actionsLink] = args;
    
    console.log('🔍 Extraindo IDs dos links do Notion...\n');
    
    const kpisId = extractNotionId(kpisLink);
    const goalsId = extractNotionId(goalsLink);
    const actionsId = extractNotionId(actionsLink);
    
    console.log('📋 IDs extraídos:');
    console.log(`   NOTION_DB_KPIS_ENZO = ${kpisId}`);
    console.log(`   NOTION_DB_GOALS_ENZO = ${goalsId}`);
    console.log(`   NOTION_DB_ACTIONS_ENZO = ${actionsId}\n`);
    
    updateEnvLocal(kpisId, goalsId, actionsId);
    
    console.log('\n✨ Concluído!');
    console.log('💡 Reinicie o servidor para aplicar as mudanças.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

module.exports = { extractNotionId, updateEnvLocal };






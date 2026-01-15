// Vende Mais Obras - Setup Script
// Cria todas as databases necessárias no Notion
// Execute: tsx server/scripts/setupVendeMaisObras.ts

import { config } from 'dotenv';
import { resolve } from 'path';
import { createDatabase, initNotionClient } from '../lib/notionDataLayer';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const PARENT_PAGE_ID = '2e884566a5fa805eaac4fadb2b302d6a'; // ID da página "Vende-mais-obras-Databases"

async function setupDatabases() {
  console.log('🚀 Iniciando setup das databases do Vende Mais Obras...\n');

  try {
    const client = initNotionClient();

    // Database 1: Servicos
    console.log('📦 Criando database Servicos...');
    const servicosDb = await createDatabase(
      PARENT_PAGE_ID,
      'Serviços SINAPI',
      {
        Codigo: {
          type: 'title',
          name: 'Codigo'
        },
        Nome: {
          type: 'rich_text',
          name: 'Nome'
        },
        Descricao: {
          type: 'rich_text',
          name: 'Descricao'
        },
        Categoria: {
          type: 'select',
          name: 'Categoria',
          select: {
            options: [
              { name: 'Demolições', color: 'red' },
              { name: 'Alvenaria', color: 'orange' },
              { name: 'Elétrica', color: 'yellow' },
              { name: 'Hidráulica', color: 'blue' },
              { name: 'Gás', color: 'red' },
              { name: 'Ar Condicionado', color: 'blue' },
              { name: 'Pinturas', color: 'purple' },
              { name: 'Pisos e Revestimentos', color: 'green' },
              { name: 'Gesso/Drywall', color: 'gray' },
              { name: 'Engenharia', color: 'brown' },
              { name: 'Fundação', color: 'gray' }
            ]
          }
        },
        Preco: {
          type: 'number',
          name: 'Preco'
        },
        Unidade: {
          type: 'select',
          name: 'Unidade',
          select: {
            options: [
              { name: 'm²', color: 'blue' },
              { name: 'unidade', color: 'green' },
              { name: 'm', color: 'yellow' },
              { name: 'm³', color: 'purple' }
            ]
          }
        },
        Ativo: {
          type: 'checkbox',
          name: 'Ativo'
        }
      }
    );
    console.log(`✅ Database Servicos criada: ${servicosDb.id}\n`);

    // Database 2: Usuarios
    console.log('👥 Criando database Usuarios...');
    const usuariosDb = await createDatabase(
      PARENT_PAGE_ID,
      'Usuários',
      {
        Nome: {
          type: 'title',
          name: 'Nome'
        },
        Email: {
          type: 'email',
          name: 'Email'
        },
        Telefone: {
          type: 'phone_number',
          name: 'Telefone'
        },
        PasswordHash: {
          type: 'rich_text',
          name: 'PasswordHash'
        },
        Status: {
          type: 'select',
          name: 'Status',
          select: {
            options: [
              { name: 'Trial', color: 'yellow' },
              { name: 'Ativo', color: 'green' },
              { name: 'Bloqueado', color: 'red' },
              { name: 'Cancelado', color: 'gray' }
            ]
          }
        },
        TrialInicio: {
          type: 'date',
          name: 'TrialInicio'
        },
        TrialFim: {
          type: 'date',
          name: 'TrialFim'
        },
        PlanoAtivo: {
          type: 'checkbox',
          name: 'PlanoAtivo'
        },
        MercadoPagoSubscriptionId: {
          type: 'rich_text',
          name: 'MercadoPagoSubscriptionId'
        },
        ActivatedAt: {
          type: 'date',
          name: 'ActivatedAt'
        },
        LastAccessAt: {
          type: 'date',
          name: 'LastAccessAt'
        },
        ChurnedAt: {
          type: 'date',
          name: 'ChurnedAt'
        }
      }
    );
    console.log(`✅ Database Usuarios criada: ${usuariosDb.id}\n`);

    // Database 3: Clientes
    console.log('🏢 Criando database Clientes...');
    const clientesDb = await createDatabase(
      PARENT_PAGE_ID,
      'Clientes',
      {
        Nome: {
          type: 'title',
          name: 'Nome'
        },
        Email: {
          type: 'email',
          name: 'Email'
        },
        Telefone: {
          type: 'phone_number',
          name: 'Telefone'
        },
        Documento: {
          type: 'rich_text',
          name: 'Documento'
        },
        Endereco: {
          type: 'rich_text',
          name: 'Endereco'
        },
        Cidade: {
          type: 'rich_text',
          name: 'Cidade'
        },
        Estado: {
          type: 'select',
          name: 'Estado',
          select: {
            options: [
              { name: 'AC' }, { name: 'AL' }, { name: 'AP' }, { name: 'AM' },
              { name: 'BA' }, { name: 'CE' }, { name: 'DF' }, { name: 'ES' },
              { name: 'GO' }, { name: 'MA' }, { name: 'MT' }, { name: 'MS' },
              { name: 'MG' }, { name: 'PA' }, { name: 'PB' }, { name: 'PR' },
              { name: 'PE' }, { name: 'PI' }, { name: 'RJ' }, { name: 'RN' },
              { name: 'RS' }, { name: 'RO' }, { name: 'RR' }, { name: 'SC' },
              { name: 'SP' }, { name: 'SE' }, { name: 'TO' }
            ]
          }
        },
        Usuario: {
          type: 'relation',
          name: 'Usuario',
          relation: {
            database_id: usuariosDb.id,
            type: 'single_property'
          }
        }
      }
    );
    console.log(`✅ Database Clientes criada: ${clientesDb.id}\n`);

    // Database 4: Orcamentos
    console.log('💰 Criando database Orcamentos...');
    const orcamentosDb = await createDatabase(
      PARENT_PAGE_ID,
      'Orçamentos',
      {
        Numero: {
          type: 'title',
          name: 'Numero'
        },
        Usuario: {
          type: 'relation',
          name: 'Usuario',
          relation: {
            database_id: usuariosDb.id,
            type: 'single_property'
          }
        },
        Cliente: {
          type: 'relation',
          name: 'Cliente',
          relation: {
            database_id: clientesDb.id,
            single_property: {}
          }
        },
        Status: {
          type: 'select',
          name: 'Status',
          select: {
            options: [
              { name: 'Rascunho', color: 'gray' },
              { name: 'Enviado', color: 'blue' },
              { name: 'Aprovado', color: 'green' },
              { name: 'Rejeitado', color: 'red' }
            ]
          }
        },
        Total: {
          type: 'number',
          name: 'Total'
        },
        Itens: {
          type: 'rich_text',
          name: 'Itens'
        },
        Observacoes: {
          type: 'rich_text',
          name: 'Observacoes'
        },
        Validade: {
          type: 'date',
          name: 'Validade'
        },
        EnviadoAt: {
          type: 'date',
          name: 'EnviadoAt'
        },
        AprovadoAt: {
          type: 'date',
          name: 'AprovadoAt'
        }
      }
    );
    console.log(`✅ Database Orcamentos criada: ${orcamentosDb.id}\n`);

    // Database 5: Leads
    console.log('📊 Criando database Leads...');
    const leadsDb = await createDatabase(
      PARENT_PAGE_ID,
      'Leads',
      {
        Nome: {
          type: 'title',
          name: 'Nome'
        },
        Email: {
          type: 'email',
          name: 'Email'
        },
        Telefone: {
          type: 'phone_number',
          name: 'Telefone'
        },
        Profissao: {
          type: 'rich_text',
          name: 'Profissao'
        },
        Cidade: {
          type: 'rich_text',
          name: 'Cidade'
        },
        Status: {
          type: 'select',
          name: 'Status',
          select: {
            options: [
              { name: 'Novo', color: 'gray' },
              { name: 'Contactado', color: 'blue' },
              { name: 'Respondeu', color: 'blue' },
              { name: 'Interessado', color: 'yellow' },
              { name: 'Qualificado', color: 'orange' },
              { name: 'Cadastrado', color: 'purple' },
              { name: 'Ativado', color: 'green' },
              { name: 'Usuário Ativo', color: 'green' },
              { name: 'Pago', color: 'green' },
              { name: 'Usuário Pagante', color: 'green' },
              { name: 'Perdido', color: 'red' },
              { name: 'Churn', color: 'red' }
            ]
          }
        },
        Source: {
          type: 'select',
          name: 'Source',
          select: {
            options: [
              { name: 'Google Maps', color: 'blue' },
              { name: 'Indicação', color: 'green' },
              { name: 'Facebook', color: 'blue' },
              { name: 'Instagram', color: 'purple' },
              { name: 'LinkedIn', color: 'blue' },
              { name: 'Outro', color: 'gray' }
            ]
          }
        },
        Notes: {
          type: 'rich_text',
          name: 'Notes'
        },
        ContactedAt: {
          type: 'date',
          name: 'ContactedAt'
        },
        QualifiedAt: {
          type: 'date',
          name: 'QualifiedAt'
        },
        ActivatedAt: {
          type: 'date',
          name: 'ActivatedAt'
        },
        ConvertedAt: {
          type: 'date',
          name: 'ConvertedAt'
        },
        ChurnedAt: {
          type: 'date',
          name: 'ChurnedAt'
        }
      }
    );
    console.log(`✅ Database Leads criada: ${leadsDb.id}\n`);

    console.log('✅ Setup completo!\n');
    console.log('📝 Adicione as seguintes variáveis ao seu .env.local:\n');
    console.log(`NOTION_DB_SERVICOS=${servicosDb.id}`);
    console.log(`NOTION_DB_USUARIOS=${usuariosDb.id}`);
    console.log(`NOTION_DB_CLIENTES=${clientesDb.id}`);
    console.log(`NOTION_DB_ORCAMENTOS=${orcamentosDb.id}`);
    console.log(`NOTION_DB_LEADS=${leadsDb.id}`);
    console.log(`\nJWT_SECRET=${generateJWTSecret()}\n`);

  } catch (error: any) {
    console.error('❌ Erro ao criar databases:', error.message);
    console.error(error);
    process.exit(1);
  }
}

function generateJWTSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Executar setup
setupDatabases();


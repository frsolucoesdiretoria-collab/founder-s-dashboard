/**
 * Setup Status property for Contacts_Enzo database
 * This function adds the Status field if it doesn't exist
 */
import { initNotionClient } from './notionDataLayer';
import { getDatabaseId } from '../../src/lib/notion/schema';

/**
 * Migrate contacts from old status to new status
 */
async function migrateContactsStatus(client: any, dbId: string): Promise<void> {
  try {
    // Buscar todos os contatos com status antigo
    const response = await client.databases.query({
      database_id: dbId,
      filter: {
        or: [
          { property: 'Status', select: { equals: 'Proposta Enviada' } },
          { property: 'Status', select: { equals: 'Venda Fechada' } }
        ]
      }
    });

    // Migrar cada contato
    for (const page of response.results) {
      const currentStatus = page.properties.Status?.select?.name;
      if (currentStatus === 'Proposta Enviada' || currentStatus === 'Venda Fechada') {
        await client.pages.update({
          page_id: page.id,
          properties: {
            Status: {
              select: { name: 'Venda Feita' }
            }
          }
        });
        console.log(`✅ Migrated contact ${page.id} from "${currentStatus}" to "Venda Feita"`);
      }
    }
  } catch (error: any) {
    // Se falhar, apenas logar (não é crítico)
    console.warn('⚠️  Could not migrate contacts status:', error.message);
  }
}

/**
 * Ensure ValorVenda field exists
 * Esta função cria o campo ValorVenda na database Contacts_Enzo se ele não existir
 */
export async function ensureValorVendaField(client: any, dbId: string): Promise<{ success: boolean; message: string }> {
  try {
    const database = await client.databases.retrieve({ database_id: dbId });
    const hasValorVendaField = database.properties.ValorVenda?.type === 'number';
    
    if (hasValorVendaField) {
      console.log('✅ Campo ValorVenda já existe na database Contacts_Enzo');
      return {
        success: true,
        message: 'Campo ValorVenda já existe na database Contacts_Enzo.'
      };
    }

    console.log('🔧 Criando campo ValorVenda na database Contacts_Enzo...');
    
    // Create ValorVenda field
    // Formato 'real' é para Real brasileiro (BRL)
    await client.databases.update({
      database_id: dbId,
      properties: {
        ValorVenda: {
          number: {
            format: 'real'
          }
        }
      }
    });

    console.log('✅ Campo ValorVenda criado com sucesso na database Contacts_Enzo!');
    
    return {
      success: true,
      message: 'Campo ValorVenda criado com sucesso na database Contacts_Enzo!'
    };
  } catch (error: any) {
    console.error('❌ Erro ao criar campo ValorVenda:', error);
    return {
      success: false,
      message: `Erro ao criar campo ValorVenda: ${error.message || 'Erro desconhecido'}`
    };
  }
}

export async function ensureEnzoContactsStatusField(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if Notion is configured - don't crash if not
    const notionToken = process.env.NOTION_TOKEN;
    if (!notionToken || notionToken.trim() === '' || notionToken.startsWith('<<<')) {
      console.warn('⚠️  NOTION_TOKEN not configured, skipping Contacts_Enzo Status field setup');
      return {
        success: false,
        message: 'NOTION_TOKEN not configured (optional feature)'
      };
    }

    const dbId = getDatabaseId('Contacts_Enzo');
    
    if (!dbId) {
      console.warn('⚠️  NOTION_DB_CONTACTS_ENZO not configured, skipping Status field setup');
      return {
        success: false,
        message: 'NOTION_DB_CONTACTS_ENZO not configured (optional feature)'
      };
    }

    const client = initNotionClient();

    // First, retrieve the database to check if Status field exists
    const database = await client.databases.retrieve({ database_id: dbId });
    
    // Migrar contatos com status antigo antes de atualizar opções
    await migrateContactsStatus(client, dbId);
    
    // Ensure ValorVenda field exists - SEMPRE criar se não existir
    const valorVendaResult = await ensureValorVendaField(client, dbId);
    if (valorVendaResult.success) {
      console.log('✅', valorVendaResult.message);
    } else {
      console.warn('⚠️', valorVendaResult.message);
    }
    
    const hasStatusField = database.properties.Status?.type === 'select';
    
    if (hasStatusField) {
      // Field already exists, check if it has the right options
      const statusSelect = database.properties.Status as any;
      const existingOptions = statusSelect.select?.options || [];
      const requiredOptions = [
        'Contato Ativado',
        'Café Agendado',
        'Café Executado',
        'Venda Feita'
      ];

      // Check which options are missing
      const missingOptions = requiredOptions.filter(
        opt => !existingOptions.some((e: any) => e.name === opt)
      );

      if (missingOptions.length > 0) {
        // Add missing options
        const allOptions = [
          ...existingOptions,
          ...missingOptions.map(name => ({ name, color: 'default' }))
        ];

        await client.databases.update({
          database_id: dbId,
          properties: {
            Status: {
              select: {
                options: allOptions
              }
            }
          }
        });

        return {
          success: true,
          message: `Campo Status já existia. Adicionadas ${missingOptions.length} opções faltantes.`
        };
      }

      return {
        success: true,
        message: 'Campo Status já existe com todas as opções necessárias.'
      };
    }

    // Field doesn't exist, create it
    await client.databases.update({
      database_id: dbId,
      properties: {
        Status: {
          select: {
            options: [
              { name: 'Contato Ativado', color: 'blue' },
              { name: 'Café Agendado', color: 'purple' },
              { name: 'Café Executado', color: 'indigo' },
              { name: 'Venda Feita', color: 'green' }
            ]
          }
        }
      }
    });

    return {
      success: true,
      message: 'Campo Status criado com sucesso na database Contacts_Enzo!'
    };
  } catch (error: any) {
    console.error('Error setting up Status field:', error);
    
    // Check if it's a permission error
    if (error.code === 'object_not_found' || error.message?.includes('permission')) {
      return {
        success: false,
        message: 'Sem permissão para atualizar a database. Certifique-se de que o bot do Notion tem acesso de edição à database Contacts_Enzo.'
      };
    }

    return {
      success: false,
      message: `Erro ao configurar campo Status: ${error.message || 'Erro desconhecido'}`
    };
  }
}


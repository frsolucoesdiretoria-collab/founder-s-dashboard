/**
 * Setup Status property for Contacts_Enzo database
 * This function adds the Status field if it doesn't exist
 */
import { initNotionClient, getDatabaseId } from './notionDataLayer';

export async function ensureEnzoContactsStatusField(): Promise<{ success: boolean; message: string }> {
  try {
    const client = initNotionClient();
    const dbId = getDatabaseId('Contacts_Enzo');
    
    if (!dbId) {
      return {
        success: false,
        message: 'NOTION_DB_CONTACTS_ENZO not configured'
      };
    }

    // First, retrieve the database to check if Status field exists
    const database = await client.databases.retrieve({ database_id: dbId });
    
    const hasStatusField = database.properties.Status?.type === 'select';
    
    if (hasStatusField) {
      // Field already exists, check if it has the right options
      const statusSelect = database.properties.Status as any;
      const existingOptions = statusSelect.select?.options || [];
      const requiredOptions = [
        'Contato Ativado',
        'Café Agendado',
        'Café Executado',
        'Proposta Enviada',
        'Venda Fechada',
        'Perdido'
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
              { name: 'Proposta Enviada', color: 'yellow' },
              { name: 'Venda Fechada', color: 'green' },
              { name: 'Perdido', color: 'red' }
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


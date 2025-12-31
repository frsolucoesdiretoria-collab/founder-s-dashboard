// FR Tech OS - Health Check Route
// Admin only - requires passcode

import { Router } from 'express';
import { validateAdminPasscode } from '../lib/guards';
import { initNotionClient, assertEnv } from '../lib/notionDataLayer';
import { NOTION_SCHEMA, getDatabaseId } from '../../src/lib/notion/schema';
import type { HealthCheckResult } from '../../src/types/health';

export const healthRouter = Router();

// Middleware: validate passcode
healthRouter.use((req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }
  next();
});

/**
 * GET /api/admin/health
 * Run health check diagnostics
 */
healthRouter.get('/', async (req, res) => {
  const checks: HealthCheckResult['checks'] = [];
  let hasErrors = false;
  let hasWarnings = false;

  try {
    // Check NOTION_TOKEN
    try {
      assertEnv('NOTION_TOKEN');
      checks.push({
        name: 'ENV: NOTION_TOKEN',
        status: 'ok',
        message: 'Token configurado'
      });
    } catch (error: any) {
      hasErrors = true;
      checks.push({
        name: 'ENV: NOTION_TOKEN',
        status: 'error',
        message: error.message || 'Token não configurado'
      });
    }

    // Check each required database
    for (const [dbName, schema] of Object.entries(NOTION_SCHEMA)) {
      if (!schema.required) continue;

      const envVar = schema.envVar;
      const dbId = getDatabaseId(dbName);

      if (!dbId) {
        hasWarnings = true;
        checks.push({
          name: `ENV: ${envVar}`,
          status: 'warning',
          message: `Variável não configurada`
        });
        continue;
      }

      checks.push({
        name: `ENV: ${envVar}`,
        status: 'ok',
        message: `Configurado (${dbId.substring(0, 8)}...)`
      });

      // Try to access the database
      try {
        const client = initNotionClient();
        const db = await client.databases.retrieve({ database_id: dbId });
        
        checks.push({
          name: `DB: ${dbName}`,
          status: 'ok',
          message: `Acessível: "${db.title[0]?.plain_text || 'Sem título'}"`
        });

        // Check required properties
        const missingProps: string[] = [];
        for (const propSchema of schema.properties) {
          if (propSchema.required) {
            const prop = db.properties[propSchema.name];
            if (!prop) {
              missingProps.push(propSchema.name);
            } else {
              // Soft type check
              const propType = prop.type;
              if (propSchema.type !== propType && propSchema.type !== 'formula') {
                // Allow some flexibility (e.g., formula can be computed)
                if (propSchema.type !== 'formula') {
                  missingProps.push(`${propSchema.name} (tipo esperado: ${propSchema.type}, atual: ${propType})`);
                }
              }
            }
          }
        }

        if (missingProps.length > 0) {
          hasWarnings = true;
          checks.push({
            name: `Schema: ${dbName}`,
            status: 'warning',
            message: `Propriedades faltando ou incorretas: ${missingProps.join(', ')}`
          });
        } else {
          checks.push({
            name: `Schema: ${dbName}`,
            status: 'ok',
            message: 'Todas as propriedades obrigatórias presentes'
          });
        }

        // Try a minimal query
        try {
          const queryResult = await client.databases.query({
            database_id: dbId,
            page_size: 1
          });
          checks.push({
            name: `Query: ${dbName}`,
            status: 'ok',
            message: `Query testada com sucesso (${queryResult.results.length} resultado(s))`
          });
        } catch (queryError: any) {
          hasWarnings = true;
          checks.push({
            name: `Query: ${dbName}`,
            status: 'warning',
            message: `Erro ao testar query: ${queryError.message || 'Erro desconhecido'}`
          });
        }

      } catch (dbError: any) {
        hasErrors = true;
        let message = 'Erro ao acessar database';
        if (dbError.code === 'object_not_found') {
          message = 'Database não encontrado. Verifique se a integração tem acesso.';
        } else if (dbError.code === 'unauthorized') {
          message = 'Não autorizado. Verifique o token e permissões.';
        } else {
          message = dbError.message || 'Erro desconhecido';
        }
        checks.push({
          name: `DB: ${dbName}`,
          status: 'error',
          message
        });
      }
    }

    // Overall status
    const status: HealthCheckResult['status'] = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';

    res.json({
      status,
      timestamp: new Date().toISOString(),
      checks
    });

  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      checks: [
        ...checks,
        {
          name: 'Health Check',
          status: 'error',
          message: error.message || 'Erro desconhecido ao executar health check'
        }
      ]
    });
  }
});


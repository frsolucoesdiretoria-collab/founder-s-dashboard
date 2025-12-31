// FR Tech OS - Environment Variables Validator
// Validates required env vars on server startup

import { NOTION_SCHEMA } from '../../src/lib/notion/schema';

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 */
export function validateEnvVars(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check NOTION_TOKEN (required)
  const token = process.env.NOTION_TOKEN;
  if (!token || token.trim() === '' || token === '<<<INSERIR_TOKEN_AQUI>>>' || token.startsWith('<<<')) {
    missing.push('NOTION_TOKEN');
  }

  // Check required databases
  const requiredDbs = ['KPIs', 'Goals', 'Actions', 'Journal'];
  for (const dbName of requiredDbs) {
    const schema = NOTION_SCHEMA[dbName];
    if (schema) {
      const envVar = schema.envVar;
      const dbId = process.env[envVar];
      if (!dbId) {
        missing.push(envVar);
      } else if (dbId.length !== 32) {
        warnings.push(`${envVar} has invalid format (expected 32 chars, got ${dbId.length})`);
      }
    }
  }

  // Check optional databases (warnings only)
  const optionalDbs = [
    'Contacts', 'Clients', 'GrowthProposals', 'CoffeeDiagnostics',
    'ExpansionOpportunities', 'CustomerWins', 'FinanceMetrics',
    'Partners', 'Referrals', 'CommissionLedger', 'PartnerNudges'
  ];
  for (const dbName of optionalDbs) {
    const schema = NOTION_SCHEMA[dbName];
    if (schema) {
      const envVar = schema.envVar;
      const dbId = process.env[envVar];
      if (dbId && dbId.length !== 32) {
        warnings.push(`${envVar} has invalid format (expected 32 chars, got ${dbId.length})`);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Assert that all required env vars are present
 * Throws error with clear message if validation fails
 */
export function assertEnvVars(): void {
  const result = validateEnvVars();
  
  if (!result.valid) {
    const errorMsg = [
      '❌ Missing required environment variables:',
      ...result.missing.map(v => `   - ${v}`),
      '',
      '📝 To fix:',
      '   1. Copy .env.local.example to .env.local',
      '   2. Fill in NOTION_TOKEN and database IDs',
      '   3. Restart the server',
      '',
      '💡 Tip: Get your NOTION_TOKEN from https://www.notion.so/my-integrations'
    ].join('\n');
    
    throw new Error(errorMsg);
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:');
    result.warnings.forEach(w => console.warn(`   ${w}`));
  }
}


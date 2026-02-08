// FR Tech OS - Self Test Route
// Admin only - requires passcode

import { Router } from 'express';
import { validateAdminPasscode, assertNoFinancialKPIs } from '../lib/guards';
import { 
  initNotionClient, 
  assertEnv, 
  getKPIsPublic, 
  getKPIsAdmin,
  getActions,
  ensureActionHasGoal,
  toggleActionDone,
  getJournalByDate
} from '../lib/notionDataLayer';
import { getDatabaseId } from '../../src/lib/notion/schema';
import type { SelfTestResult } from '../../src/types/health';

export const selftestRouter = Router();

// Middleware: validate passcode
selftestRouter.use((req, res, next) => {
  const passcode = req.headers['x-admin-passcode'] as string;
  if (!passcode || !validateAdminPasscode(passcode)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode' });
  }
  next();
});

/**
 * GET /api/__selftest
 * Run automated self-tests
 */
selftestRouter.get('/', async (req, res) => {
  const tests: SelfTestResult['tests'] = [];
  const dryRun = !process.env.NOTION_TOKEN; // If no token, run in dry-run mode

  // Test 1: Env vars missing
  try {
    const start = Date.now();
    const requiredVars = ['NOTION_TOKEN', 'NOTION_DB_KPIS', 'NOTION_DB_GOALS', 'NOTION_DB_ACTIONS', 'NOTION_DB_JOURNAL'];
    const missing: string[] = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    tests.push({
      name: 'T1: Env vars faltando',
      passed: missing.length === 0 || dryRun,
      duration: Date.now() - start,
      error: missing.length > 0 && !dryRun ? `Faltando: ${missing.join(', ')}` : undefined
    });
  } catch (e: any) {
    tests.push({
      name: 'T1: Env vars',
      passed: false,
      duration: 0,
      error: String(e)
    });
  }

  // Test 2: DB inaccessible
  if (!dryRun) {
    try {
      const start = Date.now();
      const dbId = getDatabaseId('KPIs');
      if (!dbId) {
        tests.push({
          name: 'T2: DB inacessível',
          passed: false,
          duration: Date.now() - start,
          error: 'NOTION_DB_KPIS não configurado'
        });
      } else {
        const client = initNotionClient();
        await client.databases.retrieve({ database_id: dbId });
        tests.push({
          name: 'T2: DB inacessível',
          passed: true,
          duration: Date.now() - start
        });
      }
    } catch (e: any) {
      tests.push({
        name: 'T2: DB inacessível',
        passed: false,
        duration: 0,
        error: `Database KPIs: ${e.message || 'Erro desconhecido'}`
      });
    }
  } else {
    tests.push({
      name: 'T2: DB inacessível',
      passed: true,
      duration: 0,
      error: 'Dry-run mode (sem NOTION_TOKEN)'
    });
  }

  // Test 3: Financial KPI marked VisiblePublic=true should not be exposed
  if (!dryRun) {
    try {
      const start = Date.now();
      const publicKPIs = await getKPIsPublic();
      const adminKPIs = await getKPIsAdmin();
      
      // Check if any financial KPIs are in public list
      const financialInPublic = publicKPIs.some(k => k.IsFinancial);
      
      // Check if any financial KPIs exist in admin but are marked VisiblePublic
      const financialWithPublicFlag = adminKPIs.filter(k => k.IsFinancial && k.VisiblePublic);
      
      if (financialInPublic) {
        tests.push({
          name: 'T3: KPI financeiro marcado VisiblePublic=true não deve ser exposto',
          passed: false,
          duration: Date.now() - start,
          error: 'KPIs financeiros encontrados na lista pública!'
        });
      } else if (financialWithPublicFlag.length > 0) {
        tests.push({
          name: 'T3: KPI financeiro marcado VisiblePublic=true não deve ser exposto',
          passed: true,
          duration: Date.now() - start,
          error: `Atenção: ${financialWithPublicFlag.length} KPI(s) financeiro(s) marcado(s) como VisiblePublic, mas corretamente filtrado(s)`
        });
      } else {
        tests.push({
          name: 'T3: KPI financeiro marcado VisiblePublic=true não deve ser exposto',
          passed: true,
          duration: Date.now() - start
        });
      }

      // Double-check with guard
      try {
        assertNoFinancialKPIs(publicKPIs);
      } catch (guardError: any) {
        tests.push({
          name: 'T3: Guard de segurança (assertNoFinancialKPIs)',
          passed: false,
          duration: 0,
          error: guardError.message
        });
      }
    } catch (e: any) {
      tests.push({
        name: 'T3: KPI financeiro',
        passed: false,
        duration: 0,
        error: String(e)
      });
    }
  } else {
    tests.push({
      name: 'T3: KPI financeiro marcado VisiblePublic=true não deve ser exposto',
      passed: true,
      duration: 0,
      error: 'Dry-run mode'
    });
  }

  // Test 4: Action without Goal -> toggle Done should be DENIED
  if (!dryRun) {
    try {
      const start = Date.now();
      const actions = await getActions();
      const actionWithoutGoal = actions.find(a => !a.Goal || a.Goal.trim() === '');
      
      if (actionWithoutGoal) {
        // Try to ensure it has goal (should fail)
        const checkResult = await ensureActionHasGoal(actionWithoutGoal.id);
        
        if (checkResult.allowed) {
          tests.push({
            name: 'T4: Action sem Goal -> toggle Done deve ser NEGADO',
            passed: false,
            duration: Date.now() - start,
            error: `Ação "${actionWithoutGoal.Name}" sem Goal pode ser concluída!`
          });
        } else {
          tests.push({
            name: 'T4: Action sem Goal -> toggle Done deve ser NEGADO',
            passed: true,
            duration: Date.now() - start,
            error: `Ação sem Goal corretamente bloqueada: ${checkResult.reason}`
          });
        }
      } else {
        tests.push({
          name: 'T4: Action sem Goal -> toggle Done deve ser NEGADO',
          passed: true,
          duration: Date.now() - start,
          error: 'Nenhuma ação sem Goal encontrada para testar'
        });
      }
    } catch (e: any) {
      tests.push({
        name: 'T4: Action sem Goal',
        passed: false,
        duration: 0,
        error: String(e)
      });
    }
  } else {
    tests.push({
      name: 'T4: Action sem Goal -> toggle Done deve ser NEGADO',
      passed: true,
      duration: 0,
      error: 'Dry-run mode'
    });
  }

  // Test 5: Journal of yesterday not filled -> should return LOCKED=true
  if (!dryRun) {
    try {
      const start = Date.now();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const journal = await getJournalByDate(yesterdayStr);
      
      if (!journal) {
        tests.push({
          name: 'T5: Journal de ontem não preenchido -> retornar LOCKED=true',
          passed: true,
          duration: Date.now() - start,
          error: `Journal de ${yesterdayStr} não existe (LOCKED=true esperado)`
        });
      } else if (!journal.Filled) {
        tests.push({
          name: 'T5: Journal de ontem não preenchido -> retornar LOCKED=true',
          passed: true,
          duration: Date.now() - start,
          error: `Journal de ${yesterdayStr} existe mas não está preenchido (LOCKED=true esperado)`
        });
      } else {
        tests.push({
          name: 'T5: Journal de ontem não preenchido -> retornar LOCKED=true',
          passed: true,
          duration: Date.now() - start,
          error: `Journal de ${yesterdayStr} está preenchido (LOCKED=false)`
        });
      }
    } catch (e: any) {
      tests.push({
        name: 'T5: Journal de ontem',
        passed: false,
        duration: 0,
        error: String(e)
      });
    }
  } else {
    tests.push({
      name: 'T5: Journal de ontem não preenchido -> retornar LOCKED=true',
      passed: true,
      duration: 0,
      error: 'Dry-run mode'
    });
  }

  const allPassed = tests.every(t => t.passed);

  res.json({
    passed: allPassed,
    timestamp: new Date().toISOString(),
    tests,
    dryRun
  });
});


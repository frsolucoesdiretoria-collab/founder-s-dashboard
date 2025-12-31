// FR Tech OS - Finance Data Layer
// SERVER-SIDE ONLY - NEVER import this in client-side code
// Only importable in:
// - /admin/finance route handlers
// - /partner/* route handlers (future)

import { Client } from '@notionhq/client';
import { getDatabaseId } from '../../src/lib/notion/schema';

// Notion client instance
let notionClient: Client | null = null;

/**
 * Assert that an environment variable exists
 */
function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Initialize Notion client
 */
function initNotionClient(): Client {
  if (notionClient) {
    return notionClient;
  }

  const token = assertEnv('NOTION_TOKEN');
  notionClient = new Client({ auth: token });
  return notionClient;
}

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Get finance metrics (admin only)
 * This function should ONLY be called from server-side routes with proper passcode validation
 */
export async function getFinanceMetrics(): Promise<{
  mrr: number;
  arr: number;
  churn: number;
  nrr: number;
  expansion: number;
  contraction: number;
}> {
  const client = initNotionClient();
  const dbId = getDatabaseId('FinanceMetrics');
  
  // For now, return mock data structure
  // In real implementation, query FinanceMetrics database
  // This is a placeholder that should be replaced with actual Notion queries
  
  // TODO: Implement actual finance metrics query from Notion
  // This is kept as mock for now since FinanceMetrics schema is minimal
  
  return {
    mrr: 15000,
    arr: 180000,
    churn: 2.5,
    nrr: 115,
    expansion: 3500,
    contraction: 500,
  };
}


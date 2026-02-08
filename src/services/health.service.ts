// FR Tech OS - Health & Self-Test Service

import type { HealthCheckResult, SelfTestResult } from '@/types/health';

/**
 * Run health check (calls server API)
 */
export async function runHealthCheck(passcode: string): Promise<HealthCheckResult> {
  try {
    const response = await fetch('/api/admin/health', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error running health check:', error);
    throw error;
  }
}

/**
 * Run self-tests (calls server API)
 */
export async function runSelfTests(passcode: string): Promise<SelfTestResult> {
  try {
    const response = await fetch('/api/__selftest', {
      headers: {
        'x-admin-passcode': passcode
      }
    });
    
    if (!response.ok) {
      throw new Error(`Self test failed: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error running self tests:', error);
    throw error;
  }
}

/**
 * Validate admin passcode (client-side validation - real validation is server-side)
 */
export function validateAdminPasscode(passcode: string): boolean {
  // Basic client-side validation (real validation is server-side)
  return passcode.length > 0;
}

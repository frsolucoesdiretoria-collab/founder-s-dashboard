// FR Tech OS - Coffee Mock Data

import type { CoffeeDiagnostic } from '@/types/coffee';

let diagnosticsState: CoffeeDiagnostic[] = [];

export function getMockDiagnostics(): CoffeeDiagnostic[] {
  return [...diagnosticsState];
}

export function createMockDiagnostic(diagnostic: Omit<CoffeeDiagnostic, 'id'>): CoffeeDiagnostic {
  const newDiagnostic: CoffeeDiagnostic = {
    ...diagnostic,
    id: String(Date.now())
  };
  diagnosticsState.push(newDiagnostic);
  return newDiagnostic;
}

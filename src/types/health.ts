// FR Tech OS - Health & Self-Test Types

export interface HealthCheck {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

export interface HealthCheckResult {
  status: 'ok' | 'warning' | 'error';
  timestamp: string;
  checks: HealthCheck[];
}

export interface SelfTest {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface SelfTestResult {
  passed: boolean;
  timestamp: string;
  tests: SelfTest[];
}

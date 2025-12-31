// FR Tech OS - Feature Flags
// Simple client-side feature flag check
// Note: Real implementation should check server-side

export function isPartnerFeatureEnabled(): boolean {
  // In a real implementation, this would check an API endpoint or env var
  // For now, return false by default (feature flag off)
  // Set to true to enable partner routes
  return false; // Change to true when PARTNER_FEATURE_FLAG is enabled
}


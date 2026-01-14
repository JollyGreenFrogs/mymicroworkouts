// Configuration loaded from window object (injected by server)
// This allows OAuth client IDs to be configured via environment variables

interface Config {
  googleClientId: string;
  microsoftClientId: string;
  baseUrl: string;
}

// Default configuration (will be overridden by environment)
const defaultConfig: Config = {
  googleClientId: '',
  microsoftClientId: '',
  baseUrl: window.location.origin
};

// Get configuration from window or use defaults
export const config: Config = (window as any).APP_CONFIG || defaultConfig;

// Validate configuration
export function validateConfig(): boolean {
  if (!config.googleClientId) {
    console.warn('Google OAuth client ID not configured');
    return false;
  }
  if (!config.microsoftClientId) {
    console.warn('Microsoft OAuth client ID not configured');
    return false;
  }
  return true;
}

/**
 * Application Version Management
 * Automatically tracks and manages app version
 */

export interface VersionInfo {
  version: string;
  buildDate: string;
  buildNumber: number;
  changelog: string[];
}

// Current version - update this when making significant changes
export const APP_VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString().split('T')[0];

/**
 * Initialize version tracking
 * Call this once when the app loads
 */
export function initializeVersion(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  
  const storedBuildNumber = parseInt(localStorage.getItem('app_build_number') || '0', 10);
  const storedVersion = localStorage.getItem('app_version') || '';
  
  // If version changed or first time, increment build number
  if (storedVersion !== APP_VERSION || storedBuildNumber === 0) {
    const newBuildNumber = storedVersion !== APP_VERSION ? 1 : storedBuildNumber + 1;
    localStorage.setItem('app_build_number', newBuildNumber.toString());
    localStorage.setItem('app_version', APP_VERSION);
    localStorage.setItem('app_last_update', new Date().toISOString());
  }
}

/**
 * Get version info object
 */
export function getVersionInfo(): VersionInfo {
  const buildNumber = typeof window !== 'undefined' && window.localStorage
    ? parseInt(localStorage.getItem('app_build_number') || '1', 10)
    : 1;
    
  const lastUpdate = typeof window !== 'undefined' && window.localStorage
    ? localStorage.getItem('app_last_update')?.split('T')[0] || BUILD_DATE
    : BUILD_DATE;
  
  return {
    version: APP_VERSION,
    buildDate: lastUpdate,
    buildNumber: buildNumber,
    changelog: [
      '1.0.0 - Initial release with portfolio, enquiries, and feedback features',
      'Password visibility toggle in admin login',
      'Auto-refresh portfolio updates',
      'LocalStorage-based data storage',
      'Version management system'
    ]
  };
}

/**
 * Get formatted version string
 */
export function getVersionString(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return `v${APP_VERSION}`;
  }
  
  const buildNum = parseInt(localStorage.getItem('app_build_number') || '1', 10);
  return `v${APP_VERSION} (Build ${buildNum})`;
}

/**
 * Check if there's a new version available
 */
export function checkForUpdates(): boolean {
  const storedVersion = localStorage.getItem('app_version') || '';
  return storedVersion !== APP_VERSION;
}


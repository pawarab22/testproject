const ADMIN_AUTH_KEY = 'pooja_aura_admin_auth';
const ADMIN_EMAIL = 'admin@poojasaura.com';
const ADMIN_PASSWORD = 'AuraGlow123!';

export function loginAdmin(email: string, password: string): boolean {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    return true;
  }
  return false;
}

/**
 * Clears all admin-related localStorage items
 * This is used both for logout and cleanup on page load
 */
function clearAllAdminLocalStorage(): void {
  // Clear the main admin auth key
  localStorage.removeItem(ADMIN_AUTH_KEY);
  
  // Clear any other admin-related localStorage items
  const adminKeys = [
    'pooja_aura_admin_auth',
    'loginadmin',
    'admin_user',
    'adminUser',
    'admin-user',
    'adminLogin',
    'admin_login',
    'admin_session',
    'adminSession'
  ];
  
  adminKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Also check for any localStorage keys containing 'admin' (case-insensitive)
  // but only remove ones that look like auth/session keys
  if (typeof window !== 'undefined' && window.localStorage) {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes('admin') && 
          (key.toLowerCase().includes('login') || 
           key.toLowerCase().includes('auth') || 
           key.toLowerCase().includes('session') ||
           key.toLowerCase().includes('user'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

export function logoutAdmin(): void {
  clearAllAdminLocalStorage();
}

/**
 * Initializes and cleans up admin localStorage on page load/refresh
 * If admin is not properly logged in (main auth key missing/invalid), 
 * clears all admin-related localStorage items
 */
export function initializeAdminAuth(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  
  // Check if admin is properly logged in using the main auth key
  const isLoggedIn = localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  
  // If not logged in, clean up any leftover admin localStorage items
  if (!isLoggedIn) {
    clearAllAdminLocalStorage();
  }
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}


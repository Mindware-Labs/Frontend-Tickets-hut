/**
 * Utility functions for cookie management
 */

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Handle empty cookie string
  if (!document.cookie) {
    return null;
  }
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const trimmedCookie = cookie.trim();
    if (!trimmedCookie) return acc;
    
    const equalIndex = trimmedCookie.indexOf('=');
    if (equalIndex === -1) return acc;
    
    const key = trimmedCookie.substring(0, equalIndex).trim();
    const value = trimmedCookie.substring(equalIndex + 1).trim();
    
    if (key && value) {
      try {
        acc[key] = decodeURIComponent(value);
      } catch {
        acc[key] = value; // If decoding fails, use raw value
      }
    }
    return acc;
  }, {} as Record<string, string>);
  
  return cookies[name] || null;
}

/**
 * Set a cookie
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const maxAge = days * 24 * 60 * 60; // Convert days to seconds
  // Use Lax instead of Strict to ensure cookie is sent with navigation requests
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}


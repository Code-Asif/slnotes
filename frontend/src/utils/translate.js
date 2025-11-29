/**
 * Google Translate utility functions
 * Uses Google Translate's free website translation service
 */

/**
 * Check if page is currently translated
 */
export const isTranslated = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  // Check cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'googtrans' && value && value.includes('/hi')) {
      return true;
    }
  }
  
  // Check if we're on Google Translate domain
  if (window.location.hostname.includes('translate.google.com')) {
    return true;
  }
  
  return false;
};

/**
 * Get current language
 */
export const getCurrentLanguage = () => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  if (isTranslated()) {
    return 'hi';
  }
  return 'en';
};

/**
 * Translate page to Hindi using Google Translate
 */
export const translateToHindi = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  // Set cookie for Google Translate
  const cookieValue = '/en/hi';
  document.cookie = `googtrans=${cookieValue}; path=/; max-age=31536000; SameSite=Lax`;
  
  // Reload page - Google Translate will detect cookie and translate
  window.location.reload();
};

/**
 * Switch back to English
 */
export const translateToEnglish = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  
  // Remove translation cookie
  document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  
  // If on Google Translate domain, go to original URL
  if (window.location.hostname.includes('translate.google.com')) {
    const urlParams = new URLSearchParams(window.location.search);
    const originalUrl = urlParams.get('u');
    if (originalUrl) {
      window.location.href = decodeURIComponent(originalUrl);
    } else {
      window.location.href = '/';
    }
  } else {
    // Reload page
    window.location.reload();
  }
};

/**
 * Toggle translation between English and Hindi
 */
export const toggleTranslation = () => {
  if (typeof window === 'undefined') {
    return;
  }
  
  const currentLang = getCurrentLanguage();
  if (currentLang === 'hi') {
    translateToEnglish();
  } else {
    translateToHindi();
  }
};


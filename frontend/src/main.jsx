import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import App from './App';
import { getTheme } from './theme';
import useThemeStore from './store/useThemeStore';
import './index.css';

// Initialize Google Translate if cookie is set (only in browser)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'googtrans' && value && value.includes('/hi')) {
        // Load Google Translate script if translating to Hindi
        if (!document.querySelector('script[src*="translate.google.com"]')) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
          script.async = true;
          
          window.googleTranslateElementInit = () => {
            try {
              if (window.google && window.google.translate) {
                let element = document.getElementById('google_translate_element');
                if (!element) {
                  element = document.createElement('div');
                  element.id = 'google_translate_element';
                  element.style.cssText = 'position: absolute; left: -9999px; width: 0; height: 0;';
                  document.body.appendChild(element);
                }
                
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi',
                  layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                  autoDisplay: false,
                }, 'google_translate_element');
              }
            } catch (error) {
              console.error('Error initializing Google Translate:', error);
            }
          };
          
          document.head.appendChild(script);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error checking Google Translate cookie:', error);
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

const ThemedApp = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
        <ThemedApp />
      </GoogleReCaptchaProvider>
    </HelmetProvider>
  </React.StrictMode>
);


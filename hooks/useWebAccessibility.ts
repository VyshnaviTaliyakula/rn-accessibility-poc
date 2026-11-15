import { useEffect } from 'react';
import { Platform } from 'react-native';

// Browser document configuration only. All screen UI lives in shared RN components.
export function useWebAccessibility() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const previousTitle = document.title;
    const previousLanguage = document.documentElement.lang;
    document.title = 'Sign in | Accessibility Testing PoC';
    document.documentElement.lang = 'en';
    const stylesheet = document.createElement('style');
    stylesheet.textContent = `
      #email:focus-visible, #password:focus-visible, #sign-in:focus-visible {
        outline: 3px solid #111;
        outline-offset: 3px;
      }
    `;
    document.head.appendChild(stylesheet);
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLanguage;
      stylesheet.remove();
    };
  }, []);
}

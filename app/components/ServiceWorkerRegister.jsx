'use client';
import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Registers Service Worker in background without showing modals
 * Sleep schedule setup is now handled in Onboarding Step 5
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Register Service Worker silently in background
    // No modals or permission requests on initial page load
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.warn('[SW] Service Worker registration failed:', error);
        });
    }
  }, []);

  return null;
}

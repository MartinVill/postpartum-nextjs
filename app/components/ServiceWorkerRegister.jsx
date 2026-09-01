'use client';
import { useEffect, useState } from 'react';
import SleepScheduleModal from './SleepScheduleModal';

/**
 * Service Worker Registration & Push Setup Component
 * Mounts in layout to handle service worker lifecycle
 * Shows SleepScheduleModal on first app visit
 */
export default function ServiceWorkerRegister() {
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Check if user has ever seen the sleep schedule modal
    const hasSeenModal = localStorage.getItem('hasSeenSleepScheduleModal');

    if (!hasSeenModal && !hasInitialized) {
      // Show modal on first visit (but only once per session to avoid annoyance)
      setShowSleepModal(true);
      localStorage.setItem('hasSeenSleepScheduleModal', 'true');
      setHasInitialized(true);
    }

    // Always try to register service worker in background
    // (even if user hasn't subscribed to push yet)
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
  }, [hasInitialized]);

  return (
    <>
      <SleepScheduleModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
      />
    </>
  );
}

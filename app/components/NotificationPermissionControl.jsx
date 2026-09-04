'use client';

import { useEffect, useState } from 'react';
import { getPushStatus, getStoredQuietHours, registerServiceWorkerAndSubscribe } from '@/app/utils/pushManager';

const STATUS = {
  active: { label: 'Activas', color: '#166534', background: '#F0FDF4', border: '#86EFAC' },
  blocked: { label: 'Bloqueadas', color: '#B91C1C', background: '#FEF2F2', border: '#FECACA' },
  disabled: { label: 'Desactivadas', color: '#6B7280', background: '#F9FAFB', border: '#E5E7EB' }
};

export default function NotificationPermissionControl() {
  const [status, setStatus] = useState('disabled');
  const [isActivating, setIsActivating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState('');

  const refreshStatus = async () => setStatus(await getPushStatus());

  useEffect(() => {
    refreshStatus();
  }, []);

  const activateNotifications = async () => {
    setMessage('');
    if (!('Notification' in window)) {
      setStatus('disabled');
      setMessage('Este navegador no admite notificaciones push.');
      return;
    }
    if (Notification.permission === 'denied') {
      setStatus('blocked');
      setMessage('Las notificaciones están bloqueadas en los ajustes del navegador.');
      return;
    }

    setIsActivating(true);
    try {
      // This handler runs only from a real user click. Keep this as the first
      // awaited browser operation so mobile browsers preserve user activation.
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'disabled');
        setMessage(permission === 'denied' ? 'No se concedió el permiso de notificaciones.' : 'La activación se canceló.');
        return;
      }

      const result = await registerServiceWorkerAndSubscribe(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        getStoredQuietHours(),
        localStorage.getItem('userId')
      );
      if (!result.success) throw new Error(result.error || result.message || 'No se pudo guardar la suscripción.');
      setStatus('active');
      setMessage('Listo: este dispositivo ya recibirá tus recordatorios.');
    } catch (error) {
      setStatus(await getPushStatus());
      setMessage(error.message || 'No se pudieron activar las notificaciones.');
    } finally {
      setIsActivating(false);
    }
  };

  const sendTestNotification = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setMessage('No pudimos identificar este dispositivo. Cierra y vuelve a abrir la app.');
      return;
    }

    setIsTesting(true);
    setMessage('Enviando una prueba…');
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar la prueba.');
      setMessage('Prueba enviada. Debería aparecer en unos segundos.');
    } catch (error) {
      setMessage(error.message || 'No se pudo enviar la prueba.');
    } finally {
      setIsTesting(false);
    }
  };

  const details = STATUS[status];
  return (
    <section style={{ padding: '16px', background: details.background, border: `1px solid ${details.border}`, borderRadius: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>Notificaciones push</h3>
          <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>Recordatorios de eventos y de check-in, incluso con la app cerrada.</p>
        </div>
        <span aria-live="polite" style={{ flexShrink: 0, fontSize: '12px', fontWeight: '700', color: details.color }}>● {details.label}</span>
      </div>
      {status !== 'active' && (
        <button type="button" onClick={activateNotifications} disabled={isActivating || status === 'blocked'} style={{ width: '100%', padding: '12px 14px', border: 'none', borderRadius: '10px', background: isActivating || status === 'blocked' ? '#D1D5DB' : '#D946EF', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: isActivating || status === 'blocked' ? 'not-allowed' : 'pointer' }}>
          {isActivating ? 'Activando…' : status === 'blocked' ? 'Permitilas desde el navegador' : 'Activar notificaciones'}
        </button>
      )}
      {status === 'active' && (
        <button type="button" onClick={sendTestNotification} disabled={isTesting} style={{ width: '100%', padding: '11px 14px', border: '1px solid #D946EF', borderRadius: '10px', background: '#FFFFFF', color: '#C026D3', fontSize: '14px', fontWeight: '700', cursor: isTesting ? 'wait' : 'pointer' }}>
          {isTesting ? 'Enviando prueba…' : 'Enviar una prueba'}
        </button>
      )}
      {message && <p role="status" style={{ margin: '10px 0 0', fontSize: '12px', color: details.color, lineHeight: 1.4 }}>{message}</p>}
    </section>
  );
}

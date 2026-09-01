'use client';
import { useState, useEffect } from 'react';
import { registerServiceWorkerAndSubscribe, isPushEnabled, getStoredQuietHours } from '@/app/utils/pushManager';

export default function SleepScheduleModal({ isOpen, onClose, vapidPublicKey }) {
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('08:00');
  const [isLoading, setIsLoading] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [error, setError] = useState(null);

  // Load stored quiet hours on mount
  useEffect(() => {
    const stored = getStoredQuietHours();
    setQuietStart(stored.quietStart || '22:00');
    setQuietEnd(stored.quietEnd || '08:00');

    // Check if push is already enabled
    isPushEnabled().then(setPushEnabled);
  }, []);

  const handleSaveAndActivate = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // If not enabled yet, request permission + subscribe
      if (!pushEnabled) {
        // Request notification permission
        const permission = await Notification.requestPermission();

        if (permission !== 'granted') {
          // User declined - save quiet hours anyway but don't activate push
          localStorage.setItem('quietHours', JSON.stringify({
            quietStart,
            quietEnd,
            updatedAt: new Date().toISOString()
          }));

          setError('Permiso de notificaciones denegado. Tus horarios de descanso se guardaron.');
          setIsLoading(false);
          return;
        }

        // Permission granted - subscribe to push
        if (!vapidPublicKey) {
          setError('Error: VAPID key no configurada. Contacta soporte.');
          setIsLoading(false);
          return;
        }

        const result = await registerServiceWorkerAndSubscribe(vapidPublicKey, {
          quietStart,
          quietEnd
        });

        if (!result.success) {
          throw new Error(result.error || 'No se pudo activar notificaciones');
        }

        setPushEnabled(true);
      } else {
        // Already enabled - just update quiet hours
        localStorage.setItem('quietHours', JSON.stringify({
          quietStart,
          quietEnd,
          updatedAt: new Date().toISOString()
        }));

        // Notify backend of updated quiet hours
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quietStart,
            quietEnd,
            updateOnly: true
          })
        });
      }

      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('[SLEEP MODAL] Error:', err);
      setError(err.message || 'Error al guardar. Intenta de nuevo.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 50,
      animation: 'slideUp 0.3s ease-out'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      <div style={{
        width: '100%',
        backgroundColor: '#FFFDF6',
        borderRadius: '24px 24px 0 0',
        padding: '32px 24px 40px',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#D946EF',
            margin: '0 0 8px 0'
          }}>
            Respeta tus momentos de descanso 🌙
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#4B5563',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Dinos a qué hora sueles dormir para asegurarnos de no enviarte ninguna notificación ni interrumpir tu sueño o lactancia.
          </p>
        </div>

        {/* Time Pickers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Hora de descanso */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#4B5563',
              marginBottom: '8px'
            }}>
              Hora de descanso
            </label>
            <input
              type="time"
              value={quietStart}
              onChange={(e) => setQuietStart(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1F2937',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            />
          </div>

          {/* Hora de despertar */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#4B5563',
              marginBottom: '8px'
            }}>
              Hora de despertar
            </label>
            <input
              type="time"
              value={quietEnd}
              onChange={(e) => setQuietEnd(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1.5px solid #E5E7EB',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1F2937',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: error.includes('denegado') ? '#FEF3F2' : '#FEF3F2',
            borderRadius: '8px',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '13px',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}>
            {error}
          </div>
        )}

        {/* Status */}
        {pushEnabled && !error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #86EFAC',
            color: '#166534',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            ✓ Notificaciones activadas
          </div>
        )}

        {/* Primary Button */}
        <button
          onClick={handleSaveAndActivate}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: isLoading ? '#D1D5DB' : '#D946EF',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.7 : 1,
            marginBottom: '12px'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.target.style.background = '#C026D3';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.target.style.background = '#D946EF';
          }}
        >
          {isLoading ? 'Guardando...' : 'Guardar horario y activar recordatorios'}
        </button>

        {/* Secondary Button - Close */}
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#F3F4F6',
            color: '#4B5563',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          Más tarde
        </button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

const defaults = { dailyWellbeingEnabled: true, checkinTime: '11:00', pauseTime: '18:00' };

export default function DailyWellbeingSettings() {
  const [settings, setSettings] = useState(defaults);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    fetch(`/api/notifications/settings?userId=${encodeURIComponent(userId)}`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(({ settings: saved }) => setSettings({ ...defaults, ...saved }))
      .catch(() => setFeedback('No pudimos cargar tus preferencias. Puedes intentarlo de nuevo cuando quieras.'));
  }, []);

  const save = async (nextSettings) => {
    setSettings(nextSettings);
    setFeedback('Guardando…');
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch('/api/notifications/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...nextSettings }) });
      if (!response.ok) throw new Error();
      setFeedback('Listo, tus preferencias se guardaron.');
    } catch {
      setFeedback('No se pudo guardar. Cuando puedas, vuelve a intentarlo.');
    }
  };

  return (
    <section style={{ padding: '16px', background: '#FFFFFF', border: '1px solid #F3E8FF', borderRadius: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#1F2937' }}>Bienestar diario</h3>
          <p style={{ margin: '4px 0 0', fontSize: '12px', lineHeight: 1.45, color: '#6B7280' }}>Dos recordatorios suaves para acompañarte cuando te sirvan.</p>
        </div>
        <button type="button" aria-label="Activar bienestar diario" aria-pressed={settings.dailyWellbeingEnabled} onClick={() => save({ ...settings, dailyWellbeingEnabled: !settings.dailyWellbeingEnabled })} style={{ width: '48px', height: '28px', flexShrink: 0, borderRadius: '14px', border: 'none', background: settings.dailyWellbeingEnabled ? '#D946EF' : '#E5E7EB', cursor: 'pointer', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '2px', left: settings.dailyWellbeingEnabled ? '22px' : '2px', width: '24px', height: '24px', borderRadius: '50%', background: '#FFFDF6', transition: 'left 0.2s' }} />
        </button>
      </div>
      {settings.dailyWellbeingEnabled && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
          <label style={{ fontSize: '12px', color: '#4B5563' }}>Tu registro<input aria-label="Hora de tu registro" type="time" value={settings.checkinTime} onChange={event => save({ ...settings, checkinTime: event.target.value })} style={{ boxSizing: 'border-box', width: '100%', marginTop: '5px', padding: '9px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', background: '#FFFDF6' }} /></label>
          <label style={{ fontSize: '12px', color: '#4B5563' }}>Tu pausa<input aria-label="Hora de tu pausa" type="time" value={settings.pauseTime} onChange={event => save({ ...settings, pauseTime: event.target.value })} style={{ boxSizing: 'border-box', width: '100%', marginTop: '5px', padding: '9px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', background: '#FFFDF6' }} /></label>
        </div>
      )}
      {feedback && <p role="status" style={{ margin: '10px 0 0', fontSize: '12px', color: '#6B7280' }}>{feedback}</p>}
    </section>
  );
}

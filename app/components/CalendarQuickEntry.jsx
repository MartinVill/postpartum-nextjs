'use client';

import { useState } from 'react';

const todayValue = () => new Date().toISOString().slice(0, 10);

export default function CalendarQuickEntry({ onSaved }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('evento');
  const [showSheet, setShowSheet] = useState(false);
  const [date, setDate] = useState(todayValue);
  const [time, setTime] = useState('09:00');
  const [reminder, setReminder] = useState('15min');

  const save = (name = text) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const entries = JSON.parse(localStorage.getItem('eventLogs') || '[]');
    const selectedDate = new Date(`${date}T12:00:00`);
    entries.push({
      id: Date.now(),
      name: trimmedName,
      date: selectedDate.toISOString(),
      time,
      notification: reminder,
      type
    });
    localStorage.setItem('eventLogs', JSON.stringify(entries));
    setText('');
    setShowSheet(false);
    onSaved();
  };

  const handleAdd = () => {
    if (text.trim()) save();
    else setShowSheet(true);
  };

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));

  return (
    <>
      <div style={{
        position: 'fixed', left: '16px', right: '16px', bottom: '86px', zIndex: 60,
        display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
        background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '999px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') handleAdd(); }}
          placeholder="Agrega un evento o síntoma..."
          aria-label="Agrega un evento o síntoma"
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '0 12px', fontSize: '14px', color: '#374151', background: 'transparent' }}
        />
        <div style={{ display: 'flex', gap: '3px', padding: '4px', borderRadius: '999px', background: '#F3F4F6', flexShrink: 0 }}>
          <button onClick={() => setType('evento')} style={{ border: 'none', borderRadius: '999px', padding: '6px 10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', background: type === 'evento' ? '#10B981' : 'transparent', color: type === 'evento' ? '#FFFFFF' : '#6B7280' }}>Evento</button>
          <button onClick={() => setType('sintoma')} style={{ border: 'none', borderRadius: '999px', padding: '6px 10px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', background: type === 'sintoma' ? '#FBBF24' : 'transparent', color: type === 'sintoma' ? '#FFFFFF' : '#6B7280' }}>Síntoma</button>
        </div>
        <button onClick={handleAdd} aria-label="Agregar entrada" style={{ width: '36px', height: '36px', flexShrink: 0, border: 'none', borderRadius: '50%', background: '#D946EF', color: '#FFFFFF', fontSize: '22px', fontWeight: 700, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 6px rgba(217,70,239,0.35)' }}>+</button>
      </div>

      {showSheet && (
        <div onClick={() => setShowSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.32)' }}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', padding: '24px 20px calc(24px + 86px)', borderRadius: '24px 24px 0 0', background: '#FFFDF6', boxShadow: '0 -4px 18px rgba(0,0,0,0.14)' }}>
            <h2 style={{ margin: 0, color: '#1F2937', fontSize: '19px' }}>{type === 'evento' ? '📅 Evento' : '🟡 Síntoma'}</h2>
            <p style={{ margin: '6px 0 20px', color: '#6B7280', fontSize: '13px' }}>Fecha: {formattedDate}</p>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Nombre del evento/síntoma</label>
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Nombre del evento/síntoma" style={{ boxSizing: 'border-box', width: '100%', marginBottom: '14px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', background: '#FFFFFF' }} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }} /></label>
              <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Hora<input type="time" value={time} onChange={(event) => setTime(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }} /></label>
            </div>
            <label style={{ display: 'block', marginBottom: '18px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Recordatorio<select value={reminder} onChange={(event) => setReminder(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }}><option value="15min">15 minutos antes</option><option value="30min">30 minutos antes</option><option value="1h">1 hora antes</option><option value="none">Sin recordatorio</option></select></label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowSheet(false)} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: '#E5E7EB', color: '#4B5563', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => save()} disabled={!text.trim()} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: text.trim() ? '#D946EF' : '#E5E7EB', color: '#FFFFFF', fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { syncCalendarReminder } from '@/app/utils/calendarReminderSync';

const reminderOptions = [{ value: '15min', label: '15 min antes' }, { value: '30min', label: '30 min antes' }, { value: '1h', label: '1 h antes' }, { value: '1day', label: '1 día antes' }];
const localDateValue = (value = new Date()) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};
const Pencil = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
const Bell = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>;
const Clock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;

export default function CalendarQuickEntry({ onSaved, selectedDate, onSelectedDateHandled }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('evento');
  const [date, setDate] = useState(localDateValue);
  const [time, setTime] = useState('09:00');
  const [reminder, setReminder] = useState('1h');
  const [showSheet, setShowSheet] = useState(false);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [dayEvents, setDayEvents] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);
  const [openReminderMenu, setOpenReminderMenu] = useState(null);
  const timeInputs = useRef({});

  const readEvents = () => {
    const calendarData = JSON.parse(localStorage.getItem('calendarData') || '{}');
    const legacyEntries = JSON.parse(localStorage.getItem('eventLogs') || '[]');
    const events = [...(calendarData.eventLogs || [])];
    legacyEntries.forEach(entry => { if (!events.some(saved => String(saved.id) === String(entry.id))) events.push(entry); });
    return events;
  };

  const writeEvents = async (events, changedEvent) => {
    const calendarData = JSON.parse(localStorage.getItem('calendarData') || '{}');
    localStorage.setItem('calendarData', JSON.stringify({ ...calendarData, eventLogs: events }));
    localStorage.removeItem('eventLogs');
    if (changedEvent) await syncCalendarReminder(changedEvent).catch(error => console.warn('[CALENDAR] Reminder sync failed:', error));
    onSaved?.();
  };

  const refreshDayEvents = (selected = date) => {
    const events = readEvents().filter(event => localDateValue(event.date) === selected).sort((a, b) => (a.time || '09:00').localeCompare(b.time || '09:00'));
    setDayEvents(events);
    return events;
  };

  const openSelectedDate = (selected) => {
    setDate(selected);
    const events = refreshDayEvents(selected);
    setText(''); setEditingEventId(null);
    setShowSheet(events.length === 0);
    setShowDayEvents(events.length > 0);
  };

  useEffect(() => {
    readEvents().filter(event => event?.type !== 'sintoma' && (event?.notifications?.length || (event?.notification && event.notification !== 'none'))).forEach(event => syncCalendarReminder(event).catch(error => console.warn('[CALENDAR] Existing reminder sync failed:', error)));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    openSelectedDate(selectedDate);
    onSelectedDateHandled?.();
  }, [selectedDate, onSelectedDateHandled]);

  // Calendar.jsx is deliberately left untouched. Capture its day-cell tap at
  // the document level so the compact multi-event sheet opens before its
  // legacy single-event modal is allowed to run.
  useEffect(() => {
    const handleCalendarDayTap = (event) => {
      const cell = event.target.closest('.calendar-screen div[style*="cursor: pointer"]');
      if (!cell || !cell.parentElement?.getAttribute('style')?.includes('grid-template-columns')) return;
      const day = Number(cell.textContent.trim().match(/^\d+/)?.[0]);
      const heading = document.querySelector('.calendar-screen h2')?.textContent?.trim();
      const match = heading?.match(/([a-záéíóúñ]+) de (\d{4})/i);
      if (!Number.isInteger(day) || day < 1 || day > 31 || !match) return;
      const months = { enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5, julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11 };
      const month = months[match[1].toLowerCase()];
      if (month === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      openSelectedDate(`${match[2]}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    };
    window.addEventListener('click', handleCalendarDayTap, true);
    return () => window.removeEventListener('click', handleCalendarDayTap, true);
  });

  const openNewEvent = () => {
    setText(''); setTime('09:00'); setReminder('1h'); setEditingEventId(null);
    setShowDayEvents(false); setShowSheet(true);
  };

  const openEvent = (event) => {
    setText(event.name || 'Evento'); setType(event.type || 'evento'); setDate(localDateValue(event.date));
    setTime(event.time || '09:00'); setReminder(event.notifications?.[0] || event.notification || '15min'); setEditingEventId(event.id);
    setShowDayEvents(false); setShowSheet(true);
  };

  const save = async () => {
    const name = text.trim(); if (!name) return;
    const events = readEvents();
    const existing = events.find(event => String(event.id) === String(editingEventId));
    const existingNotifications = existing?.notifications || (existing?.notification && existing.notification !== 'none' ? [existing.notification] : []);
    const entry = { ...(existing || {}), id: editingEventId || Date.now(), name, date: new Date(`${date}T12:00:00`).toISOString(), time, type, notification: type === 'evento' ? reminder : 'none', notifications: type === 'evento' && reminder !== 'none' ? [reminder, ...existingNotifications.slice(1)] : [] };
    const next = existing ? events.map(event => String(event.id) === String(editingEventId) ? entry : event) : [...events, entry];
    await writeEvents(next, entry);
    setShowSheet(false);
    const eventsForDate = next.filter(event => localDateValue(event.date) === date).sort((a, b) => (a.time || '09:00').localeCompare(b.time || '09:00'));
    setDayEvents(eventsForDate); setShowDayEvents(eventsForDate.length > 0);
  };

  const updateEvent = async (eventId, patch) => {
    const events = readEvents();
    const next = events.map(event => String(event.id) === String(eventId) ? { ...event, ...patch } : event);
    const changed = next.find(event => String(event.id) === String(eventId));
    await writeEvents(next, changed);
    setDayEvents(current => current.map(event => String(event.id) === String(eventId) ? changed : event).sort((a, b) => (a.time || '09:00').localeCompare(b.time || '09:00')));
  };

  const updateNotifications = (event, notifications) => {
    const clean = [...new Set(notifications.filter(value => value && value !== 'none'))];
    updateEvent(event.id, { notifications: clean, notification: clean[0] || 'none' });
  };

  return <>
    <div style={{ position: 'fixed', left: '16px', right: '16px', bottom: '86px', zIndex: 60, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#FFFFFF', border: '1px solid #FDE68A', borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <input value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') openNewEvent(); }} placeholder="Agrega un evento o síntoma..." aria-label="Agrega un evento o síntoma" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '0 6px', fontSize: '13px', color: '#374151', background: 'transparent' }} />
      <div style={{ display: 'flex', gap: '3px', padding: '4px', borderRadius: '999px', background: '#F3F4F6', flexShrink: 0 }}><button onClick={() => setType('evento')} style={{ border: 'none', borderRadius: '999px', padding: '6px 7px', fontSize: '9px', fontWeight: 600, cursor: 'pointer', background: type === 'evento' ? '#10B981' : 'transparent', color: type === 'evento' ? '#FFFFFF' : '#6B7280' }}>Evento</button><button onClick={() => setType('sintoma')} style={{ border: 'none', borderRadius: '999px', padding: '6px 7px', fontSize: '9px', fontWeight: 600, cursor: 'pointer', background: type === 'sintoma' ? '#FBBF24' : 'transparent', color: type === 'sintoma' ? '#FFFFFF' : '#6B7280' }}>Síntoma</button></div>
      <button onClick={openNewEvent} aria-label="Agregar entrada" style={{ width: '36px', height: '36px', flexShrink: 0, border: 'none', borderRadius: '50%', background: '#D946EF', color: '#FFFFFF', fontSize: '22px', fontWeight: 700, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 6px rgba(217,70,239,0.35)' }}>+</button>
    </div>

    {showDayEvents && <div onClick={() => setShowDayEvents(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.32)' }}>
      <section onClick={event => event.stopPropagation()} style={{ width: '100%', maxHeight: 'calc(100dvh - 112px)', overflowY: 'auto', padding: '20px 16px calc(20px + 86px)', borderRadius: '24px 24px 0 0', background: '#FFFDF6', boxShadow: '0 -4px 18px rgba(0,0,0,0.14)', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}><h2 style={{ margin: 0, color: '#1F2937', fontSize: '19px' }}>{new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</h2><button onClick={openNewEvent} aria-label="Agregar evento" style={{ width: '36px', height: '36px', padding: 0, border: 'none', borderRadius: '50%', color: '#FFFFFF', background: '#D946EF', fontWeight: 700, fontSize: '24px', lineHeight: 1, cursor: 'pointer' }}>+</button></div>
        <div style={{ display: 'grid', gap: '8px' }}>{dayEvents.map(event => {
          const notifications = event.type === 'sintoma' ? [] : (event.notifications || (event.notification && event.notification !== 'none' ? [event.notification] : []));
          const isSymptom = event.type === 'sintoma';
          return <article key={event.id} style={{ display: 'grid', gridTemplateColumns: isSymptom ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto', columnGap: '10px', padding: '11px 12px', border: `1px solid ${isSymptom ? '#EAB308' : '#22C55E'}`, borderRadius: '12px', background: '#FFFFFF' }}>
            <button onClick={() => openEvent(event)} style={{ gridColumn: '1 / -1', padding: 0, margin: isSymptom ? 0 : '0 0 7px', border: 'none', background: 'transparent', textAlign: 'left', color: '#1F2937', fontSize: '16px', lineHeight: 1.15, fontWeight: 700, cursor: 'pointer' }}>{event.name || 'Evento'}</button>
            {!isSymptom && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, color: '#6B7280' }}>
              <span aria-hidden="true" style={{ display: 'flex' }}><Clock /></span><span style={{ color: '#374151', fontSize: '14px', fontWeight: 600 }}>{event.time || '09:00'}</span>
              <input ref={node => { timeInputs.current[String(event.id)] = node; }} aria-label={`Hora de ${event.name}`} type="time" value={event.time || '09:00'} onChange={change => updateEvent(event.id, { time: change.target.value })} style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} />
              <button aria-label={`Editar hora de ${event.name}`} onClick={() => { const input = timeInputs.current[String(event.id)]; if (typeof input?.showPicker === 'function') input.showPicker(); else { input?.focus(); input?.click(); } }} style={{ display: 'flex', padding: 0, border: 'none', background: 'transparent', color: '#D946EF', cursor: 'pointer' }}><Pencil /></button>
            </div>}
            {!isSymptom && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', color: '#D946EF' }}>{notifications.length === 0 && <span aria-hidden="true" style={{ display: 'flex' }}><Bell /></span>}<div style={{ display: 'grid', gap: '5px' }}>{notifications.map((value, index) => <div key={`${value}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span aria-hidden="true" style={{ display: 'flex' }}><Bell /></span><div style={{ position: 'relative' }}><button aria-label={`Recordatorio ${index + 1} de ${event.name}`} onClick={() => setOpenReminderMenu(current => current?.eventId === String(event.id) && current?.index === index ? null : { eventId: String(event.id), index })} style={{ width: '112px', padding: '5px 6px', border: '1px solid #D1D5DB', borderRadius: '6px', background: '#FFFFFF', color: '#374151', fontSize: '13px', lineHeight: 1.1, textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer' }}>{reminderOptions.find(option => option.value === value)?.label || value} ▾</button>{openReminderMenu?.eventId === String(event.id) && openReminderMenu?.index === index && <div role="listbox" aria-label={`Opciones de recordatorio ${index + 1} de ${event.name}`} style={{ position: 'absolute', zIndex: 2, top: 'calc(100% + 3px)', left: 0, minWidth: '118px', overflow: 'hidden', border: '1px solid #D1D5DB', borderRadius: '7px', background: '#FFFFFF', boxShadow: '0 3px 8px rgba(0,0,0,0.12)' }}>{reminderOptions.map(option => <button key={option.value} role="option" aria-selected={option.value === value} onClick={() => { updateNotifications(event, notifications.map((notification, notificationIndex) => notificationIndex === index ? option.value : notification)); setOpenReminderMenu(null); }} style={{ display: 'block', width: '100%', padding: '7px 8px', border: 'none', background: option.value === value ? '#FCE7F3' : '#FFFFFF', color: '#374151', fontSize: '13px', textAlign: 'left', cursor: 'pointer' }}>{option.label}</button>)}</div>}</div><button aria-label="Quitar recordatorio" onClick={() => updateNotifications(event, notifications.filter((_, notificationIndex) => notificationIndex !== index))} style={{ border: 'none', padding: 0, background: 'transparent', color: '#D946EF', fontSize: '21px', lineHeight: 1, cursor: 'pointer' }}>×</button></div>)}</div><button aria-label="Agregar recordatorio" onClick={() => updateNotifications(event, [...notifications, '1h'])} style={{ border: 'none', padding: '0 2px', background: 'transparent', color: '#D946EF', fontSize: '22px', lineHeight: 1, cursor: 'pointer' }}>+</button></div>}
          </article>;
        })}</div>
      </section>
    </div>}

    {showSheet && <div onClick={() => setShowSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.32)' }}><div onClick={event => event.stopPropagation()} style={{ width: '100%', padding: '24px 20px calc(24px + 86px)', borderRadius: '24px 24px 0 0', background: '#FFFDF6', boxShadow: '0 -4px 18px rgba(0,0,0,0.14)' }}>
      <h2 style={{ margin: '0 0 20px', color: '#1F2937', fontSize: '19px' }}>{editingEventId ? 'Editar evento' : (text.trim() || (type === 'evento' ? 'Evento' : 'Síntoma'))}</h2>
      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Nombre del {type === 'evento' ? 'evento' : 'síntoma'}</label><input value={text} onChange={event => setText(event.target.value)} placeholder={`Nombre del ${type === 'evento' ? 'evento' : 'síntoma'}`} style={{ boxSizing: 'border-box', width: '100%', marginBottom: '14px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', background: '#FFFFFF' }} />
      <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}><label style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Fecha<input type="date" value={date} onChange={event => setDate(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }} /></label><label style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Hora<input type="time" value={time} onChange={event => setTime(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }} /></label></div>
      {type === 'evento' && <label style={{ display: 'inline-flex', flexDirection: 'column', marginBottom: '18px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Recordatorio<select value={reminder} onChange={event => setReminder(event.target.value)} style={{ minWidth: '165px', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF', color: '#374151', fontSize: '14px' }}>{reminderOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}<option value="none">Sin recordatorio</option></select></label>}
      <div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setShowSheet(false)} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: '#E5E7EB', color: '#4B5563', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button><button onClick={save} disabled={!text.trim()} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: text.trim() ? '#D946EF' : '#E5E7EB', color: '#FFFFFF', fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed' }}>Guardar</button></div>
    </div></div>}
  </>;
}

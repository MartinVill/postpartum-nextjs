'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const todayValue = () => new Date().toISOString().slice(0, 10);

export default function CalendarQuickEntry({ onSaved, selectedDate, onSelectedDateHandled }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('evento');
  const [showSheet, setShowSheet] = useState(false);
  const [date, setDate] = useState(todayValue);
  const [time, setTime] = useState('09:00');
  const [reminder, setReminder] = useState('15min');
  const [showReminderOptions, setShowReminderOptions] = useState(false);
  const [openedFromCalendarDate, setOpenedFromCalendarDate] = useState(false);
  const [savedNotificationHost, setSavedNotificationHost] = useState(null);
  const [savedNotification, setSavedNotification] = useState(null);

  useEffect(() => {
    const notificationLabels = {
      '15min': '15 minutos antes',
      '30min': '30 minutos antes',
      '1h': '1 hora antes',
      '1day': '1 día antes'
    };

    const syncSavedNotification = () => {
      const modal = document.querySelector('.calendar-screen div[style*="z-index: 9999"]');
      const title = modal?.querySelector('h3')?.textContent?.trim();
      const dateText = modal && Array.from(modal.querySelectorAll('p'))
        .map(paragraph => paragraph.textContent.trim())
        .find(value => /^\d{2}\/\d{2}\/\d{2}$/.test(value));
      const notificationLabel = Array.from(modal?.querySelectorAll('label') || [])
        .find(label => label.textContent.trim() === 'Notificación');
      const host = notificationLabel?.parentElement?.parentElement;
      if (!title || !dateText || !host) {
        setSavedNotificationHost(null);
        setSavedNotification(null);
        return;
      }

      const [day, month, shortYear] = dateText.split('/').map(Number);
      const calendarData = JSON.parse(localStorage.getItem('calendarData') || '{}');
      const savedEvent = (calendarData.eventLogs || []).find(entry => {
        const entryDate = new Date(entry.date);
        return entry.name === title && entryDate.getFullYear() === 2000 + shortYear &&
          entryDate.getMonth() === month - 1 && entryDate.getDate() === day;
      });
      const label = notificationLabels[savedEvent?.notification];
      const isAlreadyShown = label && Array.from(modal.querySelectorAll('p:not([data-saved-notification])'))
        .some(paragraph => paragraph.textContent.trim() === label);
      setSavedNotificationHost(host);
      setSavedNotification(isAlreadyShown ? null : label || null);
    };

    const observer = new MutationObserver(syncSavedNotification);
    observer.observe(document.body, { childList: true, subtree: true });
    syncSavedNotification();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setText('');
    setOpenedFromCalendarDate(true);
    setShowSheet(true);
    onSelectedDateHandled?.();
  }, [selectedDate, onSelectedDateHandled]);

  const save = (name = text) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const calendarData = JSON.parse(localStorage.getItem('calendarData') || '{}');
    const legacyEntries = JSON.parse(localStorage.getItem('eventLogs') || '[]');
    const savedEntries = calendarData.eventLogs || [];
    const entries = [...savedEntries];
    legacyEntries.forEach(entry => {
      if (!entries.some(saved => saved.id === entry.id)) entries.push(entry);
    });
    const selectedDate = new Date(`${date}T12:00:00`);
    entries.push({
      id: Date.now(),
      name: trimmedName,
      date: selectedDate.toISOString(),
      time,
      notification: reminder,
      type
    });
    localStorage.setItem('calendarData', JSON.stringify({
      ...calendarData,
      eventLogs: entries
    }));
    localStorage.removeItem('eventLogs');
    setText('');
    setShowSheet(false);
    onSaved();
  };

  const handleAdd = () => {
    setOpenedFromCalendarDate(false);
    setShowSheet(true);
  };

  const typeLabel = type === 'evento' ? 'Evento' : 'Síntoma';
  const sheetTitle = openedFromCalendarDate ? 'Agrega un evento o síntoma' : (text.trim() || typeLabel);
  const nameLabel = `Nombre del ${type === 'evento' ? 'evento' : 'síntoma'}`;
  const reminderOptions = [
    { value: '15min', label: '15 minutos antes' },
    { value: '30min', label: '30 minutos antes' },
    { value: '1h', label: '1 hora antes' },
    { value: 'none', label: 'Sin recordatorio' }
  ];
  const reminderLabel = reminderOptions.find(option => option.value === reminder)?.label;

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
          style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '0 6px', fontSize: '13px', color: '#374151', background: 'transparent' }}
        />
        <div style={{ display: 'flex', gap: '3px', padding: '4px', borderRadius: '999px', background: '#F3F4F6', flexShrink: 0 }}>
          <button onClick={() => setType('evento')} style={{ border: 'none', borderRadius: '999px', padding: '6px 7px', fontSize: '9px', fontWeight: 600, cursor: 'pointer', background: type === 'evento' ? '#10B981' : 'transparent', color: type === 'evento' ? '#FFFFFF' : '#6B7280' }}>Evento</button>
          <button onClick={() => setType('sintoma')} style={{ border: 'none', borderRadius: '999px', padding: '6px 7px', fontSize: '9px', fontWeight: 600, cursor: 'pointer', background: type === 'sintoma' ? '#FBBF24' : 'transparent', color: type === 'sintoma' ? '#FFFFFF' : '#6B7280' }}>Síntoma</button>
        </div>
        <button onClick={handleAdd} aria-label="Agregar entrada" style={{ width: '36px', height: '36px', flexShrink: 0, border: 'none', borderRadius: '50%', background: '#D946EF', color: '#FFFFFF', fontSize: '22px', fontWeight: 700, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 6px rgba(217,70,239,0.35)' }}>+</button>
      </div>

      {showSheet && (
        <div onClick={() => setShowSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.32)' }}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: '100%', padding: '24px 20px calc(24px + 86px)', borderRadius: '24px 24px 0 0', background: '#FFFDF6', boxShadow: '0 -4px 18px rgba(0,0,0,0.14)' }}>
            <h2 style={{ margin: '0 0 20px', color: '#1F2937', fontSize: '19px' }}>{sheetTitle}</h2>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>{nameLabel}</label>
            <input value={text} onChange={(event) => setText(event.target.value)} placeholder={nameLabel} style={{ boxSizing: 'border-box', width: '100%', marginBottom: '14px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', background: '#FFFFFF' }} />
            <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Fecha<input type="date" value={date} onChange={(event) => setDate(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }} /></label>
              <label style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Hora<input type="time" value={time} onChange={(event) => setTime(event.target.value)} style={{ boxSizing: 'border-box', width: '100%', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF' }} /></label>
            </div>
            {type === 'evento' && (
              <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', marginBottom: '18px', fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>
                <span>Recordatorio (opcional)</span>
                <button type="button" onClick={() => setShowReminderOptions(open => !open)} aria-expanded={showReminderOptions} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', minWidth: '165px', marginTop: '6px', padding: '10px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF', color: '#374151', fontSize: '14px', fontWeight: 400, cursor: 'pointer' }}>
                  {reminderLabel}<span aria-hidden="true">⌄</span>
                </button>
                {showReminderOptions && (
                  <div role="listbox" style={{ position: 'absolute', top: '100%', left: 0, zIndex: 80, width: 'max-content', minWidth: '100%', marginTop: '4px', padding: '4px', border: '1px solid #E5E7EB', borderRadius: '10px', background: '#FFFFFF', boxShadow: '0 6px 14px rgba(0,0,0,0.12)' }}>
                    {reminderOptions.map(option => (
                      <button key={option.value} type="button" role="option" aria-selected={reminder === option.value} onClick={() => { setReminder(option.value); setShowReminderOptions(false); }} style={{ display: 'block', width: '100%', padding: '9px 10px', border: 'none', borderRadius: '7px', background: reminder === option.value ? '#FFF0FD' : 'transparent', color: '#374151', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowSheet(false)} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: '#E5E7EB', color: '#4B5563', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => save()} disabled={!text.trim()} style={{ flex: 1, padding: '13px', border: 'none', borderRadius: '12px', background: text.trim() ? '#D946EF' : '#E5E7EB', color: '#FFFFFF', fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed' }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
      {savedNotificationHost && savedNotification && createPortal(
        <p data-saved-notification style={{ margin: '8px 0 0', color: '#1F2937', fontSize: '14px', fontWeight: 500 }}>
          {savedNotification}
        </p>,
        savedNotificationHost
      )}
    </>
  );
}

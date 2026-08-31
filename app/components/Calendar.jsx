'use client';
import { useState, useEffect } from 'react';

export default function Calendar({ userProfile, onBack }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lastMenstruationDate, setLastMenstruationDate] = useState(null);
  const [babyBirthDate, setBabyBirthDate] = useState(null);
  const [sangradoLogs, setSangradoLogs] = useState({});
  const [eventLogs, setEventLogs] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [eventNotification, setEventNotification] = useState('15min');
  const [sangradoColor, setSangradoColor] = useState('');
  const [showAddSangrado, setShowAddSangrado] = useState(false);
  const [eventType, setEventType] = useState('evento');
  const [inputFocused, setInputFocused] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState('');
  const [quickAddNotes, setQuickAddNotes] = useState('');
  const [quickAddTime, setQuickAddTime] = useState('');
  const [editingEventId, setEditingEventId] = useState(null);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [editingMenstruationDate, setEditingMenstruationDate] = useState(false);
  const [editingDateField, setEditingDateField] = useState(false);
  const [editingTimeField, setEditingTimeField] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const [editingNotificationIndex, setEditingNotificationIndex] = useState(-1);
  const [editingEventDate, setEditingEventDate] = useState(false);

  useEffect(() => {
    if (userProfile?.babyBirthDate) {
      setBabyBirthDate(new Date(userProfile.babyBirthDate));
    }
    if (userProfile?.lastMenstruationDate) {
      setLastMenstruationDate(new Date(userProfile.lastMenstruationDate));
    }

    const saved = localStorage.getItem('calendarData');
    if (saved) {
      const data = JSON.parse(saved);
      setSangradoLogs(data.sangradoLogs || {});
      setEventLogs(data.eventLogs || []);
    }
  }, [userProfile]);

  const saveData = (newSangrado, newEvents) => {
    localStorage.setItem('calendarData', JSON.stringify({
      sangradoLogs: newSangrado,
      eventLogs: newEvents
    }));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isPostpartum = () => {
    if (!babyBirthDate) return false;
    const daysSinceBirth = Math.floor((new Date() - babyBirthDate) / (1000 * 60 * 60 * 24));
    return daysSinceBirth < 84;
  };

  const getSangradoPhase = () => {
    if (!babyBirthDate) return null;
    const daysSinceBirth = Math.floor((new Date() - babyBirthDate) / (1000 * 60 * 60 * 24));
    if (daysSinceBirth <= 7) return 'Rubra (Rojo)';
    if (daysSinceBirth <= 14) return 'Serosa (Rosa)';
    if (daysSinceBirth <= 35) return 'Alba (Amarillo)';
    return null;
  };

  const formatDateShort = (date) => {
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  };

  const handleAddSangrado = () => {
    if (!editingDate || !sangradoColor) return;
    const dateStr = editingDate.toDateString();
    const newSangrado = { ...sangradoLogs, [dateStr]: sangradoColor };
    setSangradoLogs(newSangrado);
    saveData(newSangrado, eventLogs);
    setShowAddSangrado(false);
    setSangradoColor('');
    setEditingDate(null);
  };

  const handleAddEvent = () => {
    if (!eventName.trim() || !editingDate) return;

    let newEvents;
    if (editingEventId) {
      // Editar evento existente: eliminar el anterior y crear uno nuevo con los datos actualizados
      newEvents = eventLogs.filter(e => e.id !== editingEventId);
      const updatedEvent = {
        id: editingEventId,
        name: eventName,
        time: eventTime,
        notification: eventNotification,
        date: editingDate.toISOString(),
        type: eventType
      };
      newEvents.push(updatedEvent);
    } else {
      // Crear evento nuevo
      const newEvent = {
        id: Date.now(),
        name: eventName,
        time: eventTime,
        notification: eventNotification,
        date: editingDate.toISOString(),
        type: eventType
      };
      newEvents = [...eventLogs, newEvent];
    }

    setEventLogs(newEvents);
    saveData(sangradoLogs, newEvents);
    setEventName('');
    setEventTime('09:00');
    setEventNotification('15min');
    setEditingDate(null);
    setShowAddEvent(false);
    setEventType('evento');
    setEditingEventId(null);
    setNotificationList([]);
  };

  const hasEvent = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return eventLogs.some(e => new Date(e.date).toDateString() === checkDate.toDateString());
  };

  const getSangradoForDay = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return sangradoLogs[checkDate.toDateString()];
  };

  const isToday = (day) => {
    const today = new Date();
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate.toDateString() === today.toDateString();
  };

  const getMenstruationDays = () => {
    if (!lastMenstruationDate) return [];
    const menstrDays = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(lastMenstruationDate);
      date.setDate(date.getDate() + i);
      menstrDays.push(date.toDateString());
    }
    return menstrDays;
  };

  const isMenstruationDay = (day) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return !isPostpartum() && getMenstruationDays().includes(checkDate.toDateString());
  };

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getSangradoColor = (colorType) => {
    const colors = {
      'rojo-brillante': { bg: '#FEE2E2', border: '#DC2626', text: '#7F1D1D' },
      'rosa': { bg: '#FDD7E8', border: '#EC4899', text: '#831843' },
      'marron': { bg: '#FED7AA', border: '#EA580C', text: '#7C2D12' },
      'amarillo': { bg: '#FEF3C7', border: '#EAB308', text: '#713F12' }
    };
    return colors[colorType] || { bg: '#F5F5F5', border: '#E5E7EB', text: '#1F2937' };
  };

  const postpartum = isPostpartum();
  const sangradoPhase = getSangradoPhase();

  return (
    <>
      {/* CAPA FIJA: Calendario - SE CONTRAE AL HACER FOCUS */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'calc(100dvh - 90px)',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        padding: '16px',
        paddingBottom: inputFocused ? '0px' : '16px',
        zIndex: 50,
        transition: 'padding 0.2s ease'
      }}>
        {/* Calendario y contenido */}
        <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            fontSize: '24px',
            color: '#D946EF',
            fontWeight: 'bold'
          }}
        >
          &lt;
        </button>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#D946EF', margin: '0' }}>
          Mi calendario
        </h1>
        <div style={{ width: '40px' }} />
      </div>

      {/* Postpartum Status */}
      {postpartum && sangradoPhase && (
        <div style={{
          background: 'linear-gradient(135deg, #FED7AA 0%, #FEE4E2 100%)',
          padding: '12px 16px',
          borderRadius: '16px',
          marginBottom: '16px',
          border: '2px solid #F59E0B',
          fontSize: '12px',
          color: '#92400E',
          fontWeight: '600'
        }}>
          📍 Fase: {sangradoPhase}
        </div>
      )}

      {/* Info Row: Last Menstruation + Legend */}
      {lastMenstruationDate && !postpartum && (
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          alignItems: 'flex-start'
        }}>
          {/* Last Menstruation */}
          <div style={{
            background: 'white',
            padding: '11px 16px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 'none'
          }}>
            <div>
              <p style={{ fontSize: '13px', color: '#999', margin: '0', fontWeight: '600' }}>Última menstruación</p>
              <p style={{ fontSize: '13px', color: '#1F2937', margin: '2px 0 0 0', fontWeight: '700' }}>
                {formatDateShort(lastMenstruationDate)}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMenstruationDate(true);
                setPickerMonth(lastMenstruationDate || new Date());
                setShowCalendarPicker(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#D946EF',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div style={{
            background: 'white',
            padding: '12px 12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            flex: 1,
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.4' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#DC2626',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '8px', color: '#1F2937', fontWeight: '500', margin: '0' }}>Mi ciclo</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.4' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#22C55E',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '8px', color: '#1F2937', fontWeight: '500', margin: '0' }}>Mis eventos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: '1.4' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                background: '#EAB308',
                flexShrink: 0
              }} />
              <span style={{ fontSize: '8px', color: '#1F2937', fontWeight: '500', margin: '0' }}>Mis síntomas</span>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} style={{
          background: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          color: '#D946EF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>◀</button>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1F2937', margin: '0' }}>
          {currentDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} style={{
          background: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          color: '#D946EF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>▶</button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '12px' }}>
          {days.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#999', padding: '8px 0' }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} />;
            }

            const sangrado = getSangradoForDay(day);
            const sangradoStyle = sangrado ? getSangradoColor(sangrado) : null;
            const event = hasEvent(day);
            const today = isToday(day);
            const menstruation = isMenstruationDay(day);

            // Determinar si el día está en el rango de menstruación (última menstruación + 4 días)
            const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            let isMenstruationPeriod = false;
            if (lastMenstruationDate) {
              const menstrStart = new Date(lastMenstruationDate);
              const menstrEnd = new Date(lastMenstruationDate);
              menstrEnd.setDate(menstrEnd.getDate() + 4);
              isMenstruationPeriod = checkDate >= menstrStart && checkDate <= menstrEnd;
            }

            // Determinar el tipo de evento para el borde
            const eventsInDay = eventLogs.filter(e => new Date(e.date).toDateString() === checkDate.toDateString());
            const hasSintoma = eventsInDay.some(e => e.type === 'sintoma');
            const hasEvento = eventsInDay.some(e => e.type === 'evento');

            return (
              <div
                key={day}
                onClick={() => {
                  const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  setEditingDate(selectedDate);

                  // Buscar si hay un evento en esta fecha
                  const eventInDate = eventLogs.find(e => new Date(e.date).toDateString() === selectedDate.toDateString());

                  if (eventInDate) {
                    setEditingEventId(eventInDate.id);
                    setEventName(eventInDate.name);
                    setEventTime(eventInDate.time || '09:00');
                    setEventNotification(eventInDate.notification || '15min');
                    setEventType(eventInDate.type || 'evento');
                  } else {
                    setEditingEventId(null);
                    setEventName('');
                    setEventTime('09:00');
                    setEventNotification('15min');
                  }

                  setShowAddEvent(true);
                }}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: sangradoStyle ? sangradoStyle.bg : menstruation ? '#FEE2E2' : today ? '#F3E8FF' : '#F9F9F9',
                  color: sangradoStyle ? sangradoStyle.text : menstruation ? '#DC2626' : '#1F2937',
                  border: isMenstruationPeriod ? '2px dashed #DC2626' : sangradoStyle ? `2px solid ${sangradoStyle.border}` : hasSintoma ? '2px solid #EAB308' : hasEvento ? '2px solid #22C55E' : menstruation ? '2px solid #DC2626' : today ? '2px solid #D946EF' : '1px solid #E5E7EB',
                  outline: isMenstruationPeriod && today ? '2px solid #D946EF' : 'none',
                  outlineOffset: '-4px',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '12px' }}>{day}</div>
                {event && <div style={{ fontSize: '6px', marginTop: '2px', color: '#D946EF' }}>●●●</div>}
                {sangrado && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      setShowAddSangrado(true);
                    }}
                    style={{
                      fontSize: '10px',
                      position: 'absolute',
                      bottom: '2px',
                      cursor: 'pointer',
                      background: sangradoStyle.border,
                      color: 'white',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontWeight: '700'
                    }}
                  >
                    📍
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* CAPA FIJA: Input - SE MUEVE CON TECLADO */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90px',
        display: 'flex',
        gap: '8px',
        padding: '16px',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        <input
          type="text"
          placeholder={inputFocused ? '' : 'Agrega un evento o tus síntomas'}
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 200)}
          style={{
            flex: 1,
            padding: '12px 16px',
            paddingRight: '56px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontFamily: 'inherit',
            background: '#EFEFEF',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && eventName.trim()) {
              setEditingDate(new Date());
              handleAddEvent();
            }
          }}
        />

        {inputFocused && (
          <div style={{
            position: 'absolute',
            right: '68px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: '4px',
            zIndex: 10
          }}>
            <button
              onClick={() => setEventType(eventType === 'evento' ? 'evento' : 'evento')}
              onMouseDown={(e) => {
                e.preventDefault();
                setEventType('evento');
              }}
              style={{
                background: eventType === 'evento' ? '#22C55E' : '#E5E7EB',
                border: 'none',
                padding: '5px 8px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '600',
                color: eventType === 'evento' ? 'white' : '#999',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              title="Evento"
            >
              Evento
            </button>
            <button
              onClick={() => setEventType(eventType === 'sintoma' ? 'sintoma' : 'sintoma')}
              onMouseDown={(e) => {
                e.preventDefault();
                setEventType('sintoma');
              }}
              style={{
                background: eventType === 'sintoma' ? '#EAB308' : '#E5E7EB',
                border: 'none',
                padding: '5px 8px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: '600',
                color: eventType === 'sintoma' ? '#333' : '#999',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
              title="Síntoma"
            >
              Síntoma
            </button>
          </div>
        )}

        <button
          onClick={() => {
            if (eventName.trim()) {
              setShowQuickAdd(true);
              setQuickAddDate(new Date().toISOString().split('T')[0]);
            }
          }}
          style={{
            position: 'absolute',
            right: '22px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '36px',
            height: '36px',
            padding: '0',
            background: '#D946EF',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#C026D3';
            e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#D946EF';
            e.target.style.boxShadow = '0 2px 8px rgba(217, 70, 239, 0.2)';
          }}
        >
          +
        </button>
      </div>

      {/* Modal: Add Sangrado */}
      {showAddSangrado && (
        <div onClick={() => setShowAddSangrado(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: '70px',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          overflowY: 'auto'
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '24px 24px 0 0',
            padding: '24px 16px',
            paddingBottom: '32px',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '20px', textAlign: 'center' }}>
              📍 Registrar sangrado
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '12px', color: '#666', margin: '0', fontWeight: '600' }}>
                Fecha: {editingDate?.toLocaleDateString('es-AR')}
              </p>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                  Color de sangrado
                </label>
                <select
                  value={sangradoColor}
                  onChange={(e) => setSangradoColor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#F5F5F5',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                >
                  <option value="">Selecciona color...</option>
                  <option value="rojo-brillante">🔴 Rojo brillante</option>
                  <option value="rosa">🟠 Rosa</option>
                  <option value="marron">🟤 Marrón</option>
                  <option value="amarillo">🟡 Amarillo-blanco</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAddSangrado(false)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSangrado}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#D946EF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Event */}
      {showAddEvent && !showAddSangrado && (
        <div onClick={() => setShowAddEvent(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: '70px',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          overflowY: 'auto'
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '24px 24px 0 0',
            padding: '24px 16px',
            paddingBottom: '32px',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937', marginBottom: '20px', textAlign: 'center', margin: '0 0 20px 0' }}>
              {eventName}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Fecha */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '4px' }}>Fecha</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <p style={{ fontSize: '14px', color: '#1F2937', margin: '0', fontWeight: '500' }}>
                    {editingDate?.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </p>
                  <button
                    onClick={() => {
                      setEditingEventDate(true);
                      setPickerMonth(editingDate || new Date());
                      setShowCalendarPicker(true);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#D946EF',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {eventType === 'evento' && (
                <>
                  {/* Hora */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '4px' }}>Hora</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <p style={{ fontSize: '14px', color: '#1F2937', margin: '0', fontWeight: '500' }}>
                        {eventTime ? new Date(`2000-01-01T${eventTime}`).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </p>
                      <button
                        onClick={() => setEditingTimeField(!editingTimeField)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#D946EF',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {editingTimeField && (
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        borderRadius: '12px',
                        background: '#F5F5F5',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit'
                      }}
                    />
                  )}

                  {/* Notificación */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: notificationList.length > 0 ? '8px' : '0' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', margin: '0' }}>
                        Notificación
                      </label>
                      <button
                        onClick={() => {
                          setNotificationList([...notificationList, '15min']);
                          setEditingNotificationIndex(notificationList.length);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#D946EF',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Notificaciones agregadas */}
                    {notificationList.map((notif, index) => (
                      <div key={index} style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <p style={{ fontSize: '14px', color: '#1F2937', margin: '0', fontWeight: '500' }}>
                            {notif === '15min' ? '15 minutos antes' :
                             notif === '30min' ? '30 minutos antes' :
                             notif === '1h' ? '1 hora antes' :
                             notif === '1day' ? '1 día antes' : 'Sin notificación'}
                          </p>
                          <button
                            onClick={() => setEditingNotificationIndex(index)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#D946EF',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => setNotificationList(notificationList.filter((_, i) => i !== index))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#DC2626',
                              cursor: 'pointer',
                              padding: '2px',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>

                        {editingNotificationIndex === index && (
                          <select
                            value={notif}
                            onChange={(e) => {
                              const newList = [...notificationList];
                              newList[index] = e.target.value;
                              setNotificationList(newList);
                            }}
                            onBlur={() => setEditingNotificationIndex(-1)}
                            autoFocus
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #D946EF',
                              borderRadius: '8px',
                              background: '#F5F5F5',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginTop: '4px'
                            }}
                          >
                            <option value="15min">15 minutos antes</option>
                            <option value="30min">30 minutos antes</option>
                            <option value="1h">1 hora antes</option>
                            <option value="1day">1 día antes</option>
                            <option value="none">Sin notificación</option>
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowAddEvent(false)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (editingEventId) {
                      // Eliminar el evento existente
                      const newEvents = eventLogs.filter(e => e.id !== editingEventId);
                      setEventLogs(newEvents);
                      saveData(sangradoLogs, newEvents);
                    }
                    setEventName('');
                    setEventTime('09:00');
                    setEventNotification('15min');
                    setEditingEventId(null);
                    setShowAddEvent(false);
                  }}
                  title={editingEventId ? "Eliminar evento" : "Limpiar"}
                  style={{
                    padding: '12px 16px',
                    background: editingEventId ? '#FEE2E2' : '#F5F5F5',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: editingEventId ? '#DC2626' : '#D946EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = editingEventId ? '#FECACA' : '#E5E7EB';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = editingEventId ? '#FEE2E2' : '#F5F5F5';
                  }}
                  style={{
                    padding: '12px 16px',
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: '#D946EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#E5E7EB';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#F5F5F5';
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
                <button
                  onClick={handleAddEvent}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#D946EF',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Picker Modal */}
      {showCalendarPicker && (
        <div onClick={() => setShowCalendarPicker(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '20px',
            padding: '20px',
            maxWidth: '320px',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.1)'
          }}>
            {/* Navegación de meses */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <button
                onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1))}
                style={{
                  background: '#F5F5F5',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ◀
              </button>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                {pickerMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1))}
                style={{
                  background: '#F5F5F5',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ▶
              </button>
            </div>

            {/* Días de la semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#999', padding: '4px 0' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendario */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {(() => {
                const daysInMonth = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate();
                const firstDay = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1).getDay();
                const days = [];

                for (let i = 0; i < firstDay; i++) {
                  days.push(null);
                }
                for (let i = 1; i <= daysInMonth; i++) {
                  days.push(i);
                }

                return days.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} />;
                  }

                  const isSelected = quickAddDate === `${pickerMonth.getFullYear()}-${String(pickerMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        const selectedDate = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), day);
                        if (editingMenstruationDate) {
                          setLastMenstruationDate(selectedDate);
                          setEditingMenstruationDate(false);
                        } else if (editingEventDate) {
                          setEditingDate(selectedDate);
                          setEditingEventDate(false);
                        } else {
                          setQuickAddDate(selectedDate.toISOString().split('T')[0]);
                        }
                        setShowCalendarPicker(false);
                      }}
                      style={{
                        padding: '8px',
                        background: isSelected ? '#D946EF' : '#F5F5F5',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isSelected ? 'white' : '#1F2937',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.target.style.background = '#E5E7EB';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.target.style.background = '#F5F5F5';
                      }}
                    >
                      {day}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Popup: Quick Add Event/Symptom */}
      {showQuickAdd && (
        <div onClick={() => setShowQuickAdd(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: '70px',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-end',
          overflowY: 'auto'
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: 'white',
            borderRadius: '24px 24px 0 0',
            padding: '24px 16px',
            paddingBottom: '32px',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.1)',
            maxHeight: 'calc(100vh - 140px)',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1F2937', marginBottom: '20px', textAlign: 'center' }}>
              {eventType === 'sintoma' ? '🤕 Síntoma' : '📅 Evento'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                  Nombre
                </label>
                <div style={{
                  padding: '12px 16px',
                  background: '#F5F5F5',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#1F2937'
                }}>
                  {eventName}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                  Fecha
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const today = new Date();
                      setQuickAddDate(today.toISOString().split('T')[0]);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: quickAddDate === new Date().toISOString().split('T')[0] ? '#D946EF' : '#F5F5F5',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: quickAddDate === new Date().toISOString().split('T')[0] ? 'white' : '#666',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setQuickAddDate(yesterday.toISOString().split('T')[0]);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: quickAddDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? '#D946EF' : '#F5F5F5',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: quickAddDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 'white' : '#666',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Ayer
                  </button>
                  <button
                    onClick={() => {
                      setShowCalendarPicker(true);
                      setPickerMonth(new Date(quickAddDate));
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: '#F5F5F5',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#666',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Otro día
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                  Hora (opcional)
                </label>
                <input
                  type="time"
                  value={quickAddTime}
                  onChange={(e) => setQuickAddTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#F5F5F5',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#666', display: 'block', marginBottom: '8px' }}>
                  Notas (opcional)
                </label>
                <textarea
                  value={quickAddNotes}
                  onChange={(e) => setQuickAddNotes(e.target.value)}
                  placeholder="Agrega notas adicionales..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '12px',
                    background: '#F5F5F5',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    minHeight: '80px',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={() => {
                    setEventName('');
                    setQuickAddNotes('');
                    setQuickAddDate(new Date().toISOString().split('T')[0]);
                  }}
                  title="Limpiar"
                  style={{
                    padding: '12px 16px',
                    background: '#F5F5F5',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: '#D946EF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#E5E7EB';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#F5F5F5';
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>

                <button
                  onClick={() => {
                    const [year, month, day] = quickAddDate.split('-');
                    const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

                    const newEvent = {
                      id: Date.now(),
                      name: eventName,
                      date: selectedDate.toISOString(),
                      time: quickAddTime,
                      notes: quickAddNotes,
                      type: eventType
                    };
                    const newEvents = [...eventLogs, newEvent];
                    setEventLogs(newEvents);
                    saveData(sangradoLogs, newEvents);

                    setEventName('');
                    setQuickAddNotes('');
                    setQuickAddDate('');
                    setQuickAddTime('');
                    setShowQuickAdd(false);
                    setInputFocused(false);
                    setEventType('evento');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: eventType === 'sintoma' ? '#EAB308' : '#22C55E',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: eventType === 'sintoma' ? '#333' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

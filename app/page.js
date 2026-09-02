'use client';
import { useState, useEffect } from 'react';
import { selectVocative, getRandomGreetings } from '@/app/utils/vocativeManager';
import ChatSection from './components/ChatSection';
import OnboardingForm from './components/OnboardingForm';
import EnergyCheckIn from './components/EnergyCheckIn';
import DynamicFeed from './components/DynamicFeed';
import Calendar from './components/Calendar';
import NightReflection from './components/NightReflection';
import DailyChallenge from './components/DailyChallenge';
import BodyAndCalmModule from './components/BodyAndCalm/BodyAndCalmModule';
import BottomNavigationBar from './components/BottomNavigationBar';
import HomeGrid from './components/HomeGrid';
import Profile from './components/Profile';
import CalendarQuickEntry from './components/CalendarQuickEntry';
import { syncCalendarReminder } from './utils/calendarReminderSync';

export default function Home() {
  const [calendarEntryDate, setCalendarEntryDate] = useState(null);
  const [chatInputBottom, setChatInputBottom] = useState(70);
  const [state, setState] = useState({
    userId: null,
    userProfile: null,
    isReady: false,
    showChat: false,
    showReflection: false,
    showCalendar: false,
    showBodyAndCalm: false,
    showReto: false,
    showProfile: false,
    activeTab: 'home',
    energyScore: null,
    lastCheckInDate: null,
    isMenuOpen: false,
    ongoingChallenge: null,
    showRetoCelebration: false,
    showRetoFeedbackModal: false,
    calendarKey: 0
  });

  /**
   * Centralized navigation handler
   * Closes all sub-cards/modals and switches to target view
   * Ensures footer works globally across all screens
   */
  const handleNavigate = (targetTab) => {
    setState(prev => ({
      ...prev,
      activeTab: targetTab,
      showChat: targetTab === 'chat',
      showCalendar: targetTab === 'calendar',
      showProfile: targetTab === 'profile',
      showBodyAndCalm: targetTab === 'cuerpo-calma',
      showReto: false,
      showReflection: false,
      showRetoCelebration: false,
      showRetoFeedbackModal: false,
      isMenuOpen: false
    }));
  };

  const handleCalendarDateClick = (event) => {
    const cell = event.target.closest('div[style*="cursor: pointer"]');
    if (!cell || !cell.parentElement?.getAttribute('style')?.includes('grid-template-columns')) return;

    const day = Number(cell.textContent.trim().match(/^\d+/)?.[0]);
    const monthHeading = document.querySelector('.calendar-screen h2')?.textContent?.trim();
    const match = monthHeading?.match(/([a-záéíóúñ]+) de (\d{4})/i);
    if (!Number.isInteger(day) || day < 1 || day > 31 || !match) return;

    const months = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
    };
    const month = months[match[1].toLowerCase()];
    const year = Number(match[2]);
    if (month === undefined || !Number.isInteger(year)) return;

    event.preventDefault();
    event.stopPropagation();
    setCalendarEntryDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  };

  const persistCalendarNotification = (event) => {
    const saveButton = event.target.closest('button');
    if (!saveButton || saveButton.textContent.trim() !== 'Guardar') return;

    const modal = saveButton.closest('div[style*="z-index: 9999"]');
    if (!modal || !modal.textContent.includes('Notificación')) return;

    const title = modal.querySelector('h3')?.textContent?.trim();
    const dateText = Array.from(modal.querySelectorAll('p'))
      .map(paragraph => paragraph.textContent.trim())
      .find(value => /^\d{2}\/\d{2}\/\d{2}$/.test(value));
    // The modal's text includes every option in each <select>, so reading
    // textContent would incorrectly save all reminders. Persist exactly the
    // values the user selected instead.
    const notifications = [...new Set(
      Array.from(modal.querySelectorAll('select'))
        .map(select => select.value)
        .filter(value => value && value !== 'none')
    )];

    if (!title || !dateText || notifications.length === 0) return;

    window.setTimeout(() => {
      const [day, month, shortYear] = dateText.split('/').map(Number);
      const year = 2000 + shortYear;
      const saved = localStorage.getItem('calendarData');
      if (!saved) return;

      const calendarData = JSON.parse(saved);
      const eventLogs = (calendarData.eventLogs || []).map(entry => {
        const entryDate = new Date(entry.date);
        const isSameEvent = entry.name === title &&
          entryDate.getFullYear() === year &&
          entryDate.getMonth() === month - 1 &&
          entryDate.getDate() === day;
        return isSameEvent ? { ...entry, notification: notifications[0], notifications } : entry;
      });
      localStorage.setItem('calendarData', JSON.stringify({ ...calendarData, eventLogs }));
      const updatedEvent = eventLogs.find(entry => {
        const entryDate = new Date(entry.date);
        return entry.name === title && entryDate.getFullYear() === year && entryDate.getMonth() === month - 1 && entryDate.getDate() === day;
      });
      if (updatedEvent) syncCalendarReminder(updatedEvent).catch(error => console.warn('[CALENDAR] Reminder sync failed:', error));
    }, 100);
  };

  const addCalendarNotification = (event) => {
    const addButton = event.target.closest('button');
    if (!addButton || addButton.textContent.trim() !== '+') return false;

    const modal = addButton.closest('div[style*="z-index: 9999"]');
    if (!modal || !modal.textContent.includes('Notificación')) return false;

    const title = modal.querySelector('h3')?.textContent?.trim();
    const dateText = Array.from(modal.querySelectorAll('p'))
      .map(paragraph => paragraph.textContent.trim())
      .find(value => /^\d{2}\/\d{2}\/\d{2}$/.test(value));
    if (!title || !dateText) return false;

    event.preventDefault();
    event.stopPropagation();

    const [day, month, shortYear] = dateText.split('/').map(Number);
    const year = 2000 + shortYear;
    const calendarData = JSON.parse(localStorage.getItem('calendarData') || '{}');
    const eventLogs = (calendarData.eventLogs || []).map(entry => {
      const entryDate = new Date(entry.date);
      const isSameEvent = entry.name === title &&
        entryDate.getFullYear() === year &&
        entryDate.getMonth() === month - 1 &&
        entryDate.getDate() === day;
      if (!isSameEvent) return entry;

      const notifications = entry.notifications || (entry.notification && entry.notification !== 'none' ? [entry.notification] : []);
      return { ...entry, notification: notifications[0] || '15min', notifications: [...notifications, '15min'] };
    });
    localStorage.setItem('calendarData', JSON.stringify({ ...calendarData, eventLogs }));
    const updatedEvent = eventLogs.find(entry => {
      const entryDate = new Date(entry.date);
      return entry.name === title && entryDate.getFullYear() === year && entryDate.getMonth() === month - 1 && entryDate.getDate() === day;
    });
    if (updatedEvent) syncCalendarReminder(updatedEvent).catch(error => console.warn('[CALENDAR] Reminder sync failed:', error));
    window.dispatchEvent(new Event('calendar-notifications-updated'));
    return true;
  };

  const handleCalendarInteraction = (event) => {
    if (addCalendarNotification(event)) return;
    persistCalendarNotification(event);
    handleCalendarDateClick(event);
  };

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    if (state.isMenuOpen && state.showChat) {
      const handleClickOutside = () => {
        setState(prev => ({ ...prev, isMenuOpen: false }));
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [state.isMenuOpen, state.showChat]);

  // Keep the chat composer attached to the visible viewport on mobile. Some
  // browsers overlay the virtual keyboard instead of resizing the layout.
  useEffect(() => {
    if (!state.showChat) return;

    const viewport = window.visualViewport;
    const updateChatViewport = () => {
      const keyboardHeight = viewport
        ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
        : 0;
      setChatInputBottom(keyboardHeight > 0 ? keyboardHeight : 70);
    };

    window.scrollTo(0, 0);
    updateChatViewport();
    viewport?.addEventListener('resize', updateChatViewport);
    viewport?.addEventListener('scroll', updateChatViewport);
    window.addEventListener('resize', updateChatViewport);

    return () => {
      viewport?.removeEventListener('resize', updateChatViewport);
      viewport?.removeEventListener('scroll', updateChatViewport);
      window.removeEventListener('resize', updateChatViewport);
    };
  }, [state.showChat]);

  useEffect(() => {
    try {
      // Limpiar keys legacy que pueden haber causado el problema
      localStorage.removeItem('dailyChallengeData');
      localStorage.removeItem('dailyChallenge');
      console.log('[INIT] Legacy challenge keys cleaned');

      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Math.random().toString(36).substr(2, 20)}`;
        localStorage.setItem('userId', userId);
      }

      let profileJson = localStorage.getItem('userProfile');
      let userProfile = profileJson ? JSON.parse(profileJson) : null;

      if (userProfile && !userProfile.trialStartDate) {
        userProfile = {
          ...userProfile,
          trialStartDate: new Date().toISOString(),
          email: userProfile.email || 'mama@postpartumrecovery.app'
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }

      const today = new Date().toDateString();
      const lastCheckInDate = localStorage.getItem('lastCheckInDate');

      // Restaurar reto activo SOLO si tiene estado explícito 'in_progress'
      let ongoingChallenge = null;
      try {
        const savedChallengeJson = localStorage.getItem('postpartum_active_challenge');
        if (savedChallengeJson) {
          const parsed = JSON.parse(savedChallengeJson);
          // Solo restaurar si tiene timestamp 'started' y status 'in_progress'
          if (parsed && parsed.started && parsed.status === 'in_progress') {
            ongoingChallenge = parsed;
            console.log('[CHALLENGE RESTORE] Reto restaurado con status in_progress');
          } else {
            console.log('[CHALLENGE RESTORE] Reto descartado - status inválido o ausente');
          }
        }
      } catch (error) {
        console.error('[CHALLENGE RESTORE] Error parseando reto guardado:', error);
      }

      const requestedTab = new URLSearchParams(window.location.search).get('tab');
      setState(prev => ({
        ...prev,
        userId,
        userProfile,
        lastCheckInDate,
        ongoingChallenge,
        activeTab: requestedTab === 'calendar' ? 'calendar' : prev.activeTab,
        showCalendar: requestedTab === 'calendar',
        isReady: true
      }));
    } catch (error) {
      console.error('[INIT]', error);
      setState(prev => ({ ...prev, isReady: true }));
    }
  }, []);

  // Calcular copia dinámica basada en moodScore (solo client-side)
  const getDynamicHeaderCopy = () => {
    // Proteger contra SSR
    if (typeof window === 'undefined') {
      return {
        title: `¡Hola, ${state.userProfile?.name || 'hermosa'}! 💜`,
        subtitle: 'Qué bueno tenerte aquí. ¿En qué nos enfocamos hoy?'
      };
    }

    try {
      const dailyCheckInStr = localStorage.getItem('dailyCheckIn');
      let moodScore = null;

      if (dailyCheckInStr) {
        const dailyCheckIn = JSON.parse(dailyCheckInStr);
        moodScore = dailyCheckIn.voiceNote?.moodScore || dailyCheckIn.energyMorning;
      }

      const userName = state.userProfile?.name || 'hermosa';
      const nicknames = state.userProfile?.favoriteTermsOfEndearment || [];

      // Determinar título y subtítulo basado en rango de moodScore
      let title, subtitle;

      if (moodScore && moodScore >= 1 && moodScore <= 4) {
        // Ánimo bajo - Necesita apoyo
        title = `Vamos a hacer algo para que te sientas mejor 💜`;
        subtitle = `¿Qué te gustaría hacer hoy?`;
      } else if (moodScore && moodScore >= 8 && moodScore <= 10) {
        // Energía alta - Muy bien (usar vocativo dinámico)
        const vocative = selectVocative(userName, nicknames);
        const lowercaseVocative = vocative.toLowerCase();
        title = vocative ? `¡Me alegra verte bien ${lowercaseVocative}! ✨` : `¡Qué alegría! Te ves muy bien hoy ✨`;
        subtitle = `¿Qué quieres hacer hoy?`;
      } else {
        // Neutral/estable (5-7 o sin score) - usar greeting dinámico
        const { greeting } = getRandomGreetings(userName, nicknames);
        title = greeting;
        subtitle = `¿En qué nos enfocamos hoy?`;
      }

      return { title, subtitle };
    } catch (error) {
      console.error('[HEADER] Error reading mood score:', error);
      return {
        title: `¡Hola, ${state.userProfile?.name || 'hermosa'}! 💜`,
        subtitle: 'Qué bueno tenerte aquí. ¿En qué nos enfocamos hoy?'
      };
    }
  };

  const headerCopy = getDynamicHeaderCopy();

  if (!state.isReady) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)'
      }} />
    );
  }

  // Onboarding
  if (!state.userProfile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        padding: '20px',
        paddingTop: '40px',
        overflow: 'auto',
        paddingBottom: '100px'
      }}>
        <OnboardingForm
          onComplete={(formData) => {
            const profile = {
              ...formData,
              createdAt: new Date().toISOString()
            };
            localStorage.setItem('userProfile', JSON.stringify(profile));
            setState(prev => ({
              ...prev,
              userProfile: profile
            }));
          }}
        />
      </div>
    );
  }

  const renderActiveView = () => {
    // Sub-pantalla: Mi Perfil
    if (state.showProfile) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#FFFDF6',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '70px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#FFFDF6',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 40
          }}>
            <button
              onClick={() => setState(prev => ({ ...prev, showProfile: false, activeTab: 'home' }))}
              style={{
                position: 'absolute',
                left: '16px',
                background: 'white',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
                e.target.style.background = '#FFF8FE';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                e.target.style.background = 'white';
              }}
            >
              <span style={{ fontSize: '24px', color: '#D946EF', fontWeight: 'bold' }}>&lt;</span>
            </button>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#D946EF',
              margin: '0',
              letterSpacing: '-0.5px',
              lineHeight: '1.1',
              textAlign: 'center',
              flex: 1
            }}>
              Mi Perfil
            </h1>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <Profile
              userProfile={state.userProfile}
              onBack={() => setState(prev => ({ ...prev, showProfile: false, activeTab: 'home' }))}
            />
          </div>
        </div>
      );
    }

    // Sub-pantalla: Chat
    if (state.showChat) {
      return (
        <div className="chat-view" style={{
          height: '100%',
          minHeight: 0,
          background: '#FFFDF6',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          '--chat-input-bottom': `${chatInputBottom}px`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#FFFDF6',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            flexShrink: 0,
            zIndex: 40
          }}>
            <button
              onClick={() => setState(prev => ({ ...prev, showChat: false }))}
              style={{
                position: 'absolute',
                left: '16px',
                background: 'white',
                border: 'none',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
                e.target.style.background = '#FFF8FE';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                e.target.style.background = 'white';
              }}
            >
              <span style={{ fontSize: '24px', color: '#D946EF', fontWeight: 'bold' }}>&lt;</span>
            </button>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#D946EF',
              margin: '0',
              letterSpacing: '-0.5px',
              lineHeight: '1.1',
              textAlign: 'center',
              flex: 1
            }}>
              Hablemos
            </h1>
          </div>
          <div className="chat-shell" style={{ flex: 1, minHeight: 0 }}>
            {state.userId && (
              <ChatSection userId={state.userId} initialProfile={state.userProfile} />
            )}
          </div>
        </div>
      );
    }

    // Sub-pantalla: Calendario
    if (state.showCalendar) {
      return (
        <div className="calendar-screen" onClickCapture={handleCalendarInteraction} style={{ paddingBottom: '70px', background: '#FFFDF6' }}>
          <Calendar key={state.calendarKey} userProfile={state.userProfile} onBack={() => setState(prev => ({ ...prev, showCalendar: false, activeTab: 'home' }))} />
          <CalendarQuickEntry
            selectedDate={calendarEntryDate}
            onSelectedDateHandled={() => setCalendarEntryDate(null)}
            onSaved={() => setState(prev => ({ ...prev, calendarKey: prev.calendarKey + 1 }))}
          />
        </div>
      );
    }

    // Sub-pantalla: Reto 30 Días
    if (state.showReto && state.energyScore) {
      return (
        <div style={{ paddingBottom: '70px' }}>
          <DailyChallenge
            energy={state.energyScore}
            userProfile={state.userProfile}
            onBack={() => {
              // Solo volver sin iniciar reto
              setState(prev => ({
                ...prev,
                showReto: false
              }));
            }}
            onChallengeStart={(challengeInfo) => {
              const challengeData = {
                id: `challenge_${Date.now()}`,
                title: challengeInfo?.title || 'Reto del día',
                emoji: challengeInfo?.emoji || '🎯',
                energy: state.energyScore,
                started: new Date().toISOString(),
                status: 'in_progress'
              };
              localStorage.setItem('postpartum_active_challenge', JSON.stringify(challengeData));
              console.log('[CHALLENGE START] Reto iniciado con status in_progress');
              setState(prev => ({
                ...prev,
                showReto: false,
                ongoingChallenge: challengeData
              }));
            }}
          />
        </div>
      );
    }

    // Sub-pantalla: Cuerpo y Calma
    if (state.showBodyAndCalm) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#FFFDF6',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '70px'
        }}>
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <BodyAndCalmModule
              userProfile={state.userProfile}
              onBack={() => setState(prev => ({ ...prev, showBodyAndCalm: false }))}
            />
          </div>
        </div>
      );
    }

    // Pantalla principal: Home Grid
    return (
      <div style={{
        paddingTop: '12px',
        paddingBottom: '70px',
        minHeight: '100vh',
        width: '100%',
        background: '#FFFDF6'
      }}>
        {/* Header personalizado - Sistema de diseño nativo magenta con copy dinámico */}
        <div className="w-full max-w-md mx-auto text-center pt-6 pb-2 px-6 flex flex-col items-center justify-center">
          <h1 className={`font-bold tracking-tight text-center leading-snug max-w-[320px] text-[#D946EF] ${
            headerCopy.title.includes('¡Me alegra')
              ? "text-2xl"
              : "text-xl"
          }`}>
            {headerCopy.title}
          </h1>
          <p className="text-[15px] text-gray-500 font-normal mt-2 leading-relaxed text-center max-w-[280px]">
            {headerCopy.subtitle}
          </p>
        </div>

        {/* Tarjeta: Reto del día (actividades de autocuidado) */}
        {state.ongoingChallenge && (
          <div style={{
            background: 'white',
            margin: '16px 16px 12px 16px',
            marginTop: '24px',
            borderRadius: '16px',
            padding: '24px 16px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #F3F4F6',
            textAlign: 'center'
          }}>
            {/* Emoji centrado */}
            <div style={{
              fontSize: '40px',
              lineHeight: '1',
              marginBottom: '12px'
            }}>
              {state.ongoingChallenge.emoji || '🎯'}
            </div>

            {/* Nombre del reto centrado */}
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#D946EF',
              margin: '0 0 16px 0',
              lineHeight: '1.3',
              textAlign: 'center',
              display: 'block',
              width: '100%'
            }}>
              {state.ongoingChallenge.title}
            </div>

            {/* Botón principal: ¡Lo hice! */}
            <button
              onClick={() => {
                // Reproducir confetti + celebration.mp3
                const celebrationAudio = new Audio('/sounds/celebration.mp3');
                celebrationAudio.volume = 0.5;
                celebrationAudio.play().catch(err => console.error(err));

                // Mostrar confetti
                setState(prev => ({ ...prev, showRetoCelebration: true }));
                setTimeout(() => {
                  setState(prev => ({ ...prev, showRetoCelebration: false }));
                }, 2000);

                // Mostrar modal de feedback emocional
                setState(prev => ({ ...prev, showRetoFeedbackModal: true }));
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#D946EF',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                marginBottom: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#C72BD9';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#D946EF';
              }}
            >
              ¡Lo hice!
            </button>

            {/* Enlace secundario: Cancelar reto */}
            <button
              onClick={() => {
                localStorage.removeItem('postpartum_active_challenge');
                setState(prev => ({ ...prev, ongoingChallenge: null }));
              }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#6B7280',
                textDecoration: 'underline',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '4px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#4B5563';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#6B7280';
              }}
            >
              Cancelar reto
            </button>

            {/* Modal de feedback emocional */}
            {state.showRetoFeedbackModal && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '32px 24px',
                  maxWidth: '380px',
                  textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
                }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#111827',
                    margin: '0 0 16px 0'
                  }}>
                    ¿Cómo te sentiste?
                  </h3>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {['😴', '😊', '✨'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          // Limpiar reto activo
                          localStorage.removeItem('postpartum_active_challenge');
                          setState(prev => ({
                            ...prev,
                            ongoingChallenge: null,
                            showRetoFeedbackModal: false
                          }));
                        }}
                        style={{
                          fontSize: '40px',
                          background: 'none',
                          border: '2px solid #E5E7EB',
                          borderRadius: '12px',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#D946EF';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.transform = 'scale(1)';
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      localStorage.removeItem('postpartum_active_challenge');
                      setState(prev => ({
                        ...prev,
                        ongoingChallenge: null,
                        showRetoFeedbackModal: false
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#F3F4F6',
                      color: '#6B7280',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* Confetti animation */}
            {state.showRetoCelebration && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 5000
              }}>
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: `${Math.random() * 100}%`,
                      top: '-10px',
                      width: '10px',
                      height: '10px',
                      background: ['#D946EF', '#FFF8DC', '#10B981', '#FFA500'][Math.floor(Math.random() * 4)],
                      borderRadius: '50%',
                      animation: `fall ${2 + Math.random()}s linear forwards`,
                    }}
                  />
                ))}
                <style>{`
                  @keyframes fall {
                    to {
                      transform: translateY(${window.innerHeight + 10}px) rotate(360deg);
                      opacity: 0;
                    }
                  }
                `}</style>
              </div>
            )}
          </div>
        )}

        <HomeGrid
          energy={state.energyScore}
          userProfile={state.userProfile}
          onChat={() => setState(prev => ({ ...prev, showChat: true, activeTab: 'home' }))}
          onCalendar={() => setState(prev => ({ ...prev, showCalendar: true, activeTab: 'calendar' }))}
          onBodyAndCalm={() => setState(prev => ({ ...prev, showBodyAndCalm: true }))}
          onReto={() => setState(prev => ({ ...prev, showReto: true }))}
          onMoreOptions={() => {}}
        />
      </div>
    );
  };

  return (
    <div className={state.showChat ? 'app-shell app-shell--chat' : 'app-shell'} style={{
      position: 'relative',
      minHeight: state.showChat ? '100dvh' : '100vh',
      height: state.showChat ? '100dvh' : undefined,
      background: '#FFFDF6',
      paddingBottom: state.showChat ? 0 : '86px',
      overflow: state.showChat ? 'hidden' : undefined
    }}>
      {state.energyScore || state.showCalendar || state.showChat || state.showProfile || state.showBodyAndCalm || state.showReto ? renderActiveView() : (
        <EnergyCheckIn
          userProfile={state.userProfile}
          onEnergySelect={(energy) => {
            const today = new Date().toDateString();
            const checkInData = {
              date: today,
              energyMorning: energy,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('lastCheckInDate', today);
            localStorage.setItem('dailyCheckIn', JSON.stringify(checkInData));
            const userId = localStorage.getItem('userId');
            if (userId) {
              fetch('/api/notifications/checkin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, timestamp: checkInData.timestamp })
              }).catch(error => console.warn('[CHECK-IN] Notification status sync failed:', error));
            }
            console.log('[SLIDER] Check-in por slider guardado con energyMorning:', energy);
            setState(prev => ({
              ...prev,
              energyScore: energy,
              lastCheckInDate: today
            }));
          }}
        />
      )}
      <BottomNavigationBar activeTab={state.activeTab} onTabChange={handleNavigate} />
    </div>
  );
}

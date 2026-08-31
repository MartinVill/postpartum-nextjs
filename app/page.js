'use client';
import { useState, useEffect } from 'react';
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

export default function Home() {
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
    showRetoFeedbackModal: false
  });

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

      setState(prev => ({
        ...prev,
        userId,
        userProfile,
        lastCheckInDate,
        ongoingChallenge,
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

      // Determinar título y subtítulo basado en rango de moodScore
      let title, subtitle;

      if (moodScore && moodScore >= 1 && moodScore <= 4) {
        // Ánimo bajo - Necesita apoyo
        title = `Vamos a hacer algo para que te sientas mejor`;
        subtitle = `¿Qué te gustaría hacer hoy?`;
      } else if (moodScore && moodScore >= 8 && moodScore <= 10) {
        // Energía alta - Muy bien
        title = `¡Me alegra verte bien, ${userName}! ✨`;
        subtitle = `¿Qué quieres hacer hoy?`;
      } else {
        // Neutral/estable (5-7 o sin score)
        title = `Qué bueno tenerte por aquí`;
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

  // Body and Calm Module
  if (state.showBodyAndCalm && state.energyScore) {
    return (
      <BodyAndCalmModule
        userProfile={state.userProfile}
        onBack={() => setState(prev => ({ ...prev, showBodyAndCalm: false }))}
      />
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

  // Pantalla 2: Si hay energía seleccionada
  if (state.energyScore) {
    // Sub-pantalla: Mi Perfil
    if (state.showProfile) {
      return (
        <div style={{ paddingBottom: '70px' }}>
          <Profile
            userProfile={state.userProfile}
            onBack={() => setState(prev => ({ ...prev, showProfile: false, activeTab: 'home' }))}
          />
          <BottomNavigationBar
            activeTab={state.activeTab}
            onTabChange={(tab) => {
              if (tab === 'profile') {
                setState(prev => ({ ...prev, showProfile: true, activeTab: 'profile' }));
              } else if (tab === 'home') {
                setState(prev => ({ ...prev, showProfile: false, activeTab: 'home' }));
              } else if (tab === 'calendar') {
                setState(prev => ({ ...prev, showProfile: false, showCalendar: true, activeTab: 'calendar' }));
              }
            }}
          />
        </div>
      );
    }

    // Sub-pantalla: Chat
    if (state.showChat) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#FFF8FE',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '70px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: 'white',
            borderBottom: '1px solid rgba(0,0,0,0.05)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
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
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {state.userId && (
              <ChatSection userId={state.userId} initialProfile={state.userProfile} />
            )}
          </div>
          <BottomNavigationBar
            activeTab={state.activeTab}
            onTabChange={(tab) => {
              if (tab === 'calendar') {
                setState(prev => ({ ...prev, showCalendar: true, showChat: false }));
              } else if (tab === 'profile') {
                setState(prev => ({ ...prev, showCalendar: false, showChat: false }));
              } else {
                setState(prev => ({ ...prev, activeTab: 'home', showChat: false }));
              }
            }}
          />
        </div>
      );
    }

    // Sub-pantalla: Calendario
    if (state.showCalendar) {
      return (
        <div style={{ paddingBottom: '70px' }}>
          <Calendar userProfile={state.userProfile} onBack={() => setState(prev => ({ ...prev, showCalendar: false, activeTab: 'home' }))} />
          <BottomNavigationBar
            activeTab={state.activeTab}
            onTabChange={(tab) => {
              if (tab === 'calendar') {
                setState(prev => ({ ...prev, activeTab: 'calendar' }));
              } else if (tab === 'home') {
                setState(prev => ({ ...prev, showCalendar: false, activeTab: 'home' }));
              }
            }}
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
          <BottomNavigationBar activeTab="home" onTabChange={() => {}} />
        </div>
      );
    }

    // Sub-pantalla: Cuerpo y Calma
    if (state.showBodyAndCalm) {
      return (
        <div style={{ paddingBottom: '70px' }}>
          <BodyAndCalmModule
            userProfile={state.userProfile}
            onBack={() => setState(prev => ({ ...prev, showBodyAndCalm: false }))}
          />
          <BottomNavigationBar activeTab="home" onTabChange={() => {}} />
        </div>
      );
    }

    // Pantalla principal: Home Grid
    return (
      <div style={{
        paddingTop: '12px',
        paddingBottom: '70px',
        minHeight: '100vh'
      }}>
        {/* Header personalizado - Sistema de diseño nativo magenta con copy dinámico */}
        <div className="w-full max-w-md mx-auto text-center pt-6 pb-2 px-6 flex flex-col items-center justify-center">
          <h1 className={`font-bold tracking-tight text-center leading-snug max-w-[320px] ${
            headerCopy.title.includes('¡Me alegra')
              ? "text-2xl text-[#D946EF]"
              : "text-xl text-gray-800"
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
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 16px 0',
              lineHeight: '1.3'
            }}>
              {state.ongoingChallenge.title}
            </h2>

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
        <BottomNavigationBar
          activeTab={state.activeTab}
          onTabChange={(tab) => {
            setState(prev => ({ ...prev, activeTab: tab }));
            if (tab === 'calendar') {
              setState(prev => ({ ...prev, showCalendar: true }));
            } else if (tab === 'profile') {
              setState(prev => ({ ...prev, showProfile: true }));
            }
          }}
        />
      </div>
    );
  }

  // Pantalla 1: Energy check-in
  return (
    <>
      <EnergyCheckIn
        userProfile={state.userProfile}
        onEnergySelect={(energy) => {
          const today = new Date().toDateString();
          // Guardar check-in con energyScore para que getDynamicHeaderCopy lo lea
          const checkInData = {
            date: today,
            energyMorning: energy,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('lastCheckInDate', today);
          localStorage.setItem('dailyCheckIn', JSON.stringify(checkInData));
          console.log('[SLIDER] Check-in por slider guardado con energyMorning:', energy);
          setState(prev => ({
            ...prev,
            energyScore: energy,
            lastCheckInDate: today
          }));
        }}
      />
    </>
  );
}

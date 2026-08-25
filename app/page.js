'use client';
import { useState, useEffect } from 'react';
import ChatSection from './components/ChatSection';
import OnboardingForm from './components/OnboardingForm';
import EnergyCheckIn from './components/EnergyCheckIn';
import DynamicFeed from './components/DynamicFeed';
import Calendar from './components/Calendar';
import NightReflection from './components/NightReflection';

export default function Home() {
  const [state, setState] = useState({
    userId: null,
    userProfile: null,
    isReady: false,
    showChat: false,
    showReflection: false,
    showCalendar: false,
    energyScore: null,
    lastCheckInDate: null,
    isMenuOpen: false
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
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Math.random().toString(36).substr(2, 20)}`;
        localStorage.setItem('userId', userId);
      }

      const profileJson = localStorage.getItem('userProfile');
      const userProfile = profileJson ? JSON.parse(profileJson) : null;
      const today = new Date().toDateString();
      const lastCheckInDate = localStorage.getItem('lastCheckInDate');

      setState(prev => ({
        ...prev,
        userId,
        userProfile,
        lastCheckInDate,
        isReady: true
      }));
    } catch (error) {
      console.error('[INIT]', error);
      setState(prev => ({ ...prev, isReady: true }));
    }
  }, []);

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

  // Calendar view
  if (state.showCalendar) {
    return (
      <Calendar
        userProfile={state.userProfile}
        onBack={() => setState(prev => ({ ...prev, showCalendar: false, energyScore: null }))}
      />
    );
  }

  // Chat view
  if (state.showChat) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        {/* Header Fixed */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 100,
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          flexShrink: 0,
          position: 'relative'
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
            textAlign: 'center'
          }}>
            Hablemos
          </h1>
        </div>

        {/* Chat Content - Flex grow para ocupar espacio */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0 16px', minHeight: 0 }}>
          {state.userId && (
            <ChatSection userId={state.userId} initialProfile={state.userProfile} />
          )}
        </div>

        {/* Input y Slider - Siempre visible al final */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
          padding: '16px',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flexShrink: 0
        }}>
          {/* Emotional Score Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '140px' }}>
              <label style={{ fontSize: '11.5px', color: '#666', display: 'block', fontWeight: '600' }}>
                ¿Cómo estás de ánimo?
              </label>
              <span style={{ fontSize: '11px', color: '#999' }}>
                Así sé cómo responderte
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={state.emotionalScore || 5}
              onChange={(e) => setState(prev => ({ ...prev, emotionalScore: parseInt(e.target.value) }))}
              style={{
                flex: 0.9,
                height: '4px',
                cursor: 'pointer',
                accentColor: '#D946EF',
                background: 'linear-gradient(to right, #FEE2E2, #D946EF, #84CC16)',
                borderRadius: '2px',
                WebkitAppearance: 'none',
                appearance: 'none'
              }}
            />
            <span style={{ fontSize: '12px', color: '#BBB', minWidth: '10px', textAlign: 'right', fontWeight: '500' }}>
              {state.emotionalScore || 5}
            </span>
          </div>
          <style>{`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              -webkit-appearance: none;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              border: 2px solid #D946EF;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(217, 70, 239, 0.25);
            }
            input[type='range']::-moz-range-thumb {
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: white;
              border: 2px solid #D946EF;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(217, 70, 239, 0.25);
            }
          `}</style>

          {/* Input para mensajes */}
          <div style={{ display: 'flex', gap: '8px', position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Cuéntame qué sientes..."
              style={{
                flex: 1,
                padding: '12px 16px',
                paddingRight: '56px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: '#EFEFEF',
                transition: 'background 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onFocus={(e) => {
                e.target.style.background = '#E5E5E5';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#EFEFEF';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />
            <button
              style={{
                position: 'absolute',
                right: '56px',
                width: '44px',
                height: '44px',
                padding: '0',
                background: '#D946EF',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)',
                fontSize: '24px',
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
              &gt;
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, isMenuOpen: !prev.isMenuOpen }))}
              style={{
                position: 'absolute',
                right: '8px',
                width: '44px',
                height: '44px',
                padding: '0',
                background: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                color: '#999',
                fontSize: '16px',
                lineHeight: '1',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#E5E5E5';
                e.target.style.color = '#666';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#999';
              }}
              title="Más opciones"
            >
              ⋮
            </button>

            {state.isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: '0',
                  background: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  minWidth: '180px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  zIndex: 1001,
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => {
                    setState(prev => ({ ...prev, isMenuOpen: false }));
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: 'none',
                    background: 'white',
                    fontSize: '13px',
                    color: '#333',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    fontWeight: '500',
                    borderBottom: '1px solid #F0F0F0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F8F8F8'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  ❓ Preguntas frecuentes
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('¿Estás segura de que querés borrar todo el historial de esta conversación?')) {
                      setState(prev => ({ ...prev, isMenuOpen: false }));
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: 'none',
                    background: 'white',
                    fontSize: '13px',
                    color: '#333',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                    fontWeight: '500',
                    borderTop: '1px solid #F0F0F0'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#F8F8F8'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  🗑️ Borrar historial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla 2: Si hay energía seleccionada
  if (state.energyScore) {
    return (
      <DynamicFeed
        energy={state.energyScore}
        userProfile={state.userProfile}
        onChat={() => setState(prev => ({ ...prev, showChat: true }))}
        onCalendar={() => setState(prev => ({ ...prev, showCalendar: true }))}
        onReflection={() => setState(prev => ({ ...prev, showReflection: true }))}
      />
    );
  }

  // Pantalla 1: Energy check-in
  return (
    <>
      <EnergyCheckIn
        userProfile={state.userProfile}
        onEnergySelect={(energy) => {
          const today = new Date().toDateString();
          localStorage.setItem('lastCheckInDate', today);
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

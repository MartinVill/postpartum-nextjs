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
        {/* Header */}
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

        {/* ChatSection manejará TODO */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {state.userId && (
            <ChatSection userId={state.userId} initialProfile={state.userProfile} />
          )}
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

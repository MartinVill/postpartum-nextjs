'use client';
import { useState, useEffect } from 'react';
import ChatSection from './components/ChatSection';
import OnboardingForm from './components/OnboardingForm';
import EnergyCheckIn from './components/EnergyCheckIn';
import DynamicFeed from './components/DynamicFeed';
import Calendar from './components/Calendar';
import NightReflection from './components/NightReflection';
import BodyAndCalmModule from './components/BodyAndCalm/BodyAndCalmModule';
import BottomNavigationBar from './components/BottomNavigationBar';
import HomeGrid from './components/HomeGrid';

export default function Home() {
  const [state, setState] = useState({
    userId: null,
    userProfile: null,
    isReady: false,
    showChat: false,
    showReflection: false,
    showCalendar: false,
    showBodyAndCalm: false,
    activeTab: 'home',
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
      <div style={{ paddingBottom: '70px' }}>
        <HomeGrid
          energy={state.energyScore}
          userProfile={state.userProfile}
          onChat={() => setState(prev => ({ ...prev, showChat: true, activeTab: 'home' }))}
          onCalendar={() => setState(prev => ({ ...prev, showCalendar: true, activeTab: 'calendar' }))}
          onBodyAndCalm={() => setState(prev => ({ ...prev, showBodyAndCalm: true }))}
          onMoreOptions={() => {}}
        />
        <BottomNavigationBar
          activeTab={state.activeTab}
          onTabChange={(tab) => {
            setState(prev => ({ ...prev, activeTab: tab }));
            if (tab === 'calendar') {
              setState(prev => ({ ...prev, showCalendar: true }));
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

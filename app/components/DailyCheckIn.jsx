'use client';
import { useState } from 'react';

export default function DailyCheckIn({ onComplete, lastCheckIn }) {
  const [energy, setEnergy] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toDateString();
  const alreadyCheckedIn = lastCheckIn === today;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Guardar check-in en localStorage
    const checkInData = {
      date: today,
      energyMorning: energy,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('lastCheckIn', today);
    localStorage.setItem('dailyCheckIn', JSON.stringify(checkInData));

    onComplete(energy);
    setIsSubmitting(false);
  };

  if (alreadyCheckedIn) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #D946EF 0%, #C026D3 100%)',
      padding: '24px',
      borderRadius: '16px',
      color: 'white',
      marginBottom: '20px',
      boxShadow: '0 4px 15px rgba(217, 70, 239, 0.2)'
    }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
        Buenos días 💜
      </h2>

      <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.95 }}>
        ¿Cómo te sientes hoy?
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Muy cansada</span>
          <span style={{ fontSize: '16px', fontWeight: '700' }}>{energy}</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Super activa</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(parseInt(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'white'
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '14px',
          background: 'rgba(255,255,255,0.25)',
          border: '2px solid rgba(255,255,255,0.5)',
          color: 'white',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '15px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.35)';
          e.target.style.borderColor = 'rgba(255,255,255,0.7)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.25)';
          e.target.style.borderColor = 'rgba(255,255,255,0.5)';
        }}
      >
        {isSubmitting ? 'Guardando...' : 'Empezar el día'}
      </button>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

export default function EnergyCheckIn({ userProfile, onEnergySelect }) {
  const [energy, setEnergy] = useState(5);
  const [currentHour, setCurrentHour] = useState(null);

  useEffect(() => {
    setCurrentHour(new Date().getHours());
  }, []);

  const getGreeting = () => {
    if (!currentHour) return 'Hola';
    if (currentHour < 12) return 'Buenos días';
    if (currentHour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleEnergyChange = (value) => {
    setEnergy(value);
    // Autoseleccionar después de 1 segundo
    setTimeout(() => {
      onEnergySelect(value);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        animation: 'slideUp 0.6s ease-out',
        animationFillMode: 'both'
      }}>
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#D946EF',
          marginBottom: '48px',
          letterSpacing: '-0.5px'
        }}>
          ¡Hola hermosa! 💜
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#6B7280',
          marginBottom: '40px',
          fontWeight: '500'
        }}>
          ¿Cómo te sientes hoy?
        </p>

        {/* Barra deslizable */}
        <div style={{
          maxWidth: '280px',
          margin: '0 auto'
        }}>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => handleEnergyChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '10px',
              background: `linear-gradient(to right,
                #EF4444 0%,
                #F97316 20%,
                #EAB308 40%,
                #84CC16 60%,
                #22C55E 80%,
                #10B981 100%)`,
              outline: 'none',
              cursor: 'pointer',
              accentColor: '#D946EF',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />

          {/* Custom thumb styling */}
          <style>{`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              -webkit-appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: white;
              border: 3px solid #D946EF;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(217, 70, 239, 0.4);
            }
            input[type='range']::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: white;
              border: 3px solid #D946EF;
              cursor: pointer;
              box-shadow: 0 4px 12px rgba(217, 70, 239, 0.4);
            }
          `}</style>

          {/* Números debajo */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '16px',
            fontSize: '12px',
            color: '#9CA3AF',
            fontWeight: '500'
          }}>
            <span>Muy mal</span>
            <span style={{ color: '#D946EF', fontWeight: '700' }}>{energy}</span>
            <span>Excelente</span>
          </div>
        </div>
      </div>
    </div>
  );
}

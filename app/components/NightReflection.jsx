'use client';
import { useState, useEffect } from 'react';

export default function NightReflection({ onClose }) {
  const [step, setStep] = useState(1);
  const [completedChallenge, setCompletedChallenge] = useState(false);
  const [finalEnergy, setFinalEnergy] = useState(5);
  const [stats, setStats] = useState({ streak: 0, totalPoints: 0 });

  useEffect(() => {
    // Cargar estadísticas
    const saved = localStorage.getItem('userStats');
    if (saved) {
      setStats(JSON.parse(saved));
    }

    // Verificar si completó el reto
    const dailyChallenge = localStorage.getItem('dailyChallenge');
    if (dailyChallenge) {
      const data = JSON.parse(dailyChallenge);
      setCompletedChallenge(data.progress >= data.challenge.target);
    }
  }, []);

  const handleSubmit = () => {
    const today = new Date().toDateString();
    const lastReflection = localStorage.getItem('lastReflection');

    // Calcular streak
    let newStreak = stats.streak || 0;
    if (lastReflection !== today) {
      newStreak += 1;
    }

    // Calcular puntos
    let pointsEarned = 0;
    if (completedChallenge) pointsEarned += 15;
    if (finalEnergy >= 5) pointsEarned += 5;

    const newStats = {
      streak: newStreak,
      totalPoints: (stats.totalPoints || 0) + pointsEarned,
      lastReflection: today,
      reflections: (stats.reflections || []).concat([{
        date: today,
        energy: finalEnergy,
        completedChallenge,
        pointsEarned
      }])
    };

    localStorage.setItem('userStats', JSON.stringify(newStats));
    localStorage.setItem('lastReflection', today);

    setStats(newStats);
    setStep(2);
  };

  if (step === 2) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>

        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
          ¡Muy bien!
        </h2>

        <p style={{ fontSize: '14px', marginBottom: '24px', opacity: 0.95 }}>
          Completaste un día más contigo misma
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔥</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Streak</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{stats.streak || 0}</div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '12px',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>⭐</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Puntos hoy</div>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>
              +{completedChallenge ? '15' : '0'}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.15)',
          padding: '12px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>Total acumulado</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{stats.totalPoints || 0} ⭐</div>
        </div>

        {stats.streak >= 7 && (
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            🏆 ¡7 días seguidos! Eres increíble
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255,255,255,0.25)',
            border: '2px solid rgba(255,255,255,0.5)',
            color: 'white',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Descansar
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginBottom: '20px'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1F2937' }}>
        ¿Cómo fue tu día? 🌙
      </h2>

      <div style={{
        background: '#F9FAFB',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
          Reto completado
        </p>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={completedChallenge}
            onChange={(e) => setCompletedChallenge(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px', color: '#1F2937' }}>
            {completedChallenge ? '✅ Sí, lo completé' : '⭕ No lo completé'}
          </span>
        </label>
      </div>

      <div style={{
        background: '#F9FAFB',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
          ¿Cómo terminaste? ({finalEnergy}/10)
        </p>
        <input
          type="range"
          min="1"
          max="10"
          value={finalEnergy}
          onChange={(e) => setFinalEnergy(parseInt(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: '#10B981'
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '14px',
          background: '#10B981',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '15px'
        }}
        onMouseEnter={(e) => e.target.style.background = '#059669'}
        onMouseLeave={(e) => e.target.style.background = '#10B981'}
      >
        Guardar reflexión
      </button>
    </div>
  );
}

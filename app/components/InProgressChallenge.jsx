'use client';
import { useState, useEffect } from 'react';

function Confetti() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999
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
  );
}

export default function InProgressChallenge() {
  const [inProgress, setInProgress] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('inProgressChallenge');
    if (data) {
      setInProgress(JSON.parse(data));
    }
  }, []);

  const handleComplete = () => {
    setShowConfetti(true);
    setShowFeedback(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleFeedback = (mood) => {
    if (inProgress) {
      const completedChallenge = {
        date: new Date().toISOString(),
        challengeTitle: inProgress.title,
        mood: mood,
        emoji: inProgress.emoji
      };

      // Guardar en historial
      const history = JSON.parse(localStorage.getItem('completedChallengesHistory') || '[]');
      history.push(completedChallenge);
      localStorage.setItem('completedChallengesHistory', JSON.stringify(history));

      // Incrementar racha
      const challengeData = JSON.parse(localStorage.getItem('dailyChallengeData') || '{}');
      const updated = {
        ...challengeData,
        streak: (challengeData.streak || 0) + 1,
        date: new Date().toDateString()
      };
      localStorage.setItem('dailyChallengeData', JSON.stringify(updated));

      // Limpiar challenge en progreso
      localStorage.removeItem('inProgressChallenge');
      setInProgress(null);
    }

    setShowFeedback(false);
  };

  if (!inProgress) return null;

  return (
    <>
      <div style={{
        padding: '16px',
        background: 'white',
        border: '2.5px solid #D946EF',
        borderRadius: '16px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Badge "EN PROGRESO" */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: '#FEF3C7',
          color: '#92400E',
          fontSize: '11px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          🟡 EN PROGRESO
        </div>

        {/* Contenido */}
        <div style={{ textAlign: 'center', marginTop: '32px', marginBottom: '16px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60px'
          }}>
            {typeof inProgress.emoji === 'string' ? inProgress.emoji : inProgress.emoji}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#1F2937',
            margin: '0 0 8px 0'
          }}>
            {inProgress.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            fontStyle: 'italic',
            margin: '0'
          }}>
            Bloquea tu teléfono y disfruta tu momento.
          </p>
        </div>

        {/* Botón completar */}
        <button
          onClick={handleComplete}
          style={{
            width: '100%',
            padding: '12px',
            background: '#D946EF',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '16px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.background = '#C72BD9'}
          onMouseLeave={(e) => e.target.style.background = '#D946EF'}
        >
          ¡Lo completé!
        </button>
      </div>

      {/* Modal de feedback */}
      {showFeedback && (
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
          zIndex: 1000
        }} onClick={() => setShowFeedback(false)}>
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              maxWidth: '320px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 8px 0'
            }}>
              ✨ Te diste un momento para ti, ¡te felicito!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0 0 16px 0'
            }}>
              ¿Cómo te sientes ahora?
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleFeedback('😴')}
                style={{
                  fontSize: '32px',
                  background: 'none',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '80px'
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
                😴
              </button>
              <button
                onClick={() => handleFeedback('😊')}
                style={{
                  fontSize: '32px',
                  background: 'none',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '80px'
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
                😊
              </button>
              <button
                onClick={() => handleFeedback('⚡')}
                style={{
                  fontSize: '32px',
                  background: 'none',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: '1',
                  minWidth: '80px'
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
                ⚡
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#9CA3AF',
              margin: 0
            }}>
              Esto nos ayuda a personalizar tus retos
            </p>
          </div>
        </div>
      )}

      {showConfetti && <Confetti />}
    </>
  );
}

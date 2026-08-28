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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('inProgressChallenge');
    if (data) {
      setInProgress(JSON.parse(data));
    }

    const challengeData = localStorage.getItem('dailyChallengeData');
    if (challengeData) {
      const parsed = JSON.parse(challengeData);
      setCurrentStreak(parsed.streak || 0);
    }
  }, []);

  const handleComplete = () => {
    setShowConfetti(true);
    setShowFeedback(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleFeedback = (mood) => {
    setSelectedMood(mood);

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
      setCurrentStreak(updated.streak);
      localStorage.setItem('dailyChallengeData', JSON.stringify(updated));

      // Limpiar challenge en progreso
      localStorage.removeItem('inProgressChallenge');

      // Mostrar confirmación
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setShowFeedback(false);
        setInProgress(null);
      }, 1800);
    }
  };

  if (!inProgress) return null;

  return (
    <>
      {/* Estilos de animación */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .ping-indicator {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      <div style={{
        padding: '16px',
        background: 'white',
        border: '2.5px solid #D946EF',
        borderRadius: '16px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(217, 70, 239, 0.15)'
      }}>
        {/* Badge "EN PROGRESO" con ping animation */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {/* Ping circle */}
          <div style={{
            position: 'relative',
            width: '12px',
            height: '12px'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#FBBF24',
              borderRadius: '50%',
              opacity: 0.75
            }} />
            <div style={{
              position: 'absolute',
              inset: '-4px',
              backgroundColor: '#FBBF24',
              borderRadius: '50%',
              opacity: 0,
              animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
            }} />
          </div>
          <div style={{
            background: '#FEF3C7',
            color: '#92400E',
            fontSize: '10px',
            fontWeight: '700',
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            EN PROGRESO
          </div>
        </div>

        {/* Contenido */}
        <div style={{ textAlign: 'center', marginTop: '36px', marginBottom: '16px' }}>
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
            margin: '0 0 12px 0'
          }}>
            {inProgress.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#6B7280',
            fontStyle: 'italic',
            margin: '8px 0 0 0',
            lineHeight: '1.5'
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
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#C72BD9'}
          onMouseLeave={(e) => e.target.style.background = '#D946EF'}
        >
          ¡Lo completé!
        </button>
      </div>

      {/* Modal de feedback */}
      {showFeedback && !showConfirmation && (
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
              fontSize: '15px',
              color: '#1F2937',
              fontWeight: '600',
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
              {['😴', '😊', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleFeedback(emoji)}
                  style={{
                    fontSize: '32px',
                    background: 'none',
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flex: '1',
                    minWidth: '80px',
                    opacity: selectedMood && selectedMood !== emoji ? 0.5 : 1,
                    transform: selectedMood === emoji ? 'scale(1.08)' : 'scale(1)',
                    borderColor: selectedMood === emoji ? '#D946EF' : '#E5E7EB'
                  }}
                  onMouseEnter={(e) => {
                    if (!selectedMood) {
                      e.target.style.borderColor = '#D946EF';
                      e.target.style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedMood) {
                      e.target.style.borderColor = '#E5E7EB';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {emoji}
                </button>
              ))}
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

      {/* Modal de confirmación */}
      {showConfirmation && (
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
          zIndex: 1000,
          animation: 'fadeInOut 1.8s ease-in-out'
        }}>
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px 24px',
              textAlign: 'center',
              maxWidth: '320px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#D946EF',
              margin: '0 0 12px 0'
            }}>
              💜 ¡Momento registrado!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0 0 16px 0',
              lineHeight: '1.6'
            }}>
              Nos vemos mañana para tu próximo momento de autocuidado.
            </p>
            <div style={{
              background: '#FFF5E6',
              border: '1.5px solid #F59E0B',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#D97706',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🔥 <span>{currentStreak}</span> días de racha
            </div>
          </div>
        </div>
      )}

      {showConfetti && <Confetti />}
    </>
  );
}

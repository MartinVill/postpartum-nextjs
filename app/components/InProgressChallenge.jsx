'use client';
import { useState, useEffect } from 'react';
import { getAccurateEmoji } from '@/app/utils/emojiMapper';
import { getChallengeDayKey, getChallengeStreak, recordChallengeCompletion } from '@/app/utils/challengeStreak';

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

function StreakWidget({ streak }) {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const today = new Date().getDay();
  const todayIndex = (today + 6) % 7; // Ajustar domingo a fin de semana

  // Obtener historial de días completados
  const completedHistory = JSON.parse(localStorage.getItem('completedChallengesHistory') || '[]');
  const completedDates = new Set(
    completedHistory.map(entry => new Date(entry.date).toDateString())
  );

  // Mapear cada día a si fue completado
  const daysOfWeek = days.map((day, index) => {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() - (todayIndex - index));
    const dateString = dayDate.toDateString();
    return {
      label: day,
      completed: completedDates.has(dateString)
    };
  });

  return (
    <div style={{
      background: '#FFF5E6',
      border: '1px solid #FED7AA',
      borderRadius: '12px',
      padding: '12px 14px',
      marginBottom: '16px'
    }}>
      <p style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#D97706',
        margin: '0 0 10px 0'
      }}>
        🔥 {streak} días seguidos cuidando de ti
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '6px'
      }}>
        {daysOfWeek.map((day, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: day.completed ? '#FCD34D' : '#FEF3C7',
                border: '1px solid ' + (day.completed ? '#F59E0B' : '#FBBF24'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: day.completed ? '#92400E' : '#B45309'
              }}
            >
              {day.completed ? '✓' : ''}
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '500',
                color: '#92400E',
                textAlign: 'center'
              }}
            >
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InProgressChallenge() {
  const [inProgress, setInProgress] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const data = localStorage.getItem('inProgressChallenge');
    const completedToday = localStorage.getItem('completedChallengeToday');

    if (data) {
      setInProgress(JSON.parse(data));
      if (completedToday === getChallengeDayKey()) {
        setIsCompleted(true);
      }
    }

    setCurrentStreak(getChallengeStreak().streak);
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

      const updated = recordChallengeCompletion({
        title: completedChallenge.challengeTitle,
        emoji: completedChallenge.emoji,
        mood
      });
      setCurrentStreak(updated.streak);

      // Marcar como completado hoy (NO limpiar inProgressChallenge)
      localStorage.setItem('completedChallengeToday', getChallengeDayKey());
      setIsCompleted(true);

      // Mostrar confirmación
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setShowFeedback(false);
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

      {/* Widget de Racha */}
      {isCompleted && <StreakWidget streak={currentStreak} />}

      {/* Tarjeta del Reto - Estados: En Progreso o Completado */}
      <div style={{
        padding: '16px',
        background: isCompleted ? '#ECFDF5' : 'white',
        border: isCompleted ? '2px solid #10B981' : '2.5px solid #D946EF',
        borderRadius: '16px',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isCompleted
          ? '0 8px 24px rgba(16, 185, 129, 0.12)'
          : '0 8px 24px rgba(217, 70, 239, 0.15)'
      }}>
        {/* Badge - Estado */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isCompleted ? '#DBEAFE' : '#FAF5FF',
          color: isCompleted ? '#0369A1' : '#A21CAF',
          fontSize: '13px',
          fontWeight: '500',
          padding: '6px 14px',
          borderRadius: '9999px',
          border: isCompleted ? '1px solid #BAE6FD' : '1px solid #E9D5FF',
          whiteSpace: 'nowrap'
        }}>
          {isCompleted ? '✓ Completado por hoy' : '✨ Tu reto de hoy'}
        </div>

        {/* Contenido */}
        <div style={{ textAlign: 'center', marginTop: '48px', marginBottom: '16px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60px'
          }}>
            {typeof inProgress.emoji === 'string' ? getAccurateEmoji(inProgress.title, inProgress.emoji) : inProgress.emoji}
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: isCompleted ? '#059669' : '#1F2937',
            margin: '0 0 12px 0'
          }}>
            {inProgress.title}
          </h3>
          <p style={{
            fontSize: '14px',
            color: isCompleted ? '#059669' : '#6B7280',
            fontStyle: 'italic',
            margin: '8px 0 0 0',
            lineHeight: '1.5'
          }}>
            {isCompleted
              ? '¡Excelente trabajo! Tómate el resto del día para descansar. Próximo reto disponible mañana.'
              : 'Bloquea tu teléfono y disfruta tu momento.'}
          </p>
        </div>

        {/* Botón - Deshabilitado si ya está completado */}
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          style={{
            width: '100%',
            padding: '12px',
            background: isCompleted ? '#D1D5DB' : '#D946EF',
            color: isCompleted ? '#6B7280' : 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '16px',
            cursor: isCompleted ? 'default' : 'pointer',
            opacity: isCompleted ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isCompleted) e.target.style.background = '#C72BD9';
          }}
          onMouseLeave={(e) => {
            if (!isCompleted) e.target.style.background = '#D946EF';
          }}
        >
          {isCompleted ? 'Completado' : '¡Lo completé!'}
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
              color: '#10B981',
              margin: '0 0 12px 0'
            }}>
              💚 ¡Momento registrado!
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
              background: '#ECFDF5',
              border: '1.5px solid #10B981',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#059669',
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

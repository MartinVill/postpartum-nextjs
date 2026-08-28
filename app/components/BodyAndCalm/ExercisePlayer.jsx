'use client';
import { useState, useEffect } from 'react';

const EXERCISE_GUIDES = {
  'breathing-1': {
    title: 'Respiración Diafragmática 360°',
    emoji: '🫁',
    instructions: [
      'Recuéstate sobre tu espalda, con las rodillas dobladas si es necesario.',
      'Coloca una mano sobre el pecho y otra sobre el vientre.',
      'Inhala lentamente por la nariz, expandiendo el abdomen (no el pecho).'
    ]
  },
  'breathing-2': {
    title: 'Box Breathing para Ansiedad',
    emoji: '🫁',
    instructions: [
      'Siéntate cómoda con la espalda recta.',
      'Inhala durante 4 segundos.',
      'Retén el aire durante 4 segundos.'
    ]
  },
  'stretch-1': {
    title: 'Apertura Pectoral Suave',
    emoji: '🧘‍♀️',
    instructions: [
      'Siéntate derecha, pies apoyados en el suelo.',
      'Entrelaza los dedos detrás de tu cabeza o cuello.',
      'Abre los codos hacia los lados suavemente.'
    ]
  },
  'relax-1': {
    title: 'Exploración Corporal Mindful',
    emoji: '🕊️',
    instructions: [
      'Acuéstate en un lugar cómodo y tranquilo.',
      'Cierra los ojos y respira profundamente.',
      'Comienza a notar sensaciones en los pies, subiendo lentamente.'
    ]
  },
  'move-1': {
    title: 'Movimiento Orgánico del Pelvis',
    emoji: '🌿',
    instructions: [
      'Ponte de pie con los pies al ancho de las caderas.',
      'Relaja las rodillas ligeramente.',
      'Permite que tu pelvis se mueva en círculos lentos.'
    ]
  }
};

export default function ExercisePlayer({ activity, onComplete, onBack }) {
  const [timeLeft, setTimeLeft] = useState(parseInt(activity.duration.split('-')[0]) * 60); // segundos
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);

  const guide = EXERCISE_GUIDES[activity.id] || {
    title: activity.title,
    emoji: activity.emoji,
    instructions: ['Sigue tu propio ritmo.', 'Escucha a tu cuerpo.', 'Sin presión.']
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTimeLeft(parseInt(activity.duration.split('-')[0]) * 60);
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleComplete = () => {
    setShowCompletionModal(true);
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FBF8F3 0%, #FFF5E1 100%)',
      padding: '20px 16px',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes scalePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .breathing-circle {
          animation: scalePulse 4s ease-in-out infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingTop: '12px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#C8956D',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
        >
          &lt; Volver
        </button>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#3E3530',
          margin: '0',
          textAlign: 'center',
          flex: 1
        }}>
          {guide.title}
        </h2>
        <div style={{ width: '60px' }} />
      </div>

      {/* Zona gráfica central - Círculo respiratorio animado */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <div
          className='breathing-circle'
          style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: '#D4E8E0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            boxShadow: '0 8px 24px rgba(107, 142, 113, 0.2)'
          }}
        >
          {guide.emoji}
        </div>

        {/* Temporizador grande */}
        <div style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#C8956D',
          fontFamily: 'monospace',
          letterSpacing: '2px'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Instrucciones */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '100%',
          textAlign: 'center'
        }}>
          {guide.instructions.map((instruction, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '13px',
                color: '#7A6F67',
                margin: idx === guide.instructions.length - 1 ? '0' : '0 0 8px 0',
                lineHeight: '1.5',
                fontWeight: '400'
              }}
            >
              {idx + 1}. {instruction}
            </p>
          ))}
        </div>
      </div>

      {/* Controles de temporizador */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        gap: '12px',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <button
          onClick={handleReset}
          style={{
            padding: '10px 16px',
            background: 'white',
            border: '1px solid #D4C4B0',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            color: '#7A6F67',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#F5F5F5';
            e.target.style.borderColor = '#C8956D';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#D4C4B0';
          }}
        >
          ↻ Reiniciar
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          style={{
            padding: '12px 28px',
            background: '#C8956D',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            color: 'white',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(200, 149, 109, 0.3)',
            minWidth: '140px'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#A8755A';
            e.target.style.boxShadow = '0 6px 16px rgba(200, 149, 109, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#C8956D';
            e.target.style.boxShadow = '0 4px 12px rgba(200, 149, 109, 0.3)';
          }}
        >
          {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
        </button>

        <button
          onClick={handleStop}
          style={{
            padding: '10px 16px',
            background: 'white',
            border: '1px solid #D4C4B0',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            color: '#7A6F67',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#F5F5F5';
            e.target.style.borderColor = '#C8956D';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.borderColor = '#D4C4B0';
          }}
        >
          ◼ Detener
        </button>
      </div>

      {/* Botón de finalización */}
      <button
        onClick={handleComplete}
        style={{
          width: '100%',
          padding: '14px',
          background: '#6B8E71',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '15px',
          color: 'white',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(107, 142, 113, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#4B6E51';
          e.target.style.boxShadow = '0 6px 16px rgba(107, 142, 113, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#6B8E71';
          e.target.style.boxShadow = '0 4px 12px rgba(107, 142, 113, 0.2)';
        }}
      >
        ¡Completé mi actividad!
      </button>

      {/* Modal de finalización */}
      {showCompletionModal && (
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
              color: '#3E3530',
              margin: '0 0 16px 0'
            }}>
              ¿Cómo te sientes ahora?
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
                  onClick={() => handleMoodSelect(emoji)}
                  style={{
                    fontSize: '40px',
                    background: 'none',
                    border: '2px solid #D4C4B0',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: selectedMood === emoji ? 1 : 0.6,
                    transform: selectedMood === emoji ? 'scale(1.1)' : 'scale(1)',
                    borderColor: selectedMood === emoji ? '#C8956D' : '#D4C4B0'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#C8956D';
                    e.target.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMood !== emoji) {
                      e.target.style.borderColor = '#D4C4B0';
                      e.target.style.opacity = '0.6';
                    }
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <p style={{
              fontSize: '12px',
              color: '#999',
              margin: '0'
            }}>
              Tu feedback nos ayuda a personalizar mejor
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

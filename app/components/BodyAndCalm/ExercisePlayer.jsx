'use client';
import { useState, useEffect, useRef } from 'react';

// Data URI de sonido de campana meditativa (WAV sin compresión, ~2KB)
const CHIME_SOUND = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==';

// Las instrucciones se cargan dinámicamente desde la actividad seleccionada

export default function ExercisePlayer({ activity, onComplete, onBack }) {
  const [timeLeft, setTimeLeft] = useState(parseInt(activity.duration.split('-')[0]) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [phase, setPhase] = useState('inhale');
  const [scale, setScale] = useState(1);

  const audioRef = useRef(null);
  const hasSoundPlayedRef = useRef(false);

  const guide = {
    title: activity.title,
    instructions: activity.instructions || ['Sigue tu propio ritmo.', 'Escucha a tu cuerpo.', 'Sin presión.'],
    type: activity.type || 'breathing'
  };

  // Inicializar audio element
  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.src = '/sounds/chime.wav';
      audioRef.current.volume = 1.0;
      audioRef.current.preload = 'auto';
    }
  }, []);

  // Función para desbloquear audio (autoplay unlock en iOS/Android)
  const unlockAudio = () => {
    if (!audioRef.current) return;

    try {
      // Reproducir y pausar inmediatamente para desbloquear autoplay
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          })
          .catch((error) => {
            console.warn('[AUDIO] Unlock play failed:', error);
          });
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.warn('[AUDIO] Error unlocking audio:', error);
    }
  };

  // Función para reproducir sonido de campana
  const playTimerChime = () => {
    if (!audioRef.current) return;

    try {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('[AUDIO] Failed to play chime:', error);
        });
      }
    } catch (error) {
      console.error('[AUDIO] Error playing timer chime:', error);
    }
  };

  // Función para vibración táctil
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 200, 500]);
      } catch (error) {
        console.warn('[VIBRATION] Error triggering vibration:', error);
      }
    }
  };

  // Effect para cuando el temporizador llega a 0
  useEffect(() => {
    if (timeLeft === 0 && !hasSoundPlayedRef.current) {
      hasSoundPlayedRef.current = true;
      setIsRunning(false);
      playTimerChime();
      triggerVibration();
    }
  }, [timeLeft]);

  // Ciclo respiratorio (4 segundos por fase)
  useEffect(() => {
    let interval;
    const phases = ['inhale', 'exhale'];
    let currentPhaseIndex = 0;

    if (isRunning) {
      interval = setInterval(() => {
        const currentPhase = phases[currentPhaseIndex];
        setPhase(currentPhase);

        if (currentPhase === 'inhale') {
          // Escalar de 1 a 1.35 durante 4 segundos
          let scaleValue = 1;
          const scaleInterval = setInterval(() => {
            scaleValue += 0.35 / 40; // 40 pasos en 4 segundos
            if (scaleValue >= 1.35) {
              scaleValue = 1.35;
              clearInterval(scaleInterval);
            }
            setScale(scaleValue);
          }, 100);
        } else {
          // Escalar de 1.35 a 0.85 durante 4 segundos
          let scaleValue = 1.35;
          const scaleInterval = setInterval(() => {
            scaleValue -= 0.5 / 40; // 40 pasos en 4 segundos
            if (scaleValue <= 0.85) {
              scaleValue = 0.85;
              clearInterval(scaleInterval);
            }
            setScale(scaleValue);
          }, 100);
        }

        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      }, 4000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

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
    hasSoundPlayedRef.current = false;
    setTimeLeft(parseInt(activity.duration.split('-')[0]) * 60);
    setIsRunning(false);
    setScale(1);
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

  const phaseText = {
    'inhale': 'INHALA',
    'exhale': 'EXHALA'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '20px 16px',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Header con botón simétrico y título centrado */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingTop: '12px',
        gap: '12px'
      }}>
        {/* Botón Volver - Lado izquierdo */}
        <button
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            minWidth: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
            flexShrink: 0
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

        {/* Título centrado - Centro (permite 2 líneas) */}
        <h2 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#D946EF',
          margin: '0',
          textAlign: 'center',
          flex: 1,
          minWidth: '0',
          paddingLeft: '8px',
          paddingRight: '8px',
          lineHeight: '1.3',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden'
        }}>
          {guide.title}
        </h2>

        {/* Espaciador invisible - Lado derecho */}
        <div style={{
          width: '40px',
          minWidth: '40px',
          flexShrink: 0
        }} />
      </div>

      {/* Zona gráfica central - Contenido dinámico según tipo de ejercicio */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* BREATHING: Círculo respiratorio animado */}
        {guide.type === 'breathing' && (
        <div style={{
          position: 'relative',
          width: '180px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* SVG para anillo con stroke-dashoffset */}
          <svg
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: `scale(${scale})`,
              transition: 'transform 0.1s linear',
              filter: 'drop-shadow(0 8px 24px rgba(217, 70, 239, 0.2))'
            }}
            viewBox="0 0 180 180"
          >
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="#D946EF"
              strokeWidth="3"
              opacity="0.3"
            />
            <circle
              cx="90"
              cy="90"
              r="80"
              fill="none"
              stroke="#D946EF"
              strokeWidth="3"
              strokeDasharray="502.4"
              strokeDashoffset={phase === 'inhale' ? 502.4 * (1 - scale / 1.35) : 502.4 * ((1.35 - scale) / 0.5)}
              opacity="0.8"
              style={{
                transition: 'stroke-dashoffset 0.1s linear'
              }}
            />
          </svg>

          {/* Círculo central relleno con texto dinámico */}
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '8px',
              transform: `scale(${scale})`,
              transition: 'transform 0.1s linear',
              zIndex: 10
            }}
          >
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#7C3AED',
              textAlign: 'center',
              letterSpacing: '1px'
            }}>
              {phaseText[phase]}
            </div>
          </div>
        </div>
        )}

        {/* STRETCH / MOVEMENT: Indicador lineal de fases */}
        {(guide.type === 'stretch' || guide.type === 'movement') && (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#D946EF',
            textAlign: 'center'
          }}>
            {guide.type === 'stretch' ? 'Lado Izquierdo / Lado Derecho' : 'Fase Activa / Descanso'}
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: '#E5E7EB',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #D946EF 0%, #7C3AED 100%)',
              width: `${(timeLeft === 0 ? 0 : ((parseInt(activity.duration.split('-')[0]) * 60 - timeLeft) / (parseInt(activity.duration.split('-')[0]) * 60)) * 100)}%`,
              transition: 'width 0.1s linear'
            }} />
          </div>
        </div>
        )}

        {/* RELAXATION: Temporizador limpio + guía corporal */}
        {guide.type === 'relaxation' && (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#6B7280',
            textAlign: 'center'
          }}>
            Rastreo corporal: libera tensión paso a paso
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            width: '100%'
          }}>
            {['🗣️ Mandíbula', '💪 Hombros', '🧘 Cadera', '🦶 Pies'].map((area, idx) => (
              <div key={idx} style={{
                background: '#F3E8FF',
                border: '1px solid #E9D5FF',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: '#7C3AED'
              }}>
                {area}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Temporizador grande (visible para todos) */}
        <div style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#D946EF',
          fontFamily: 'monospace',
          letterSpacing: '2px'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Instrucciones - Mejoradas */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          width: '100%',
          border: '1px solid #E5E7EB'
        }}>
          {guide.instructions.map((instruction, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '16px',
                color: '#111827',
                margin: idx === guide.instructions.length - 1 ? '0' : '0 0 12px 0',
                lineHeight: '1.6',
                fontWeight: '400',
                textAlign: 'left'
              }}
            >
              <span style={{ fontWeight: '600', color: '#7C3AED' }}>{idx + 1}.</span> {instruction}
            </p>
          ))}
        </div>
      </div>

      {/* Controles de temporizador - Botones circulares */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '16px'
      }}>
        {/* Botón Reiniciar - Circular con SVG */}
        <button
          onClick={handleReset}
          style={{
            width: '56px',
            height: '56px',
            minWidth: '56px',
            minHeight: '56px',
            background: '#F3F4F6',
            border: '1px solid #E5E7EB',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '0'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#E5E7EB';
            e.target.style.borderColor = '#D946EF';
            e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#F3F4F6';
            e.target.style.borderColor = '#E5E7EB';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Botón Play/Pausa - Circular grande */}
        <button
          onClick={() => {
            unlockAudio();
            setIsRunning(!isRunning);
          }}
          style={{
            width: '72px',
            height: '72px',
            minWidth: '72px',
            minHeight: '72px',
            background: '#D946EF',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(217, 70, 239, 0.3)',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#C72BD9';
            e.target.style.boxShadow = '0 6px 16px rgba(217, 70, 239, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#D946EF';
            e.target.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.3)';
          }}
        >
          {isRunning ? '⏸' : '▶'}
        </button>
      </div>

      {/* Botón de finalización - Simplificado */}
      <button
        onClick={handleComplete}
        style={{
          width: '100%',
          padding: '14px',
          background: '#10B981',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '15px',
          color: 'white',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#059669';
          e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#10B981';
          e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
        }}
      >
        ✓ Listo
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
              color: '#111827',
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
                    border: '2px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: selectedMood === emoji ? 1 : 0.6,
                    transform: selectedMood === emoji ? 'scale(1.1)' : 'scale(1)',
                    borderColor: selectedMood === emoji ? '#D946EF' : '#E5E7EB'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#D946EF';
                    e.target.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMood !== emoji) {
                      e.target.style.borderColor = '#E5E7EB';
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
              color: '#6B7280',
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

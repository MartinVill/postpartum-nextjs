'use client';
import { useState, useEffect, useRef } from 'react';

// Audio HTML5 simple - reproduce directamente chime.mp3
const chimeAudio = typeof window !== 'undefined' ? new Audio('/sounds/chime.mp3') : null;

// Las instrucciones se cargan dinámicamente desde la actividad seleccionada

export default function ExercisePlayer({ activity, onComplete, onBack }) {
  const [timeLeft, setTimeLeft] = useState(parseInt(activity.duration.split('-')[0]) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [phase, setPhase] = useState('inhale');
  const [scale, setScale] = useState(1);

  const audioContextRef = useRef(null);
  const hasSoundPlayedRef = useRef(false);
  const wakeLockRef = useRef(null);
  const endTimeRef = useRef(null);

  const guide = {
    title: activity.title,
    instructions: activity.instructions || ['Sigue tu propio ritmo.', 'Escucha a tu cuerpo.', 'Sin presión.'],
    type: activity.type || 'breathing'
  };

  // Wake Lock API: Mantener pantalla encendida durante el ejercicio
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('[WAKE LOCK] Pantalla bloqueada para permanecer encendida');
      }
    } catch (err) {
      console.warn('[WAKE LOCK] No activado:', err);
    }
  };

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('[WAKE LOCK] Pantalla desbloqueada');
      }
    } catch (err) {
      console.warn('[WAKE LOCK] Error liberando:', err);
    }
  };

  // Re-solicitar Wake Lock si pantalla se despierta (user reactiva)
  useEffect(() => {
    if (!isRunning) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        console.log('[WAKE LOCK] Pantalla se oscureció');
      } else {
        console.log('[WAKE LOCK] Pantalla se reactivó, re-solicitando...');
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isRunning]);

  // Cleanup: Liberar Wake Lock al desmontar el componente
  useEffect(() => {
    return () => {
      releaseWakeLock();
      if (chimeAudio) {
        chimeAudio.pause();
        chimeAudio.currentTime = 0;
      }
    };
  }, []);

  // CAPA 2: Bucle de audio silencioso (mantiene la app "activa" en iOS/Android)
  const startSilentAudioLoop = () => {
    try {
      // Crear buffer de silencio absoluto (44.1kHz, 1 segundo)
      if (!silentAudioLoopRef.current) {
        const audioCtx = audioContextRef.current || (window.AudioContext && new (window.AudioContext || window.webkitAudioContext)());
        if (!audioCtx) return;

        const sampleRate = audioCtx.sampleRate;
        const silentBuffer = audioCtx.createBuffer(1, sampleRate, sampleRate);
        // Buffer contiene todo ceros (silencio absoluto)

        silentAudioLoopRef.current = audioCtx.createBufferSource();
        silentAudioLoopRef.current.buffer = silentBuffer;
        silentAudioLoopRef.current.loop = true;
        silentAudioLoopRef.current.loopStart = 0;
        silentAudioLoopRef.current.loopEnd = sampleRate;

        // Volumen prácticamente inaudible
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.001;

        silentAudioLoopRef.current.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Iniciar el bucle
        silentAudioLoopRef.current.start(0);

        console.log('[SILENT LOOP] Bucle de audio silencioso iniciado (mantiene app activa en background)');
      }
    } catch (error) {
      console.warn('[SILENT LOOP] Error iniciando bucle silencioso:', error);
    }
  };

  const stopSilentAudioLoop = () => {
    try {
      if (silentAudioLoopRef.current) {
        silentAudioLoopRef.current.stop();
        silentAudioLoopRef.current = null;
        console.log('[SILENT LOOP] Bucle de audio detenido');
      }
    } catch (error) {
      console.warn('[SILENT LOOP] Error deteniendo bucle:', error);
    }
  };

  // CAPA 3: Web Worker para timers en background (no se congela con pantalla bloqueada)
  const startBackgroundTimer = (totalSeconds) => {
    try {
      if (!backgroundWorkerRef.current) {
        backgroundWorkerRef.current = createBackgroundWorker();

        backgroundWorkerRef.current.onmessage = (event) => {
          const { tick, completed } = event.data;

          // Actualizar UI con tiempo restante
          if (tick !== undefined) {
            setTimeLeft(tick);
          }

          // Cuando el worker reporta finalización
          if (completed) {
            console.log('[BACKGROUND WORKER] Timer completado en background');
            // NO llamar aquí - dejar que el useEffect de timeLeft === 0 lo maneje
          }
        };

        backgroundWorkerRef.current.onerror = (error) => {
          console.warn('[BACKGROUND WORKER] Error en worker:', error);
        };
      }

      backgroundWorkerRef.current.postMessage({ command: 'start', duration: totalSeconds });
      console.log('[BACKGROUND WORKER] Timer iniciado en background thread para', totalSeconds, 'segundos');
    } catch (error) {
      console.error('[BACKGROUND WORKER] Error iniciando background timer:', error);
    }
  };

  const stopBackgroundTimer = () => {
    try {
      if (backgroundWorkerRef.current) {
        backgroundWorkerRef.current.postMessage({ command: 'stop' });
        console.log('[BACKGROUND WORKER] Timer detenido');
      }
    } catch (error) {
      console.warn('[BACKGROUND WORKER] Error deteniendo background timer:', error);
    }
  };

  // Función para desbloquear audio y solicitar permisos
  const unlockAudio = async () => {
    try {
      // Desbloquear audio HTML5 al hacer clic (gesto del usuario)
      if (chimeAudio) {
        chimeAudio.volume = 0;
        chimeAudio.load();
        await chimeAudio.play().catch(() => {});
        chimeAudio.pause();
        chimeAudio.currentTime = 0;
        chimeAudio.volume = 1.0;
        console.log('[AUDIO] Desbloqueo de audio completado');
      }

      // Solicitar permisos de notificación
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
        console.log('[NOTIFICATION] Permisos solicitados');
      }

      // Solicitar Wake Lock
      await requestWakeLock();

      // Inicializar Media Session
      initMediaSession();

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch (error) {
      console.warn('[AUDIO] Error:', error);
    }
  };

  // Media Session API - Control de reproducción en segundo plano
  const initMediaSession = () => {
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: guide.title,
          artist: 'Postpartum Recovery',
          album: 'Cuerpo y Calma',
          artwork: [
            {
              src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect fill="%23D946EF" width="96" height="96"/></svg>',
              sizes: '96x96',
              type: 'image/svg+xml'
            }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          setIsRunning(true);
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          setIsRunning(false);
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          setIsRunning(false);
        });

        console.log('[MEDIA SESSION] Inicializada para audio en segundo plano');
      }
    } catch (error) {
      console.warn('[MEDIA SESSION] Error inicializando:', error);
    }
  };

  // Actualizar Media Session con tiempo restante
  useEffect(() => {
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = isRunning ? 'playing' : 'paused';

        if (navigator.mediaSession.setPositionState) {
          navigator.mediaSession.setPositionState({
            duration: parseInt(activity.duration.split('-')[0]) * 60,
            playbackRate: 1,
            position: Math.max(0, parseInt(activity.duration.split('-')[0]) * 60 - timeLeft)
          });
        }
      }
    } catch (error) {
      console.warn('[MEDIA SESSION] Error actualizando:', error);
    }
  }, [isRunning, timeLeft, activity.duration]);

  // Reproducir cuenco tibetano usando HTMLAudioElement (garantizado en background)
  const playTimerChime = () => {
    try {
      // 1. Intentar con HTMLAudioElement (método principal - funciona en background)
      if (chimeAudioRef.current) {
        // Reset audio para asegurar reproducción desde el inicio
        chimeAudioRef.current.currentTime = 0;
        chimeAudioRef.current.volume = 1.0;
        chimeAudioRef.current.muted = false;

        const playPromise = chimeAudioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('[AUDIO] Cuenco tibetano reproduciendo (HTMLAudioElement)');
              // Éxito, no hacer nada más
            })
            .catch((error) => {
              console.warn('[AUDIO] HTMLAudioElement falló:', error);
              // 2. Fallback: Web Audio API synthesis (si está desbloqueado)
              playWebAudioChime();
            });
        } else {
          // Si play() no devuelve una Promise, intentar directamente
          playWebAudioChime();
        }
      } else {
        console.warn('[AUDIO] Audio element no inicializado, usando Web Audio');
        playWebAudioChime();
      }
    } catch (error) {
      console.error('[AUDIO] Error en playTimerChime:', error);
      // Último fallback: Web Audio
      playWebAudioChime();
    }
  };

  // ARQUITECTURA CRÍTICA: Programar audio en Web Audio API (reloj de hardware)
  // Se ejecuta INCLUSO cuando JS congelado en background (porque es hardware-scheduled)
  const scheduleAudioCompletion = (totalSeconds) => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          console.warn('[AUDIO SCHEDULING] AudioContext no disponible');
          return;
        }
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // Si AudioContext está suspendido, no se puede programar
      if (ctx.state === 'suspended') {
        console.warn('[AUDIO SCHEDULING] AudioContext suspendido, sonido NO se ejecutará en background');
        return;
      }

      // Momento exacto en el AudioContext cuando debe sonar (reloj de hardware)
      // Sumar el tiempo total del ejercicio al tiempo actual del AudioContext
      const completionTime = ctx.currentTime + totalSeconds;

      console.log(`[AUDIO SCHEDULING] Programando sonido para ${totalSeconds}s en audioCtx.currentTime=${completionTime}`);

      // ========== CREAR SONIDO PROGRAMADO ==========
      // Opción 1: Intentar cargar archivo de audio
      if (chimeAudioRef.current && chimeAudioRef.current.src) {
        try {
          // Convertir HTMLAudioElement a AudioBuffer para poder schedularlo
          // (esto es complejo, así que usar oscillator como fallback siempre)
          console.log('[AUDIO SCHEDULING] Usando síntesis de tono (Web Audio API)');
        } catch (e) {
          console.warn('[AUDIO SCHEDULING] No se puede usar archivo, usando síntesis');
        }
      }

      // Opción 2: Síntesis de tono tibetano (siempre funciona)
      const frequencies = [174.61, 349.23, 523.25];
      const attackTime = 0.05;
      const decayTime = 1.5;

      frequencies.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = 2; // +2 cents detune

        // Ganancia: silencio → máximo → decay exponencial
        gain.gain.setValueAtTime(0.001, completionTime); // Inicia silencioso
        gain.gain.linearRampToValueAtTime(0.15, completionTime + attackTime); // Attack
        gain.gain.exponentialRampToValueAtTime(0.001, completionTime + attackTime + decayTime); // Decay

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Programar exactamente en completionTime (reloj de hardware, NO JS)
        osc.start(completionTime);
        osc.stop(completionTime + attackTime + decayTime);
      });

      console.log('[AUDIO SCHEDULING] Sonido programado en hardware ✓ (se ejecutará aunque JS esté congelado)');
    } catch (error) {
      console.error('[AUDIO SCHEDULING] Error programando audio:', error);
    }
  };

  // Fallback: Síntesis de tono con Web Audio API (funciona si fue desbloqueado)
  const playWebAudioChime = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      // Si está suspendido, no hacer nada
      if (ctx.state === 'suspended') {
        console.warn('[AUDIO] AudioContext aún suspendido, no se puede reproducir Web Audio');
        return;
      }

      // Crear tono tibetano (frequencies: 174.61, 349.23, 523.25 Hz)
      const now = ctx.currentTime;
      const duration = 0.5; // Corto (350ms en lugar de 8s para no interferir)
      const frequencies = [174.61, 349.23, 523.25];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = freq;
        osc.detune.value = 2; // Detune +2 cents
        osc.type = 'sine';

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });

      console.log('[AUDIO] Cuenco tibetano reproduciendo (Web Audio API fallback)');
    } catch (error) {
      console.warn('[AUDIO] Web Audio fallback también falló:', error);
    }
  };

  // Mostrar notificación nativa del sistema operativo
  // Esto garantiza alerta sonora + vibración incluso con pantalla bloqueada
  const showNativeNotification = async () => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Ejercicio Completado! 🎉', {
          body: `${guide.title} finalizado. ¡Bien hecho!`,
          icon: '/icon-192x192.png',
          tag: 'exercise-complete',
          vibrate: [400, 150, 400, 150, 500, 200, 600]
        });

        console.log('[NOTIFICATION] Notificación nativa enviada');
      }
    } catch (error) {
      console.warn('[NOTIFICATION] Error:', error);
    }
  };

  // Función para vibración táctil intensa
  const triggerVibration = () => {
    if ('vibrate' in navigator) {
      try {
        // Patrón intenso de vibración: 4 pulsos progresivos
        navigator.vibrate([400, 150, 400, 150, 500, 200, 600]);
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

      // Reproducir audio nativo HTML5 simple
      if (chimeAudio) {
        chimeAudio.currentTime = 0;
        chimeAudio.volume = 1.0;
        chimeAudio.play().catch(() => console.warn('[AUDIO] Play falló'));
      }

      // Vibración táctil
      triggerVibration();
      setTimeout(() => triggerVibration(), 100);

      // Notificación nativa del sistema operativo
      showNativeNotification();

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }

      console.log('[COMPLETION] Ejercicio finalizado');
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

  // Timer simple basado en timestamp absoluto
  useEffect(() => {
    let interval;
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + timeLeft * 1000;
      }

      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
        setTimeLeft(remaining);

        if (remaining === 0) {
          setIsRunning(false);
          endTimeRef.current = null;
        }
      }, 250);
    } else {
      endTimeRef.current = null;
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = async () => {
    hasSoundPlayedRef.current = false;
    await releaseWakeLock();
    setTimeLeft(parseInt(activity.duration.split('-')[0]) * 60);
    setIsRunning(false);
    setScale(1);
  };

  const handleComplete = async () => {
    await releaseWakeLock();
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
      height: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '12px 12px 8px 12px',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header con botón simétrico y título centrado */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        paddingTop: '6px',
        gap: '12px'
      }}>
        {/* Botón Volver - Lado izquierdo */}
        <button
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            padding: '6px',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            minWidth: '36px',
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
          <span style={{ fontSize: '20px', color: '#D946EF', fontWeight: 'bold' }}>&lt;</span>
        </button>

        {/* Título centrado - Centro (permite 2 líneas) */}
        <h2 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: '#D946EF',
          margin: '0',
          textAlign: 'center',
          flex: 1,
          minWidth: '0',
          paddingLeft: '8px',
          paddingRight: '8px',
          lineHeight: '1.2',
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden'
        }}>
          {guide.title}
        </h2>

        {/* Espaciador invisible - Lado derecho */}
        <div style={{
          width: '36px',
          minWidth: '36px',
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
        gap: '12px',
        marginBottom: '12px',
        minHeight: '0'
      }}>
        {/* BREATHING: Círculo respiratorio animado */}
        {guide.type === 'breathing' && (
        <div style={{
          position: 'relative',
          width: '140px',
          height: '140px',
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
              filter: 'drop-shadow(0 4px 16px rgba(217, 70, 239, 0.15))'
            }}
            viewBox="0 0 140 140"
          >
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#D946EF"
              strokeWidth="3"
              opacity="0.3"
            />
            <circle
              cx="70"
              cy="70"
              r="60"
              fill="none"
              stroke="#D946EF"
              strokeWidth="3"
              strokeDasharray="376.99"
              strokeDashoffset={phase === 'inhale' ? 376.99 * (1 - scale / 1.35) : 376.99 * ((1.35 - scale) / 0.5)}
              opacity="0.8"
              style={{
                transition: 'stroke-dashoffset 0.1s linear'
              }}
            />
          </svg>

          {/* Círculo central relleno con texto dinámico */}
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '4px',
              transform: `scale(${scale})`,
              transition: 'transform 0.1s linear',
              zIndex: 10
            }}
          >
            <div style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#7C3AED',
              textAlign: 'center',
              letterSpacing: '0.5px'
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
          gap: '12px'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#D946EF',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            {guide.type === 'stretch' ? 'Lado Izquierdo / Lado Derecho' : 'Fase Activa / Descanso'}
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            background: '#E5E7EB',
            borderRadius: '5px',
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
          gap: '12px'
        }}>
          <div style={{
            fontSize: '13px',
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
          fontSize: '40px',
          fontWeight: '700',
          color: '#D946EF',
          fontFamily: 'monospace',
          letterSpacing: '1px',
          margin: '4px 0'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Instrucciones - Mejoradas */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '12px 14px',
          width: '100%',
          border: '1px solid #E5E7EB'
        }}>
          {guide.instructions.map((instruction, idx) => (
            <p
              key={idx}
              style={{
                fontSize: '13px',
                color: '#111827',
                margin: idx === guide.instructions.length - 1 ? '0' : '0 0 8px 0',
                lineHeight: '1.5',
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
        gap: '16px',
        marginBottom: '8px'
      }}>
        {/* Botón Reiniciar - Circular con SVG */}
        <button
          onClick={handleReset}
          style={{
            width: '48px',
            height: '48px',
            minWidth: '48px',
            minHeight: '48px',
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
            width: '60px',
            height: '60px',
            minWidth: '60px',
            minHeight: '60px',
            background: '#D946EF',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
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
          padding: '10px 12px',
          background: '#10B981',
          border: 'none',
          borderRadius: '50px',
          cursor: 'pointer',
          fontWeight: '700',
          fontSize: '14px',
          color: 'white',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          flexShrink: 0
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

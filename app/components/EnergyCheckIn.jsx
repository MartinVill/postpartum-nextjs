'use client';
import { useState, useEffect, useRef } from 'react';

export default function EnergyCheckIn({ userProfile, onEnergySelect }) {
  const [energy, setEnergy] = useState(5);
  const [currentHour, setCurrentHour] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  const MAX_RECORDING_TIME = 180; // 3 minutos

  useEffect(() => {
    setCurrentHour(new Date().getHours());
  }, []);

  // Limpiar timer cuando se desmonta
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
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

  const startRecording = async () => {
    try {
      setMicPermissionDenied(false);
      setProcessingError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        console.log('[VOICE] ondataavailable disparado, data size:', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('[VOICE] MediaRecorder error:', event.error);
        setProcessingError(`Error de grabación: ${event.error}`);
        setIsRecording(false);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      console.log('[VOICE] Grabación iniciada');

      // Iniciar temporizador
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            console.log('[VOICE] Límite de 3 minutos alcanzado, deteniendo...');
            mediaRecorder.stop();
            clearInterval(timerIntervalRef.current);
            stream.getTracks().forEach(track => track.stop());
            streamRef.current = null;
            setIsRecording(false);
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('[VOICE] Error al iniciar grabación:', error);
      if (error.name === 'NotAllowedError') {
        setMicPermissionDenied(true);
        setProcessingError('Permiso de micrófono denegado');
      } else {
        setProcessingError(`No se pudo acceder al micrófono: ${error.message}`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = (shouldSubmit = false) => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        console.log('[VOICE] Deteniendo grabación, shouldSubmit:', shouldSubmit);

        if (shouldSubmit) {
          // Configurar onstop para enviar cuando se complete la grabación
          mediaRecorderRef.current.onstop = () => {
            console.log('[VOICE] onstop disparado, chunks:', audioChunksRef.current.length);
            // Esperar un tick para que ondataavailable se procese completamente
            setTimeout(() => {
              submitVoiceNote();
            }, 100);
          };
        } else {
          // Cancelar grabación
          mediaRecorderRef.current.onstop = null;
          audioChunksRef.current = [];
          setRecordingTime(0);
        }

        mediaRecorderRef.current.stop();

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        clearInterval(timerIntervalRef.current);
        setIsRecording(false);
      }
    } catch (error) {
      console.error('[VOICE] Error al detener grabación:', error);
      setProcessingError(`Error al detener grabación: ${error.message}`);
      audioChunksRef.current = [];
      setRecordingTime(0);
      setIsRecording(false);
    }
  };

  const submitVoiceNote = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        console.warn('[VOICE] Sin chunks de audio, abortando');
        setIsProcessing(false);
        setProcessingError('No se capturó audio. Vuelve a intentar hablando de nuevo.');
        return;
      }

      setIsProcessing(true);
      setProcessingError(null);

      console.log('[VOICE] Enviando nota de voz, tamaño chunks:', audioChunksRef.current.length);

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('[VOICE] Blob creado, tamaño:', audioBlob.size, 'bytes');

      // Validar que el blob tenga datos
      if (audioBlob.size === 0) {
        console.error('[VOICE] Blob vacío (0 bytes)');
        setIsProcessing(false);
        setProcessingError('No se capturó audio. Vuelve a intentar hablando de nuevo.');
        audioChunksRef.current = [];
        setRecordingTime(0);
        return;
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-note.webm');

      console.log('[VOICE] Iniciando fetch a /api/transcribe...');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      console.log('[VOICE] Response recibida, status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Error al procesar el audio';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('[VOICE] Error response:', errorData);
        } catch (e) {
          console.error('[VOICE] No se pudo parsear error response');
          errorMessage = `Error HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[VOICE] Resultado exitoso:', result);

      // Guardar análisis en localStorage
      const today = new Date().toDateString();
      const checkInData = {
        date: today,
        energyMorning: energy,
        timestamp: new Date().toISOString(),
        voiceNote: {
          transcription: result.transcription,
          moodScore: result.moodScore,
          summary: result.summary,
          tags: result.tags,
        },
      };

      localStorage.setItem('lastCheckInDate', today);
      localStorage.setItem('dailyCheckIn', JSON.stringify(checkInData));
      console.log('[VOICE] Datos guardados en localStorage');

      // Limpiar estado
      audioChunksRef.current = [];
      setRecordingTime(0);
      setIsProcessing(false);
      setProcessingError(null);

      // Esperar un poco antes de redirigir para que se vea el cambio de estado
      console.log('[VOICE] Redirigiendo a Home...');
      setTimeout(() => {
        onEnergySelect(energy);
      }, 500);
    } catch (error) {
      const errorMsg = error?.message || 'Error desconocido al procesar audio';
      console.error('[VOICE] FATAL ERROR:', errorMsg);

      // Resetear estado de grabación y procesamiento
      audioChunksRef.current = [];
      setRecordingTime(0);
      setIsRecording(false);
      setIsProcessing(false);
      setProcessingError(errorMsg);

      // Mostrar error en pantalla
      console.error('[VOICE] Mostrando error al usuario:', errorMsg);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFDF6',
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

          {/* Tarjeta de Registro por Voz - Tipo WhatsApp */}
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            marginTop: '24px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            minHeight: '120px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            {/* Mensaje de permiso denegado */}
            {micPermissionDenied && (
              <div style={{
                padding: '12px',
                background: '#fee',
                borderRadius: '8px',
                color: '#c33',
                fontSize: '13px',
                marginBottom: '12px'
              }}>
                ⚠️ Permiso de micrófono denegado. Por favor, habilita el acceso en los ajustes de tu navegador.
              </div>
            )}

            {/* Mensaje de error de procesamiento */}
            {processingError && (
              <div style={{
                padding: '12px',
                background: '#fee',
                borderRadius: '8px',
                color: '#c33',
                fontSize: '13px',
                marginBottom: '12px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                <span style={{ fontSize: '16px', lineHeight: '1' }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 6px 0', fontWeight: '600' }}>No pudimos procesar tu audio</p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px' }}>{processingError}</p>
                  <button
                    onClick={() => {
                      setProcessingError(null);
                      setIsRecording(false);
                      setRecordingTime(0);
                    }}
                    style={{
                      background: '#c33',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Intentar de nuevo
                  </button>
                </div>
              </div>
            )}

            {/* ESTADO REPOSO */}
            {!isRecording && recordingTime === 0 && (
              <div style={{
                textAlign: 'center',
                minHeight: '96px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '14px',
                  margin: '0 0 14px 0'
                }}>
                  ¿Prefieres hacer tu registro por voz?
                </p>
                <button
                  onClick={startRecording}
                  disabled={isProcessing}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#f0f0f0',
                    border: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    opacity: isProcessing ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isProcessing) e.target.style.background = '#e8e8e8';
                  }}
                  onMouseLeave={(e) => {
                    if (!isProcessing) e.target.style.background = '#f0f0f0';
                  }}
                >
                  🎙️
                </button>
              </div>
            )}

            {/* ESTADO GRABANDO */}
            {isRecording && recordingTime > 0 && (
              <div style={{
                textAlign: 'center',
                minHeight: '96px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '400',
                  color: '#4b5563',
                  marginBottom: '14px',
                  margin: '0 0 14px 0'
                }}>
                  Grabando...
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '20px',
                  marginTop: '12px'
                }}>
                  {/* Temporizador */}
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: '#4b5563',
                    minWidth: '45px'
                  }}>
                    {formatTime(recordingTime)}
                  </div>

                  {/* Botón Cancelar */}
                  <button
                    onClick={() => stopRecording(false)}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#fee';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f0f0f0';
                    }}
                  >
                    ❌
                  </button>

                  {/* Botón Enviar */}
                  <button
                    onClick={() => stopRecording(true)}
                    disabled={isProcessing}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#000',
                      border: 'none',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      color: 'white',
                      fontSize: '22px',
                      fontWeight: '900',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      opacity: isProcessing ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) e.target.style.background = '#222';
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) e.target.style.background = '#000';
                    }}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}

            {/* ESTADO CARGANDO / PROCESANDO */}
            {isProcessing && (
              <div style={{
                textAlign: 'center',
                minHeight: '96px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  width: '28px',
                  height: '28px',
                  border: '3px solid #e0e0e0',
                  borderTop: '3px solid #D946EF',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '12px'
                }} />
                <p style={{
                  fontSize: '13px',
                  color: '#1f2937',
                  fontWeight: '500',
                  margin: '8px 0 0 0'
                }}>
                  Escuchándote y guardando...
                </p>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

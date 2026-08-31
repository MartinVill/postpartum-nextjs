'use client';
import { useState, useEffect, useRef } from 'react';

export default function EnergyCheckIn({ userProfile, onEnergySelect }) {
  const [energy, setEnergy] = useState(5);
  const [currentHour, setCurrentHour] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar temporizador
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
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
      if (error.name === 'NotAllowedError') {
        setMicPermissionDenied(true);
      } else {
        console.error('Error accessing microphone:', error);
        alert('No se pudo acceder al micrófono. Intenta de nuevo.');
      }
    }
  };

  const stopRecording = (shouldSubmit = false) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      clearInterval(timerIntervalRef.current);
      setIsRecording(false);

      if (shouldSubmit) {
        submitVoiceNote();
      } else {
        audioChunksRef.current = [];
        setRecordingTime(0);
      }
    }
  };

  const submitVoiceNote = async () => {
    if (audioChunksRef.current.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-note.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error uploading voice note');
      }

      const result = await response.json();

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

      // Limpiar estado
      audioChunksRef.current = [];
      setRecordingTime(0);
      setIsProcessing(false);

      // Completar check-in
      onEnergySelect(energy);
    } catch (error) {
      console.error('Error submitting voice note:', error);
      alert('Error al procesar la nota de voz. Intenta de nuevo.');
      setIsProcessing(false);
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

          {/* Tarjeta de Registro por Voz - Tipo WhatsApp */}
          <div style={{
            background: 'white',
            padding: '14px',
            borderRadius: '12px',
            marginTop: '24px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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

            {/* ESTADO REPOSO */}
            {!isRecording && recordingTime === 0 && (
              <div style={{
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
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
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
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
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#333',
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
                padding: '10px'
              }}>
                <div style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  border: '2px solid #f0f0f0',
                  borderTop: '2px solid #D946EF',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                  marginBottom: '6px'
                }} />
                <p style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '6px',
                  margin: '6px 0 0 0'
                }}>
                  Escuchándote...
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

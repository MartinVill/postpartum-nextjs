'use client';
import { useState, useRef, useEffect } from 'react';

export default function DailyCheckIn({ onComplete, lastCheckIn }) {
  const [energy, setEnergy] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const streamRef = useRef(null);

  const today = new Date().toDateString();
  const alreadyCheckedIn = lastCheckIn === today;

  const MAX_RECORDING_TIME = 180; // 3 minutos en segundos

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

      mediaRecorder.onstop = () => {
        // Se maneja en stopRecording()
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar temporizador
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            // Detener automáticamente al llegar a 3 minutos
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
        // Enviar audio a la API
        submitVoiceNote();
      } else {
        // Cancelar grabación
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

      localStorage.setItem('lastCheckIn', today);
      localStorage.setItem('dailyCheckIn', JSON.stringify(checkInData));

      // Limpiar estado
      audioChunksRef.current = [];
      setRecordingTime(0);
      setIsProcessing(false);

      // Completar check-in
      onComplete(energy);
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

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Guardar check-in en localStorage (sin voz)
    const checkInData = {
      date: today,
      energyMorning: energy,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('lastCheckIn', today);
    localStorage.setItem('dailyCheckIn', JSON.stringify(checkInData));

    onComplete(energy);
    setIsSubmitting(false);
  };

  if (alreadyCheckedIn) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #D946EF 0%, #C026D3 100%)',
      padding: '16px',
      borderRadius: '16px',
      color: 'white',
      marginBottom: '16px',
      boxShadow: '0 4px 15px rgba(217, 70, 239, 0.2)'
    }}>
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
        Buenos días 💜
      </h2>

      <p style={{ fontSize: '13px', marginBottom: '14px', opacity: 0.95 }}>
        ¿Cómo te sientes hoy?
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '14px',
        borderRadius: '12px',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Muy cansada</span>
          <span style={{ fontSize: '16px', fontWeight: '700' }}>{energy}</span>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>Super activa</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(parseInt(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'white'
          }}
        />
      </div>

      {/* Tarjeta de Registro por Voz - Tipo WhatsApp */}
      <div style={{
        background: 'white',
        padding: '14px',
        borderRadius: '12px',
        marginBottom: '14px',
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
              fontSize: '15px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px'
            }}>
              ¿Prefieres hacer tu registro por voz?
            </p>
            <button
              onClick={startRecording}
              disabled={isProcessing}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#f0f0f0',
                border: 'none',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontSize: '28px',
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
              fontSize: '15px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px'
            }}>
              Grabando...
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '16px'
            }}>
              {/* Temporizador */}
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#333',
                minWidth: '50px'
              }}>
                {formatTime(recordingTime)}
              </div>

              {/* Botón Cancelar */}
              <button
                onClick={() => stopRecording(false)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#f0f0f0',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
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
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#000',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  color: 'white',
                  fontSize: '24px',
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
            padding: '12px'
          }}>
            <div style={{
              display: 'inline-block',
              width: '24px',
              height: '24px',
              border: '3px solid #f0f0f0',
              borderTop: '3px solid #D946EF',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
              marginBottom: '8px'
            }} />
            <p style={{
              fontSize: '13px',
              color: '#666',
              marginTop: '8px'
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

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '12px',
          background: 'rgba(255,255,255,0.25)',
          border: '2px solid rgba(255,255,255,0.5)',
          color: 'white',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '14px',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.35)';
          e.target.style.borderColor = 'rgba(255,255,255,0.7)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.25)';
          e.target.style.borderColor = 'rgba(255,255,255,0.5)';
        }}
      >
        {isSubmitting ? 'Guardando...' : 'Empezar el día'}
      </button>
    </div>
  );
}

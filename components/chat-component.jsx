/**
 * COMPONENTE: Chat Emocional Personalizado
 * Integra OpenAI + Personalización + Voz
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { EmotionAwareChat } from '../lib/openai-personalization-engine';

export default function ChatComponent({ userProfile }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emotionalScore, setEmotionalScore] = useState(7);
  const [showGreeting, setShowGreeting] = useState(true);

  const chatInstance = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Inicializar chat
  useEffect(() => {
    chatInstance.current = new EmotionAwareChat(userProfile);
    setShowGreeting(true);
  }, [userProfile]);

  // Obtener mensaje de bienvenida personalizado
  useEffect(() => {
    if (showGreeting && chatInstance.current) {
      const welcome = chatInstance.current.getWelcomeMessage();
      const recommendations = chatInstance.current.getPersonalizedRecommendations(emotionalScore);

      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: welcome.greeting,
          isGreeting: true,
          recommendations: recommendations
        }
      ]);
      setShowGreeting(false);
    }
  }, []);

  /**
   * Enviar mensaje de texto
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Agregar mensaje del usuario
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage
    }]);

    try {
      // Llamar a OpenAI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          emotionalContext: { todayScore: emotionalScore },
          userProfile: userProfile
        })
      });

      const data = await response.json();

      // Agregar respuesta
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        cost: data.cost
      }]);

      // Text to speech (opcional)
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(data.message);
        utterance.lang = 'es-ES';
        // NO hablar automáticamente, solo preparar para que usuario dé click
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '💙 Hubo un error. Estoy aquí, cuéntame qué sientes.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Grabar voz
   */
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error de micrófono:', error);
      alert('No tengo permiso para acceder al micrófono');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  /**
   * Enviar mensaje de voz
   */
  const handleSendVoiceMessage = async (audioBlob) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('userProfile', JSON.stringify(userProfile));
      formData.append('emotionalContext', JSON.stringify({ todayScore: emotionalScore }));

      const response = await fetch('/api/chat/voice', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      // Agregar transcripción
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'user',
        content: `🎙️ "${data.transcript}"`,
        isVoice: true
      }]);

      // Agregar respuesta
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        hasAudio: data.audio !== 'usar-web-speech-api',
        cost: data.cost
      }]);

      // Reproducir audio si está disponible
      if (data.audio && data.audio !== 'usar-web-speech-api') {
        const audio = new Audio(data.audio);
        audio.play();
      }
    } catch (error) {
      console.error('Error en voz:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '💙 Error procesando voz. ¿Quieres escribir en su lugar?'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reproducir respuesta con voz del navegador
   */
  const handleSpeakResponse = (text) => {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#fff9f5',
      borderRadius: '12px',
      padding: '16px',
      gap: '16px'
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '2px solid #FFE5EC',
        paddingBottom: '12px'
      }}>
        <div>
          <h3 style={{fontSize: '16px', fontWeight: '700', color: '#E91E63', margin: 0}}>
            💬 Desahógate conmigo
          </h3>
          <p style={{fontSize: '11px', color: '#999', margin: '2px 0 0 0'}}>
            Estoy acá para escucharte
          </p>
        </div>
        <span style={{fontSize: '20px'}}>💙</span>
      </div>

      {/* EMOTIONAL CHECK-IN */}
      <div style={{
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        borderLeft: '4px solid #E91E63'
      }}>
        <label style={{fontSize: '12px', fontWeight: '600', color: '#333'}}>
          Cómo te sentís ahora: {emotionalScore}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={emotionalScore}
          onChange={(e) => setEmotionalScore(parseInt(e.target.value))}
          style={{width: '100%', marginTop: '8px'}}
        />
      </div>

      {/* CHAT MESSAGES */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '12px'
      }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px',
              borderRadius: '12px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)'
                : '#F5F5F5',
              color: msg.role === 'user' ? 'white' : '#333',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {msg.content}
              {msg.recommendations && (
                <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.1)'}}>
                  {msg.recommendations.map((rec, idx) => (
                    <div key={idx} style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      marginBottom: '6px',
                      fontSize: '12px'
                    }}>
                      {rec.emoji} {rec.action}
                    </div>
                  ))}
                </div>
              )}
              {msg.hasAudio && (
                <button
                  onClick={() => handleSpeakResponse(msg.content)}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}
                >
                  🔊 Escuchar
                </button>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            paddingLeft: '12px'
          }}>
            <span>Sofia está escribiendo</span>
            <div style={{display: 'flex', gap: '3px'}}>
              <div style={{width: '6px', height: '6px', background: '#E91E63', borderRadius: '50%', animation: 'bounce 1.4s infinite'}} />
              <div style={{width: '6px', height: '6px', background: '#E91E63', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.2s'}} />
              <div style={{width: '6px', height: '6px', background: '#E91E63', borderRadius: '50%', animation: 'bounce 1.4s infinite 0.4s'}} />
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Cuéntame qué sientes..."
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #E91E63',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
          style={{
            padding: '12px 16px',
            background: '#E91E63',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: isLoading || !inputValue.trim() ? 0.5 : 1
          }}
        >
          ✉️
        </button>
      </div>

      {/* VOICE BUTTON */}
      <button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        style={{
          padding: '12px',
          background: isRecording ? '#FF6B6B' : '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        {isRecording ? '⏹️ Detener grabación' : '🎙️ Hablar'}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';

export default function ChatSection({ userId, initialProfile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [emotionalScore, setEmotionalScore] = useState(7);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cargar historial del localStorage al montar
  useEffect(() => {
    if (userId) {
      const savedMessages = localStorage.getItem(`chat_history_${userId}`);
      if (savedMessages) {
        try {
          setMessages(JSON.parse(savedMessages));
        } catch (error) {
          console.error('Error cargando historial:', error);
          setMessages([]);
        }
      }
    }
    if (userId && initialProfile) {
      setUserProfile(initialProfile);
    }
  }, [userId, initialProfile]);

  const faqQuestions = [
    '¿Es normal sentirse abrumada?',
    '¿Cuándo para la depresión postparto?',
    '¿Cómo recuperar la energía?',
    '¿Qué hago si no duermo aunque el bebé duerme?',
    '¿Es normal perder la paciencia con mi pareja?',
    '¿Cuándo puedo volver a hacer ejercicio?',
    '¿Cómo sé si tengo depresión postparto?',
    '¿Qué puedo hacer si no quiero a mi bebé?',
    '¿Es normal sentir que no soy buena madre?',
    '¿Cómo hablar con mi familia sobre cómo me siento?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Guardar historial en localStorage cada que cambian los mensajes
  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  const getContextMessages = () => {
    // Enviar últimos 50 mensajes para contexto (no todo)
    return messages.slice(-50).map(msg => ({
      role: msg.role,
      text: msg.text
    }));
  };

  const clearChatHistory = () => {
    if (window.confirm('¿Estás segura de que querés borrar todo el historial de esta conversación?')) {
      setMessages([]);
      if (userId) {
        localStorage.removeItem(`chat_history_${userId}`);
      }
    }
  };

  const handleRating = async (messageId, ratingType) => {
    setMessages(prev =>
      prev.map(msg => msg.id === messageId ? { ...msg, rating: ratingType } : msg)
    );

    const message = messages.find(m => m.id === messageId);

    try {
      // Guardar en Firestore (opcional, por ahora solo log)
      console.log(`[FEEDBACK] Message ID: ${messageId} | Rating: ${ratingType} | Text: ${message.text.substring(0, 50)}...`);

      // En el futuro: await fetch('/api/feedback', { method: 'POST', body: JSON.stringify({...}) })
    } catch (error) {
      console.error('Error guardando feedback:', error);
    }
  };

  const handleSend = async () => {
    console.log('[SEND] Init:', { hasInput: !!input.trim(), userId, hasProfile: !!userProfile });

    if (!input.trim() || !userId || !userProfile) {
      console.warn('[SEND] EARLY EXIT - missing data', { input: input.trim(), userId, userProfile: !!userProfile });
      return;
    }

    const userMessage = input.trim();
    console.log('[SEND] Message:', userMessage.substring(0, 50));

    setInput('');
    const messageId = Date.now();
    setMessages(prev => [...prev, { id: messageId, role: 'user', text: userMessage, rating: null }]);
    setLoading(true);

    let botMessage = '❓ Esperando respuesta...';

    try {
      console.log('[FETCH] Starting request...');
      console.log('[FETCH] UserProfile type:', typeof userProfile);
      console.log('[FETCH] UserProfile keys:', Object.keys(userProfile || {}));

      const payload = {
        message: userMessage,
        emotionalContext: { todayScore: emotionalScore },
        userProfile: {
          name: userProfile?.name || 'Hermosa',
          hobbies: userProfile?.hobbies || [],
          cyclePhase: userProfile?.cyclePhase || 'unknown',
          babyAge: userProfile?.babyAge || 0,
          favoriteTermsOfEndearment: userProfile?.favoriteTermsOfEndearment || []
        },
        conversationHistory: getContextMessages()
      };

      console.log('[FETCH] Payload ready, sending...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[FETCH] ABORT - timeout triggered');
        controller.abort();
      }, 12000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('[FETCH] Response received, status:', response.status);

      if (!response.ok) {
        console.error('[FETCH] HTTP error:', response.status);
        const text = await response.text();
        console.log('[FETCH] Response body:', text.substring(0, 200));
        botMessage = `❌ Error ${response.status}`;
      } else {
        const data = await response.json();
        console.log('[FETCH] JSON parsed, has message:', !!data.message);

        if (data.message) {
          botMessage = data.message;
          console.log('[FETCH] SUCCESS');
        } else {
          botMessage = '⚠️ Respuesta vacía';
          console.error('[FETCH] No message in response:', data);
        }
      }
    } catch (error) {
      console.error('[FETCH] Exception:', error.name, error.message);
      if (error.name === 'AbortError') {
        botMessage = '⏱️ Tardó demasiado. Intenta de nuevo.';
      } else {
        botMessage = `❌ ${error.message}`;
      }
    } finally {
      console.log('[SEND] Adding bot message');
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: botMessage, rating: null }]);
      setLoading(false);
      console.log('[SEND] Done');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectFaqQuestion = (question) => {
    setInput(question);
    setIsFaqOpen(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        stream.getTracks().forEach(track => track.stop());
        await sendVoiceMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('[VOICE] Error al acceder al micrófono:', error);
      alert('No puedo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = async (audioBlob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('userProfile', JSON.stringify({
      userId: 'user-default',
      name: 'Mamá Guerrera',
      favoriteTermsOfEndearment: ['Reina', 'Mamá Guerrera'],
      hobbies: ['lectura', 'música', 'pintura'],
      cyclePhase: 'Fase Folicular',
      energyLevel: emotionalScore,
      babyAge: 30
    }));
    formData.append('emotionalContext', JSON.stringify({ todayScore: emotionalScore }));

    try {
      console.log('[VOICE] Enviando audio...');
      const response = await fetch('/api/chat/voice', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('[VOICE] Respuesta:', data);

      if (data.transcript) {
        setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: data.transcript, rating: null }]);
      }

      if (data.message) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: data.message, rating: null }]);
      }
    } catch (error) {
      console.error('[VOICE] Error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: `Error de voz: ${error.message}`, rating: null }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Chat Messages */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        flex: 1,
        overflow: 'auto',
        minHeight: '0'
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                background: msg.role === 'user' ? '#D946EF' : '#F5F5F5',
                color: msg.role === 'user' ? 'white' : '#333',
                padding: '10px 14px',
                borderRadius: '16px',
                fontSize: '14px',
                maxWidth: '80%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                boxShadow: msg.role === 'user' ? '0 2px 8px rgba(217, 70, 239, 0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {msg.text}
              </div>
            </div>

            {/* Rating Buttons (solo para respuestas del bot) */}
            {msg.role === 'bot' && (
              <div style={{
                display: 'flex',
                gap: '6px',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginTop: '4px',
                fontSize: '14px'
              }}>
                <button
                  onClick={() => handleRating(msg.id, 'good')}
                  style={{
                    background: msg.rating === 'good' ? '#D946EF' : 'transparent',
                    color: msg.rating === 'good' ? 'white' : '#CCC',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    opacity: msg.rating === 'good' ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.background = msg.rating === 'good' ? '#D946EF' : '#F0F0F0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = msg.rating === 'good' ? 1 : 0.6;
                    e.target.style.background = msg.rating === 'good' ? '#D946EF' : 'transparent';
                  }}
                  title="Me ayudó"
                >
                  👍
                </button>
                <button
                  onClick={() => handleRating(msg.id, 'bad')}
                  style={{
                    background: msg.rating === 'bad' ? '#D946EF' : 'transparent',
                    color: msg.rating === 'bad' ? 'white' : '#CCC',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    opacity: msg.rating === 'bad' ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '1';
                    e.target.style.background = msg.rating === 'bad' ? '#D946EF' : '#F0F0F0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = msg.rating === 'bad' ? 1 : 0.6;
                    e.target.style.background = msg.rating === 'bad' ? '#D946EF' : 'transparent';
                  }}
                  title="No me ayudó"
                >
                  👎
                </button>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ marginBottom: '12px', textAlign: 'left' }}>
            <div style={{
              display: 'inline-block',
              background: '#F0F0F0',
              color: '#999',
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              ✨ Escribiendo...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

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
  const recordingStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordingDurationRef = useRef(0);
  const discardRecordingRef = useRef(false);
  const realtimePeerRef = useRef(null);
  const realtimeDataChannelRef = useRef(null);
  const realtimeTranscriptRef = useRef('');
  const realtimeTranscriptWaiterRef = useRef(null);
  const realtimeConnectionPromiseRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceSending, setIsVoiceSending] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Cargar perfil del usuario e historial del chat al montar
  useEffect(() => {
    try {
      // 1. Cargar perfil: prop initialProfile > localStorage > null
      if (initialProfile) {
        setUserProfile(initialProfile);
        console.log('[CHAT] Using initialProfile:', initialProfile.name);
      } else if (typeof window !== 'undefined') {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setUserProfile(profile);
          console.log('[CHAT] Loaded profile from localStorage:', profile.name);
        } else {
          console.warn('[CHAT] No profile found in localStorage');
        }
      }

      // 2. Cargar historial de mensajes
      if (userId) {
        const savedMessages = localStorage.getItem(`chat_history_${userId}`);
        if (savedMessages) {
          try {
            setMessages(JSON.parse(savedMessages));
            console.log('[CHAT] Loaded message history');
          } catch (error) {
            console.error('Error cargando historial:', error);
            setMessages([]);
          }
        }
      }
    } catch (error) {
      console.error('[CHAT] Error in initialization:', error);
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

  useEffect(() => {
    return () => {
      clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        discardRecordingRef.current = true;
        mediaRecorderRef.current.stop();
      }
      recordingStreamRef.current?.getTracks().forEach(track => track.stop());
      realtimeDataChannelRef.current?.close();
      realtimePeerRef.current?.close();
    };
  }, []);

  // Guardar historial en localStorage cada que cambian los mensajes
  useEffect(() => {
    if (userId && messages.length > 0) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

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

    // Verificar que tenemos datos necesarios
    if (!input.trim()) {
      console.warn('[SEND] Empty message');
      return;
    }

    if (!userId) {
      console.warn('[SEND] No userId');
      return;
    }

    // Si no hay userProfile, intentar cargarlo del localStorage
    let profile = userProfile;
    if (!profile && typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        console.log('[SEND] Loaded missing profile from localStorage:', profile.name);
      }
    }

    if (!profile) {
      console.error('[SEND] NO PROFILE AVAILABLE');
      return;
    }

    const userMessage = input.trim();
    console.log('[SEND] Message:', userMessage.substring(0, 50));
    console.log('[SEND] Using profile:', { name: profile.name, babyAge: profile.babyAge });

    setInput('');
    const messageId = Date.now();
    setMessages(prev => [...prev, { id: messageId, role: 'user', text: userMessage, rating: null }]);
    setLoading(true);

    let botMessage = '❓ Esperando respuesta...';

    try {
      console.log('[FETCH] Starting request...');
      console.log('[FETCH] UserProfile:', { name: profile.name, hasBabyAge: !!profile.babyAge });

      const payload = {
        message: userMessage,
        emotionalContext: { todayScore: emotionalScore },
        userProfile: {
          name: profile.name || 'Hermosa',
          hobbies: profile.hobbies || [],
          cyclePhase: profile.cyclePhase || 'unknown',
          babyAge: profile.babyAge || 0,
          favoriteTermsOfEndearment: profile.favoriteTermsOfEndearment || []
        },
        conversationHistory: getContextMessages()
      };

      console.log('[FETCH] Payload ready:', { name: payload.userProfile.name, msgLen: userMessage.length });

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

  const formatVoiceDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const getPreferredAudioMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';

    return [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ].find(type => MediaRecorder.isTypeSupported(type)) || '';
  };

  const closeRealtimeTranscription = () => {
    realtimeTranscriptWaiterRef.current?.resolve?.(null);
    realtimeTranscriptWaiterRef.current = null;
    realtimeDataChannelRef.current?.close();
    realtimeDataChannelRef.current = null;
    realtimePeerRef.current?.close();
    realtimePeerRef.current = null;
    realtimeConnectionPromiseRef.current = null;
  };

  const connectRealtimeTranscription = async (stream) => {
    if (typeof RTCPeerConnection === 'undefined') return false;

    const peer = new RTCPeerConnection();
    const dataChannel = peer.createDataChannel('oai-events');
    realtimePeerRef.current = peer;
    realtimeDataChannelRef.current = dataChannel;
    realtimeTranscriptRef.current = '';

    dataChannel.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'conversation.item.input_audio_transcription.delta') {
          realtimeTranscriptRef.current += payload.delta || '';
        }

        if (payload.type === 'conversation.item.input_audio_transcription.completed') {
          realtimeTranscriptRef.current = payload.transcript || realtimeTranscriptRef.current;
          realtimeTranscriptWaiterRef.current?.resolve?.(realtimeTranscriptRef.current.trim());
          realtimeTranscriptWaiterRef.current = null;
        }

        if (payload.type === 'conversation.item.input_audio_transcription.failed' || payload.type === 'error') {
          realtimeTranscriptWaiterRef.current?.resolve?.(null);
          realtimeTranscriptWaiterRef.current = null;
        }
      } catch (error) {
        console.warn('[VOICE] Evento Realtime inválido:', error);
      }
    });

    peer.addTrack(stream.getAudioTracks()[0], stream);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    const response = await fetch('/api/chat/voice/realtime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'X-Postpartum-User': userId || 'anonymous'
      },
      body: offer.sdp
    });

    if (!response.ok) {
      throw new Error('Realtime no disponible');
    }

    await peer.setRemoteDescription({ type: 'answer', sdp: await response.text() });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Realtime tardó demasiado en conectar')), 6000);
      dataChannel.addEventListener('open', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      dataChannel.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('Realtime no disponible'));
      }, { once: true });
    });

    return true;
  };

  const getRealtimeTranscript = async () => {
    const dataChannel = realtimeDataChannelRef.current;
    if (!dataChannel || dataChannel.readyState !== 'open') return null;

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        realtimeTranscriptWaiterRef.current = null;
        resolve(realtimeTranscriptRef.current.trim() || null);
      }, 5000);

      realtimeTranscriptWaiterRef.current = {
        resolve: (transcript) => {
          clearTimeout(timeout);
          resolve(transcript || realtimeTranscriptRef.current.trim() || null);
        }
      };

      dataChannel.send(JSON.stringify({ type: 'input_audio_buffer.commit' }));
    });
  };

  const startRecording = async () => {
    if (loading || isRecording || isVoiceSending) return;

    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        setVoiceError('Tu navegador no admite notas de voz.');
        return;
      }

      setVoiceError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredAudioMimeType();
      audioChunksRef.current = [];
      recordingDurationRef.current = 0;
      discardRecordingRef.current = false;

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      recordingStreamRef.current = stream;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm'
        });
        const duration = Math.max(1, recordingDurationRef.current);

        stream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
        const realtimeReady = await Promise.race([
          realtimeConnectionPromiseRef.current || Promise.resolve(false),
          new Promise(resolve => setTimeout(() => resolve(false), 2500))
        ]);
        const realtimeTranscript = !discardRecordingRef.current && realtimeReady
          ? await getRealtimeTranscript()
          : null;

        stream.getTracks().forEach(track => track.stop());
        recordingStreamRef.current = null;
        mediaRecorderRef.current = null;
        clearInterval(recordingTimerRef.current);
        setRecordingSeconds(0);

        if (!discardRecordingRef.current && (realtimeTranscript || audioBlob.size > 0)) {
          await sendVoiceMessage({ audioBlob, transcript: realtimeTranscript, duration });
        }

        closeRealtimeTranscription();
      };

      mediaRecorder.start(250);
      realtimeConnectionPromiseRef.current = connectRealtimeTranscription(stream)
        .catch((error) => {
          console.info('[VOICE] Realtime no disponible; se usará el envío de respaldo.', error.message);
          closeRealtimeTranscription();
          return false;
        });
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingSeconds(recordingDurationRef.current);
        if (recordingDurationRef.current >= 180) {
          stopRecording(false);
        }
      }, 1000);
    } catch (error) {
      console.error('[VOICE] Error al acceder al micrófono:', error);
      setVoiceError('Para enviar una nota de voz, permite el micrófono en tu navegador.');
    }
  };

  const stopRecording = (discard = false) => {
    if (mediaRecorderRef.current && isRecording) {
      discardRecordingRef.current = discard;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const sendVoiceMessage = async ({ audioBlob, transcript, duration }) => {
    setLoading(true);
    setIsVoiceSending(true);

    const profile = userProfile || {};
    const voiceProfile = {
      userId: userId || 'user-default',
      name: profile.name || 'Hermosa',
      favoriteTermsOfEndearment: profile.favoriteTermsOfEndearment || ['hermosa'],
      hobbies: profile.hobbies || [],
      cyclePhase: profile.cyclePhase || 'unknown',
      energyLevel: emotionalScore,
      babyAge: profile.babyAge || 0
    };

    try {
      const requestOptions = transcript
        ? {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript,
              userProfile: voiceProfile,
              emotionalContext: { todayScore: emotionalScore }
            })
          }
        : (() => {
            const formData = new FormData();
            const fileExtension = audioBlob.type.includes('mp4') ? 'm4a' : audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
            formData.append('audio', audioBlob, `nota-de-voz.${fileExtension}`);
            formData.append('userProfile', JSON.stringify(voiceProfile));
            formData.append('emotionalContext', JSON.stringify({ todayScore: emotionalScore }));
            return { body: formData };
          })();

      console.log(`[VOICE] Enviando ${transcript ? 'transcripción Realtime' : 'audio de respaldo'}...`);
      const response = await fetch('/api/chat/voice', {
        method: 'POST',
        ...requestOptions
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No pudimos procesar tu nota de voz.');
      }
      console.log('[VOICE] Respuesta:', data);

      if (data.transcript) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'user',
          text: data.transcript,
          rating: null,
          isVoice: true,
          voiceDuration: duration
        }]);
      }

      if (data.message) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: data.message, rating: null }]);
      }
    } catch (error) {
      console.error('[VOICE] Error:', error);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: `Error de voz: ${error.message}`, rating: null }]);
    } finally {
      setLoading(false);
      setIsVoiceSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
      {/* Chat Messages */}
      <div style={{
        background: 'white',
        padding: '16px',
        paddingBottom: loading ? '80px' : '16px',
        borderRadius: '20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        flex: 1,
        overflow: 'auto',
        minHeight: '0',
        position: 'relative'
      }}>
        {messages.length === 0 && !loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '300px',
            padding: '24px',
            textAlign: 'center'
          }}>
            {/* Ícono con animación */}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              .pulse-icon {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
            `}</style>
            <div className="pulse-icon" style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: '#F3E8FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
              fontSize: '48px'
            }}>
              💬
            </div>

            {/* Título */}
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1F2937',
              margin: '0 0 8px 0',
              lineHeight: '1.4'
            }}>
              Este es tu espacio seguro
            </h3>

            {/* Descripción */}
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              margin: '0',
              lineHeight: '1.6',
              fontWeight: '400',
              maxWidth: '280px'
            }}>
              Escribe lo que sientes, desahógate o pregunta lo que necesites sin filtros ni juicios.
            </p>
          </div>
        )}
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
                {msg.isVoice ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    opacity: 0.9
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="9" y="2" width="6" height="12" rx="3" />
                      <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
                    </svg>
                    Nota de voz · {formatVoiceDuration(msg.voiceDuration || 0)}
                  </div>
                ) : (
                  msg.text
                )}
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
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: '#F0F0F0',
                color: '#999',
                padding: '10px 14px',
                borderRadius: '16px',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {isVoiceSending ? '🎙️ Procesando tu nota de voz...' : '✨ Escribiendo...'}
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
        {!loading && <div ref={messagesEndRef} />}
      </div>

      {/* Emotional Score Slider */}
      <div style={{
        padding: '16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '140px' }}>
          <label style={{ fontSize: '11.5px', color: '#666', display: 'block', fontWeight: '600' }}>
            ¿Cómo estás de ánimo?
          </label>
          <span style={{ fontSize: '11px', color: '#999' }}>
            Así sé cómo responderte
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={emotionalScore}
          onChange={(e) => setEmotionalScore(parseInt(e.target.value))}
          style={{
            flex: 0.9,
            height: '4px',
            cursor: 'pointer',
            accentColor: '#D946EF',
            background: 'linear-gradient(to right, #FEE2E2, #D946EF, #84CC16)',
            borderRadius: '2px',
            WebkitAppearance: 'none',
            appearance: 'none'
          }}
        />
        <span style={{ fontSize: '12px', color: '#BBB', minWidth: '10px', textAlign: 'right', fontWeight: '500' }}>
          {emotionalScore}
        </span>
        <style>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            -webkit-appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            border: 2px solid #D946EF;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(217, 70, 239, 0.25);
          }
          input[type='range']::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            border: 2px solid #D946EF;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(217, 70, 239, 0.25);
          }
        `}</style>
      </div>

      {/* Input Section */}
      <div
        ref={menuRef}
        style={{
          padding: '16px',
          borderRadius: '20px',
          display: 'flex',
          gap: '8px',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {isRecording ? (
          <>
            <div style={{
              flex: 1,
              minHeight: '44px',
              padding: '0 158px 0 10px',
              borderRadius: '20px',
              background: '#EFEFEF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxSizing: 'border-box',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <button
                type="button"
                onClick={() => stopRecording(true)}
                aria-label="Cancelar nota de voz"
                style={{
                  border: 'none', background: 'transparent', color: '#6B7280', cursor: 'pointer',
                  fontSize: '21px', lineHeight: 1, padding: '5px 4px'
                }}
              >
                ×
              </button>
              <span style={{ width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', flex: '0 0 auto' }} />
              <span style={{ color: '#4B5563', fontSize: '14px', fontVariantNumeric: 'tabular-nums', minWidth: '38px' }}>
                {formatVoiceDuration(recordingSeconds)}
              </span>
              <span style={{ color: '#6B7280', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Grabando...
              </span>
            </div>
            <button
              type="button"
              onClick={() => stopRecording(false)}
              aria-label="Enviar nota de voz"
              style={{
                position: 'absolute', right: '56px', width: '44px', height: '44px', padding: '0',
                background: '#D946EF', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 14-7-4 14-3-6-7-1Z" />
              </svg>
            </button>
            <button
              type="button"
              disabled
              aria-label="Más opciones"
              style={{
                position: 'absolute', right: '8px', width: '44px', height: '44px', padding: '0', background: 'transparent',
                border: 'none', borderRadius: '50%', color: '#999', fontSize: '16px', lineHeight: '1', opacity: 0.45,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ⋮
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Cuéntame qué sientes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || isVoiceSending}
              style={{
                flex: 1,
                padding: '12px 16px',
                paddingRight: '158px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: '#EFEFEF',
                transition: 'background 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onFocus={(e) => {
                e.target.style.background = '#E5E5E5';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
              }}
              onBlur={(e) => {
                e.target.style.background = '#EFEFEF';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            />
            <button
              type="button"
              onClick={startRecording}
              disabled={loading || isVoiceSending}
              aria-label="Grabar nota de voz"
              title="Grabar nota de voz"
              style={{
                position: 'absolute', right: '104px', width: '44px', height: '44px', padding: '0',
                background: 'transparent', color: '#4B5563', border: 'none', borderRadius: '50%',
                cursor: loading || isVoiceSending ? 'not-allowed' : 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', opacity: loading || isVoiceSending ? 0.45 : 1
              }}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="2" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || isVoiceSending}
              aria-label="Enviar mensaje"
              style={{
                position: 'absolute', right: '56px', width: '44px', height: '44px', padding: '0',
                background: '#D946EF', color: 'white', border: 'none', borderRadius: '50%',
                cursor: loading || isVoiceSending ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', opacity: loading || isVoiceSending ? 0.6 : 1
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 14-7-4 14-3-6-7-1Z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Más opciones"
              style={{
                position: 'absolute', right: '8px', width: '44px', height: '44px', padding: '0', background: 'transparent',
                border: 'none', borderRadius: '50%', cursor: 'pointer', color: '#999', fontSize: '16px', lineHeight: '1',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Más opciones"
            >
              ⋮
            </button>
          </>
        )}

        {voiceError && !isRecording && (
          <div role="status" style={{
            position: 'absolute', left: '16px', right: '16px', bottom: '-16px', color: '#B45309',
            fontSize: '12px', textAlign: 'center', lineHeight: 1.25
          }}>
            {voiceError}
          </div>
        )}

        {isFaqOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '0',
              right: '0',
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              marginBottom: '8px',
              maxHeight: '300px',
              overflowY: 'auto',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 1001
            }}
          >
            {faqQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectFaqQuestion(q)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: idx < faqQuestions.length - 1 ? '1px solid #F0F0F0' : 'none',
                  borderRight: 'none',
                  borderLeft: 'none',
                  background: 'white',
                  fontSize: '13px',
                  color: '#333',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#F8F8F8'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {isMenuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              right: '0',
              background: 'white',
              border: 'none',
              borderRadius: '12px',
              marginBottom: '8px',
              minWidth: '180px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              zIndex: 1001,
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsFaqOpen(!isFaqOpen);
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: 'none',
                background: 'white',
                fontSize: '13px',
                color: '#333',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
                fontWeight: '500',
                borderBottom: '1px solid #F0F0F0'
              }}
              onMouseEnter={(e) => e.target.style.background = '#F8F8F8'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              ❓ Preguntas frecuentes
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Estás segura de que querés borrar todo el historial de esta conversación?')) {
                  setMessages([]);
                  if (userId) {
                    localStorage.removeItem(`chat_history_${userId}`);
                  }
                  setIsMenuOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: 'none',
                background: 'white',
                fontSize: '13px',
                color: '#333',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
                fontWeight: '500',
                borderTop: '1px solid #F0F0F0'
              }}
              onMouseEnter={(e) => e.target.style.background = '#F8F8F8'}
              onMouseLeave={(e) => e.target.style.background = 'white'}
            >
              🗑️ Borrar historial
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

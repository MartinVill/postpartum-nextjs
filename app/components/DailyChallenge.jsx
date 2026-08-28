'use client';
import { useState, useEffect } from 'react';

const BASE_ACTIVITIES = [
  { id: 'cinema', title: 'Ir al cine', emoji: '🎬' },
  { id: 'cook', title: 'Cocinar algo rico', emoji: '👨‍🍳' },
  { id: 'cafe', title: 'Ir a tu cafetería favorita', emoji: '☕' },
  { id: 'candy', title: 'Comer tu dulce favorito', emoji: '🍭' },
  { id: 'skincare', title: 'Rutina de skincare', emoji: '💄' },
  { id: 'icecream', title: 'Ir a comer helado', emoji: '🍦' },
  { id: 'nails', title: 'Pintarte las uñas', emoji: '💅' },
  { id: 'outfit', title: 'Ponerte tu mejor ropa', emoji: '👗' },
  { id: 'friend', title: 'Invitar a tu mejor amiga', emoji: '👭' },
  { id: 'series', title: 'Ver tu serie favorita', emoji: '📺' },
  { id: 'music', title: 'Escuchar tu música favorita', emoji: '🎵' },
  { id: 'shower', title: 'Tomar una ducha caliente', emoji: '🛁' },
  { id: 'mall', title: 'Ir al centro comercial', emoji: '🛍️' }
];

function getEmojiForHobby(hobbyTitle) {
  const title = hobbyTitle.toLowerCase();
  const emojiMap = {
    'scrapbook': '📐',
    'arte': '🎨',
    'dibujo': '🎨',
    'pintura': '🖼️',
    'ceramica': '🏺',
    'artesania': '🧵',
    'manualidades': '🧵',
    'yoga': '🧘‍♀️',
    'pilates': '🧘‍♀️',
    'gym': '💪',
    'correr': '🏃‍♀️',
    'caminar': '🚶‍♀️',
    'ciclismo': '🚴‍♀️',
    'baile': '💃',
    'danza': '💃',
    'ejercicio': '🏋️‍♀️',
    'netflix': '📺',
    'pelicula': '🎬',
    'cine': '🎬',
    'series': '📺',
    'television': '📺',
    'musica': '🎵',
    'lectura': '📚',
    'leer': '📚',
    'libros': '📚',
    'atrapasol': '☀️',
    'mandalas': '✨',
    'origami': '📄',
    'tejido': '🧶',
    'crochet': '🧶',
    'costura': '🧵',
    'meditacion': '🧘‍♀️',
    'relajacion': '😌',
    'spa': '💆‍♀️',
    'masaje': '💆‍♀️',
    'amigas': '👭',
    'amiga': '👭',
    'amigos': '👫',
    'familia': '👨‍👩‍👧',
    'cafe': '☕',
    'vino': '🍷',
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (title.includes(key) || key.includes(title)) {
      return emoji;
    }
  }

  if (title.includes('yoga') || title.includes('deporte') || title.includes('ejercicio')) return '🧘‍♀️';
  if (title.includes('arte') || title.includes('dibujo') || title.includes('pintura')) return '🎨';
  if (title.includes('lectura') || title.includes('libro')) return '📚';
  if (title.includes('musica') || title.includes('cancion')) return '🎵';

  return '✨';
}

function NetflixIcon() {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#E50914',
      fontFamily: 'Arial, sans-serif',
      letterSpacing: '-2px'
    }}>
      N
    </span>
  );
}

function normalizeForComparison(str) {
  return str.toLowerCase().replace(/^(hacer|ir a|tomar|ir al)\s+/, '').trim();
}

const HOBBY_CORRECTION_MAP = {
  'scraakbook': 'Hacer scrapbook',
  'scrackbook': 'Hacer scrapbook',
  'scrapbook': 'Hacer scrapbook',
  'scraoboosk': 'Hacer scrapbook',
};

function sanitizeHobby(hobby) {
  const lowerHobby = hobby.toLowerCase().trim();
  return HOBBY_CORRECTION_MAP[lowerHobby] || hobby;
}

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

export default function DailyChallenge({ energy, userProfile }) {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentActivityId, setCurrentActivityId] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [challengeData, setChallengeData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('dailyChallengeData');
    const stored = data ? JSON.parse(data) : null;
    const today = new Date().toDateString();

    // REGLA 1: FUENTE ÚNICA DE VERDAD - Leer hobbies desde localStorage
    const userProfileData = localStorage.getItem('userProfile');
    const parsedProfile = userProfileData ? JSON.parse(userProfileData) : null;
    let hobbiesFromProfile = parsedProfile?.hobbies ? parsedProfile.hobbies.slice(0, 3) : [];

    // CORRECCIÓN: Sanitizar hobbies (corregir typos comunes)
    hobbiesFromProfile = hobbiesFromProfile.map(sanitizeHobby);

    // Crear actividades de hobbies (solo primeras 3)
    const hobbyActivities = hobbiesFromProfile.map((hobby, idx) => {
      let emoji = '📐';
      if (hobby.includes('scrapbook') || hobby.includes('Scrapbook')) {
        emoji = '📐';
      } else if (hobby.toLowerCase().includes('netflix') || hobby.toLowerCase().includes('serie')) {
        emoji = <NetflixIcon />;
      } else {
        emoji = getEmojiForHobby(hobby);
      }

      return {
        id: `hobby-${idx}`,
        title: hobby,
        emoji: emoji,
        isHobby: true
      };
    });

    // REGLA 3 + SEGURIDAD: Deduplicación con normalización y Set
    const normalizedHobbies = new Set(hobbiesFromProfile.map(h => normalizeForComparison(h)));

    const finalActivities = [
      ...hobbyActivities,
      ...BASE_ACTIVITIES.filter(base => !normalizedHobbies.has(normalizeForComparison(base.title)))
    ];

    // Deduplicación final: garantizar que no hay dos tarjetas con el mismo título
    const uniqueTitles = new Set();
    const dedupedActivities = finalActivities.filter(activity => {
      const key = activity.title.toLowerCase();
      if (uniqueTitles.has(key)) return false;
      uniqueTitles.add(key);
      return true;
    });

    setActivities(dedupedActivities);

    if (stored && stored.date === today) {
      setChallengeData(stored);
    } else {
      const newData = {
        date: today,
        completed: [],
        streak: stored?.streak || 0,
        points: stored?.points || 0,
        userPreferences: stored?.userPreferences || { accepted: [], rejected: [], feedback: [] }
      };
      localStorage.setItem('dailyChallengeData', JSON.stringify(newData));
      setChallengeData(newData);
    }
  }, []);

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setCurrentActivityId(activity.id);
    setShowModal(true);
  };

  const handleAcceptChallenge = () => {
    if (!currentActivityId) return;

    const updated = {
      ...challengeData,
      completed: [...(challengeData?.completed || []), currentActivityId],
      points: (challengeData?.points || 0) + 10,
      streak: (challengeData?.streak || 0) + 1,
      userPreferences: {
        ...challengeData?.userPreferences,
        accepted: [...(challengeData?.userPreferences?.accepted || []), currentActivityId]
      }
    };

    setChallengeData(updated);
    localStorage.setItem('dailyChallengeData', JSON.stringify(updated));
    setShowModal(false);
    setShowFeedback(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const handleFeedback = (emoji) => {
    const updated = {
      ...challengeData,
      userPreferences: {
        ...challengeData?.userPreferences,
        feedback: [
          ...(challengeData?.userPreferences?.feedback || []),
          { activityId: currentActivityId, emoji, date: new Date().toDateString() }
        ]
      }
    };
    setChallengeData(updated);
    localStorage.setItem('dailyChallengeData', JSON.stringify(updated));
    setShowFeedback(false);
    setCurrentActivityId(null);
  };

  const isActivityCompleted = (id) => challengeData?.completed?.includes(id);

  const warmMessages = [
    'Te mereces disfrutar y celebrar este momento.',
    'Tu bienestar es prioridad. ¡Adelante!',
    'Pequeños actos de amor propio suman.',
    'Hoy es tu día para sonreír y relajarte.',
    '¡Tú puedes! Esto es para ti.'
  ];

  const randomMessage = warmMessages[Math.floor(Math.random() * warmMessages.length)];

  return (
    <div style={{
      padding: '16px',
      paddingBottom: '80px',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      borderRadius: '16px',
      marginBottom: '20px'
    }}>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .activity-card {
          animation: fadeInScale 0.3s ease-out;
        }
        .activity-card:active {
          transform: scale(0.98);
        }
      `}</style>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1F2937',
          margin: '0 0 12px 0'
        }}>
          🎯 Reto de Hoy
        </h2>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: '#FFF0FF',
            border: '1.5px solid #D946EF',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#D946EF',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            ⭐ <span>{challengeData?.points || 0}</span> pts
          </div>
          <div style={{
            background: '#FFF5E6',
            border: '1.5px solid #F59E0B',
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🔥 <span>{challengeData?.streak || 0}</span> días
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {activities.map((activity, index) => (
          <button
            key={activity.id}
            onClick={() => !isActivityCompleted(activity.id) && handleSelectActivity(activity)}
            className="activity-card"
            style={{
              padding: '14px',
              background: isActivityCompleted(activity.id) ? '#F0FDF4' : '#FFFFFF',
              border: activity.isHobby && index < 3 ? '2.5px solid #D946EF' : '1px solid #E5E7EB',
              borderRadius: '14px',
              cursor: isActivityCompleted(activity.id) ? 'default' : 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease-out',
              opacity: isActivityCompleted(activity.id) ? 0.6 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!isActivityCompleted(activity.id)) {
                e.currentTarget.style.background = (activity.isHobby && index < 3) ? '#FFF8FE' : '#F9F9F9';
                e.currentTarget.style.boxShadow = (activity.isHobby && index < 3)
                  ? '0 6px 16px rgba(217, 70, 239, 0.15)'
                  : '0 4px 12px rgba(0, 0, 0, 0.08)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActivityCompleted(activity.id)) {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {activity.isHobby && index < 3 && (
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                background: '#D946EF',
                color: 'white',
                fontSize: '9px',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '12px',
                letterSpacing: '0.3px'
              }}>
                ⭐ PARA TI
              </div>
            )}
            <div style={{ fontSize: '32px', marginBottom: '6px', marginTop: (activity.isHobby && index < 3) ? '12px' : '0', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40px' }}>
              {typeof activity.emoji === 'string' ? activity.emoji : activity.emoji}
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#1F2937',
              lineHeight: '1.3'
            }}>
              {activity.title}
            </div>
            {isActivityCompleted(activity.id) && (
              <div style={{ fontSize: '16px', marginTop: '6px' }}>✅</div>
            )}
          </button>
        ))}
      </div>

      {showModal && selectedActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }} onClick={() => setShowModal(false)}>
          <div
            style={{
              background: 'white',
              borderRadius: '20px 20px 0 0',
              padding: '24px',
              width: '100%',
              maxHeight: '80vh',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60px' }}>
                {typeof selectedActivity.emoji === 'string' ? selectedActivity.emoji : selectedActivity.emoji}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1F2937',
                margin: '0 0 12px 0'
              }}>
                {selectedActivity.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6B7280',
                margin: '0 0 16px 0',
                fontStyle: 'italic'
              }}>
                {randomMessage}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#9CA3AF',
                margin: 0
              }}>
                Ganas: +10 puntos ⭐
              </p>
            </div>

            <button
              onClick={handleAcceptChallenge}
              style={{
                width: '100%',
                padding: '14px',
                background: '#D946EF',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
              onMouseEnter={(e) => e.target.style.background = '#C72BD9'}
              onMouseLeave={(e) => e.target.style.background = '#D946EF'}
            >
              ¡Acepto el reto de hoy!
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#F3F4F6',
                color: '#6B7280',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showFeedback && (
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
              maxWidth: '280px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#1F2937',
              margin: '0 0 16px 0'
            }}>
              ¿Cómo te sientes?
            </h3>
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '16px'
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
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#D946EF';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#E5E7EB';
                    e.target.style.transform = 'scale(1)';
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

      {showConfetti && <Confetti />}
    </div>
  );
}

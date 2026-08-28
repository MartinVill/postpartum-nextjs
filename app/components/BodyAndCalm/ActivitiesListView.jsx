'use client';

const ACTIVITIES_DATABASE = {
  breathing: [
    {
      id: 'breathing-1',
      title: 'Respiración Diafragmática 360°',
      duration: '3-5',
      posture: 'Recostada',
      emoji: '🫁'
    },
    {
      id: 'breathing-2',
      title: 'Box Breathing para Ansiedad',
      duration: '4-6',
      posture: 'Sentada',
      emoji: '🫁'
    },
    {
      id: 'breathing-3',
      title: 'Respiración Alterna (Nadi Shodhana)',
      duration: '5-8',
      posture: 'Sentada',
      emoji: '🫁'
    }
  ],
  stretching: [
    {
      id: 'stretch-1',
      title: 'Apertura Pectoral Suave',
      duration: '5-7',
      posture: 'Sentada',
      emoji: '🧘‍♀️'
    },
    {
      id: 'stretch-2',
      title: 'Liberación de Cervicales y Hombros',
      duration: '6-8',
      posture: 'Sentada',
      emoji: '🧘‍♀️'
    },
    {
      id: 'stretch-3',
      title: 'Secuencia de Espalda Baja',
      duration: '8-10',
      posture: 'Recostada',
      emoji: '🧘‍♀️'
    }
  ],
  relaxation: [
    {
      id: 'relax-1',
      title: 'Exploración Corporal Mindful',
      duration: '7-10',
      posture: 'Recostada',
      emoji: '🕊️'
    },
    {
      id: 'relax-2',
      title: 'Relajación Progresiva',
      duration: '10-15',
      posture: 'Recostada',
      emoji: '🕊️'
    },
    {
      id: 'relax-3',
      title: 'Meditación Guiada: Soltar y Confiar',
      duration: '8-12',
      posture: 'Sentada o Recostada',
      emoji: '🕊️'
    }
  ],
  movement: [
    {
      id: 'move-1',
      title: 'Movimiento Orgánico del Pelvis',
      duration: '5-7',
      posture: 'De pie',
      emoji: '🌿'
    },
    {
      id: 'move-2',
      title: 'Danza Suave de Recuperación',
      duration: '7-10',
      posture: 'De pie',
      emoji: '🌿'
    },
    {
      id: 'move-3',
      title: 'Fortalecimiento Suave del Core',
      duration: '8-10',
      posture: 'Recostada',
      emoji: '🌿'
    }
  ]
};

const CATEGORY_TITLES = {
  breathing: '🫁 Respiración y Core',
  stretching: '🧘‍♀️ Estiramiento y Postura',
  relaxation: '🕊️ Relajación y Pausa',
  movement: '🌿 Movimiento Suave'
};

export default function ActivitiesListView({ categoryId, onSelectActivity, onBack }) {
  const activities = ACTIVITIES_DATABASE[categoryId] || [];
  const categoryTitle = CATEGORY_TITLES[categoryId] || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FBF8F3 0%, #FFF5E1 100%)',
      padding: '20px 16px 100px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingTop: '20px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '50px',
            cursor: 'pointer',
            color: '#C8956D',
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
        >
          ← Volver
        </button>

        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#3E3530',
          margin: '0',
          lineHeight: '1.3',
          letterSpacing: '-0.5px'
        }}>
          {categoryTitle}
        </h1>
      </div>

      {/* Lista de actividades */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {activities.map(activity => (
          <button
            key={activity.id}
            onClick={() => onSelectActivity(activity)}
            style={{
              background: 'white',
              border: '1px solid #D4C4B0',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C8956D';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 149, 109, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D4C4B0';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            <div style={{
              fontSize: '32px',
              flexShrink: 0
            }}>
              {activity.emoji}
            </div>

            <div style={{
              flex: 1,
              minWidth: 0
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#3E3530',
                margin: '0 0 6px 0'
              }}>
                {activity.title}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  background: '#D4E8E0',
                  color: '#6B8E71',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {activity.duration} min
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  background: '#D4C4B0',
                  color: '#7A6F67',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {activity.posture}
                </span>
              </div>
            </div>

            <div style={{
              fontSize: '20px',
              color: '#C8956D',
              flexShrink: 0
            }}>
              →
            </div>
          </button>
        ))}
      </div>

      {/* Footer disclaimer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.9)',
        borderTop: '1px solid #D4C4B0',
        padding: '12px 16px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#999'
      }}>
        ℹ️ Escucha a tu cuerpo y confirma siempre tu alta médica antes de iniciar.
      </div>
    </div>
  );
}

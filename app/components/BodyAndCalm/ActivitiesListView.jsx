'use client';

const ACTIVITIES_DATABASE = {
  breathing: [
    {
      id: 'breathing-1',
      title: 'Respiración Diafragmática 360°',
      duration: '3-5',
      posture: 'Recostada'
    },
    {
      id: 'breathing-2',
      title: 'Box Breathing para Ansiedad',
      duration: '4-6',
      posture: 'Sentada'
    },
    {
      id: 'breathing-3',
      title: 'Respiración Alterna (Nadi Shodhana)',
      duration: '5-8',
      posture: 'Sentada'
    }
  ],
  stretching: [
    {
      id: 'stretch-1',
      title: 'Apertura Pectoral Suave',
      duration: '5-7',
      posture: 'Sentada'
    },
    {
      id: 'stretch-2',
      title: 'Liberación de Cervicales y Hombros',
      duration: '6-8',
      posture: 'Sentada'
    },
    {
      id: 'stretch-3',
      title: 'Secuencia de Espalda Baja',
      duration: '8-10',
      posture: 'Recostada'
    }
  ],
  relaxation: [
    {
      id: 'relax-1',
      title: 'Exploración Corporal Mindful',
      duration: '7-10',
      posture: 'Recostada'
    },
    {
      id: 'relax-2',
      title: 'Relajación Progresiva',
      duration: '10-15',
      posture: 'Recostada'
    },
    {
      id: 'relax-3',
      title: 'Meditación Guiada: Soltar y Confiar',
      duration: '8-12',
      posture: 'Sentada o Recostada'
    }
  ],
  movement: [
    {
      id: 'move-1',
      title: 'Movimiento Orgánico del Pelvis',
      duration: '5-7',
      posture: 'De pie'
    },
    {
      id: 'move-2',
      title: 'Danza Suave de Recuperación',
      duration: '7-10',
      posture: 'De pie'
    },
    {
      id: 'move-3',
      title: 'Fortalecimiento Suave del Core',
      duration: '8-10',
      posture: 'Recostada'
    }
  ]
};

const CATEGORY_TITLES = {
  breathing: '🫁 Respiración y Core',
  stretching: '🧘‍♀️ Estiramiento y Postura',
  relaxation: '🕊️ Relajación y Pausa',
  movement: '🌿 Movimiento Suave'
};

const POSTURE_EMOJI = {
  'Recostada': '🛌',
  'Sentada': '🧘',
  'De pie': '🧍',
  'Sentada o Recostada': '🛌🧘'
};

export default function ActivitiesListView({ categoryId, onSelectActivity, onBack }) {
  const activities = ACTIVITIES_DATABASE[categoryId] || [];
  const categoryTitle = CATEGORY_TITLES[categoryId] || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '20px 16px 100px',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Header con botón absoluto y título centrado */}
      <div style={{
        marginBottom: '24px',
        paddingTop: '20px',
        position: 'relative',
        textAlign: 'center'
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: '0',
            top: '20px',
            background: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s'
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

        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#1F2937',
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
              border: '1px solid #E5E7EB',
              borderRadius: '14px',
              padding: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D946EF';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 70, 239, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              flex: 1,
              minWidth: 0
            }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#111827',
                margin: '0 0 6px 0'
              }}>
                {activity.title}
              </h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  background: '#F3E8FF',
                  color: '#7C3AED',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {activity.duration} min
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  background: '#FCE7F3',
                  color: '#BE185D',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {POSTURE_EMOJI[activity.posture] || '🧘'} {activity.posture}
                </span>
              </div>
            </div>

            <div style={{
              fontSize: '18px',
              color: '#D946EF',
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
        borderTop: '1px solid #E5E7EB',
        padding: '8px 16px',
        textAlign: 'center',
        fontSize: '11px',
        color: '#9CA3AF',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%'
      }}>
        ℹ️ Escucha a tu cuerpo y confirma tu alta médica antes de empezar.
      </div>
    </div>
  );
}

'use client';

const ACTIVITIES_DATABASE = {
  breathing: [
    {
      id: 'resp-1',
      title: 'Respiración Diafragmática 360°',
      duration: '3-5',
      posture: 'Recostada',
      type: 'breathing',
      instructions: [
        'Recuéstate sobre tu espalda con las rodillas flectadas o siéntate cómoda junto a tu bebé.',
        'Inhala lentamente por la nariz llevando el aire hacia tu espalda y costillas inferiores. Exhala suave por la boca.',
        'Tu respiración es el primer freno de mano para la ansiedad de hoy.'
      ]
    },
    {
      id: 'resp-2',
      title: 'Abrazos Abdominales (Transverso)',
      duration: '4-6',
      posture: 'Recostada',
      type: 'breathing',
      instructions: [
        'Recostada sobre tu espalda o sentada erguida.',
        'Inhala profundo. Al exhalar, imagina que tus músculos abdominales abrazan suavemente a tu bebé hacia tu columna.',
        'Tu centro se está volviendo a integrar, dale su tiempo.'
      ]
    },
    {
      id: 'resp-3',
      title: 'Respiración Equilibrante 4x4',
      duration: '5-8',
      posture: 'Sentada',
      type: 'breathing',
      instructions: [
        'Busca una postura donde no tengas que hacer esfuerzo físico.',
        'Inhala en 4 segundos sintiendo cómo se llena tu abdomen y exhala en 4 segundos soltando la tensión del cuello.',
        'Un minuto de calma regula también a tu bebé.'
      ]
    }
  ],
  stretching: [
    {
      id: 'est-1',
      title: 'Liberación de Cervicales y Hombros',
      duration: '5-7',
      posture: 'Sentada',
      type: 'stretch',
      instructions: [
        'Sentada con la espalda apoyada o en la alfombra junto a tu bebé.',
        'Deja caer suavemente la oreja hacia el hombro derecho. Suelta la mandíbula por completo. Cambia de lado a la mitad del tiempo.',
        'Baja los hombros: no tienes que sostener el mundo todo el tiempo.'
      ]
    },
    {
      id: 'est-2',
      title: 'Apertura de Pecho (Postura de Lactancia)',
      duration: '6-8',
      posture: 'De pie',
      type: 'stretch',
      instructions: [
        'De pie o sentada cerca de una pared/silla.',
        'Lleva los codos hacia atrás formando una "W" con tus brazos. Acurruca tus escápulas y respira profundo hacia el pecho.',
        'Desenrollar los hombros le devuelve el espacio a tus pulmones.'
      ]
    },
    {
      id: 'est-3',
      title: 'Descompresión Lumbar en Suelo',
      duration: '8-10',
      posture: 'Recostada',
      type: 'stretch',
      instructions: [
        'En el suelo sobre una alfombra o bordes de la cama.',
        'Lleva suavemente ambas rodillas hacia el pecho o deja caer las piernas hacia un lado liberando la espalda baja.',
        'Tu espalda cargó peso muchos meses, regálale esta pausa.'
      ]
    }
  ],
  relaxation: [
    {
      id: 'rel-1',
      title: 'Pausa de Descarga Somática',
      duration: '7-10',
      posture: 'Recostada',
      type: 'relaxation',
      instructions: [
        'Tu cuerpo estuvo en alerta constante. Esta pausa le avisa a tu sistema nervioso que estás a salvo.',
        'Suelta la lengua del paladar, floja la boca y siente el peso de tus caderas sobre la superficie.',
        'No estás haciendo nada mal. Lo estás haciendo increíble.'
      ]
    },
    {
      id: 'rel-2',
      title: 'Pausa Visual y Descompresión Mental',
      duration: '10-15',
      posture: 'Sentada',
      type: 'relaxation',
      instructions: [
        'Pensada para momentos de sobrecarga sensorial.',
        'Cierra los ojos o fija la mirada en un punto neutro. Notarás pensamientos de pendientes: déjalos pasar sin juzgar.',
        'Estos minutos son solo tuyos.'
      ]
    },
    {
      id: 'rel-3',
      title: 'Rastreo Corporal de Desconexión',
      duration: '8-12',
      posture: 'Recostada',
      type: 'relaxation',
      instructions: [
        'Libera la tensión acumulada en las articulaciones.',
        'Recorre mentalmente tu cuerpo de arriba abajo soltando frente, mandíbula, hombros, abdomen y pies.',
        'Descansar también es cuidar a tu bebé.'
      ]
    }
  ],
  movement: [
    {
      id: 'mov-1',
      title: 'Balanza Pélvica Suave',
      duration: '5-7',
      posture: 'Recostada',
      type: 'movement',
      instructions: [
        'Recostada sobre la espalda con rodillas flectadas.',
        'Bascula suavemente la pelvis pegando y despegando la espalda baja del suelo de forma fluida.',
        'Movimiento sutil para reconectar con tu cuerpo.'
      ]
    },
    {
      id: 'mov-2',
      title: 'Movilidad de Tobillos y Retorno Venoso',
      duration: '7-10',
      posture: 'Recostada',
      type: 'movement',
      instructions: [
        'Recostada con piernas ligeramente elevadas sobre almohadones.',
        'Dibuja círculos lentos con los pies hacia afuera y adentro para activar la circulación de las piernas.',
        'Cuidar tus piernas es cuidar tu energía diaria.'
      ]
    },
    {
      id: 'mov-3',
      title: 'Balanceo de Hombros y Torso',
      duration: '8-10',
      posture: 'Sentada',
      type: 'movement',
      instructions: [
        'Sentada cómoda en una silla o en el suelo.',
        'Realiza giros suaves con los hombros hacia atrás coordinando con una respiración fluida sin forzar.',
        'Recupera la fluidez paso a paso.'
      ]
    }
  ]
};

const CATEGORY_TITLES = {
  breathing: 'Respiración y Core',
  stretching: 'Estiramiento y Postura',
  relaxation: 'Relajación y Pausa',
  movement: 'Movimiento Suave'
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
      background: '#FFFDF6',
      padding: '20px 16px 100px',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Header compartido por las cuatro categorías */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        marginBottom: '24px',
        padding: '12px 16px'
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: '16px',
            zIndex: 10,
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
          width: '100%',
          padding: '0 52px',
          minWidth: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: '#D946EF',
          margin: '0',
          lineHeight: '1.25',
          letterSpacing: '-0.25px',
          textAlign: 'center'
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

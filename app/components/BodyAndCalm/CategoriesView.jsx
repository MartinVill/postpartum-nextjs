'use client';

export default function CategoriesView({ onSelectCategory, onBack }) {
  const categories = [
    {
      id: 'breathing',
      emoji: '🫁',
      title: 'Respiración y Core',
      subtitle: 'Para recuperarte desde adentro'
    },
    {
      id: 'stretching',
      emoji: '🧘‍♀️',
      title: 'Estiramiento y Postura',
      subtitle: 'Para aliviar cargas y dolor de espalda'
    },
    {
      id: 'relaxation',
      emoji: '🕊️',
      title: 'Relajación y Pausa',
      subtitle: 'Para bajar un cambio'
    },
    {
      id: 'movement',
      emoji: '🌿',
      title: 'Movimiento Suave',
      subtitle: 'Para activar tu fuerza cuando te apetezca'
    }
  ];

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
        marginBottom: '32px',
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
          fontSize: '28px',
          fontWeight: '700',
          color: '#3E3530',
          margin: '0',
          lineHeight: '1.3',
          letterSpacing: '-0.5px'
        }}>
          ¿Qué necesita tu cuerpo hoy?
        </h1>
      </div>

      {/* Grid de categorías */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              background: 'white',
              border: '2px solid #D4C4B0',
              borderRadius: '16px',
              padding: '20px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#C8956D';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(200, 149, 109, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D4C4B0';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>
              {cat.emoji}
            </div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#3E3530',
              margin: '0 0 6px 0'
            }}>
              {cat.title}
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#7A6F67',
              margin: '0',
              fontWeight: '400'
            }}>
              {cat.subtitle}
            </p>
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

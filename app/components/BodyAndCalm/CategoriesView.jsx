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
      background: 'linear-gradient(135deg, #FFF8DC 0%, #FFF5E1 100%)',
      padding: '20px 16px 100px',
      maxWidth: '600px',
      margin: '0 auto',
      position: 'relative'
    }}>
      {/* Header con layout simétrico - Botón | Título | Espaciador */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingTop: '12px',
        gap: '12px'
      }}>
        {/* Botón Volver - Lado izquierdo */}
        <button
          onClick={onBack}
          style={{
            background: 'white',
            border: 'none',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            width: '40px',
            height: '40px',
            minWidth: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s',
            flexShrink: 0
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

        {/* Título centrado - Centro */}
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: '#1F2937',
          margin: '0',
          lineHeight: '1.3',
          letterSpacing: '-0.5px',
          flex: 1,
          textAlign: 'center',
          minWidth: '0'
        }}>
          ¿Qué necesita tu cuerpo hoy?
        </h1>

        {/* Espaciador invisible - Lado derecho */}
        <div style={{
          width: '40px',
          minWidth: '40px',
          flexShrink: 0
        }} />
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
              border: '1px solid #E5E7EB',
              borderRadius: '16px',
              padding: '20px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>
              {cat.emoji}
            </div>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 6px 0'
            }}>
              {cat.title}
            </h3>
            <p style={{
              fontSize: '12px',
              color: '#6B7280',
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

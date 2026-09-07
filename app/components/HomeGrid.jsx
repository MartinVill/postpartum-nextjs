'use client';

const HOME_ACTIONS = [
  { id: 'chat', icon: '💬', title: 'Chat de apoyo', subtitle: 'Un espacio para ti' },
  { id: 'reto', icon: '🏆', title: 'Reto del día', subtitle: 'Un paso a la vez' },
  { id: 'body', icon: '🧘‍♀️', title: 'Cuerpo y Calma', subtitle: 'Movimiento suave' },
  { id: 'more', icon: '＋', title: 'Más opciones', subtitle: 'Explora la app' }
];

export default function HomeGrid({ onChat, onBodyAndCalm, onReto, onMoreOptions }) {
  const actions = { chat: onChat, reto: onReto, body: onBodyAndCalm, more: onMoreOptions };

  return (
    <section style={{ minHeight: '100vh', background: 'transparent', padding: '24px 20px 98px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {HOME_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={actions[action.id]}
            style={{
              minHeight: '148px', padding: '18px 14px', background: 'rgba(255,255,255,0.74)', border: '1px solid #F0ECE6', borderRadius: '18px', color: '#25212A', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease', boxShadow: '0 8px 20px rgba(48, 38, 56, 0.055)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '11px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#FFFCFF';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(91, 55, 104, 0.11)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.74)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(48, 38, 56, 0.055)';
            }}
          >
            <span aria-hidden="true" style={{ width: '46px', height: '46px', borderRadius: '15px', background: '#F7EEFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: action.id === 'more' ? '32px' : '27px', lineHeight: 1 }}>
              {action.icon}
            </span>
            <span style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '15px', fontWeight: '700', lineHeight: '1.25', marginBottom: '4px' }}>{action.title}</span>
              <span style={{ display: 'block', fontSize: '12px', lineHeight: '1.35', color: '#59616D' }}>{action.subtitle}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

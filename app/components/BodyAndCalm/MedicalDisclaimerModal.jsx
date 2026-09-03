'use client';

export default function MedicalDisclaimerModal({ onAccept }) {
  return (
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
      zIndex: 9999
    }}>
      <div style={{
        background: '#FFFDF6',
        borderRadius: '20px',
        padding: '32px 24px',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#3E3530',
          margin: '0 0 16px 0',
          lineHeight: '1.4'
        }}>
          💜 Un pequeño recordatorio
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#4B5563',
          margin: '0 0 24px 0',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          Te acompañamos con gentileza. Avanza a tu ritmo y recuerda consultar con tu médico antes de ejercitarte.
        </p>

        <button
          onClick={onAccept}
          style={{
            padding: '11px 20px',
            background: '#D946EF',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#C72BD9'}
          onMouseLeave={(e) => e.target.style.background = '#D946EF'}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

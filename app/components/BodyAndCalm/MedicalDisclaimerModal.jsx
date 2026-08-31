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
        background: 'white',
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
          fontSize: '14px',
          color: '#7A6F67',
          margin: '0 0 24px 0',
          lineHeight: '1.6',
          fontWeight: '400'
        }}>
          Este espacio está diseñado para acompañarte con gentileza. Avanza a tu propio ritmo y confirma con tu médico que cuentas con el alta médica para realizar actividad física.
        </p>

        <button
          onClick={onAccept}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: '#C8956D',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#A8755A'}
          onMouseLeave={(e) => e.target.style.background = '#C8956D'}
        >
          Entendido, empezar
        </button>
      </div>
    </div>
  );
}

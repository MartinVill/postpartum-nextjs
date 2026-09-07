'use client';

import TrialActivationButton from './TrialActivationButton';

export default function TrialActivationScreen({ onActivated, onSkip }) {
  return (
    <main style={{
      minHeight: '100dvh',
      background: '#FFFDF6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px 20px',
      boxSizing: 'border-box'
    }}>
      <section style={{
        width: '100%',
        maxWidth: '390px',
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid #F0E3F4',
        borderRadius: '24px',
        padding: '30px 22px 22px',
        boxShadow: '0 16px 40px rgba(55, 42, 63, 0.09)',
        textAlign: 'center'
      }}>
        <div aria-hidden="true" style={{
          width: '52px',
          height: '52px',
          borderRadius: '18px',
          margin: '0 auto 20px',
          display: 'grid',
          placeItems: 'center',
          background: '#F7EAF9',
          color: '#B43CCB',
          fontSize: '25px'
        }}>✦</div>

        <p style={{ color: '#9A3BC2', fontSize: '13px', fontWeight: '700', margin: '0 0 8px', letterSpacing: '0.15px' }}>
          BIENVENIDA
        </p>
        <h1 style={{ color: '#25212A', fontSize: '27px', lineHeight: 1.18, letterSpacing: '-0.45px', margin: '0 0 12px', fontWeight: '750' }}>
          Empieza con 7 días para ti
        </h1>
        <p style={{ color: '#59616D', fontSize: '15px', lineHeight: 1.52, margin: '0 auto 24px', maxWidth: '305px' }}>
          Prueba la experiencia completa y guarda tu progreso para volver cuando lo necesites.
        </p>

        <div style={{
          padding: '14px 15px',
          textAlign: 'left',
          borderRadius: '14px',
          background: '#FAF6FB',
          border: '1px solid #F0E8F2',
          marginBottom: '18px'
        }}>
          <p style={{ color: '#302A34', fontSize: '13px', fontWeight: '700', margin: '0 0 5px' }}>
            Después eliges cómo continuar
          </p>
          <p style={{ color: '#59616D', fontSize: '13px', lineHeight: 1.45, margin: 0 }}>
            US$15 pago único de lanzamiento o US$5/mes.
          </p>
        </div>

        <TrialActivationButton onActivated={onActivated} />

        <button
          type="button"
          onClick={onSkip}
          style={{
            marginTop: '18px',
            padding: '8px 14px',
            background: 'transparent',
            border: 'none',
            color: '#6A6170',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px'
          }}
        >
          Ahora no
        </button>
      </section>
    </main>
  );
}

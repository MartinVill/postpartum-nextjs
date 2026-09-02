'use client';

export default function BreathingPausePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#FFFDF6', boxSizing: 'border-box', textAlign: 'center' }}>
      <section style={{ maxWidth: '340px' }}>
        <p style={{ margin: '0 0 12px', fontSize: '36px' }}>✨</p>
        <h1 style={{ margin: 0, color: '#D946EF', fontSize: '26px', lineHeight: 1.2 }}>Un momento para ti</h1>
        <p style={{ margin: '16px 0 24px', color: '#4B5563', fontSize: '16px', lineHeight: 1.55 }}>Cuando puedas, inhala despacio y exhala un poco más lento. No hay nada más que hacer ahora.</p>
        <button type="button" onClick={() => window.location.assign('/')} style={{ border: 'none', borderRadius: '12px', padding: '13px 18px', background: '#D946EF', color: '#FFFFFF', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>Volver cuando quieras</button>
      </section>
    </main>
  );
}

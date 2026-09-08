'use client';

import { createInitialWellbeingPlan } from '@/lib/initialWellbeingPlan';

export default function InitialWellbeingPlan({ profile, onContinue }) {
  const plan = createInitialWellbeingPlan(profile);
  const name = profile?.name?.trim();

  return (
    <main style={{ minHeight: '100dvh', background: '#FFFDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px', boxSizing: 'border-box' }}>
      <section style={{ width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.8)', border: '1px solid #EEE7F0', borderRadius: '24px', padding: '25px 21px 22px', boxShadow: '0 18px 42px rgba(55,42,63,0.10)' }}>
        <p style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8E32AE', background: '#FAEDFC', border: '1px solid #EECFF4', borderRadius: '999px', padding: '6px 9px', fontWeight: '750', fontSize: '11px', letterSpacing: '0.38px', margin: '0 0 14px' }}><span aria-hidden="true" style={{ fontSize: '14px', lineHeight: 0 }}>✓</span> GUÍA SUGERIDA PARA TI</p>
        <h1 style={{ color: '#292430', fontSize: '27px', lineHeight: 1.18, letterSpacing: '-0.45px', fontWeight: '760', margin: '0 0 8px' }}>{plan.heading}{name ? `, ${name}` : ''}</h1>
        <p style={{ color: '#59616D', fontSize: '14px', lineHeight: 1.48, margin: '0 0 20px' }}>Diseñada a partir de tus respuestas.</p>

        <div style={{ display: 'grid', gap: '10px' }}>
          {plan.focusCards.map((card) => <article key={card.id} style={{ padding: '15px 14px', border: '1px solid #EDDDF0', borderRadius: '15px', background: 'linear-gradient(125deg, #FFF8FD 0%, #FFFDF9 100%)', boxShadow: '0 6px 16px rgba(75,46,82,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><span aria-hidden="true" style={{ width: '18px', height: '18px', flex: '0 0 auto', display: 'grid', placeItems: 'center', marginTop: '1px', borderRadius: '50%', background: '#D946EF', color: '#FFFFFF', fontSize: '12px', fontWeight: '800' }}>✓</span><div><h2 style={{ color: '#302A34', fontSize: '15px', lineHeight: 1.28, fontWeight: '760', margin: '0 0 5px' }}>{card.title}</h2><p style={{ color: '#59616D', fontSize: '13px', lineHeight: 1.42, margin: 0 }}>{card.description}</p></div></div>
          </article>)}
        </div>

        {plan.safetyMessage && <div role="note" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '13px', padding: '10px 11px', borderRadius: '12px', background: '#FFF9EF', border: '1px solid #F0DFC2', color: '#71523B', fontSize: '11.5px', lineHeight: 1.45 }}><span aria-hidden="true" style={{ color: '#B77B35', fontSize: '14px', lineHeight: 1 }}>!</span><span>{plan.safetyMessage}</span></div>}
        <p style={{ color: '#59616D', fontSize: '13px', lineHeight: 1.45, margin: '18px 2px 12px' }}>Pausas de menos de 5 min, a tu ritmo.</p>
        <p style={{ color: '#706878', fontSize: '11.5px', lineHeight: 1.4, margin: '0 2px 18px' }}>Contenido de bienestar general; no reemplaza la orientación profesional.</p>
        <button type="button" onClick={onContinue} style={{ width: '100%', minHeight: '51px', border: 'none', borderRadius: '14px', background: '#D946EF', color: '#FFFFFF', fontSize: '15px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 9px 19px rgba(217,70,239,0.22)' }}>Continuar a mi prueba de 7 días</button>
      </section>
    </main>
  );
}

'use client';

import { createInitialWellbeingPlan } from '@/lib/initialWellbeingPlan';

const focusIcons = {
  back_comfort: '◌',
  gentle_center: '◌',
  rest_and_recharge: '✦',
  self_compassion: '♡',
  mental_pause: '◌',
  care_first: '⌁'
};

export default function InitialWellbeingPlan({ profile, onContinue }) {
  const plan = createInitialWellbeingPlan(profile);
  const name = profile?.name?.trim();

  return (
    <main style={{ minHeight: '100dvh', background: '#FFFDF6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px', boxSizing: 'border-box' }}>
      <section style={{ width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.76)', border: '1px solid #EEE7F0', borderRadius: '24px', padding: '29px 21px 22px', boxShadow: '0 16px 40px rgba(55,42,63,0.09)' }}>
        <div aria-hidden="true" style={{ width: '48px', height: '48px', display: 'grid', placeItems: 'center', borderRadius: '16px', background: '#F8EAFB', color: '#B43CCB', fontSize: '25px', marginBottom: '19px' }}>✦</div>
        <p style={{ color: '#9232B2', fontWeight: '750', fontSize: '12px', letterSpacing: '0.55px', margin: '0 0 8px' }}>TU MOMENTO DE PARTIDA</p>
        <h1 style={{ color: '#292430', fontSize: '27px', lineHeight: 1.18, letterSpacing: '-0.45px', fontWeight: '760', margin: '0 0 10px' }}>{plan.heading}{name ? `, ${name}` : ''}</h1>
        <p style={{ color: '#505866', fontSize: '15px', lineHeight: 1.5, margin: '0 0 21px' }}>Basada en lo que elegiste. Puedes ajustar tu experiencia cuando quieras.</p>

        {plan.safetyMessage && <div role="note" style={{ marginBottom: '15px', padding: '13px 14px', borderRadius: '14px', background: '#FFF8EA', border: '1px solid #F0DEC0', color: '#664831', fontSize: '13px', lineHeight: 1.48 }}>{plan.safetyMessage}</div>}

        <div style={{ display: 'grid', gap: '11px' }}>
          {plan.focusCards.map((card) => <article key={card.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', border: '1px solid #EEE7F0', borderRadius: '15px', background: '#FCFAFC', boxShadow: '0 4px 13px rgba(53,42,60,0.045)' }}>
            <span aria-hidden="true" style={{ width: '31px', height: '31px', flex: '0 0 auto', display: 'grid', placeItems: 'center', borderRadius: '10px', background: '#F7EAF9', color: '#B43CCB', fontSize: '18px' }}>{focusIcons[card.id] || '✦'}</span>
            <div><h2 style={{ color: '#302A34', fontSize: '15px', lineHeight: 1.28, fontWeight: '750', margin: '0 0 4px' }}>{card.title}</h2><p style={{ color: '#59616D', fontSize: '13px', lineHeight: 1.42, margin: 0 }}>{card.description}</p></div>
          </article>)}
        </div>

        <p style={{ color: '#59616D', fontSize: '13px', lineHeight: 1.48, margin: '20px 2px 16px' }}>Pausas breves, cuando puedas. Sin rutinas pesadas ni presiones estéticas.</p>
        <p style={{ color: '#706878', fontSize: '11.5px', lineHeight: 1.42, margin: '0 2px 19px' }}>Esta app ofrece bienestar general; no evalúa, diagnostica ni reemplaza la orientación de un médico, obstetra o fisioterapeuta.</p>
        <button type="button" onClick={onContinue} style={{ width: '100%', minHeight: '51px', border: 'none', borderRadius: '14px', background: '#D946EF', color: '#FFFFFF', fontSize: '15px', fontWeight: '750', cursor: 'pointer', boxShadow: '0 9px 19px rgba(217,70,239,0.22)' }}>Continuar</button>
      </section>
    </main>
  );
}

'use client';

import { createInitialWellbeingPlan } from '@/lib/initialWellbeingPlan';

function FocusIcon({ id }) {
  const common = { width: 25, height: 25, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.65, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (id === 'care_first' || id === 'rest_and_recharge') return <svg {...common}><path d="M12 20c4.8-3.1 7.1-7.1 6.5-12.2C13.4 8.1 9.1 10.7 7 15.1" /><path d="M7 15c1.9-.2 3.7-1.2 5.1-3.2" /></svg>;
  if (id === 'self_compassion') return <svg {...common}><path d="M20.2 8.8c0 5.1-8.2 9.5-8.2 9.5S3.8 13.9 3.8 8.8A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 8.2 1.4Z" /></svg>;
  if (id === 'back_comfort') return <svg {...common}><path d="M7 18c3.2-1.1 4.8-3.8 4.8-8.2V5.5" /><path d="M12 5.5c1.2 2 3.6 3.1 5.8 2.7" /><path d="M8 14.4c2 .4 4.1-.1 5.6-1.5" /></svg>;
  if (id === 'gentle_center') return <svg {...common}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M8.5 12c1.1 1.3 2.3 2 3.5 2s2.4-.7 3.5-2" /></svg>;
  return <svg {...common}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M8.5 12h7" /></svg>;
}

export default function InitialWellbeingPlan({ profile, onContinue }) {
  const plan = createInitialWellbeingPlan(profile);
  const name = profile?.name?.trim();

  return (
    <main className="wellbeing-plan-shell">
      <section className="wellbeing-plan-content">
        <header className="wellbeing-plan-header">
          <p className="guide-badge"><span aria-hidden="true">✓</span> GUÍA SUGERIDA PARA TI</p>
          <div className="organic-header-art" aria-hidden="true"><svg viewBox="0 0 360 110" preserveAspectRatio="none"><path d="M-10 82C51 30 102 109 171 63c70-47 109-11 199-53" /><path d="M20 97c57-29 91-9 142-36 54-29 93 5 178-41" /></svg></div>
          <h1>{plan.heading}{name ? `, ${name}` : ''}</h1>
          <p className="plan-subtitle">Diseñada a partir de tus respuestas.</p>
        </header>

        <div className="focus-stack">
          {plan.focusCards.map((card, index) => <article key={card.id} className={`focus-card focus-card-${index + 1}`}><span className="focus-icon"><FocusIcon id={card.id} /></span><div><h2>{card.title}</h2><p>{card.description}</p></div></article>)}
        </div>

        {plan.safetyMessage && <div role="note" className="care-note"><span className="care-note-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-3.2 7-9.3V5.5L12 3 5 5.5v6.2C5 17.8 12 21 12 21Z" /><path d="M9.5 12.1 11.2 14l3.6-4" /></svg></span><span>Antes de sumar movimiento activo, consulta con tu profesional de salud si tienes alguna molestia. Mientras tanto, puedes elegir pausas de descanso, sonidos y registro emocional.</span></div>}
        <p className="plan-rhythm">Pausas de menos de 5 min, a tu ritmo.</p>
        <p className="plan-disclaimer">Contenido de bienestar general; no reemplaza la orientación profesional.</p>
        <button type="button" onClick={onContinue} className="plan-continue">Continuar a mi prueba de 7 días</button>
      </section>

      <style jsx>{`
        .wellbeing-plan-shell { min-height: 100dvh; box-sizing: border-box; background: #FFFDF6; padding: clamp(28px, 7vh, 68px) 20px 34px; overflow: auto; }
        .wellbeing-plan-content { width: min(100%, 440px); margin: 0 auto; }
        .wellbeing-plan-header { position: relative; padding: 0 2px 4px; animation: plan-enter 560ms cubic-bezier(.2,.8,.2,1) both; }
        .guide-badge { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; margin: 0 0 13px; padding: 6px 10px; border-radius: 999px; color: #8D3A82; background: #F9E8F0; font-size: 11px; font-weight: 750; letter-spacing: .45px; animation: badge-glow 900ms ease-out 180ms both; }
        .guide-badge span { color: #B73F9D; font-size: 14px; line-height: 1; }
        .organic-header-art { position: absolute; z-index: 0; top: 19px; right: -16px; left: 42px; height: 83px; overflow: hidden; opacity: .78; pointer-events: none; }
        .organic-header-art::before { content: ''; position: absolute; width: 132px; height: 72px; top: 6px; right: 24px; border-radius: 60% 40% 54% 46%; background: radial-gradient(circle at 40% 35%, #F9DDEB 0, #F7E8F2 47%, transparent 71%); filter: blur(1px); }
        .organic-header-art svg { position: absolute; inset: 0; width: 100%; height: 100%; color: #E9B6D7; }
        .organic-header-art path { fill: none; stroke: currentColor; stroke-width: 1.2; opacity: .7; }
        h1 { position: relative; z-index: 1; margin: 0 0 8px; color: #302A34; font-size: clamp(27px, 7vw, 31px); line-height: 1.14; letter-spacing: -.7px; font-weight: 700; }
        .plan-subtitle { position: relative; z-index: 1; margin: 0; color: #5A6370; font-size: 14px; line-height: 1.45; }
        .focus-stack { display: grid; gap: 12px; margin-top: 27px; }
        .focus-card { display: flex; align-items: flex-start; gap: 14px; min-height: 92px; padding: 17px 16px; box-sizing: border-box; border-radius: 20px; animation: card-enter 540ms cubic-bezier(.2,.8,.2,1) both; }
        .focus-card-1 { background: #FDF1F6; animation-delay: 140ms; }
        .focus-card-2 { background: #F8F2FC; animation-delay: 250ms; }
        .focus-icon { width: 39px; height: 39px; flex: 0 0 auto; display: grid; place-items: center; margin-top: 1px; border-radius: 14px; color: #A64594; background: rgba(255,255,255,.64); }
        .focus-card-2 .focus-icon { color: #8053A5; }
        .focus-card h2 { margin: 1px 0 5px; color: #36303A; font-size: 15px; line-height: 1.26; font-weight: 720; letter-spacing: -.15px; }
        .focus-card p { margin: 0; color: #5C626E; font-size: 13px; line-height: 1.44; }
        .care-note { display: flex; align-items: flex-start; gap: 9px; margin-top: 15px; padding: 11px 12px; border-radius: 15px; background: #FFF6E5; color: #74553B; font-size: 11.5px; line-height: 1.46; animation: card-enter 500ms cubic-bezier(.2,.8,.2,1) 350ms both; }
        .care-note-icon { width: 21px; height: 21px; flex: 0 0 auto; display: grid; place-items: center; border-radius: 8px; color: #A87535; background: #FFFDF7; }
        .plan-rhythm { margin: 19px 2px 10px; color: #565D68; font-size: 13px; line-height: 1.45; }
        .plan-disclaimer { margin: 0 2px 20px; color: #77717B; font-size: 11.5px; line-height: 1.42; }
        .plan-continue { width: 100%; min-height: 52px; border: 0; border-radius: 15px; background: linear-gradient(115deg, #D946EF, #C940DE); color: #FFF; font: inherit; font-size: 15px; font-weight: 730; cursor: pointer; box-shadow: 0 7px 17px rgba(217,70,239,.28); transition: transform 160ms ease, box-shadow 160ms ease; }
        .plan-continue:hover { transform: translateY(-1px); box-shadow: 0 10px 21px rgba(217,70,239,.32); }
        .plan-continue:focus-visible { outline: 3px solid rgba(217,70,239,.28); outline-offset: 3px; }
        @keyframes plan-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes card-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes badge-glow { 0% { opacity: .4; box-shadow: 0 0 0 0 rgba(183,63,157,.15); } 70% { opacity: 1; box-shadow: 0 0 0 7px rgba(183,63,157,0); } 100% { opacity: 1; box-shadow: none; } }
        @media (prefers-reduced-motion: reduce) { .wellbeing-plan-header, .guide-badge, .focus-card, .care-note { animation: none; } .plan-continue { transition: none; } }
      `}</style>
    </main>
  );
}

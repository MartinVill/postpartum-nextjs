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
          <h1>{plan.heading}{name && <>, <span className="plan-name">{name}</span></>}</h1>
          <p className="plan-subtitle">Diseñada a partir de tus respuestas.</p>
        </header>

        <div className="focus-stack">
          {plan.focusCards.map((card, index) => <article key={card.id} className={`focus-card focus-card-${index + 1}`}><span className="focus-icon"><FocusIcon id={card.id} /></span><div><h2>{card.title}</h2><p>{card.description}</p></div></article>)}
        </div>

        {plan.safetyMessage && <div role="note" className="care-note"><span className="care-note-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-3.2 7-9.3V5.5L12 3 5 5.5v6.2C5 17.8 12 21 12 21Z" /><path d="M9.5 12.1 11.2 14l3.6-4" /></svg></span><span>Antes de sumar movimiento activo, consulta con tu profesional de salud si tienes alguna molestia. Mientras tanto, puedes elegir pausas de descanso, sonidos y registro emocional.</span></div>}
        <p className="plan-rhythm"><span>⏱️ Pausas de &lt;5 min</span><i aria-hidden="true" /> <span>🌸 A tu ritmo</span></p>
        <p className="plan-disclaimer">Contenido de bienestar general; no reemplaza la orientación profesional.</p>
        <button type="button" onClick={onContinue} className="plan-continue">Continuar a mi prueba de 7 días</button>
      </section>

      <style jsx>{`
        .wellbeing-plan-shell { min-height: 100dvh; box-sizing: border-box; background: radial-gradient(circle at 50% 14%, #FFFDF9 0%, #FFFDF6 42%, #FAF5FF 100%); padding: clamp(28px, 7vh, 68px) 20px 34px; overflow: auto; }
        .wellbeing-plan-content { width: min(100%, 440px); margin: 0 auto; }
        .wellbeing-plan-header { padding: 0 2px; animation: plan-enter 560ms cubic-bezier(.2,.8,.2,1) both; }
        h1 { margin: 0 0 8px; color: #302A34; font-size: clamp(27px, 7vw, 31px); line-height: 1.14; letter-spacing: -.7px; font-weight: 700; }
        .plan-name { color: #C026D3; }
        .plan-subtitle { margin: 0 0 24px; color: #4B5563; font-size: 14px; line-height: 1.45; }
        .focus-stack { display: grid; gap: 12px; margin-top: 0; }
        .focus-card { display: flex; align-items: flex-start; gap: 14px; min-height: 92px; padding: 17px 16px; box-sizing: border-box; border-radius: 24px; animation: card-enter 540ms cubic-bezier(.2,.8,.2,1) both; }
        .focus-card-1 { background: #FDF1F6; border: 1px solid rgba(225,169,197,.5); animation-delay: 140ms; }
        .focus-card-2 { background: #F8F2FC; border: 1px solid rgba(186,155,214,.42); animation-delay: 250ms; }
        .focus-icon { width: 44px; height: 44px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; margin-top: 1px; border-radius: 15px; color: #A64594; background: rgba(255,255,255,.64); }
        .focus-card-2 .focus-icon { color: #8053A5; }
        .focus-card h2 { margin: 1px 0 5px; color: #1F2937; font-size: 15px; line-height: 1.26; font-weight: 720; letter-spacing: -.15px; }
        .focus-card p { margin: 0; color: #5C626E; font-size: 13px; line-height: 1.44; }
        .care-note { display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; padding: 10px 2px 0; color: #74553B; font-size: 13px; line-height: 1.4; animation: card-enter 500ms cubic-bezier(.2,.8,.2,1) 350ms both; }
        .care-note-icon { width: 16px; height: 16px; flex: 0 0 auto; display: flex; align-items: center; justify-content: center; margin-top: 1px; color: #A87535; }
        .plan-rhythm { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin: 18px 2px 10px; color: #565D68; font-size: 12.5px; line-height: 1.4; }
        .plan-rhythm i { width: 3px; height: 3px; border-radius: 50%; background: #C48BBE; }
        .plan-disclaimer { margin: 0 2px 20px; color: #77717B; font-size: 11.5px; line-height: 1.42; }
        .plan-continue { width: 100%; min-height: 52px; border: 0; border-radius: 15px; background: linear-gradient(115deg, #D946EF, #C940DE); color: #FFF; font: inherit; font-size: 15px; font-weight: 730; cursor: pointer; box-shadow: 0 8px 20px rgba(217,70,239,.35); transition: transform 200ms ease, box-shadow 200ms ease; }
        .plan-continue:hover { transform: translateY(-1px); box-shadow: 0 11px 23px rgba(217,70,239,.39); }
        .plan-continue:active { transform: scale(.98); box-shadow: 0 5px 13px rgba(217,70,239,.29); }
        .plan-continue:focus-visible { outline: 3px solid rgba(217,70,239,.28); outline-offset: 3px; }
        @keyframes plan-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes card-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .wellbeing-plan-header, .focus-card, .care-note { animation: none; } .plan-continue { transition: none; } }
      `}</style>
    </main>
  );
}

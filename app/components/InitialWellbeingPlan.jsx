'use client';

import { createInitialWellbeingPlan } from '@/lib/initialWellbeingPlan';

const FEATURES = [
  { id: 'guide', title: 'Guía diaria', description: 'Dinos cómo estás y te sugerimos tu pausa del día.' },
  { id: 'chat', title: 'Voz o texto', description: 'Exprésate cuando lo necesites.' },
  { id: 'calendar', title: 'Tu calendario', description: 'Síntomas, eventos y recordatorios sin carga mental.' },
  { id: 'calm', title: 'Pausas de calma', description: 'Respiraciones, sonidos y momentos a tu ritmo.' }
];

function FeatureIcon({ id }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (id === 'guide') return <svg {...common}><path d="M12 3v4" /><path d="M12 17v4" /><path d="m5.6 5.6 2.8 2.8" /><path d="m15.6 15.6 2.8 2.8" /><path d="M3 12h4" /><path d="M17 12h4" /><circle cx="12" cy="12" r="4" /></svg>;
  if (id === 'chat') return <svg {...common}><path d="M20 11.2a7.5 7.5 0 0 1-8 7.5 8.5 8.5 0 0 1-3.1-.6L4 20l1.5-4.1A7.4 7.4 0 0 1 4 11.2a8 8 0 0 1 16 0Z" /><path d="M8.5 11.2h.01M12 11.2h.01M15.5 11.2h.01" /></svg>;
  if (id === 'calendar') return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M4 10h16" /><path d="M8 14h.01M12 14h.01M16 14h.01" /></svg>;
  return <svg {...common}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /><path d="M8 12c1.3 1.4 2.6 2 4 2s2.7-.6 4-2" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>;
}

export default function InitialWellbeingPlan({ profile, onContinue }) {
  const plan = createInitialWellbeingPlan(profile);
  const name = profile?.name?.trim();

  return (
    <main className="wellbeing-plan-shell">
      <section className="wellbeing-plan-content">
        <header className="wellbeing-plan-header">
          <h1>Esto es para ti{ name && <>, <span>{name}</span></>}</h1>
          <p>Un espacio que se ajusta a lo que necesitas hoy.</p>
        </header>

        <section className="empathy-block" aria-labelledby="benefit-heading">
          <h2 id="benefit-heading">Aquí encontrarás una forma simple de:</h2>
          <ul>
            <li>Bajar el ritmo cuando todo se siente mucho.</li>
            <li>Volver a escuchar tu cuerpo, sin exigirte.</li>
            <li>Hacer un espacio para ti en pocos minutos.</li>
          </ul>
        </section>

        <section className="feature-section" aria-labelledby="feature-heading">
          <h2 id="feature-heading">Desde hoy tienes</h2>
          <div className="feature-grid">
            {FEATURES.map((feature, index) => <article className={`feature-card feature-${index + 1}`} key={feature.id}>
              <span className="feature-icon"><FeatureIcon id={feature.id} /></span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>)}
          </div>
        </section>

        {plan.safetyLevel === 'restricted' && <p className="care-note"><span aria-hidden="true">⚠</span> Antes de sumar movimiento activo, consulta a tu profesional de salud.</p>}
        <p className="encouragement">Sin presiones. Empieza cuando puedas.</p>
        <button type="button" onClick={onContinue} className="plan-continue">Activar 7 días para ti</button>
        <p className="plan-disclaimer">Contenido de bienestar general; no reemplaza la orientación profesional.</p>
      </section>

      <style jsx>{`
        .wellbeing-plan-shell { min-height: 100dvh; box-sizing: border-box; background: radial-gradient(circle at 50% 12%, #FFFDF9 0%, #FFFDF6 43%, #FAF5FF 100%); padding: clamp(26px, 6vh, 58px) 20px 34px; overflow: auto; }
        .wellbeing-plan-content { width: min(100%, 440px); margin: 0 auto; }
        .wellbeing-plan-header { animation: reveal 500ms cubic-bezier(.2,.8,.2,1) both; }
        .wellbeing-plan-header h1 { margin: 0 0 8px; color: #302A34; font-size: clamp(27px, 7vw, 32px); line-height: 1.12; letter-spacing: -.75px; font-weight: 700; }
        .wellbeing-plan-header h1 span { color: #C026D3; }
        .wellbeing-plan-header p { margin: 0; color: #4B5563; font-size: 14px; line-height: 1.45; }
        .empathy-block { margin-top: 24px; padding: 15px 16px; border-radius: 20px; background: rgba(253,241,246,.78); border: 1px solid rgba(225,169,197,.38); animation: reveal 520ms cubic-bezier(.2,.8,.2,1) 90ms both; }
        .empathy-block h2, .feature-section > h2 { margin: 0; color: #3C3440; font-size: 13px; line-height: 1.35; font-weight: 720; }
        .empathy-block ul { display: grid; gap: 7px; padding: 0; margin: 11px 0 0; list-style: none; color: #5A5360; font-size: 13px; line-height: 1.36; }
        .empathy-block li { display: flex; gap: 8px; }
        .empathy-block li::before { content: '•'; color: #C026D3; font-size: 17px; line-height: 12px; }
        .feature-section { margin-top: 24px; animation: reveal 540ms cubic-bezier(.2,.8,.2,1) 180ms both; }
        .feature-section > h2 { margin: 0 0 11px; color: #433847; font-size: 14px; }
        .feature-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .feature-card { min-height: 118px; padding: 13px 12px 12px; box-sizing: border-box; border-radius: 19px; animation: reveal 520ms cubic-bezier(.2,.8,.2,1) both; }
        .feature-1 { background: #FDF1F6; border: 1px solid rgba(225,169,197,.48); animation-delay: 220ms; }
        .feature-2 { background: #F8F2FC; border: 1px solid rgba(186,155,214,.42); animation-delay: 280ms; }
        .feature-3 { background: #FDF6ED; border: 1px solid rgba(225,191,143,.38); animation-delay: 340ms; }
        .feature-4 { background: #F1F8F5; border: 1px solid rgba(143,190,166,.35); animation-delay: 400ms; }
        .feature-icon { width: 31px; height: 31px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; border-radius: 11px; color: #9C3D89; background: rgba(255,255,255,.68); }
        .feature-2 .feature-icon { color: #7D55A2; }.feature-3 .feature-icon { color: #A46B38; }.feature-4 .feature-icon { color: #4F8C70; }
        .feature-card h3 { margin: 0 0 4px; color: #26303A; font-size: 13px; line-height: 1.24; font-weight: 740; letter-spacing: -.12px; }
        .feature-card p { margin: 0; color: #59616D; font-size: 11.5px; line-height: 1.35; }
        .care-note { display: flex; align-items: flex-start; gap: 7px; margin: 17px 1px 0; color: #77543B; font-size: 12.5px; line-height: 1.4; }.care-note span { color: #B37734; }
        .encouragement { margin: 18px 2px 13px; color: #535C67; font-size: 13px; line-height: 1.4; font-weight: 650; }
        .plan-continue { width: 100%; min-height: 52px; border: 0; border-radius: 15px; background: linear-gradient(115deg, #D946EF, #C940DE); color: #FFF; font: inherit; font-size: 15px; font-weight: 730; cursor: pointer; box-shadow: 0 8px 20px rgba(217,70,239,.35); transition: transform 200ms ease, box-shadow 200ms ease; }.plan-continue:hover { transform: translateY(-1px); box-shadow: 0 11px 23px rgba(217,70,239,.39); }.plan-continue:active { transform: scale(.98); box-shadow: 0 5px 13px rgba(217,70,239,.29); }.plan-continue:focus-visible { outline: 3px solid rgba(217,70,239,.28); outline-offset: 3px; }
        .plan-disclaimer { margin: 13px 3px 0; color: #77717B; font-size: 11px; line-height: 1.38; text-align: center; }
        @keyframes reveal { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .wellbeing-plan-header, .empathy-block, .feature-section, .feature-card { animation: none; } .plan-continue { transition: none; } }
      `}</style>
    </main>
  );
}

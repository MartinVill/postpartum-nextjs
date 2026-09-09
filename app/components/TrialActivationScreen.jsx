'use client';

import { useMemo, useState } from 'react';
import TrialActivationButton from './TrialActivationButton';
import { auth } from '@/lib/firebase';

const PLAN_DETAILS = {
  lifetime: {
    eyebrow: 'MÁS POPULAR · PAGO ÚNICO',
    price: '$15 USD',
    suffix: 'de por vida',
    description: 'Un único pago. Sin cobros recurrentes.'
  },
  monthly: {
    eyebrow: 'SUSCRIPCIÓN MENSUAL',
    price: '$5 USD',
    suffix: 'por mes',
    description: 'Flexible. Cancela cuando quieras.'
  }
};

function formatDate(date) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })
    .format(date)
    .replace('.', '');
}

function TimelineIcon({ type }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (type === 'bell') return <svg {...common}><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>;
  if (type === 'lock') return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
  return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
}

export default function TrialActivationScreen({ onAuthenticated, onSkip }) {
  const [selectedPlan, setSelectedPlan] = useState('lifetime');
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const timeline = useMemo(() => {
    const today = new Date();
    const reminder = new Date(today); reminder.setDate(today.getDate() + 5);
    const activation = new Date(today); activation.setDate(today.getDate() + 7);
    return { today: formatDate(today), reminder: formatDate(reminder), activation: formatDate(activation) };
  }, []);

  const beginCheckout = async (user) => {
    setCheckoutStatus('loading');
    setErrorMessage('');
    try {
      const idToken = await user.getIdToken();
      await onAuthenticated?.({ uid: user.uid, email: user.email || '', displayName: user.displayName || '', idToken });
      const response = await fetch('/api/billing/paypal/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ planType: selectedPlan })
      });
      const payload = await response.json();
      if (!response.ok || !payload.approvalUrl) throw new Error(payload.error || 'No pudimos abrir PayPal.');
      window.location.assign(payload.approvalUrl);
    } catch (error) {
      setCheckoutStatus('idle');
      setErrorMessage(error.message || 'No pudimos iniciar PayPal. Inténtalo de nuevo.');
    }
  };

  const handleMainAction = () => {
    if (auth?.currentUser) {
      beginCheckout(auth.currentUser);
      return;
    }
    setErrorMessage('');
    setShowAuthSheet(true);
  };

  return (
    <main className="paywall-shell">
      <section className="paywall-content">
        <header className="paywall-header">
          <h1>Comienza tus 7 días de calma sin riesgo</h1>
          <p>Acceso inmediato a tu guía diaria, herramientas de pausa, registro personal, y mucho más.</p>
        </header>

        <ol className="trial-timeline" aria-label="Cómo funciona la prueba">
          <li className="timeline-step timeline-step-1"><span className="timeline-node"><TimelineIcon type="check" /></span><div><strong>Hoy · {timeline.today}</strong><p>Desbloquea toda la app. Cobro de $0 USD hoy.</p></div></li>
          <li className="timeline-step timeline-step-2"><span className="timeline-node"><TimelineIcon type="bell" /></span><div><strong>Día 5 · {timeline.reminder}</strong><p>Te enviamos un email de recordatorio.</p></div></li>
          <li className="timeline-step timeline-step-3"><span className="timeline-node"><TimelineIcon type="lock" /></span><div><strong>Día 7 · {timeline.activation}</strong><p>Se activa el plan. Cancelas cuando quieras.</p></div></li>
        </ol>

        <fieldset className="plan-selector" disabled={checkoutStatus === 'loading'}>
          <legend>Elige cómo continuar después</legend>
          {Object.entries(PLAN_DETAILS).map(([id, plan], index) => <button key={id} type="button" onClick={() => setSelectedPlan(id)} className={`plan-option plan-option-${index + 1} ${selectedPlan === id ? 'selected' : ''}`} aria-pressed={selectedPlan === id}>
            <span className="plan-radio" aria-hidden="true" />
            <span className="plan-copy"><small>{plan.eyebrow}</small><strong>{plan.price} <em>{plan.suffix}</em></strong><span>{plan.description}</span></span>
          </button>)}
        </fieldset>

        <button type="button" className="paywall-cta" onClick={handleMainAction} disabled={checkoutStatus === 'loading'}>
          {checkoutStatus === 'loading' ? 'Abriendo PayPal…' : 'Probar 7 días por $0 USD'}
        </button>
        <p className="paypal-note"><span aria-hidden="true">⌁</span> Procesamiento seguro por PayPal.</p>
        <p className="payment-reassurance">No se te cobrará nada hoy.</p>
        {errorMessage && <p className="paywall-error" role="alert">{errorMessage}</p>}
        <button type="button" onClick={onSkip} className="paywall-skip">Dejar para más tarde</button>
      </section>

      {showAuthSheet && <div className="auth-layer" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-backdrop" type="button" aria-label="Cerrar acceso" onClick={() => setShowAuthSheet(false)} />
        <section className="auth-sheet">
          <div className="sheet-handle" aria-hidden="true" />
          <button type="button" className="sheet-close" aria-label="Cerrar" onClick={() => setShowAuthSheet(false)}>×</button>
          <h2 id="auth-title">Guarda tu prueba</h2>
          <p>Crea tu acceso para que podamos guardar tu guía, tu prueba y tu progreso.</p>
          <TrialActivationButton onAuthenticated={beginCheckout} />
        </section>
      </div>}

      <style jsx>{`
        .paywall-shell { position: relative; min-height: 100dvh; box-sizing: border-box; background: radial-gradient(circle at 50% -12%, #FBEAFE 0%, #FFF9F4 35%, #FFFDF6 74%); padding: 30px 20px 26px; overflow: auto; animation: screen-in 420ms ease-out both; }
        .paywall-shell::before { content: ''; position: fixed; z-index: 0; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% -7%, rgba(232,121,249,.11), transparent 38%); animation: ambient-settle 850ms ease-out both; }
        .paywall-content { position: relative; z-index: 1; width: min(100%, 398px); margin: 0 auto; }
        .paywall-header { text-align: center; animation: reveal .5s cubic-bezier(.22,1,.36,1) both; }.paywall-header h1 { margin: 0; color: #374151; font-size: clamp(28px, 7vw, 33px); line-height: 1.13; letter-spacing: -.7px; font-weight: 730; }.paywall-header > p:last-child { max-width: 340px; margin: 11px auto 0; color: #3F4650; font-size: 15px; line-height: 1.45; }
        .trial-timeline { position: relative; display: grid; gap: 15px; margin: 27px 0 24px; padding: 0; list-style: none; text-align: left; }.trial-timeline::before { content: ''; position: absolute; left: 16px; top: 30px; bottom: 30px; width: 1px; background: linear-gradient(#D946EF, #EAD4EE); transform-origin: top; animation: line-draw 520ms cubic-bezier(.22,1,.36,1) 150ms both; }.trial-timeline li { position: relative; display: flex; gap: 13px; align-items: flex-start; }.timeline-step { animation: reveal 420ms cubic-bezier(.22,1,.36,1) both; }.timeline-step-1 { animation-delay: 170ms; }.timeline-step-2 { animation-delay: 270ms; }.timeline-step-3 { animation-delay: 370ms; }.timeline-node { position: relative; z-index: 1; width: 33px; height: 33px; border: 1px solid #F0CFF5; border-radius: 50%; display: grid; place-items: center; flex: 0 0 auto; background: #FFFDF6; color: #B63ACB; }.trial-timeline strong { display: block; color: #374151; font-size: 14px; line-height: 1.25; font-weight: 730; }.trial-timeline p { margin: 4px 0 0; color: #4A535F; font-size: 13px; line-height: 1.38; }
        .plan-selector { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; animation: reveal 440ms cubic-bezier(.22,1,.36,1) 450ms both; }.plan-selector legend { margin: 0 0 10px; padding: 0; color: #374151; font-size: 14px; font-weight: 720; text-align: center; width: 100%; }.plan-option { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 15px; border: 1px solid #E9E1EB; border-radius: 19px; background: rgba(255,255,255,.76); color: inherit; text-align: left; cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; animation: reveal 420ms cubic-bezier(.22,1,.36,1) both; }.plan-option-1 { animation-delay: 490ms; }.plan-option-2 { animation-delay: 560ms; }.plan-option.selected { border-color: #D946EF; box-shadow: 0 7px 18px rgba(217,70,239,.14); background: #FFF9FF; }.plan-option:active { transform: scale(.99); }.plan-radio { width: 18px; height: 18px; box-sizing: border-box; border: 1.5px solid #C8BACD; border-radius: 50%; flex: 0 0 auto; }.plan-option.selected .plan-radio { border: 5px solid #D946EF; }.plan-copy { display: grid; gap: 3px; }.plan-copy small { color: #A739B9; font-size: 10px; font-weight: 780; letter-spacing: .3px; }.plan-copy strong { color: #374151; font-size: 17px; line-height: 1.15; font-weight: 740; }.plan-copy em { color: #3F4650; font-size: 12px; font-style: normal; font-weight: 740; }.plan-copy > span { color: #4A535F; font-size: 12.5px; line-height: 1.35; }
        .paywall-cta { width: 100%; min-height: 53px; margin-top: 21px; border: 0; border-radius: 16px; background: linear-gradient(115deg, #D946EF, #C940DE); color: #FFF; font: inherit; font-size: 15px; font-weight: 750; cursor: pointer; box-shadow: 0 8px 20px rgba(217,70,239,.35); transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease; animation: reveal 440ms cubic-bezier(.22,1,.36,1) 640ms both, gentle-glow 900ms ease-out 970ms both; }.paywall-cta:hover { transform: translateY(-1px); box-shadow: 0 11px 23px rgba(217,70,239,.39); }.paywall-cta:active { transform: scale(.98); }.paywall-cta:disabled { cursor: wait; opacity: .74; }.paypal-note { margin: 6px 0 0; color: #4A535F; font-size: 12px; line-height: 1.25; text-align: center; animation: reveal 420ms cubic-bezier(.22,1,.36,1) 700ms both; }.paypal-note span { color: #A739B9; font-size: 16px; vertical-align: -1px; }.payment-reassurance { margin: 1px 0 0; color: #3F4650; font-size: 12px; line-height: 1.25; text-align: center; animation: reveal 420ms cubic-bezier(.22,1,.36,1) 730ms both; }.paywall-error { margin: 10px auto 0; color: #A33950; font-size: 13px; line-height: 1.4; text-align: center; }.paywall-skip { display: block; margin: 11px auto 0; padding: 7px 10px; border: 0; background: transparent; color: #4A535F; font: inherit; font-size: 14px; font-weight: 650; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; animation: reveal 420ms cubic-bezier(.22,1,.36,1) 760ms both; }
        .auth-layer { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; }.auth-backdrop { position: absolute; inset: 0; width: 100%; border: 0; background: rgba(32,24,37,.34); }.auth-sheet { position: relative; width: min(100%, 500px); margin: 0 auto; padding: 13px 22px calc(25px + env(safe-area-inset-bottom)); box-sizing: border-box; border-radius: 26px 26px 0 0; background: #FFFDF9; box-shadow: 0 -12px 35px rgba(45,34,52,.16); animation: sheet-in .28s cubic-bezier(.22,1,.36,1) both; }.sheet-handle { width: 35px; height: 4px; margin: 0 auto 20px; border-radius: 99px; background: #D9D0DD; }.sheet-close { position: absolute; top: 20px; right: 17px; width: 32px; height: 32px; border: 1px solid #E6DDE8; border-radius: 50%; background: #FFF; color: #4A535F; font-size: 22px; line-height: 1; cursor: pointer; }.auth-sheet h2 { margin: 0; color: #374151; font-size: 23px; line-height: 1.15; text-align: center; }.auth-sheet > p { margin: 9px auto 20px; max-width: 320px; color: #3F4650; font-size: 14px; line-height: 1.45; text-align: center; }
        @keyframes screen-in { from { opacity: 0; } to { opacity: 1; } } @keyframes ambient-settle { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } } @keyframes reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes line-draw { from { transform: scaleY(0); } to { transform: scaleY(1); } } @keyframes gentle-glow { 0%,100% { box-shadow: 0 8px 20px rgba(217,70,239,.35); } 50% { box-shadow: 0 10px 25px rgba(217,70,239,.48); } } @keyframes sheet-in { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } } @media (prefers-reduced-motion: reduce) { .paywall-shell, .paywall-shell::before, .paywall-header, .trial-timeline::before, .timeline-step, .plan-selector, .plan-option, .paywall-cta, .paypal-note, .payment-reassurance, .paywall-skip, .auth-sheet { animation: none; } .plan-option, .paywall-cta { transition: none; } }
      `}</style>
    </main>
  );
}

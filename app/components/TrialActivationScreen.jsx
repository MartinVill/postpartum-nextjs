'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import TrialActivationButton from './TrialActivationButton';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { GOOGLE_PLAY_PRODUCT_IDS, listGooglePlayPurchases, requestGooglePlayPurchase, usePaymentProvider } from '@/app/hooks/usePaymentProvider';

const PLAN_DETAILS = {
  monthly: {
    eyebrow: 'MÁS POPULAR · SUSCRIPCIÓN MENSUAL',
    price: '$5 USD',
    suffix: 'por mes',
    description: 'Flexible. Cancela cuando quieras.'
  },
  lifetime: {
    eyebrow: 'PAGO ÚNICO',
    price: '$15 USD',
    suffix: 'de por vida',
    description: 'Un único pago. Sin cobros recurrentes.'
  }
};

const PENDING_CHECKOUT_PLAN_KEY = 'postpartum_pending_checkout_plan';
const PENDING_CHECKOUT_MAX_AGE_MS = 15 * 60 * 1000;

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

export default function TrialActivationScreen({ onAuthenticated, onBillingActivated, onSkip }) {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showAuthSheet, setShowAuthSheet] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutNotice, setCheckoutNotice] = useState('');
  const [authAction, setAuthAction] = useState('checkout');
  const [redirectCheckout, setRedirectCheckout] = useState(null);
  const resumedCheckout = useRef(false);
  const paymentProvider = usePaymentProvider();
  const isLifetime = selectedPlan === 'lifetime';
  // The TWA itself is the payment-provider boundary. Product metadata can be
  // delayed in Play Console; falling back to PayPal here would incorrectly
  // bypass native Google Play Billing on an Android installation.
  const paymentProviderForPlan = () => paymentProvider.provider === 'google-play' ? 'google-play' : 'paypal';
  const activePaymentProvider = paymentProviderForPlan(selectedPlan);
  const timeline = useMemo(() => {
    const today = new Date();
    const reminder = new Date(today); reminder.setDate(today.getDate() + 5);
    const activation = new Date(today); activation.setDate(today.getDate() + 7);
    return { today: formatDate(today), reminder: formatDate(reminder), activation: formatDate(activation) };
  }, []);

  const storeCheckoutState = async (idToken, state, provider) => {
    await fetch('/api/billing/checkout-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ state, provider })
    });
  };

  const beginGooglePlayCheckout = async (user, planType = selectedPlan) => {
    let paymentResponse;
    let idToken = null;
    try {
      // PaymentRequest must start in the exact user gesture that pressed the
      // CTA. Start it before token refreshes or Firestore/network work, which
      // otherwise makes Android reject the native Play sheet as aborted.
      const nativePurchase = requestGooglePlayPurchase(
        GOOGLE_PLAY_PRODUCT_IDS[planType],
        planType === 'lifetime' ? '15.00' : '0.00'
      );
      idToken = await user.getIdToken();
      await onAuthenticated?.({ uid: user.uid, email: user.email || '', displayName: user.displayName || '', idToken });
      await storeCheckoutState(idToken, 'checkout_started', 'google-play');
      const { response, purchaseToken } = await nativePurchase;
      paymentResponse = response;
      const verification = await fetch('/api/billing/google-play/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ planType, purchaseToken })
      });
      const payload = await verification.json();
      if (!verification.ok) throw new Error(payload.error || 'No pudimos validar la compra con Google Play.');
      await paymentResponse.complete('success');
      await onBillingActivated?.({ uid: user.uid, email: user.email || '', entitlement: payload.entitlement });
    } catch (error) {
      if (paymentResponse) await paymentResponse.complete('fail').catch(() => {});
      if (error?.name === 'AbortError') {
        // AbortError is also emitted by a TWA provider that cannot present the
        // Google Play sheet (not only when the person closes it). Do not label
        // that implementation error as a cancelled purchase or mark a real
        // user as having abandoned checkout.
        const message = String(error?.message || '').toLowerCase();
        if (message.includes('invalid state') || !message) {
          throw new Error('No pudimos abrir Google Play en este dispositivo. Actualiza Google Chrome y vuelve a abrir la app desde Google Play.');
        }
        if (idToken) await storeCheckoutState(idToken, 'checkout_abandoned', 'google-play').catch(() => {});
        throw new Error('La compra se cerró antes de confirmarse. Puedes intentarlo nuevamente cuando quieras.');
      }
      throw error;
    }
  };

  const beginPayPalCheckout = async (idToken, planType) => {
    const response = await fetch('/api/billing/paypal/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ planType })
    });
    const payload = await response.json();
    if (!response.ok || !payload.approvalUrl) throw new Error(payload.error || 'No pudimos abrir PayPal.');
    window.location.assign(payload.approvalUrl);
  };

  async function beginCheckout(user, planType = selectedPlan) {
    setCheckoutStatus('loading');
    setErrorMessage('');
    setCheckoutNotice('');
    try {
      const provider = paymentProviderForPlan(planType);
      if (provider === 'google-play') {
        await beginGooglePlayCheckout(user, planType);
        return;
      }
      const idToken = await user.getIdToken();
      await onAuthenticated?.({ uid: user.uid, email: user.email || '', displayName: user.displayName || '', idToken });
      await storeCheckoutState(idToken, 'checkout_started', provider);
      await beginPayPalCheckout(idToken, planType);
    } catch (error) {
      setCheckoutStatus('idle');
      setErrorMessage(error.message || 'No pudimos iniciar PayPal. Inténtalo de nuevo.');
    }
  }

  useEffect(() => {
    if (!auth || resumedCheckout.current || typeof window === 'undefined') return undefined;
    let pendingPlan = null;
    const resumeCheckoutPlan = new URLSearchParams(window.location.search).get('resumeCheckout');
    if (['monthly', 'lifetime'].includes(resumeCheckoutPlan)) pendingPlan = resumeCheckoutPlan;
    try {
      const pendingCheckout = JSON.parse(window.localStorage.getItem(PENDING_CHECKOUT_PLAN_KEY) || 'null');
      if (!pendingPlan && pendingCheckout && Date.now() - pendingCheckout.startedAt < PENDING_CHECKOUT_MAX_AGE_MS) {
        pendingPlan = pendingCheckout.plan;
      } else if (!pendingPlan && (!pendingCheckout || Date.now() - pendingCheckout.startedAt >= PENDING_CHECKOUT_MAX_AGE_MS)) {
        window.localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
      }
    } catch {
      window.localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
    }
    if (!['monthly', 'lifetime'].includes(pendingPlan)) return undefined;

    let disposed = false;
    const resume = (user) => {
      if (!user || disposed || resumedCheckout.current) return;
      setRedirectCheckout({ user, plan: pendingPlan });
    };

    getRedirectResult(auth)
      .then(result => resume(result?.user || auth.currentUser))
      .catch(error => {
        console.error('[AUTH] No se pudo recuperar el acceso de Google:', error);
        if (!disposed) {
          setErrorMessage('No pudimos completar el acceso con Google. Inténtalo nuevamente.');
        }
      });

    // Some Android webviews publish the authenticated user a moment after the
    // redirect result. Listening here prevents a successful login from leaving
    // the user stranded on the paywall.
    const unsubscribe = onAuthStateChanged(auth, resume);

    return () => { disposed = true; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!redirectCheckout || !paymentProvider.ready || resumedCheckout.current || typeof window === 'undefined') return;

    resumedCheckout.current = true;
    window.localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete('resumeCheckout');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    // A redirect is not a user gesture. Calling PaymentRequest immediately
    // after it returns makes Android abort the native checkout, so we wait
    // for one explicit confirmation tap.
    setCheckoutStatus('idle');
    setShowAuthSheet(false);
    setCheckoutNotice('Tu cuenta está lista. Toca el botón para continuar con Google Play.');
  }, [paymentProvider.ready, redirectCheckout]);

  const handleCheckoutAuthentication = async () => {
    setShowAuthSheet(false);
    setCheckoutStatus('idle');
    setCheckoutNotice('Tu cuenta está lista. Toca el botón para continuar con Google Play.');
  };

  const restoreGooglePlayPurchases = async (user = auth?.currentUser) => {
    if (!user || paymentProvider.provider !== 'google-play') return;
    setCheckoutStatus('loading');
    setErrorMessage('');
    try {
      const purchases = await listGooglePlayPurchases(paymentProvider.service);
      const recognized = (purchases || []).map(purchase => {
        const planType = Object.entries(GOOGLE_PLAY_PRODUCT_IDS).find(([, productId]) => productId === purchase.itemId)?.[0];
        return planType && purchase.purchaseToken ? { planType, purchaseToken: purchase.purchaseToken } : null;
      }).filter(Boolean);
      if (!recognized.length) throw new Error('No encontramos compras de Postpartum para restaurar.');
      const idToken = await user.getIdToken();
      const restored = [];
      for (const purchase of recognized) {
        const response = await fetch('/api/billing/google-play/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }, body: JSON.stringify(purchase)
        });
        const payload = await response.json();
        if (response.ok) restored.push(payload.entitlement);
      }
      const entitlement = restored.find(item => item.planType === 'lifetime') || restored[0];
      if (!entitlement) throw new Error('No encontramos una compra activa para restaurar.');
      await onBillingActivated?.({ uid: user.uid, email: user.email || '', entitlement });
    } catch (error) {
      setCheckoutStatus('idle');
      setErrorMessage(error.message || 'No pudimos restaurar tus compras.');
    }
  };

  const handleMainAction = () => {
    if (!paymentProvider.ready) return;
    if (auth?.currentUser) {
      beginCheckout(auth.currentUser);
      return;
    }
    setErrorMessage('');
    setAuthAction('checkout');
    setShowAuthSheet(true);
  };

  const handleRestoreAction = () => {
    if (auth?.currentUser) { restoreGooglePlayPurchases(auth.currentUser); return; }
    setErrorMessage('');
    setAuthAction('restore');
    setShowAuthSheet(true);
  };

  return (
    <main className="paywall-shell">
      <section className="paywall-content">
        <button type="button" className="paywall-close" onClick={onSkip} aria-label="Dejar para más tarde">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
        <header className="paywall-header">
          <h1>Elige el plan que mejor se adapte a ti</h1>
          <p>Tu experiencia completa empieza hoy.</p>
        </header>

        <fieldset className="plan-selector" aria-label="Opciones de plan" disabled={checkoutStatus === 'loading'}>
          {Object.entries(PLAN_DETAILS).map(([id, plan], index) => <button key={id} type="button" onClick={() => setSelectedPlan(id)} className={`plan-option plan-option-${index + 1} ${selectedPlan === id ? 'selected' : ''}`} aria-pressed={selectedPlan === id}>
            <span className="plan-radio" aria-hidden="true" />
            <span className="plan-copy"><small>{plan.eyebrow}</small><strong>{plan.price} <em>{plan.suffix}</em></strong><span>{plan.description}</span></span>
          </button>)}
        </fieldset>

        <ol className="trial-timeline" aria-label={isLifetime ? 'Cómo funciona tu acceso de por vida' : 'Cómo funciona tu prueba'}>
          {isLifetime ? <>
            <li className="timeline-step timeline-step-1"><span className="timeline-node"><TimelineIcon type="check" /></span><div><strong>Hoy · {timeline.today}</strong><p>Pagas $15 USD y desbloqueas toda la app.</p></div></li>
            <li className="timeline-step timeline-step-2"><span className="timeline-node"><TimelineIcon type="bell" /></span><div><strong>Sin suscripción</strong><p>Un único pago. No habrá renovaciones.</p></div></li>
            <li className="timeline-step timeline-step-3"><span className="timeline-node"><TimelineIcon type="lock" /></span><div><strong>Acceso de por vida</strong><p>Tu guía y herramientas quedan disponibles para ti.</p></div></li>
          </> : <>
            <li className="timeline-step timeline-step-1"><span className="timeline-node"><TimelineIcon type="check" /></span><div><strong>Hoy · {timeline.today}</strong><p>Desbloquea toda la app. Cobro de $0 USD hoy.</p></div></li>
            <li className="timeline-step timeline-step-2"><span className="timeline-node"><TimelineIcon type="bell" /></span><div><strong>Día 5 · {timeline.reminder}</strong><p>Te enviamos un email de recordatorio.</p></div></li>
            <li className="timeline-step timeline-step-3"><span className="timeline-node"><TimelineIcon type="lock" /></span><div><strong>Día 7 · {timeline.activation}</strong><p>Se activa el plan. Cancelas cuando quieras.</p></div></li>
          </>}
        </ol>

      </section>

      <footer className="paywall-fixed-footer">
        {checkoutNotice && <p className="paywall-notice" role="status">{checkoutNotice}</p>}
        {errorMessage && <p className="paywall-error" role="alert">{errorMessage}</p>}
        <button type="button" className="paywall-cta" onClick={handleMainAction} disabled={checkoutStatus === 'loading' || !paymentProvider.ready}>
          {!paymentProvider.ready ? 'Preparando pago…' : checkoutStatus === 'loading' ? `Abriendo ${activePaymentProvider === 'google-play' ? 'Google Play' : 'PayPal'}…` : isLifetime ? 'Pagar $15 USD hoy - Acceso de por vida' : 'Probar 7 días por $0 USD'}
        </button>
        <p className="paypal-note"><span aria-hidden="true">⌁</span> {activePaymentProvider === 'google-play' ? isLifetime ? 'Procesado de forma segura mediante Google Play.' : 'Procesado de forma segura mediante Google Play · $0 hoy.' : isLifetime ? 'Procesamiento seguro por PayPal.' : 'Procesamiento seguro por PayPal · $0 hoy.'}</p>
        {paymentProvider.provider === 'google-play' && <button type="button" className="paywall-restore" onClick={handleRestoreAction} disabled={checkoutStatus === 'loading'}>¿Ya hiciste una compra? Recuperar mi acceso</button>}
      </footer>

      {showAuthSheet && <div className="auth-layer" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-backdrop" type="button" aria-label="Cerrar acceso" onClick={() => setShowAuthSheet(false)} />
        <section className="auth-sheet">
          <div className="sheet-handle" aria-hidden="true" />
          <button type="button" className="sheet-close" aria-label="Cerrar" onClick={() => setShowAuthSheet(false)}>×</button>
          <h2 id="auth-title">{authAction === 'restore' ? 'Recupera tu acceso' : 'Crea tu cuenta'}</h2>
          <p>{authAction === 'restore' ? 'Ingresa con la cuenta que usaste para comprar en Google Play.' : 'Para activar tu acceso y guardar tu progreso.'}</p>
          <TrialActivationButton
            onAuthenticated={authAction === 'restore' ? () => restoreGooglePlayPurchases() : handleCheckoutAuthentication}
            onGoogleRedirectStart={authAction === 'checkout' ? () => {
              window.localStorage.setItem(PENDING_CHECKOUT_PLAN_KEY, JSON.stringify({ plan: selectedPlan, startedAt: Date.now() }));
              const url = new URL(window.location.href);
              url.searchParams.set('resumeCheckout', selectedPlan);
              window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
            } : undefined}
            onGoogleRedirectFailure={authAction === 'checkout' ? () => window.localStorage.removeItem(PENDING_CHECKOUT_PLAN_KEY) : undefined}
          />
        </section>
      </div>}

      <style jsx>{`
        .paywall-shell { position: relative; min-height: 100dvh; box-sizing: border-box; background: radial-gradient(circle at 50% -12%, #FBEAFE 0%, #FFF9F4 35%, #FFFDF6 74%); padding: 0 20px; overflow: auto; animation: screen-in 420ms ease-out both; }
        .paywall-shell::before { content: ''; position: fixed; z-index: 0; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% -7%, rgba(232,121,249,.11), transparent 38%); animation: ambient-settle 850ms ease-out both; }
        .paywall-content { position: relative; z-index: 1; width: min(100%, 398px); margin: 0 auto; padding: max(78px, calc(56px + env(safe-area-inset-top))) 0 190px; }
        .paywall-close { position: fixed; z-index: 4; top: max(18px, calc(12px + env(safe-area-inset-top))); right: max(18px, calc((100vw - 398px) / 2)); width: 42px; height: 42px; padding: 0; border: 1px solid #D8CBDD; border-radius: 50%; background: #FFFDF9; color: #374151; display: grid; place-items: center; box-shadow: 0 5px 15px rgba(47,35,53,.12); cursor: pointer; transition: background .2s ease, border-color .2s ease, color .2s ease, transform .2s ease; }.paywall-close:hover { background: #FFF; border-color: #B9A9C1; color: #2F2535; transform: scale(1.03); }.paywall-close:active { transform: scale(.96); }.paywall-close:focus-visible { outline: 3px solid rgba(217,70,239,.22); outline-offset: 3px; }
        .paywall-header { text-align: center; animation: reveal .5s cubic-bezier(.22,1,.36,1) both; }.paywall-header h1 { margin: 0; color: #374151; font-size: clamp(28px, 7vw, 33px); line-height: 1.13; letter-spacing: -.7px; font-weight: 730; }.paywall-header > p:last-child { max-width: 340px; margin: 11px auto 0; color: #3F4650; font-size: 15px; line-height: 1.45; }
        .trial-timeline { position: relative; display: grid; gap: 15px; margin: 34px 0 24px; padding: 0; list-style: none; text-align: left; }.trial-timeline::before { content: ''; position: absolute; left: 16px; top: 30px; bottom: 30px; width: 1px; background: linear-gradient(#D946EF, #EAD4EE); transform-origin: top; animation: line-draw 520ms cubic-bezier(.22,1,.36,1) 150ms both; }.trial-timeline li { position: relative; display: flex; gap: 13px; align-items: flex-start; }.timeline-step { animation: reveal 420ms cubic-bezier(.22,1,.36,1) both; }.timeline-step-1 { animation-delay: 170ms; }.timeline-step-2 { animation-delay: 270ms; }.timeline-step-3 { animation-delay: 370ms; }.timeline-node { position: relative; z-index: 1; width: 33px; height: 33px; border: 1px solid #F0CFF5; border-radius: 50%; display: grid; place-items: center; flex: 0 0 auto; background: #FFFDF6; color: #B63ACB; }.trial-timeline strong { display: block; color: #374151; font-size: 14px; line-height: 1.25; font-weight: 730; }.trial-timeline p { margin: 4px 0 0; color: #4A535F; font-size: 13px; line-height: 1.38; }
        .plan-selector { display: grid; gap: 10px; margin: 25px 0 0; padding: 0; border: 0; animation: reveal 440ms cubic-bezier(.22,1,.36,1) 450ms both; }.plan-option { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 15px; border: 1px solid #E9E1EB; border-radius: 19px; background: rgba(255,255,255,.76); color: inherit; text-align: left; cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; animation: reveal 420ms cubic-bezier(.22,1,.36,1) both; }.plan-option-1 { animation-delay: 490ms; }.plan-option-2 { animation-delay: 560ms; }.plan-option.selected { border-color: #D946EF; box-shadow: 0 7px 18px rgba(217,70,239,.14); background: #FFF9FF; }.plan-option:active { transform: scale(.99); }.plan-radio { width: 18px; height: 18px; box-sizing: border-box; border: 1.5px solid #C8BACD; border-radius: 50%; flex: 0 0 auto; }.plan-option.selected .plan-radio { border: 5px solid #D946EF; }.plan-copy { display: grid; gap: 3px; }.plan-copy small { color: #A739B9; font-size: 10px; font-weight: 780; letter-spacing: .3px; }.plan-copy strong { color: #374151; font-size: 17px; line-height: 1.15; font-weight: 740; }.plan-copy em { color: #3F4650; font-size: 12px; font-style: normal; font-weight: 740; }.plan-copy > span { color: #4A535F; font-size: 12.5px; line-height: 1.35; }
        .paywall-fixed-footer { position: fixed; z-index: 3; left: 50%; bottom: 0; width: min(calc(100% - 40px), 398px); padding: 12px 0 max(14px, env(safe-area-inset-bottom)); transform: translateX(-50%); background: linear-gradient(to bottom, rgba(255,253,246,0), #FFFDF6 20%, #FFFDF6 100%); }.paywall-cta { width: 100%; min-height: 53px; margin: 0; border: 0; border-radius: 16px; background: linear-gradient(115deg, #D946EF, #C940DE); color: #FFF; font: inherit; font-size: 15px; font-weight: 750; cursor: pointer; box-shadow: 0 8px 20px rgba(217,70,239,.35); transition: transform .2s ease, box-shadow .2s ease, opacity .2s ease; animation: reveal 440ms cubic-bezier(.22,1,.36,1) 640ms both, gentle-glow 900ms ease-out 970ms both; }.paywall-cta:hover { transform: translateY(-1px); box-shadow: 0 11px 23px rgba(217,70,239,.39); }.paywall-cta:active { transform: scale(.98); }.paywall-cta:disabled { cursor: wait; opacity: .74; }.paypal-note { margin: 7px 0 0; color: #69717D; font-size: 11.5px; line-height: 1.25; text-align: center; animation: reveal 420ms cubic-bezier(.22,1,.36,1) 700ms both; }.paypal-note span { color: #8E3AB1; font-size: 14px; vertical-align: -1px; }.paywall-restore { display: block; min-height: 36px; margin: 3px auto 0; padding: 6px 8px; border: 0; background: transparent; color: #69717D; font: inherit; font-size: 11.5px; font-weight: 650; line-height: 1.25; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; animation: reveal 420ms cubic-bezier(.22,1,.36,1) 730ms both; }.paywall-restore:disabled { opacity: .55; cursor: wait; }.paywall-error, .paywall-notice { margin: 0 0 8px; font-size: 13px; line-height: 1.4; text-align: center; }.paywall-error { color: #A33950; }.paywall-notice { color: #59616D; }
        .auth-layer { position: fixed; inset: 0; z-index: 100; display: flex; align-items: flex-end; }.auth-backdrop { position: absolute; inset: 0; width: 100%; border: 0; background: rgba(32,24,37,.34); }.auth-sheet { position: relative; width: min(100%, 500px); margin: 0 auto; padding: 13px 22px calc(25px + env(safe-area-inset-bottom)); box-sizing: border-box; border-radius: 26px 26px 0 0; background: #FFFDF9; box-shadow: 0 -12px 35px rgba(45,34,52,.16); animation: sheet-in .28s cubic-bezier(.22,1,.36,1) both; }.sheet-handle { width: 35px; height: 4px; margin: 0 auto 20px; border-radius: 99px; background: #D9D0DD; }.sheet-close { position: absolute; top: 20px; right: 17px; width: 32px; height: 32px; border: 1px solid #E6DDE8; border-radius: 50%; background: #FFF; color: #4A535F; font-size: 22px; line-height: 1; cursor: pointer; }.auth-sheet h2 { margin: 0; color: #374151; font-size: 23px; line-height: 1.15; text-align: center; }.auth-sheet > p { margin: 9px auto 20px; max-width: 320px; color: #3F4650; font-size: 14px; line-height: 1.45; text-align: center; }
        @keyframes screen-in { from { opacity: 0; } to { opacity: 1; } } @keyframes ambient-settle { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } } @keyframes reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } @keyframes line-draw { from { transform: scaleY(0); } to { transform: scaleY(1); } } @keyframes gentle-glow { 0%,100% { box-shadow: 0 8px 20px rgba(217,70,239,.35); } 50% { box-shadow: 0 10px 25px rgba(217,70,239,.48); } } @keyframes sheet-in { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } } @media (prefers-reduced-motion: reduce) { .paywall-shell, .paywall-shell::before, .paywall-header, .trial-timeline::before, .timeline-step, .plan-selector, .plan-option, .paywall-fixed-footer, .paywall-cta, .paypal-note, .paywall-restore, .auth-sheet { animation: none; } .plan-option, .paywall-cta, .paywall-close { transition: none; } }
      `}</style>
    </main>
  );
}

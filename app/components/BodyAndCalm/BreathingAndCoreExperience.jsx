'use client';

import { useEffect, useRef, useState } from 'react';

const SESSION_MINUTES = 2;
const PHASES = [
  { label: 'Inhala', duration: 4000, scale: 1.15, ringStart: 0, ringEnd: 1 },
  { label: 'Sostén', duration: 2000, scale: 1.15, ringStart: 1, ringEnd: 1 },
  { label: 'Exhala', duration: 6000, scale: 0.4, ringStart: 1, ringEnd: 0 }
];

const RING_RADIUS = 112;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const PREPARATION_RADIUS = 72;
const PREPARATION_CIRCUMFERENCE = 2 * Math.PI * PREPARATION_RADIUS;

const EXERCISES = [
  { id: 'diaphragmatic', title: 'Respiración Diafragmática', benefit: 'Alivia la presión lumbar' },
  { id: 'core', title: 'Activación de Core Suave', benefit: 'Reconecta tu abdomen' },
  { id: 'pelvic-floor', title: 'Relajación de Suelo Pélvico', benefit: 'Suelta la tensión acumulada' }
];

function getLocalWeekKey() {
  const date = new Date();
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = local.getDay() || 7;
  local.setDate(local.getDate() + 4 - day);
  const yearStart = new Date(local.getFullYear(), 0, 1);
  const week = Math.ceil((((local - yearStart) / 86400000) + 1) / 7);
  return `${local.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function localStorageKey(userId) {
  return `postpartum_breathing_minutes_${userId || 'guest'}`;
}

function readLocalMinutes(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(localStorageKey(userId)) || '{}');
    return saved.weekKey === getLocalWeekKey() ? Number(saved.minutes) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveLocalMinutes(userId, minutes) {
  localStorage.setItem(localStorageKey(userId), JSON.stringify({ weekKey: getLocalWeekKey(), minutes }));
}

export default function BreathingAndCoreExperience({ onBack, onComplete }) {
  const [userId, setUserId] = useState('');
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [session, setSession] = useState(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [ringProgress, setRingProgress] = useState(0);
  const [preparationSeconds, setPreparationSeconds] = useState(10);
  const [completionSeconds, setCompletionSeconds] = useState(5);
  const completedRef = useRef(false);
  const wakeLockRef = useRef(null);

  const requestWakeLock = async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator) || document.visibilityState !== 'visible' || wakeLockRef.current) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null;
      });
    } catch {
      // Algunos navegadores no permiten mantener la pantalla activa; la guía continúa normalmente.
    }
  };

  const releaseWakeLock = async () => {
    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (wakeLock) {
      try {
        await wakeLock.release();
      } catch {
        // El navegador puede haber liberado el bloqueo al cambiar de aplicación.
      }
    }
  };

  useEffect(() => {
    const id = localStorage.getItem('userId') || '';
    setUserId(id);
    const localMinutes = readLocalMinutes(id);
    setWeeklyMinutes(localMinutes);
    if (!id) return;

    fetch(`/api/breathing/stats?userId=${encodeURIComponent(id)}`)
      .then(async (response) => response.ok ? response.json() : Promise.reject(new Error('Stats unavailable')))
      .then(({ minutes }) => {
        const resolvedMinutes = Number(minutes) || 0;
        setWeeklyMinutes(resolvedMinutes);
        saveLocalMinutes(id, resolvedMinutes);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!session || session.status !== 'preparing') return undefined;

    const countdown = window.setInterval(() => {
      setPreparationSeconds(current => {
        if (current <= 1) {
          window.clearInterval(countdown);
          setSession(active => active ? { ...active, status: 'running' } : active);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(countdown);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== 'running') return undefined;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(18);

    const timeout = window.setTimeout(() => {
      if (phaseIndex < PHASES.length - 1) {
        setPhaseIndex(current => current + 1);
      } else if (cycle < 10) {
        setCycle(current => current + 1);
        setPhaseIndex(0);
      } else {
        setSession(current => ({ ...current, status: 'complete' }));
      }
    }, PHASES[phaseIndex].duration);

    return () => window.clearTimeout(timeout);
  }, [cycle, phaseIndex, session]);

  useEffect(() => {
    if (!session || session.status !== 'running') return undefined;
    const phase = PHASES[phaseIndex];
    setRingProgress(phase.ringStart);
    const frame = window.requestAnimationFrame(() => setRingProgress(phase.ringEnd));
    return () => window.cancelAnimationFrame(frame);
  }, [phaseIndex, session]);

  useEffect(() => {
    if (!session || !['preparing', 'running'].includes(session.status)) {
      releaseWakeLock();
      return undefined;
    }

    requestWakeLock();
    const restoreWakeLock = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', restoreWakeLock);

    return () => {
      document.removeEventListener('visibilitychange', restoreWakeLock);
      releaseWakeLock();
    };
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== 'complete' || completedRef.current) return undefined;
    completedRef.current = true;
    let nextMinutes = SESSION_MINUTES;
    setWeeklyMinutes(current => {
      nextMinutes = current + SESSION_MINUTES;
      saveLocalMinutes(userId, nextMinutes);
      return nextMinutes;
    });

    if (userId) {
      fetch('/api/breathing/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, minutes: SESSION_MINUTES })
      })
        .then(async response => response.ok ? response.json() : Promise.reject(new Error('Stats unavailable')))
        .then(({ minutes }) => {
          const resolvedMinutes = Number(minutes) || nextMinutes;
          setWeeklyMinutes(resolvedMinutes);
          saveLocalMinutes(userId, resolvedMinutes);
        })
        .catch(() => undefined);
    }

    setCompletionSeconds(5);
    const countdown = window.setInterval(() => {
      setCompletionSeconds(current => Math.max(0, current - 1));
    }, 1000);
    const returnTimeout = window.setTimeout(() => {
      if (onComplete) onComplete();
      else setSession(null);
    }, 5000);
    return () => {
      window.clearInterval(countdown);
      window.clearTimeout(returnTimeout);
    };
  }, [session, userId, onComplete]);

  const startSession = (title, needsPreparation = false) => {
    requestWakeLock();
    completedRef.current = false;
    setCycle(1);
    setPhaseIndex(0);
    setRingProgress(0);
    setPreparationSeconds(10);
    setCompletionSeconds(5);
    setSession({ title, status: needsPreparation ? 'preparing' : 'running' });
  };

  const closeSession = () => setSession(null);

  if (session) {
    const phase = PHASES[phaseIndex];
    const isComplete = session.status === 'complete';
    return (
      <div style={{ ...sessionStyles.screen, ...(session.status === 'preparing' ? sessionStyles.preparationScreen : {}) }} role="dialog" aria-modal="true" aria-label="Guía de respiración">
        <button className="breathing-close" onClick={closeSession} aria-label="Salir de la pausa" style={sessionStyles.close}>×</button>
        {!isComplete && <p style={sessionStyles.exerciseName}>{session.title}</p>}
        {isComplete ? (
          <div style={sessionStyles.completion}>
            <div style={sessionStyles.heart}>😍</div>
            <h2 style={sessionStyles.completionTitle}>Hiciste algo hermoso<br />por ti hoy</h2>
            <p style={sessionStyles.completionText}>Sumaste 2 minutos de amor propio hoy</p>
            <p style={sessionStyles.autoExit}>Saliendo en {completionSeconds}</p>
          </div>
        ) : session.status === 'preparing' ? (
          <div style={sessionStyles.preparation}>
            <p style={sessionStyles.preparationEyebrow}>Este momento es para ti</p>
            <p style={sessionStyles.preparationTitle}>Unos segundos para acomodarte.</p>
            <p style={sessionStyles.preparationCopy}>Relaja los hombros y la espalda. Deja lo demás afuera por un momento.</p>
            <div style={sessionStyles.preparationTimer} aria-label={`Comenzamos en ${preparationSeconds} segundos`}>
              <div style={sessionStyles.preparationGlow} />
              <svg viewBox="0 0 176 176" aria-hidden="true" style={sessionStyles.preparationRing}>
                <circle cx="88" cy="88" r={PREPARATION_RADIUS} style={sessionStyles.preparationRingTrack} />
                <circle
                  cx="88"
                  cy="88"
                  r={PREPARATION_RADIUS}
                  style={{
                    ...sessionStyles.preparationRingProgress,
                    strokeDasharray: PREPARATION_CIRCUMFERENCE,
                    strokeDashoffset: PREPARATION_CIRCUMFERENCE * (preparationSeconds / 10)
                  }}
                />
              </svg>
              <div style={sessionStyles.preparationCounterContent}>
                <p key={preparationSeconds} aria-live="polite" style={sessionStyles.preparationCountdown}>{preparationSeconds}</p>
                <span style={sessionStyles.preparationSecondsLabel}>segundos</span>
              </div>
            </div>
            <style>{`@keyframes preparation-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } @keyframes preparation-pulse { 0%, 100% { transform: scale(0.92); opacity: 0.35; } 50% { transform: scale(1.08); opacity: 0.72; } } @keyframes preparation-count { from { opacity: 0.35; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }`}</style>
          </div>
        ) : (
          <>
            <div style={sessionStyles.orbArea}>
              <svg viewBox="0 0 270 270" aria-hidden="true" style={sessionStyles.progressRing}>
                <circle cx="135" cy="135" r={RING_RADIUS} style={sessionStyles.ringTrack} />
                <circle
                  cx="135"
                  cy="135"
                  r={RING_RADIUS}
                  style={{
                    ...sessionStyles.ringProgress,
                    strokeDasharray: RING_CIRCUMFERENCE,
                    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress),
                    transitionDuration: `${phase.duration}ms`
                  }}
                />
              </svg>
              <div style={{ ...sessionStyles.orbGlow, transform: `scale(${phase.scale})`, transitionDuration: `${phase.duration}ms` }} />
              <div style={{ ...sessionStyles.orb, transform: `scale(${phase.scale})`, transitionDuration: `${phase.duration}ms` }} />
            </div>
            <h1 key={phase.label} style={sessionStyles.phase}>{phase.label}</h1>
            <p style={sessionStyles.cycle}>Ciclo {cycle} de 10</p>
            <div style={sessionStyles.cycleDots} aria-label={`Progreso: ciclo ${cycle} de 10`}>
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  style={{
                    ...sessionStyles.cycleDot,
                    background: index < cycle - 1 ? '#D946EF' : index === cycle - 1 ? 'rgba(217,70,239,0.38)' : '#F1E7F2'
                  }}
                />
              ))}
            </div>
            <style>{`@keyframes breathing-phase-fade { 0% { opacity: 0; transform: translateY(9px) scale(0.97); filter: blur(1px); } 100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } } @media (hover: hover) { .breathing-close:hover { opacity: 1 !important; } }`}</style>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={onBack} aria-label="Volver a Cuerpo y Calma" style={styles.back}>&lt;</button>
        <h1 style={styles.title}>Respiración y Core</h1>
      </div>

      {weeklyMinutes > 0 && (
        <p style={styles.accumulator}>Llevas {weeklyMinutes} minutos de aire para ti esta semana 🌿</p>
      )}

      <button onClick={() => startSession('Pausa rápida', true)} style={styles.quickStart}>
        <span style={styles.quickLabel}>Pausa rápida de 2 minutos</span>
        <span aria-hidden="true" style={styles.quickArrow}>&gt;</span>
      </button>

      <h2 style={styles.sectionTitle}>Elige según tu necesidad</h2>
      <div style={styles.exerciseList}>
        {EXERCISES.map(exercise => (
          <button key={exercise.id} onClick={() => startSession(exercise.title)} style={styles.exerciseCard}>
            <span style={styles.exerciseTitle}>{exercise.title}</span>
            <span style={styles.benefit}>{exercise.benefit}</span>
            <span aria-hidden="true" style={styles.exerciseArrow}>&gt;</span>
          </button>
        ))}
      </div>
      <p style={styles.disclaimer}>Recuerda asegurar tu alta médica antes de ejercitarte.</p>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#FFFDF6', padding: '20px 16px 100px', maxWidth: '600px', margin: '0 auto', boxSizing: 'border-box' },
  header: { minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '18px' },
  back: { position: 'absolute', left: '0', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #F3E8F7', background: '#FFFDF6', color: '#D946EF', fontSize: '24px', fontWeight: '700', cursor: 'pointer', lineHeight: 1 },
  title: { color: '#D946EF', fontSize: '20px', lineHeight: 1.25, margin: 0, padding: '0 52px', textAlign: 'center', fontWeight: '700' },
  accumulator: { color: '#4B5563', fontSize: '15px', lineHeight: 1.45, fontWeight: '600', margin: '0 8px 22px', textAlign: 'center' },
  quickStart: { width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', background: 'linear-gradient(135deg, #D946EF, #C026D3)', border: 'none', borderRadius: '20px', color: '#fff', padding: '24px 52px 24px 22px', cursor: 'pointer', boxShadow: '0 8px 18px rgba(217,70,239,0.2)', marginBottom: '28px' },
  quickLabel: { fontSize: '19px', lineHeight: 1.25, fontWeight: '700' },
  quickArrow: { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '25px', fontWeight: '400', lineHeight: 1 },
  sectionTitle: { color: '#374151', fontSize: '16px', fontWeight: '700', margin: '0 4px 12px' },
  exerciseList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  exerciseCard: { width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: '9px', background: '#FFFDF6', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '17px 44px 17px 17px', cursor: 'pointer', boxShadow: '0 2px 7px rgba(17,24,39,0.045)' },
  exerciseTitle: { color: '#1F2937', fontSize: '16px', fontWeight: '700', lineHeight: 1.3 },
  benefit: { color: '#8B3D9C', fontSize: '13px', lineHeight: 1.25, fontWeight: '600', background: '#FBEAFE', borderRadius: '999px', padding: '5px 9px' },
  exerciseArrow: { position: 'absolute', right: '17px', top: '50%', transform: 'translateY(-50%)', color: '#D946EF', fontSize: '20px', fontWeight: '400', lineHeight: 1 },
  disclaimer: { color: '#6B7280', fontSize: '12px', lineHeight: 1.45, margin: '24px 10px 0', textAlign: 'center' }
};

const sessionStyles = {
  screen: { position: 'fixed', inset: 0, zIndex: 90, minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFDF6', color: '#374151', padding: '32px 24px', boxSizing: 'border-box', overflow: 'hidden' },
  preparationScreen: { background: 'radial-gradient(circle at 50% 51%, #FBEAFE 0%, #FFF9F4 32%, #FFFDF6 71%)' },
  close: { position: 'absolute', right: '20px', top: 'max(34px, calc(env(safe-area-inset-top) + 8px))', width: '42px', height: '42px', border: '1px solid #D1D5DB', borderRadius: '50%', background: '#FFFDF6', color: '#6B7280', fontSize: '29px', fontWeight: '300', lineHeight: 1, cursor: 'pointer', opacity: 0.9, transition: 'opacity 0.2s ease' },
  exerciseName: { position: 'absolute', top: 'max(34px, calc(env(safe-area-inset-top) + 8px))', margin: 0, color: '#8B3D9C', fontSize: '17px', fontWeight: '600', textAlign: 'center', padding: '0 68px' },
  orbArea: { height: '270px', width: '270px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '18px', marginBottom: '34px', flexShrink: 0 },
  progressRing: { position: 'absolute', inset: 0, width: '270px', height: '270px', transform: 'rotate(-90deg)', overflow: 'visible', pointerEvents: 'none' },
  ringTrack: { fill: 'none', stroke: 'rgba(217,70,239,0.14)', strokeWidth: 2 },
  ringProgress: { fill: 'none', stroke: '#D946EF', strokeWidth: 3, strokeLinecap: 'round', transitionProperty: 'stroke-dashoffset', transitionTimingFunction: 'linear' },
  orbGlow: { position: 'absolute', width: '190px', height: '190px', borderRadius: '50%', background: 'rgba(217,70,239,0.22)', filter: 'blur(18px)', transitionProperty: 'transform', transitionTimingFunction: 'ease-in-out' },
  orb: { position: 'absolute', width: '172px', height: '172px', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, #F7C7FF 0%, #E879F9 44%, #C026D3 100%)', boxShadow: '0 18px 52px rgba(192,38,211,0.28)', transitionProperty: 'transform', transitionTimingFunction: 'ease-in-out' },
  phase: { margin: 0, color: '#D946EF', fontSize: '34px', lineHeight: 1.2, fontWeight: '700', animation: 'breathing-phase-fade 600ms cubic-bezier(0.22, 1, 0.36, 1) both' },
  cycle: { margin: '10px 0 0', color: '#4B5563', fontSize: '15px', fontWeight: '600' },
  cycleDots: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '26px' },
  cycleDot: { display: 'block', width: '17px', height: '6px', borderRadius: '999px', transition: 'background 250ms ease' },
  completion: { maxWidth: '310px', textAlign: 'center' },
  heart: { width: '72px', height: '72px', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBEAFE', color: '#D946EF', borderRadius: '50%', fontSize: '45px' },
  completionTitle: { color: '#374151', fontSize: '28px', lineHeight: 1.28, margin: '0 0 12px', fontWeight: '700' },
  completionText: { color: '#6B7280', fontSize: '15px', lineHeight: 1.45, margin: 0 },
  autoExit: { color: '#D946EF', fontSize: '15px', lineHeight: 1.45, fontWeight: '400', margin: '10px 0 0' },
  preparation: { width: '100%', maxWidth: '336px', textAlign: 'center', padding: '32px 24px 27px', boxSizing: 'border-box', borderRadius: '28px', background: 'rgba(255,253,246,0.78)', border: '1px solid rgba(232,121,249,0.16)', boxShadow: '0 18px 46px rgba(139,61,156,0.10)', animation: 'preparation-fade 620ms cubic-bezier(0.22, 1, 0.36, 1) both' },
  preparationEyebrow: { color: '#A739B9', fontSize: '16px', fontWeight: '700', margin: 0, animation: 'preparation-fade 520ms 80ms ease both' },
  preparationTitle: { color: '#374151', fontSize: '21px', lineHeight: 1.3, fontWeight: '700', margin: '10px 0 0', animation: 'preparation-fade 520ms 150ms ease both' },
  preparationCopy: { color: '#465160', fontSize: '16px', lineHeight: 1.52, margin: '13px auto 22px', maxWidth: '264px', animation: 'preparation-fade 520ms 230ms ease both' },
  preparationTimer: { position: 'relative', width: '176px', height: '176px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'preparation-fade 600ms 300ms ease both' },
  preparationGlow: { position: 'absolute', width: '126px', height: '126px', borderRadius: '50%', background: 'rgba(217,70,239,0.20)', filter: 'blur(18px)', animation: 'preparation-pulse 3.2s ease-in-out infinite' },
  preparationRing: { position: 'absolute', inset: 0, width: '176px', height: '176px', transform: 'rotate(-90deg)', overflow: 'visible' },
  preparationRingTrack: { fill: 'none', stroke: 'rgba(217,70,239,0.15)', strokeWidth: 5 },
  preparationRingProgress: { fill: 'none', stroke: '#D946EF', strokeWidth: 5, strokeLinecap: 'round', transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)' },
  preparationCounterContent: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  preparationCountdown: { color: '#D946EF', fontSize: '70px', lineHeight: 0.92, fontWeight: '700', margin: 0, fontVariantNumeric: 'tabular-nums', animation: 'preparation-count 420ms cubic-bezier(0.22, 1, 0.36, 1) both' },
  preparationSecondsLabel: { color: '#9C579F', fontSize: '12px', letterSpacing: '0.04em', marginTop: '7px' }
};

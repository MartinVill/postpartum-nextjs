'use client';

import { useEffect, useRef, useState } from 'react';

const SESSION_MINUTES = 2;
const PHASES = [
  { label: 'Inhala', duration: 4000, scale: 1.28 },
  { label: 'Sostén', duration: 2000, scale: 1.28 },
  { label: 'Exhala', duration: 6000, scale: 0.74 }
];

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

export default function BreathingAndCoreExperience({ onBack }) {
  const [userId, setUserId] = useState('');
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [session, setSession] = useState(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const completedRef = useRef(false);

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
    if (!session || session.status !== 'complete' || completedRef.current) return undefined;
    completedRef.current = true;
    const nextMinutes = weeklyMinutes + SESSION_MINUTES;
    setWeeklyMinutes(nextMinutes);
    saveLocalMinutes(userId, nextMinutes);

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

    const returnTimeout = window.setTimeout(() => setSession(null), 2000);
    return () => window.clearTimeout(returnTimeout);
  }, [session, userId, weeklyMinutes]);

  const startSession = (title) => {
    completedRef.current = false;
    setCycle(1);
    setPhaseIndex(0);
    setSession({ title, status: 'running' });
  };

  if (session) {
    const phase = PHASES[phaseIndex];
    const isComplete = session.status === 'complete';
    return (
      <div style={sessionStyles.screen} role="dialog" aria-modal="true" aria-label="Guía de respiración">
        <button onClick={() => setSession(null)} aria-label="Salir de la pausa" style={sessionStyles.close}>×</button>
        {isComplete ? (
          <div style={sessionStyles.completion}>
            <div style={sessionStyles.heart}>♡</div>
            <h2 style={sessionStyles.completionTitle}>Hiciste algo hermoso por ti hoy 🤍</h2>
            <p style={sessionStyles.completionText}>Sumamos 2 minutos de aire para ti esta semana.</p>
          </div>
        ) : (
          <>
            <p style={sessionStyles.exerciseName}>{session.title}</p>
            <div style={sessionStyles.orbArea}>
              <div style={{ ...sessionStyles.orbGlow, transform: `scale(${phase.scale})` }} />
              <div style={{ ...sessionStyles.orb, transform: `scale(${phase.scale})`, transitionDuration: `${phase.duration}ms` }} />
            </div>
            <h1 style={sessionStyles.phase}>{phase.label}</h1>
            <p style={sessionStyles.cycle}>Ciclo {cycle} de 10</p>
            <p style={sessionStyles.quiet}>Guía visual silenciosa</p>
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

      <button onClick={() => startSession('Pausa rápida')} style={styles.quickStart}>
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
      <p style={styles.disclaimer}>Escucha a tu cuerpo y consulta con tu médico antes de ejercitarte.</p>
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
  close: { position: 'absolute', right: '20px', top: 'max(20px, env(safe-area-inset-top))', width: '42px', height: '42px', border: '1px solid #E5E7EB', borderRadius: '50%', background: '#FFFDF6', color: '#6B7280', fontSize: '29px', fontWeight: '300', lineHeight: 1, cursor: 'pointer' },
  exerciseName: { position: 'absolute', top: 'max(28px, env(safe-area-inset-top))', margin: 0, color: '#8B3D9C', fontSize: '15px', fontWeight: '600', textAlign: 'center', padding: '0 62px' },
  orbArea: { height: '228px', width: '228px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '18px', marginBottom: '34px' },
  orbGlow: { position: 'absolute', width: '156px', height: '156px', borderRadius: '50%', background: 'rgba(217,70,239,0.12)', transition: 'transform 1s ease-in-out' },
  orb: { width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, #F7C7FF 0%, #E879F9 44%, #C026D3 100%)', boxShadow: '0 14px 42px rgba(192,38,211,0.25)', transitionProperty: 'transform', transitionTimingFunction: 'ease-in-out' },
  phase: { margin: 0, color: '#D946EF', fontSize: '28px', lineHeight: 1.2, fontWeight: '700' },
  cycle: { margin: '10px 0 0', color: '#4B5563', fontSize: '15px', fontWeight: '600' },
  quiet: { margin: '30px 0 0', color: '#9CA3AF', fontSize: '13px' },
  completion: { maxWidth: '310px', textAlign: 'center' },
  heart: { width: '72px', height: '72px', margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBEAFE', color: '#D946EF', borderRadius: '50%', fontSize: '45px' },
  completionTitle: { color: '#374151', fontSize: '25px', lineHeight: 1.28, margin: '0 0 12px', fontWeight: '700' },
  completionText: { color: '#6B7280', fontSize: '15px', lineHeight: 1.45, margin: 0 }
};

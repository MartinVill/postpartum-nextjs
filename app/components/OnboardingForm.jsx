'use client';

import { useState } from 'react';

const PHYSICAL_SENSATIONS = [
  { id: 'back_pain', label: 'Me duele la espalda o la cintura' },
  { id: 'low_abdomen_pain', label: 'Me duele la zona baja del abdomen' },
  { id: 'abdomen_support', label: 'Siento el abdomen flojo o sin sostén' },
  { id: 'body_fatigue', label: 'Siento el cuerpo cansado y sin energía' },
  { id: 'birth_area_pain', label: 'Me molesta la zona de la cesárea o del parto al caminar' },
  { id: 'urination_pain', label: 'Me duele o arde al orinar' },
  { id: 'heavy_legs', label: 'Siento las piernas pesadas' },
  { id: 'none', label: 'Ninguna molestia en particular' },
  { id: 'prefer_not_to_say', label: 'Prefiero no responder' }
];

const EMOTIONAL_STATES = [
  { id: 'mental_fatigue', label: 'Cansancio mental o estrés constante' },
  { id: 'identity', label: 'No sentirme yo misma' },
  { id: 'emotional_sensitivity', label: 'Sensibilidad emocional o altibajos' },
  { id: 'inadequacy', label: 'Siento que hago todo mal o no soy suficiente' },
  { id: 'body_image', label: 'Baja autoestima con mi cuerpo' },
  { id: 'calm_tired', label: 'Tranquila, pero agotada' },
  { id: 'prefer_not_to_say', label: 'Prefiero no responder' }
];

const optionStyle = (selected) => ({
  width: '100%',
  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '13px 14px',
  borderRadius: '13px',
  border: `1px solid ${selected ? '#D946EF' : '#E8E2EA'}`,
  background: selected ? '#FCF5FD' : 'rgba(255,255,255,0.72)',
  color: '#302A34',
  fontFamily: 'inherit',
  fontSize: '14px',
  lineHeight: 1.35,
  cursor: 'pointer',
  transition: 'background 0.18s ease, border-color 0.18s ease'
});

function ChoiceList({ options, selected, onToggle, type = 'multi' }) {
  return <div style={{ display: 'grid', gap: '9px' }}>
    {options.map((option) => {
      const isSelected = selected.includes(option.id);
      return <button key={option.id} type="button" onClick={() => onToggle(option.id)} style={optionStyle(isSelected)}>
        <span aria-hidden="true" style={{
          flex: '0 0 auto', width: '20px', height: '20px', boxSizing: 'border-box', borderRadius: type === 'single' ? '50%' : '6px',
          border: `1.5px solid ${isSelected ? '#D946EF' : '#B9B1BC'}`, background: isSelected ? '#D946EF' : '#FFFFFF',
          display: 'grid', placeItems: 'center', color: '#FFFFFF', fontSize: '13px', fontWeight: '800'
        }}>{isSelected && (type === 'single' ? '•' : '✓')}</span>
        <span>{option.label}</span>
      </button>;
    })}
  </div>;
}

export default function OnboardingForm({ onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    babyBirthDate: '',
    deliveryType: '',
    medicalClearance: '',
    physicalSensations: [],
    emotionalStates: [],
    dataUseConsent: null,
    hobbies: [],
    favoriteTermsOfEndearment: ['Hermosa'],
    lastMenstruationDate: ''
  });

  const toggleExclusive = (field, id, exclusiveIds) => {
    setFormData((previous) => {
      const current = previous[field];
      const isExclusive = exclusiveIds.includes(id);
      if (isExclusive) return { ...previous, [field]: current.includes(id) ? [] : [id] };
      return { ...previous, [field]: current.includes(id) ? current.filter((value) => value !== id) : [...current.filter((value) => !exclusiveIds.includes(value)), id] };
    });
  };

  const isStepValid = () => {
    if (step === 1) return Boolean(formData.name.trim() && formData.babyBirthDate && formData.dataUseConsent?.accepted);
    if (step === 2) return Boolean(formData.deliveryType && formData.medicalClearance);
    if (step === 3) return formData.physicalSensations.length > 0;
    return formData.emotionalStates.length > 0;
  };

  const finish = () => {
    const needsMedicalReview = formData.physicalSensations.some((item) => ['urination_pain', 'birth_area_pain', 'low_abdomen_pain'].includes(item)) || formData.medicalClearance !== 'yes' || formData.deliveryType === 'complications';
    localStorage.setItem('onboardingComplete', 'true');
    onComplete({ ...formData, needsMedicalReview, onboardingVersion: 4, createdAt: new Date().toISOString() });
  };

  const next = () => {
    if (!isStepValid()) return;
    if (step === 4) finish(); else setStep((current) => current + 1);
  };

  const inputStyle = { width: '100%', height: '52px', boxSizing: 'border-box', border: '1px solid #DED8E1', borderRadius: '13px', padding: '0 15px', fontSize: '16px', color: '#302A34', background: '#FFFFFF', fontFamily: 'inherit', outlineColor: '#D946EF' };
  const titleStyle = { fontSize: '25px', fontWeight: '750', margin: '0 0 10px', color: '#302A34', lineHeight: 1.2, letterSpacing: '-0.3px' };
  const introStyle = { fontSize: '14px', color: '#59616D', margin: '0 0 23px', lineHeight: 1.48 };

  const content = () => {
    if (step === 1) return <>
      <h1 style={titleStyle}>Empecemos por ti</h1>
      <p style={introStyle}>Así podemos acompañarte de una forma más cercana.</p>
      <label htmlFor="onboarding-name" style={{ display: 'block', color: '#4C4651', fontSize: '13px', fontWeight: '700', marginBottom: '7px' }}>¿Cómo te llamas?</label>
      <input id="onboarding-name" value={formData.name} onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))} placeholder="Tu nombre" autoComplete="given-name" autoFocus style={inputStyle} />
      <label htmlFor="baby-birth-date" style={{ display: 'block', color: '#4C4651', fontSize: '13px', fontWeight: '700', margin: '21px 0 7px' }}>¿Cuándo nació tu bebé?</label>
      <input id="baby-birth-date" type="date" value={formData.babyBirthDate} onChange={(event) => setFormData((previous) => ({ ...previous, babyBirthDate: event.target.value }))} max={new Date().toISOString().split('T')[0]} style={inputStyle} />
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '20px', padding: '13px', border: `1px solid ${formData.dataUseConsent?.accepted ? '#E9C8EF' : '#E6E0E8'}`, borderRadius: '13px', background: formData.dataUseConsent?.accepted ? '#FCF5FD' : '#FAF8FA', color: '#505866', fontSize: '12px', lineHeight: 1.45, cursor: 'pointer' }}>
        <input type="checkbox" checked={Boolean(formData.dataUseConsent?.accepted)} onChange={(event) => setFormData((previous) => ({ ...previous, dataUseConsent: event.target.checked ? { accepted: true, version: 'onboarding-sensitive-data-v1', acceptedAt: new Date().toISOString() } : null }))} style={{ marginTop: '2px', accentColor: '#D946EF', width: '16px', height: '16px', flex: '0 0 auto' }} />
        <span><strong style={{ color: '#3B3440' }}>Acepto compartir estas respuestas para personalizar mi experiencia.</strong><br />Incluye información de bienestar posparto. Puedes elegir “Prefiero no responder” en las siguientes preguntas. Se guarda en este dispositivo y, si activas una cuenta, se sincroniza de forma protegida con tu perfil.</span>
      </label>
    </>;

    if (step === 2) return <>
      <h1 style={titleStyle}>Cuidemos tu ritmo</h1>
      <p style={introStyle}>Estas respuestas nos ayudan a mostrarte opciones suaves y cuidadosas.</p>
      <p style={{ color: '#4C4651', fontSize: '13px', fontWeight: '700', margin: '0 0 9px' }}>¿Cómo fue tu parto?</p>
      <ChoiceList type="single" selected={[formData.deliveryType]} onToggle={(deliveryType) => setFormData((previous) => ({ ...previous, deliveryType }))} options={[{ id: 'vaginal', label: 'Parto vaginal' }, { id: 'cesarean', label: 'Cesárea' }, { id: 'complications', label: 'Tuve complicaciones o indicaciones especiales' }, { id: 'prefer_not_to_say', label: 'Prefiero no responder' }]} />
      <p style={{ color: '#4C4651', fontSize: '13px', fontWeight: '700', margin: '22px 0 9px' }}>¿Tienes alta médica para actividad física suave?</p>
      <ChoiceList type="single" selected={[formData.medicalClearance]} onToggle={(medicalClearance) => setFormData((previous) => ({ ...previous, medicalClearance }))} options={[{ id: 'yes', label: 'Sí' }, { id: 'no', label: 'Aún no' }, { id: 'unsure', label: 'No estoy segura' }]} />
    </>;

    if (step === 3) {
      const needsCareNote = formData.physicalSensations.some((item) => ['urination_pain', 'birth_area_pain', 'low_abdomen_pain'].includes(item));
      return <>
        <h1 style={titleStyle}>Escuchemos a tu cuerpo</h1>
        <p style={introStyle}>Elige todas las que apliquen. Esto nos ayuda a mostrarte un acompañamiento más cuidadoso.</p>
        <ChoiceList selected={formData.physicalSensations} onToggle={(id) => toggleExclusive('physicalSensations', id, ['none', 'prefer_not_to_say'])} options={PHYSICAL_SENSATIONS} />
        {needsCareNote && <p style={{ margin: '16px 0 0', padding: '12px 13px', borderRadius: '12px', color: '#704B2D', background: '#FFF8EA', border: '1px solid #F2DFC1', fontSize: '13px', lineHeight: 1.45 }}>Gracias por contarlo. Te mostraremos opciones de descanso y cuidado; si la molestia es intensa o empeora, consulta con un profesional.</p>}
      </>;
    }

    return <>
      <h1 style={titleStyle}>¿Cómo te has sentido?</h1>
      <p style={introStyle}>No hay respuestas correctas. Esto nos ayuda a acompañarte con más calidez.</p>
      <ChoiceList selected={formData.emotionalStates} onToggle={(id) => toggleExclusive('emotionalStates', id, ['prefer_not_to_say'])} options={EMOTIONAL_STATES} />
    </>;
  };

  return <div style={{ background: 'rgba(255,255,255,0.78)', padding: '28px 24px', border: '1px solid #F0ECE6', borderRadius: '20px', boxShadow: '0 14px 32px rgba(48, 38, 56, 0.08)', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
      <p style={{ fontSize: '13px', color: '#59616D', fontWeight: '650', margin: 0 }}>Paso {step} de 4</p>
      <div style={{ display: 'flex', gap: '6px' }}>{[1, 2, 3, 4].map((number) => <span key={number} style={{ width: number === step ? '20px' : '8px', height: '8px', borderRadius: '999px', background: number <= step ? '#D946EF' : '#E8E2EA', transition: 'all 0.2s' }} />)}</div>
    </div>
    {content()}
    <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
      {step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} style={{ flex: 1, minHeight: '50px', border: '1px solid #E7E1E5', borderRadius: '14px', background: '#F2EEF0', color: '#4B5563', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Atrás</button>}
      <button type="button" onClick={next} disabled={!isStepValid()} style={{ flex: 1, minHeight: '50px', border: 'none', borderRadius: '14px', background: isStepValid() ? '#D946EF' : '#DDD7DF', color: '#FFFFFF', fontSize: '15px', fontWeight: '700', cursor: isStepValid() ? 'pointer' : 'not-allowed', boxShadow: isStepValid() ? '0 8px 18px rgba(217,70,239,0.2)' : 'none' }}>{step === 4 ? 'Continuar' : 'Siguiente'}</button>
    </div>
  </div>;
}

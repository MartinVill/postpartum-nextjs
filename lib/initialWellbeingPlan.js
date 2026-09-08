const RESTRICTED_PHYSICAL_SIGNALS = ['urination_pain', 'birth_area_pain', 'low_abdomen_pain'];

const physicalPlans = [
  {
    id: 'back_comfort',
    matches: ['back_pain'],
    title: 'Comodidad para espalda y postura',
    description: 'Pausas suaves para bajar el ritmo y acompañar los momentos de mayor tensión corporal.'
  },
  {
    id: 'gentle_center',
    matches: ['abdomen_support'],
    title: 'Reconexión suave con tu centro',
    description: 'Respiraciones tranquilas y sin impacto, siempre a tu propio ritmo.'
  },
  {
    id: 'rest_and_recharge',
    matches: ['body_fatigue', 'heavy_legs', 'none', 'prefer_not_to_say'],
    title: 'Descanso y recarga diaria',
    description: 'Momentos breves de calma para hacer espacio para ti, sin exigencias.'
  }
];

const emotionalPlans = [
  {
    id: 'self_compassion',
    matches: ['identity', 'inadequacy', 'body_image'],
    title: 'Acompañamiento sin exigencias',
    description: 'Un espacio breve para volver a ti con amabilidad, sin tener que hacerlo todo perfecto.'
  },
  {
    id: 'mental_pause',
    matches: ['mental_fatigue', 'emotional_sensitivity', 'calm_tired', 'prefer_not_to_say'],
    title: 'Pausas para bajar el ruido mental',
    description: 'Respiración guiada y sonidos de descanso cuando necesites un momento más tranquilo.'
  }
];

function firstMatch(plans, selected) {
  return plans.find((plan) => plan.matches.some((item) => selected.includes(item)));
}

/**
 * A deliberately deterministic, client-safe wellbeing selector.
 * It does not diagnose or prescribe. Restricted inputs omit active movement
 * until the user has received advice from their qualified professional.
 */
export function createInitialWellbeingPlan(profile = {}) {
  const physical = profile.physicalSensations || [];
  const emotional = profile.emotionalStates || [];
  const restricted = profile.medicalClearance !== 'yes'
    || profile.deliveryType === 'complications'
    || physical.some((signal) => RESTRICTED_PHYSICAL_SIGNALS.includes(signal));

  if (restricted) {
    const emotionalCard = firstMatch(emotionalPlans, emotional);
    return {
      safetyLevel: 'restricted',
      heading: 'Tu guía inicial está lista',
      safetyMessage: 'Antes de sumar movimiento activo, conviene consultar con tu profesional de salud. Mientras tanto, puedes elegir pausas de descanso, sonidos y registro emocional.',
      focusCards: [
        {
          id: 'care_first',
          title: 'Cuidado y descanso primero',
          description: 'Pausas tranquilas de respiración y descanso, sin movimiento activo.'
        },
        ...(emotionalCard ? [emotionalCard] : [])
      ],
      excludedModules: ['movement', 'active_core'],
      reasons: physical
    };
  }

  const physicalCard = firstMatch(physicalPlans, physical) || physicalPlans[2];
  const emotionalCard = firstMatch(emotionalPlans, emotional) || emotionalPlans[1];
  return {
    safetyLevel: 'general',
    heading: 'Tu guía inicial está lista',
    safetyMessage: null,
    focusCards: [physicalCard, emotionalCard],
    excludedModules: [],
    reasons: [...physical, ...emotional]
  };
}

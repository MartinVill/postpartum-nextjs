// Validadores y lógica de negocio para la aplicación

import { medicalRedFlags } from './notifications.js';
import { checkRedFlags } from './openai-service.js';

/**
 * Validar que el usuario es elegible para la app
 * @param {Object} medicalIntakeData - Datos del formulario de evaluación
 * @returns {Object} { isEligible, warnings, errors }
 */
export function validateUserEligibility(medicalIntakeData) {
  const warnings = [];
  const errors = [];

  // Validaciones críticas
  if (medicalIntakeData.doctorClearance === 'no') {
    errors.push('Debes obtener la aprobación de tu médico antes de usar esta app');
  }

  // Advertencias
  if (medicalIntakeData.painLevel >= 8) {
    warnings.push('Tu nivel de dolor es alto. Considera descansar más antes de comenzar ejercicios');
  }

  if (medicalIntakeData.complication === 'severe') {
    warnings.push('Tienes complicaciones severas. Sigue las instrucciones de tu médico específicamente');
  }

  // Banderas rojas
  if (medicalIntakeData.symptoms?.includes('fever')) {
    errors.push('⚠️ FIEBRE DETECTADA - Busca atención médica inmediata');
  }

  return {
    isEligible: errors.length === 0,
    warnings,
    errors,
    canContinue: warnings.length === 0 && errors.length === 0
  };
}

/**
 * Calcular la semana actual basada en la fecha de entrega
 * @param {Date} deliveryDate - Fecha del parto/cesárea
 * @returns {number} Semana actual (1-8)
 */
export function calculateCurrentWeek(deliveryDate) {
  const now = new Date();
  const delivery = new Date(deliveryDate);
  const weeksSince = Math.floor((now - delivery) / (7 * 24 * 60 * 60 * 1000));
  return Math.min(Math.max(weeksSince + 1, 1), 8); // Entre 1 y 8
}

/**
 * Determinar si un síntoma requiere atención médica
 * @param {string} symptom - ID del síntoma
 * @returns {Object} { requiresAttention, severity, recommendation }
 */
export function evaluateSymptom(symptom) {
  const criticalSymptoms = {
    fever: { severity: 'critical', recommendation: 'Busca atención médica inmediatamente' },
    severeBleding: { severity: 'critical', recommendation: 'Ve a emergencias ahora' },
    severeInfectionSigns: { severity: 'high', recommendation: 'Llama a tu médico hoy' },
    severeAbdominalPain: { severity: 'high', recommendation: 'Llama a tu médico' },
    incontinenceServer: { severity: 'medium', recommendation: 'Consulta con especialista de piso pélvico' }
  };

  return criticalSymptoms[symptom] || { severity: 'low', recommendation: 'Monitorea y reporta en tu próxita cita' };
}

/**
 * Validar respuesta de ejercicio seguro
 * @param {number} week - Semana actual
 * @param {string} exerciseId - ID del ejercicio
 * @param {string} userLevel - Nivel del usuario (beginner, intermediate, advanced)
 * @returns {Object} { isSafe, warnings, maxRepetitions }
 */
export function validateExerciseSafety(week, exerciseId, userLevel = 'beginner') {
  const warnings = [];
  let isSafe = true;
  let maxRepetitions = 10;

  // Ejercicios que son NUNCA seguros en semana 1
  const avoidWeek1 = ['modified-pushup', 'squat-assisted', 'dead-bug', 'hiit'];
  if (week === 1 && avoidWeek1.includes(exerciseId)) {
    isSafe = false;
    warnings.push('Este ejercicio es demasiado intenso para la semana 1. Espera a la semana 3+');
  }

  // Advertencias para semanas tempranas
  if (week < 3 && exerciseId === 'glute-bridge') {
    warnings.push('Haz este ejercicio MUY lentamente. Para si sientes dolor en la incisión');
  }

  // Ajustar máximo de repeticiones según el nivel
  const repLimits = {
    beginner: { 1: 5, 2: 8, 3: 10, 4: 12 },
    intermediate: { 3: 12, 4: 15, 5: 20 },
    advanced: { 5: 20, 6: 25, 7: 30 }
  };

  const userRepLimit = repLimits[userLevel]?.[week];
  if (userRepLimit) {
    maxRepetitions = userRepLimit;
  }

  return {
    isSafe,
    warnings,
    maxRepetitions,
    shouldProceed: warnings.length === 0
  };
}

/**
 * Calcular puntos ganados en una sesión
 * @param {Object} sessionData - Datos de la sesión
 * @returns {Object} { points, breakdown, achievements }
 */
export function calculateSessionPoints(sessionData) {
  const breakdown = {};
  let totalPoints = 0;

  // Puntos por workout completado
  if (sessionData.workoutCompleted) {
    breakdown.workout = 5;
    totalPoints += 5;
  }

  // Puntos adicionales si incluye seguimiento de síntomas
  if (sessionData.symptomsLogged) {
    breakdown.symptoms = 2;
    totalPoints += 2;
  }

  // Bonificación por consistencia
  if (sessionData.streak >= 7) {
    breakdown.streakBonus = 10;
    totalPoints += 10;
  }

  // Puntos por leer educación
  if (sessionData.articleRead) {
    breakdown.education = 3;
    totalPoints += 3;
  }

  return {
    totalPoints,
    breakdown,
    message: `¡Ganaste ${totalPoints} puntos! 🎉`
  };
}

/**
 * Determinar logros desbloqueados
 * @param {Object} userStats - Estadísticas del usuario
 * @returns {Array} Lista de logros desbloqueados esta sesión
 */
export function checkAchievementsUnlocked(userStats) {
  const newAchievements = [];

  // Primer workout
  if (userStats.totalWorkouts === 1) {
    newAchievements.push({
      id: 'first-workout',
      title: '🚀 Primer Paso',
      message: 'Completaste tu primer workout'
    });
  }

  // 7 días seguidos
  if (userStats.streak === 7) {
    newAchievements.push({
      id: '7-day-streak',
      title: '🔥 7 Días Seguidos',
      message: 'Hiciste ejercicio durante una semana completa'
    });
  }

  // 100 puntos
  if (userStats.totalPoints === 100 && userStats.totalPoints - userStats.lastSessionPoints < 100) {
    newAchievements.push({
      id: '100-points',
      title: '⭐ Centésima',
      message: 'Acumulaste 100 puntos'
    });
  }

  // Semanas completadas
  if (userStats.week === 2 && userStats.weekChanged) {
    newAchievements.push({
      id: 'week-2-reached',
      title: '📈 Semana 2',
      message: 'Avanzaste a la segunda semana'
    });
  }

  return newAchievements;
}

/**
 * Validar entrada de usuario en Chat
 * @param {string} message - Mensaje del usuario
 * @returns {Object} { isValid, warnings, redFlags, shouldEscalate }
 */
export function validateChatInput(message) {
  const redFlag = checkRedFlags(message);
  const warnings = [];
  let shouldEscalate = false;

  if (redFlag.isRedFlag) {
    shouldEscalate = true;
  }

  // Detectar si el usuario menciona síntomas preocupantes
  const concerning = ['suicida', 'matarme', 'no puedo más', 'no aguanto'];
  if (concerning.some(word => message.toLowerCase().includes(word))) {
    warnings.push('Parece que estás pasando por un momento difícil. Busca apoyo profesional.');
    shouldEscalate = true;
  }

  return {
    isValid: message.trim().length > 0,
    warnings,
    redFlags: redFlag.isRedFlag ? redFlag : null,
    shouldEscalate
  };
}

/**
 * Generar recomendación personalizada
 * @param {Object} userData - Datos del usuario
 * @param {Object} stats - Estadísticas
 * @returns {string} Recomendación personalizada
 */
export function generatePersonalRecommendation(userData, stats) {
  const week = stats.currentWeek;
  const workoutStreak = stats.streak || 0;
  const needsRest = stats.averagePainLevel > 6;

  let recommendation = '';

  if (needsRest) {
    recommendation = `👉 ${userData.name}, veo que tienes dolor elevado. Te recomiendo descansar más estos días. `;
  }

  if (workoutStreak === 0) {
    recommendation += `Vamos, empieza hoy con el workout de la semana ${week}. Solo 5-10 minutos. ¡Tú puedes! 💪`;
  } else if (workoutStreak >= 7) {
    recommendation += `¡Wow! Llevas ${workoutStreak} días seguidos. Eres increíble. Mantén este ritmo. 🔥`;
  } else {
    recommendation += `Vas bien con tu racha de ${workoutStreak} días. Solo ${7 - workoutStreak} más para desbloquear el logro de 7 días. 🔥`;
  }

  return recommendation;
}

export default {
  validateUserEligibility,
  calculateCurrentWeek,
  evaluateSymptom,
  validateExerciseSafety,
  calculateSessionPoints,
  checkAchievementsUnlocked,
  validateChatInput,
  generatePersonalRecommendation
};

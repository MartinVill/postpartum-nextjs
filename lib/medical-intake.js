// Formulario de evaluación médica inicial para personalizar recomendaciones

export const medicalIntakeForm = {
  title: 'Evaluación Inicial',
  description: 'Ayúdanos a entender tu situación para personalizar tus recomendaciones',
  sections: [
    {
      id: 'delivery-method',
      title: 'Tipo de Parto',
      type: 'radio',
      required: true,
      options: [
        { id: 'vaginal', label: 'Parto vaginal', value: 'vaginal' },
        { id: 'cesarean', label: 'Cesárea (como tú)', value: 'cesarean', selected: true },
        { id: 'vacuum', label: 'Parto asistido (vacuum/fórceps)', value: 'vacuum' }
      ]
    },
    {
      id: 'weeks-since-delivery',
      title: '¿Cuántas semanas hace que tuviste el bebé?',
      type: 'number',
      required: true,
      min: 0,
      max: 52,
      unit: 'semanas'
    },
    {
      id: 'complication',
      title: '¿Tuviste alguna complicación durante el parto?',
      type: 'radio',
      required: true,
      options: [
        { id: 'no', label: 'No', value: 'no', selected: true },
        { id: 'mild', label: 'Leve (desgarros pequeños, infección leve)', value: 'mild' },
        { id: 'severe', label: 'Severa (infección, hemorragia, dañi mayor)', value: 'severe' }
      ]
    },
    {
      id: 'pain-level',
      title: '¿Cuál es tu nivel de dolor actual?',
      type: 'range',
      required: true,
      min: 0,
      max: 10,
      labels: ['Sin dolor', 'Dolor extremo']
    },
    {
      id: 'symptoms',
      title: '¿Cuáles son tus síntomas actuales?',
      type: 'checkbox',
      required: false,
      options: [
        { id: 'pelvic-pain', label: 'Dolor pélvico' },
        { id: 'bleeding', label: 'Sangrado anormal' },
        { id: 'incontinence', label: 'Incontinencia urinaria' },
        { id: 'fatigue', label: 'Fatiga extrema' },
        { id: 'depression', label: 'Síntomas de depresión' },
        { id: 'sleep', label: 'Problemas de sueño' },
        { id: 'fever', label: 'Fiebre' },
        { id: 'discharge', label: 'Secreción anormal' }
      ]
    },
    {
      id: 'exercise-experience',
      title: '¿Hacías ejercicio antes del embarazo?',
      type: 'radio',
      required: true,
      options: [
        { id: 'sedentary', label: 'No mucho (sedentaria)', value: 'sedentary' },
        { id: 'moderate', label: 'Moderadamente (2-3 veces por semana)', value: 'moderate', selected: true },
        { id: 'active', label: 'Muy activa (4+ veces por semana)', value: 'active' }
      ]
    },
    {
      id: 'medical-conditions',
      title: '¿Tienes alguna condición médica que deba saber?',
      type: 'checkbox',
      required: false,
      options: [
        { id: 'diabetes', label: 'Diabetes' },
        { id: 'hypertension', label: 'Presión arterial alta' },
        { id: 'thyroid', label: 'Problemas de tiroides' },
        { id: 'pcos', label: 'PCOS' },
        { id: 'cardiac', label: 'Problemas cardíacos' },
        { id: 'none', label: 'Ninguna' }
      ]
    },
    {
      id: 'medications',
      title: '¿Estás tomando algún medicamento importante?',
      type: 'text',
      required: false,
      placeholder: 'Ej: Omeprazol, vitaminas, antidepresivos...'
    },
    {
      id: 'doctor-clearance',
      title: '¿Tu médico te ha autorizado a hacer ejercicio?',
      type: 'radio',
      required: true,
      options: [
        { id: 'yes', label: 'Sí', value: 'yes', selected: true },
        { id: 'no', label: 'No', value: 'no' },
        { id: 'pending', label: 'Aún no lo he consultado', value: 'pending' }
      ]
    }
  ]
};

export function validateIntakeForm(formData) {
  const errors = [];

  medicalIntakeForm.sections.forEach(section => {
    if (section.required && (!formData[section.id] || formData[section.id] === '')) {
      errors.push(`${section.title} es requerido`);
    }
  });

  // Validaciones específicas
  if (formData['doctor-clearance'] === 'no') {
    errors.push('⚠️ Es importante obtener la aprobación de tu médico antes de comenzar cualquier ejercicio');
  }

  if (formData['complication'] === 'severe') {
    errors.push('⚠️ Debes seguir las instrucciones de tu médico específicamente. Esta app es un complemento, no un reemplazo');
  }

  // Red flags
  const severeSymptoms = ['fever', 'discharge'];
  const hasRedFlag = formData['symptoms']?.some(s => severeSymptoms.includes(s));
  if (hasRedFlag) {
    errors.push('⚠️ Algunos síntomas requieren atención médica inmediata. Consulta a tu médico.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: errors.filter(e => e.startsWith('⚠️'))
  };
}

export function personalizeProgram(intakeData) {
  const recommendations = {
    startingWeek: 1,
    intensity: 'low',
    frequency: 3,
    notes: []
  };

  // Ajustar según semanas desde el parto
  const weeksSinceBirth = intakeData['weeks-since-delivery'];
  if (weeksSinceBirth >= 4) {
    recommendations.startingWeek = 2;
    recommendations.intensity = 'low-medium';
  }
  if (weeksSinceBirth >= 8) {
    recommendations.startingWeek = 3;
    recommendations.intensity = 'medium';
  }

  // Ajustar según complicaciones
  if (intakeData['complication'] === 'severe') {
    recommendations.notes.push('Tu programa ha sido personalizado considerando tus complicaciones. Sigue las instrucciones de tu médico.');
    recommendations.intensity = 'very-low';
  }

  // Ajustar según dolor
  if (intakeData['pain-level'] >= 7) {
    recommendations.notes.push('Dado tu nivel de dolor, comenzaremos muy suavemente. No dudes en pausar si sientes incomodidad.');
  }

  // Ajustar según síntomas
  if (intakeData['symptoms']?.includes('depression')) {
    recommendations.notes.push('Queremos apoyarte emocionalmente también. Incluimos estrategias de bienestar mental.');
  }

  if (intakeData['symptoms']?.includes('incontinence')) {
    recommendations.notes.push('Nos enfocaremos en fortalecer el piso pélvico desde el inicio.');
  }

  // Ajustar según experiencia previa
  if (intakeData['exercise-experience'] === 'active') {
    recommendations.frequency = 4;
    recommendations.notes.push('Aunque eres activa, respetaremos los tiempos de recuperación postparto.');
  }

  return recommendations;
}

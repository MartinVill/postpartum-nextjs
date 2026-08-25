// Sistema de notificaciones y recordatorios para la app

export const reminders = [
  {
    id: 'morning-greeting',
    time: '08:00',
    title: '¡Buenos días, Lauren!',
    message: 'Es hora de tu workout del día. Vamos a recuperarte paso a paso 💪',
    icon: '🌅'
  },
  {
    id: 'hydration-noon',
    time: '12:00',
    title: 'Recuerda hidratarte',
    message: 'Bebe agua para acelerar tu recuperación. ¡Tú cuerpo te lo agradecerá! 💧',
    icon: '💧'
  },
  {
    id: 'afternoon-stretch',
    time: '15:00',
    title: 'Estiramiento rápido',
    message: 'Tómate 2 minutos para estirar. Mejora la circulación y reduce el dolor 🧘‍♀️',
    icon: '🧘‍♀️'
  },
  {
    id: 'evening-reflection',
    time: '20:00',
    title: 'Reflexiona sobre tu día',
    message: '¿Cómo te sientes? Registra tus síntomas para ver el progreso 📊',
    icon: '📝'
  },
  {
    id: 'sleep-reminder',
    time: '22:00',
    title: 'Hora de descansar',
    message: 'El sueño es crucial para la recuperación. ¡Buenas noches! 😴',
    icon: '😴'
  }
];

export const educationalTips = [
  {
    id: 'week1-breathing',
    week: 1,
    title: '¿Por qué respirar correctamente?',
    content: 'La respiración profunda oxigena tu cuerpo y acelera la recuperación. Además, reduce el estrés y mejora la función del piso pélvico.',
    tips: [
      'Respira lentamente por la nariz',
      'Sostén el aire 2 segundos',
      'Exhala lentamente por la boca',
      'Hazlo 5 veces cada hora'
    ]
  },
  {
    id: 'week2-pelvis',
    week: 2,
    title: 'Piso pélvico: Tu mejor amigo',
    content: 'Fortalecer el piso pélvico previene incontinencia, dolor y mejora tu vida sexual futura.',
    tips: [
      'Los Kegels son efectivos pero requieren práctica',
      'Empieza con 3 segundos de contracción',
      'Aumenta gradualmente a 10 segundos',
      'Descansa entre series'
    ]
  },
  {
    id: 'week3-nutrition',
    week: 3,
    title: 'Nutrición para sanar rápido',
    content: 'Tu cuerpo necesita nutrientes específicos después de una cesárea.',
    tips: [
      'Hierro: carnes rojas, espinacas, lentejas',
      'Proteína: pollo, pescado, huevos, yogur',
      'Vitamina C: cítricos, fresas, brócoli',
      'Zinc: mariscos, semillas, nueces'
    ]
  },
  {
    id: 'week4-mental-health',
    week: 4,
    title: 'Salud mental postparto',
    content: 'Es normal sentirse abrumada. Aquí hay estrategias para cuidar tu bienestar emocional.',
    tips: [
      'Habla con alguien de confianza',
      'Descansa cuando puedas',
      'No te compares con otras madres',
      'Busca ayuda profesional si lo necesitas'
    ]
  },
  {
    id: 'week5-return-exercise',
    week: 5,
    title: 'Volviendo al ejercicio normal',
    content: 'Ya estás lista para actividades más intensas. Escucha a tu cuerpo.',
    tips: [
      'No hagas ejercicio de alto impacto aún',
      'Evita abdominales tradicionales',
      'Enfócate en core funcional',
      'Para si sientes dolor'
    ]
  }
];

export const medicalRedFlags = [
  'Sangrado profuso (empapando más de una toalla por hora)',
  'Fiebre superior a 38°C',
  'Dolor muy intenso que no mejora con medicinas',
  'Enrojecimiento, calor o pus en la incisión',
  'Mareos o desmayos frecuentes',
  'Pensamientos de hacerse daño o depresión severa',
  'Incapacidad de respirar normalmente'
];

export function scheduleReminder(reminderId) {
  const reminder = reminders.find(r => r.id === reminderId);
  if (!reminder) return;

  // Aquí iría integración con Service Workers para notificaciones reales
  console.log(`Recordatorio programado: ${reminder.title}`);
}

export function getEducationalContent(week) {
  return educationalTips.filter(tip => tip.week <= week);
}

export function checkRedFlags(symptoms) {
  // Comparar síntomas contra banderas rojas
  return medicalRedFlags.filter(flag =>
    symptoms.some(s => flag.toLowerCase().includes(s.toLowerCase()))
  );
}

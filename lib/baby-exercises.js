// Ejercicios para hacer sola vs. con el bebé

export const exercisesWithoutBaby = {
  week1: [
    {
      id: 'breathing',
      name: 'Respiración Profunda',
      duration: '2 min',
      sets: '3x5',
      instructions: 'Siéntate, respira profundamente por la nariz 4s, sostén 2s, exhala 6s. Sin presión en la incisión.',
      safety: '✓ Post-cesárea seguro',
      icon: '🌬️'
    },
    {
      id: 'stretching',
      name: 'Estiramiento Suave',
      duration: '2 min',
      sets: '10 reps',
      instructions: 'Cuello, hombros, brazos, cintura. Movimientos suaves, sin rebotes.',
      safety: '✓ Sin presión',
      icon: '🧘'
    }
  ],
  week2: [
    {
      id: 'kegels',
      name: 'Kegels (Piso Pélvico)',
      duration: '2 min',
      sets: '3x8',
      instructions: 'Contrae como si detuvieras orina. Sostén 3s, relaja. Muy importante para recuperación.',
      safety: '✓ Esencial',
      icon: '💪'
    },
    {
      id: 'walking',
      name: 'Caminata Lenta',
      duration: '3 min',
      sets: '1 serie',
      instructions: 'Camina a ritmo conversacional. Mejora circulación, previene coágulos.',
      safety: '✓ Bajo impacto',
      icon: '🚶'
    }
  ],
  week3: [
    {
      id: 'bridge',
      name: 'Puente de Glúteos',
      duration: '2 min',
      sets: '3x10',
      instructions: 'Acuéstate, rodillas flexionadas. Levanta cadera, contrae glúteos 2s, baja.',
      safety: '✓ Sin presión incisión',
      icon: '🌉'
    }
  ]
};

export const exercisesWithBaby = {
  week2: [
    {
      id: 'baby-squat',
      name: 'Sentadilla con Bebé en Brazos',
      duration: '2 min',
      sets: '3x10',
      instructions: `
        1. Sostén al bebé en tus brazos (frente a tu pecho)
        2. De pie, pies a la altura de cadera
        3. Baja lentamente como si fueras a sentarte
        4. Mantén al bebé cerca (es peso extra = ejercicio más intenso)
        5. Sube usando tus piernas

        Nota: El bebé disfruta el movimiento. ¡Es un juego para él!
      `,
      safety: '✓ Bebé seguro, tú fortalecida',
      icon: '👶💪',
      benefits: ['Fortalece piernas', 'Conexión con bebé', 'Diversión para ambas']
    },
    {
      id: 'baby-lunge',
      name: 'Estocada con Bebé',
      duration: '2 min',
      sets: '3x8 cada pierna',
      instructions: `
        1. De pie, bebé en brazos
        2. Da un paso adelante con una pierna
        3. Baja lentamente (rodilla no pasa los dedos del pie)
        4. Sube y repite con la otra pierna

        Tip: Canta una canción mientras lo haces. ¡El bebé lo ama!
      `,
      safety: '✓ Seguro para ambas',
      icon: '🚶👶',
      benefits: ['Fortaleza en piernas', 'Entretenimiento bebé', 'Diversión']
    },
    {
      id: 'baby-walk',
      name: 'Paseo con Bebé',
      duration: '10 min',
      sets: '1 serie',
      instructions: `
        1. Sostén al bebé en brazos o en mochila
        2. Camina a ritmo moderado
        3. Varía el ritmo (rápido-lento, rápido-lento)

        Beneficio adicional: aire fresco, cambio de escenario, relajación
      `,
      safety: '✓ Super seguro',
      icon: '🚶👶☀️',
      benefits: ['Cardio suave', 'Aire fresco', 'Bonding', 'Salud mental']
    }
  ],
  week3: [
    {
      id: 'baby-dance',
      name: 'Bailar con Bebé',
      duration: '5 min',
      sets: '1-2 canciones',
      instructions: `
        1. Pon tu música favorita (o canta)
        2. Sostén al bebé en brazos
        3. Baila suavemente (el bebé sentirá el ritmo)
        4. Puedes hacer movimientos de cadera, giros suaves

        Nota: El bebé aprende ritmo. ¡Es estimulación sensorial!
      `,
      safety: '✓ Divertido y seguro',
      icon: '💃👶',
      benefits: ['Cardio suave', 'Diversión', 'Conexión', 'Música = felicidad']
    },
    {
      id: 'baby-play-squats',
      name: 'Sentadillas mientras el bebé juega',
      duration: '5 min',
      sets: '3x15',
      instructions: `
        1. Acuéstate en el piso con el bebé frente a ti
        2. El bebé puede gatear, jugar, explorar
        3. Haz sentadillas sobre el bebé (sin presión)
        4. ¡Tu bebé te ve ejercitando! Es estimulación visual

        Bonus: No necesitas vigilancia, ¡estás juntas!
      `,
      safety: '✓ Multi-tasking para mamás',
      icon: '🧘👶',
      benefits: ['Fortaleza', 'Supervisión bebé', 'Bonding', 'Diversión']
    }
  ]
};

export const babyExercisesTips = [
  {
    title: '🎵 Música es tu aliada',
    description: 'Pon música alegre. Mejora el ánimo de ambas y hace que sea más divertido.'
  },
  {
    title: '👶 El bebé está seguro',
    description: 'Aunque sientas que no, los bebés aman estar en brazos mientras se mueven. ¡Es seguro y divertido para él!'
  },
  {
    title: '💪 Eres más fuerte de lo que crees',
    description: 'Un bebé pesa 4-7 kg. Eso es peso extra en tu ejercicio. ¡Estás haciendo más de lo que crees!'
  },
  {
    title: '🧠 Es bueno para el bebé',
    description: 'El movimiento y la conexión son estimulación sensorial perfecta para su desarrollo.'
  },
  {
    title: '😊 Si te diviertes, el bebé se divierte',
    description: 'Los bebés sienten tu energía. Si sonríes, el bebé sonríe. ¡Disfrútalo!'
  }
];

export class BabyExerciseProgram {
  constructor(currentWeek) {
    this.currentWeek = currentWeek;
    this.exercisesWithBaby = this.getExercisesForWeek();
    this.exercisesAlone = this.getAloneExercisesForWeek();
  }

  getExercisesForWeek() {
    return exercisesWithBaby[this.currentWeek] || [];
  }

  getAloneExercisesForWeek() {
    return exercisesWithoutBaby[this.currentWeek] || [];
  }

  getRecommendation() {
    if (this.currentWeek === 1) {
      return "Semana 1: Aún estás en recuperación. Respira profundo, estira suave. El bebé aún es muy nuevo para ejercicios juntas.";
    }
    if (this.currentWeek === 2) {
      return "Semana 2: ¡Perfecto para empezar a ejercitar con tu bebé! Sentadillas con bebé en brazos es ideal.";
    }
    if (this.currentWeek >= 3) {
      return "Ahora tienes opciones: ejercitar sola O con tu bebé. ¡El bebé ama moverse contigo!";
    }
  }

  canExerciseWithBaby() {
    return this.currentWeek >= 2;
  }

  getTip() {
    return babyExercisesTips[Math.floor(Math.random() * babyExercisesTips.length)];
  }

  selectExercise(preference = 'baby') {
    if (preference === 'baby' && this.exercisesWithBaby.length > 0) {
      return this.exercisesWithBaby[0];
    }
    if (preference === 'alone' && this.exercisesAlone.length > 0) {
      return this.exercisesAlone[0];
    }
    return this.exercisesAlone[0] || this.exercisesWithBaby[0];
  }
}

export default {
  exercisesWithoutBaby,
  exercisesWithBaby,
  babyExercisesTips,
  BabyExerciseProgram
};

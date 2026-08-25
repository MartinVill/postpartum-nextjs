// Gestor de preferencias y estado emocional personalizado

export const emotionalScaleEmojis = ['😭', '😢', '😐', '😊', '😄', '💪'];

export const dailyGreetings = [
  "¡Hola Reina! 💛 Hoy es un gran día para brillar",
  "¡Belleza Mundial! ✨ Nadie brilla más que tú",
  "¡Hermosa! 💗 Hoy vamos a ponernos nuestro mejor outfit",
  "¡Eres un milagro! 💛 Tu cuerpo hizo lo más increíble",
  "¡Mamá Guerrera! 💪 Eres más fuerte de lo que crees",
  "¡Qué bueno verte! 💫 Hoy es un día para ti también",
];

export const followUpQuestions = {
  lowEnergy: [
    "¿Cómo está tu cuerpo hoy? (dolor, sangrado, energía)",
    "¿Cómo está tu mente? (tristeza, ansiedad, calma)",
    "¿Qué necesitarías para sentirte mejor?",
  ],
  highEnergy: [
    "¿Qué te hace sentir tan bien hoy?",
    "¿Quieres ejercitarte o prefieres relajarte?",
    "¿Hay algo que quieras celebrar hoy?",
  ]
};

export const activityOptions = {
  lowEnergy: [
    { id: 'selfcare', label: '💅 Darte un mimo', type: 'self-care' },
    { id: 'walk', label: '🚶 Salir 2 cuadras', type: 'outdoor' },
    { id: 'music', label: '🎵 Escuchar música alegre', type: 'music' },
    { id: 'watch', label: '📺 Ver tu serie favorita', type: 'entertainment' },
    { id: 'meditate', label: '🧘 Meditación guiada', type: 'mindfulness' },
    { id: 'read', label: '📖 Leer tu libro favorito', type: 'hobby' },
    { id: 'craft', label: '🎨 Hacer manualidades', type: 'hobby' },
    { id: 'baby', label: '👶 Jugar con mi bebé', type: 'baby' },
    { id: 'rest', label: '😴 Solo descansar', type: 'rest' },
  ],
  highEnergy: [
    { id: 'exercise-alone', label: '💪 Ejercitarme sola', type: 'exercise' },
    { id: 'exercise-baby', label: '👶 Ejercitar con mi bebé', type: 'exercise' },
    { id: 'challenge', label: '🎯 Hacer el reto del día', type: 'challenge' },
    { id: 'adventure', label: '🌟 Algo diferente', type: 'adventure' },
  ]
};

export const selfCareOptions = {
  skincare: [
    { name: 'Limpieza facial', duration: '5 min', video: 'https://youtube.com/...' },
    { name: 'Mascarilla calmante', duration: '10 min', video: 'https://youtube.com/...' },
    { name: 'Masaje facial antiestres', duration: '5 min', video: 'https://youtube.com/...' },
    { name: 'Hidratación profunda', duration: '3 min', video: 'https://youtube.com/...' },
  ],
  nails: [
    { name: 'Manicura básica', duration: '15 min' },
    { name: 'Pedicura relajante', duration: '20 min' },
    { name: 'Diseño de uñas simple', duration: '10 min' },
  ],
  hair: [
    { name: 'Peinado alisado', duration: '20 min' },
    { name: 'Peinado ondulado', duration: '15 min' },
    { name: 'Mascarilla capilar', duration: '30 min' },
  ]
};

export const meditationGuides = {
  anxiety: [
    { duration: 5, title: 'Calma en 5 minutos', instructor: 'Sofia' },
    { duration: 10, title: 'Respiración profunda', instructor: 'Ana' },
    { duration: 15, title: 'Ansiedad cero', instructor: 'Maria' },
  ],
  sleep: [
    { duration: 10, title: 'Duerme en paz', instructor: 'Sofia' },
    { duration: 15, title: 'Sueño reparador', instructor: 'Lucia' },
    { duration: 20, title: 'Noche tranquila', instructor: 'Ana' },
  ],
  connection: [
    { duration: 5, title: 'Conexión con tu bebé', instructor: 'Sofia' },
    { duration: 10, title: 'Amor infinito', instructor: 'Maria' },
    { duration: 15, title: 'Mamá presente', instructor: 'Lucia' },
  ]
};

export const dailyChallenges = [
  { day: 0, title: '🎬 Ir al cine', reward: 10, category: 'adventure' },
  { day: 1, title: '👗 Nuestro mejor outfit', reward: 10, category: 'self-care' },
  { day: 2, title: '💅 Masaje facial', reward: 10, category: 'self-care' },
  { day: 3, title: '💄 Pintarse las uñas', reward: 10, category: 'self-care' },
  { day: 4, title: '✨ Peinado nuevo', reward: 10, category: 'self-care' },
  { day: 5, title: '🎯 Estiramientos', reward: 10, category: 'exercise' },
  { day: 6, title: '🧘 Yoga suave', reward: 10, category: 'exercise' },
  { day: 7, title: '✉️ Carta para mi YO futura', reward: 15, category: 'reflection' },
  { day: 8, title: '🙏 Lista de gratitud', reward: 15, category: 'mindfulness' },
  { day: 9, title: '💝 Carta para mi bebé a los 18', reward: 20, category: 'reflection' },
  { day: 10, title: '🚶 Paseo especial', reward: 10, category: 'outdoor' },
  { day: 11, title: '☕ Café con amigas', reward: 15, category: 'social' },
  { day: 12, title: '📚 Capítulo de mi libro', reward: 10, category: 'hobby' },
  { day: 13, title: '🎨 Manualidad creativa', reward: 15, category: 'hobby' },
];

export const weeklyAllowances = [
  { item: '🍫 Chocolate favorito', day: 'jueves' },
  { item: '🍰 Postre favorito', day: 'viernes' },
  { item: '🍕 Comida favorita', day: 'sábado' },
  { item: '🍪 Snack favorito', day: 'domingo' },
];

export const emotionalFactors = [
  { id: 'energy', label: 'Energía', icon: '⚡' },
  { id: 'anxiety', label: 'Ansiedad', icon: '😰' },
  { id: 'sadness', label: 'Tristeza', icon: '😢' },
  { id: 'joy', label: 'Alegría', icon: '😊' },
  { id: 'baby-connection', label: 'Conexión bebé', icon: '👶' },
  { id: 'pain', label: 'Dolor físico', icon: '💢' },
  { id: 'sleep', label: 'Sueño', icon: '😴' },
  { id: 'overwhelm', label: 'Abrumada', icon: '😫' },
];

export const hobbyCategories = [
  { id: 'reading', label: '📖 Lectura', icon: '📚' },
  { id: 'painting', label: '🎨 Pintura', icon: '🖌️' },
  { id: 'music', label: '🎵 Música', icon: '🎶' },
  { id: 'crafts', label: '✨ Manualidades', icon: '🧵' },
  { id: 'movies', label: '🎬 Películas/Series', icon: '📺' },
  { id: 'gaming', label: '🎮 Videojuegos', icon: '👾' },
  { id: 'writing', label: '✍️ Escritura', icon: '📝' },
  { id: 'dance', label: '💃 Danza/Movimiento', icon: '🕺' },
];

export class EmotionalProfile {
  constructor(userId) {
    this.userId = userId;
    this.preferences = {
      hobbies: [],
      favoriteActivities: [],
      favoriteMusic: [],
      favoriteMovies: [],
      favoriteBooks: [],
      favoriteDessert: '',
      skinType: 'normal',
    };
    this.emotionalHistory = [];
    this.dailyCheckIns = [];
  }

  recordEmotionalState(score, factors, notes) {
    const entry = {
      date: new Date().toISOString(),
      score: score, // 1-10
      factors: factors, // array of emotional factors
      notes: notes,
      improvedWith: null // what helped
    };
    this.emotionalHistory.push(entry);
    return entry;
  }

  recordCheckIn(score, reason, selectedActivities) {
    const checkIn = {
      date: new Date().toISOString(),
      score,
      reason,
      selectedActivities,
      timestamp: Date.now()
    };
    this.dailyCheckIns.push(checkIn);
    return checkIn;
  }

  getEmotionalTrend(days = 7) {
    const recentCheckins = this.dailyCheckIns.slice(-days);
    if (recentCheckins.length === 0) return 'no-data';

    const avgScore = recentCheckins.reduce((sum, ci) => sum + ci.score, 0) / recentCheckins.length;

    if (avgScore < 4) return 'struggling';
    if (avgScore < 6) return 'managing';
    return 'thriving';
  }

  getTodayChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return dailyChallenges[dayOfYear % dailyChallenges.length];
  }

  getWeeklyAllowance() {
    const dayOfWeek = new Date().getDay();
    return weeklyAllowances[dayOfWeek % weeklyAllowances.length];
  }

  updatePreferences(preferences) {
    this.preferences = { ...this.preferences, ...preferences };
  }

  getRecommendations(emotionalScore) {
    if (emotionalScore <= 3) {
      return activityOptions.lowEnergy.filter(a =>
        !['exercise-alone', 'exercise-baby'].includes(a.id)
      );
    } else if (emotionalScore <= 5) {
      return activityOptions.lowEnergy;
    } else {
      return activityOptions.highEnergy;
    }
  }
}

export default {
  emotionalScaleEmojis,
  dailyGreetings,
  activityOptions,
  selfCareOptions,
  meditationGuides,
  dailyChallenges,
  weeklyAllowances,
  emotionalFactors,
  hobbyCategories,
  EmotionalProfile
};

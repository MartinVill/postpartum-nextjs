// Configuración global de la aplicación

export const appConfig = {
  name: 'PostpartumFitness',
  version: '1.0.0',
  description: 'App de fitness especializada para mujeres en recuperación postparto',
  targetUser: 'Mujeres postparto, especialmente post-cesárea',
  language: 'es',

  // Configuración de programa
  program: {
    duration: 8, // semanas
    startingWeek: 1,
    minRestDays: 1, // días de descanso mínimos entre workouts
    maxWeeklyWorkouts: 6,
  },

  // Configuración de seguridad y límites
  safety: {
    maxHeartRate: 140, // bpm sugerido
    warningPainLevel: 5, // 0-10
    redFlagSeverity: ['fever', 'severe_bleeding', 'infection_signs'],
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    frequency: 'daily',
    preferredTime: '08:00',
    types: ['workout_reminder', 'symptom_check', 'motivational', 'milestone']
  },

  // Configuración de privacidad
  privacy: {
    dataSynchronization: 'firestore',
    backupFrequency: 'daily',
    encryptSensitiveData: true,
    gdprCompliant: true,
  },

  // Configuración de precios (para futuro)
  pricing: {
    trialDays: 14,
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    currency: 'USD',
    paymentProvider: 'paypal'
  },

  // Configuración de contenido
  content: {
    educationalArticles: 4,
    workoutExercises: 25,
    symptomTrackers: 6,
    achievements: 12,
  },

  // URLs y endpoints
  endpoints: {
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    },
    openai: {
      model: 'gpt-4',
      maxTokens: 500,
    }
  },

  // Features
  features: {
    workoutTracking: true,
    symptomLogging: true,
    aiChat: true,
    educationalContent: true,
    gamification: true,
    progressDashboard: true,
    pushNotifications: true,
    offline: true,
    exportData: true,
  },

  // Metadata para SEO
  metadata: {
    title: 'PostpartumFitness - Recuperación Post-Cesárea',
    description: 'App especializada para mujeres en recuperación postparto. Ejercicios seguros, educación, seguimiento de síntomas y soporte emocional.',
    keywords: 'postparto, cesárea, ejercicio, recuperación, fitness, salud mental',
    author: 'Martín Villaroel',
  }
};

// Constantes de la app
export const APP_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  CACHE_TTL: 60 * 60 * 1000, // 1 hora
  API_TIMEOUT: 10000, // 10 segundos
};

// Estados posibles de la app
export const APP_STATES = {
  INITIAL: 'initial',
  ONBOARDING: 'onboarding',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  TRIALED_OUT: 'trialed_out',
};

// Mensajes predeterminados
export const MESSAGES = {
  es: {
    welcome: '¡Bienvenida a PostpartumFitness!',
    startingProgram: 'Estamos listos para comenzar tu recuperación segura',
    congratulations: '¡Felicidades! Has desbloqueado un nuevo logro',
    encouragement: 'Vamos, tú puedes. Tu cuerpo es más fuerte de lo que crees.',
    error: 'Oops, algo salió mal. Por favor intenta de nuevo.',
    offline: 'Estás sin conexión, pero puedes seguir usando la app.',
  }
};

// Validaciones
export const VALIDATIONS = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  phoneNumberFormat: /^[\d\s\-\+\(\)]{10,}$/,
  emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// Colores y tema
export const THEME = {
  primary: '#C770A4',
  secondary: '#A85A8A',
  accent: '#F9A97A',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  neutral: '#999999',
  light: '#F5F1F8',
  dark: '#1a1a1a',
};

export default appConfig;

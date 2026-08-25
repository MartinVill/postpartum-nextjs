// Sistema de gamificación: puntos, logros, badges

export const pointsSystem = {
  workout: {
    completed: 5,
    completedWithSymptomCheck: 7,
    perfectWeek: 35
  },
  education: {
    articleRead: 3,
    articleReadFull: 5
  },
  streak: {
    perDayStreak: 1,
    bonusAt7Days: 10,
    bonusAt14Days: 20,
    bonusAt30Days: 50
  },
  symptoms: {
    loggedDaily: 2,
    improvedSymptom: 5
  }
};

export const achievements = [
  {
    id: 'first-workout',
    title: '🚀 Primer Paso',
    description: 'Completaste tu primer workout',
    icon: '🚀',
    unlockedAt: { type: 'first_workout' },
    points: 10,
    rarity: 'common'
  },
  {
    id: '7-day-streak',
    title: '🔥 7 Días Seguidos',
    description: 'Hiciste ejercicio 7 días consecutivos',
    icon: '🔥',
    unlockedAt: { type: 'streak', days: 7 },
    points: 25,
    rarity: 'uncommon'
  },
  {
    id: '14-day-streak',
    title: '⚡ 2 Semanas de Consistencia',
    description: '14 días de compromiso contigo misma',
    icon: '⚡',
    unlockedAt: { type: 'streak', days: 14 },
    points: 50,
    rarity: 'rare'
  },
  {
    id: '100-points',
    title: '⭐ Centésima',
    description: 'Acumulaste 100 puntos',
    icon: '⭐',
    unlockedAt: { type: 'points', amount: 100 },
    points: 15,
    rarity: 'uncommon'
  },
  {
    id: '15-workouts',
    title: '💪 15 Workouts',
    description: 'Completaste 15 sesiones de ejercicio',
    icon: '💪',
    unlockedAt: { type: 'workouts_completed', count: 15 },
    points: 30,
    rarity: 'uncommon'
  },
  {
    id: 'week-2-reached',
    title: '📈 Semana 2',
    description: 'Llegaste a la segunda semana del programa',
    icon: '📈',
    unlockedAt: { type: 'week_reached', week: 2 },
    points: 20,
    rarity: 'uncommon'
  },
  {
    id: 'week-4-reached',
    title: '🎯 Punto Medio',
    description: 'Alcanzaste la mitad del programa (Semana 4)',
    icon: '🎯',
    unlockedAt: { type: 'week_reached', week: 4 },
    points: 40,
    rarity: 'rare'
  },
  {
    id: 'week-8-reached',
    title: '👑 Graduada',
    description: 'Completaste las 8 semanas del programa',
    icon: '👑',
    unlockedAt: { type: 'week_reached', week: 8 },
    points: 100,
    rarity: 'legendary'
  },
  {
    id: 'education-master',
    title: '📚 Maestra del Conocimiento',
    description: 'Leíste 5 artículos educativos completos',
    icon: '📚',
    unlockedAt: { type: 'articles_read', count: 5 },
    points: 25,
    rarity: 'uncommon'
  },
  {
    id: 'symptom-tracker',
    title: '📊 Analista',
    description: 'Registraste síntomas 10 días seguidos',
    icon: '📊',
    unlockedAt: { type: 'symptom_streak', days: 10 },
    points: 20,
    rarity: 'uncommon'
  },
  {
    id: 'perfect-week',
    title: '✨ Semana Perfecta',
    description: 'Completaste todo: 7 workouts + síntomas + educación',
    icon: '✨',
    unlockedAt: { type: 'perfect_week' },
    points: 50,
    rarity: 'rare'
  },
  {
    id: 'comeback',
    title: '💯 Resiliencia',
    description: 'Volviste después de perder una racha',
    icon: '💯',
    unlockedAt: { type: 'streak_restart' },
    points: 15,
    rarity: 'uncommon'
  }
];

export const badges = [
  {
    id: 'beginner',
    name: 'Principiante',
    description: 'Estás en la semana 1-2',
    icon: '🌱',
    weeks: [1, 2]
  },
  {
    id: 'progressing',
    name: 'En Progreso',
    description: 'Estás en la semana 3-4',
    icon: '📈',
    weeks: [3, 4]
  },
  {
    id: 'strong',
    name: 'Fuerte',
    description: 'Estás en la semana 5-6',
    icon: '💪',
    weeks: [5, 6]
  },
  {
    id: 'champion',
    name: 'Campeona',
    description: 'Estás en la semana 7-8',
    icon: '🏆',
    weeks: [7, 8]
  }
];

export class GamificationEngine {
  constructor(userId) {
    this.userId = userId;
    this.points = 0;
    this.unlockedAchievements = [];
    this.streak = 0;
    this.lastWorkoutDate = null;
  }

  addPoints(amount, reason) {
    this.points += amount;
    return {
      newTotal: this.points,
      added: amount,
      reason
    };
  }

  recordWorkout(completed = true) {
    if (completed) {
      this.addPoints(pointsSystem.workout.completed, 'Workout completado');
      this.updateStreak();
      return { success: true, pointsAdded: pointsSystem.workout.completed };
    }
  }

  recordSymptomCheck() {
    this.addPoints(pointsSystem.symptoms.loggedDaily, 'Síntomas registrados');
    return { pointsAdded: pointsSystem.symptoms.loggedDaily };
  }

  updateStreak() {
    const today = new Date().toDateString();
    const lastDate = this.lastWorkoutDate ? new Date(this.lastWorkoutDate).toDateString() : null;

    if (lastDate === today) {
      // Ya hizo workout hoy
      return { streakContinues: true };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (lastDate === yesterdayStr) {
      // Racha continúa
      this.streak++;
      this.lastWorkoutDate = new Date().toISOString();

      // Bonuses por racha
      if (this.streak === 7) {
        this.addPoints(pointsSystem.streak.bonusAt7Days, 'Bonus: 7 días seguidos');
      } else if (this.streak === 14) {
        this.addPoints(pointsSystem.streak.bonusAt14Days, 'Bonus: 14 días seguidos');
      } else if (this.streak === 30) {
        this.addPoints(pointsSystem.streak.bonusAt30Days, 'Bonus: 30 días seguidos');
      }

      return { streakContinues: true, currentStreak: this.streak };
    } else {
      // Racha se rompió
      const previousStreak = this.streak;
      this.streak = 1;
      this.lastWorkoutDate = new Date().toISOString();
      return { streakRestarted: true, previousStreak };
    }
  }

  checkAchievements(userStats) {
    const newlyUnlocked = [];

    for (let achievement of achievements) {
      if (this.unlockedAchievements.includes(achievement.id)) {
        continue; // Ya desbloqueado
      }

      let isUnlocked = false;

      switch (achievement.unlockedAt.type) {
        case 'first_workout':
          isUnlocked = userStats.workoutsCompleted >= 1;
          break;
        case 'streak':
          isUnlocked = this.streak >= achievement.unlockedAt.days;
          break;
        case 'points':
          isUnlocked = this.points >= achievement.unlockedAt.amount;
          break;
        case 'workouts_completed':
          isUnlocked = userStats.workoutsCompleted >= achievement.unlockedAt.count;
          break;
        case 'week_reached':
          isUnlocked = userStats.currentWeek >= achievement.unlockedAt.week;
          break;
        case 'articles_read':
          isUnlocked = (userStats.articlesRead || 0) >= achievement.unlockedAt.count;
          break;
        case 'symptom_streak':
          isUnlocked = (userStats.symptomStreak || 0) >= achievement.unlockedAt.days;
          break;
        case 'perfect_week':
          isUnlocked = userStats.perfectWeeks >= 1;
          break;
        case 'streak_restart':
          isUnlocked = userStats.streaksRestarted >= 1;
          break;
      }

      if (isUnlocked) {
        this.unlockedAchievements.push(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  getCurrentBadge(currentWeek) {
    for (let badge of badges) {
      if (badge.weeks.includes(currentWeek)) {
        return badge;
      }
    }
    return badges[0]; // Default to beginner
  }

  getStats() {
    return {
      points: this.points,
      streak: this.streak,
      unlockedAchievements: this.unlockedAchievements.length,
      achievements: achievements.filter(a => this.unlockedAchievements.includes(a.id))
    };
  }
}

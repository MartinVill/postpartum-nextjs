// Gestor de almacenamiento persistente (LocalStorage + Firestore)

const STORAGE_KEYS = {
  USER_DATA: 'pf_user_data',
  WORKOUTS: 'pf_workouts',
  SYMPTOMS: 'pf_symptoms',
  ACHIEVEMENTS: 'pf_achievements',
  POINTS: 'pf_points',
  STREAK: 'pf_streak',
  LAST_SYNC: 'pf_last_sync',
  APP_STATE: 'pf_app_state',
};

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

class StorageManager {
  constructor() {
    this.isOnline = typeof window !== 'undefined' && navigator.onLine;
    this.syncQueue = [];
    this.lastSync = null;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  // Obtener datos del usuario
  async getUser() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (cached) return JSON.parse(cached);

      // Si no hay cache, buscar en Firestore
      if (this.isOnline && window.firebase) {
        const { db } = await import('./firebase');
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'users', this.getUserId());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.error('Error getting user:', e);
    }
    return this.getDefaultUser();
  }

  // Guardar datos del usuario
  async setUser(userData) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

      if (this.isOnline && window.firebase) {
        this.syncQueue.push({ action: 'updateUser', data: userData });
      }
    } catch (e) {
      console.error('Error setting user:', e);
    }
  }

  // Obtener historial de workouts
  async getWorkouts() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error('Error getting workouts:', e);
      return [];
    }
  }

  // Agregar workout completado
  async addWorkout(workout) {
    try {
      const workouts = await this.getWorkouts();
      const newWorkout = {
        ...workout,
        id: Date.now(),
        completedAt: new Date().toISOString(),
      };
      workouts.push(newWorkout);

      localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));

      if (this.isOnline && window.firebase) {
        this.syncQueue.push({ action: 'addWorkout', data: newWorkout });
      }

      return newWorkout;
    } catch (e) {
      console.error('Error adding workout:', e);
    }
  }

  // Obtener síntomas registrados
  async getSymptoms() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.SYMPTOMS);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error('Error getting symptoms:', e);
      return [];
    }
  }

  // Registrar síntomas del día
  async logSymptoms(symptoms) {
    try {
      const allSymptoms = await this.getSymptoms();
      const todaySymptoms = allSymptoms.find(s =>
        new Date(s.date).toDateString() === new Date().toDateString()
      );

      const symptomsEntry = {
        id: todaySymptoms?.id || Date.now(),
        date: new Date().toISOString(),
        symptoms: symptoms,
        severity: this.calculateSeverity(symptoms)
      };

      if (todaySymptoms) {
        // Actualizar síntomas de hoy
        const index = allSymptoms.indexOf(todaySymptoms);
        allSymptoms[index] = symptomsEntry;
      } else {
        // Agregar nuevos síntomas
        allSymptoms.push(symptomsEntry);
      }

      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(allSymptoms));

      if (this.isOnline && window.firebase) {
        this.syncQueue.push({ action: 'logSymptoms', data: symptomsEntry });
      }

      return symptomsEntry;
    } catch (e) {
      console.error('Error logging symptoms:', e);
    }
  }

  // Obtener logros desbloqueados
  async getAchievements() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error('Error getting achievements:', e);
      return [];
    }
  }

  // Desbloquear logro
  async unlockAchievement(achievementId) {
    try {
      const achievements = await this.getAchievements();
      if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));

        if (this.isOnline && window.firebase) {
          this.syncQueue.push({ action: 'unlockAchievement', data: achievementId });
        }
      }
    } catch (e) {
      console.error('Error unlocking achievement:', e);
    }
  }

  // Obtener puntos
  async getPoints() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.POINTS);
      return cached ? JSON.parse(cached) : { total: 0, breakdown: {} };
    } catch (e) {
      console.error('Error getting points:', e);
      return { total: 0, breakdown: {} };
    }
  }

  // Agregar puntos
  async addPoints(amount, reason) {
    try {
      const points = await this.getPoints();
      points.total += amount;
      points.breakdown[reason] = (points.breakdown[reason] || 0) + amount;
      points.lastAdded = { amount, reason, date: new Date().toISOString() };

      localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(points));

      if (this.isOnline && window.firebase) {
        this.syncQueue.push({ action: 'addPoints', data: { amount, reason } });
      }

      return points;
    } catch (e) {
      console.error('Error adding points:', e);
    }
  }

  // Obtener racha
  async getStreak() {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STREAK);
      return cached ? JSON.parse(cached) : { current: 0, longest: 0, lastDate: null };
    } catch (e) {
      console.error('Error getting streak:', e);
      return { current: 0, longest: 0, lastDate: null };
    }
  }

  // Actualizar racha
  async updateStreak() {
    try {
      const streak = await this.getStreak();
      const today = new Date().toDateString();
      const lastDate = streak.lastDate ? new Date(streak.lastDate).toDateString() : null;

      if (lastDate === today) {
        return streak; // Ya actualizado hoy
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate === yesterday.toDateString()) {
        streak.current++;
      } else {
        streak.current = 1;
      }

      streak.longest = Math.max(streak.longest, streak.current);
      streak.lastDate = new Date().toISOString();

      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));

      if (this.isOnline && window.firebase) {
        this.syncQueue.push({ action: 'updateStreak', data: streak });
      }

      return streak;
    } catch (e) {
      console.error('Error updating streak:', e);
    }
  }

  // Sincronizar con Firestore
  async syncWithFirebase() {
    if (!this.isOnline || this.syncQueue.length === 0) return false;

    try {
      const { db } = await import('./firebase');
      const { doc, updateDoc } = await import('firebase/firestore');

      const userId = this.getUserId();
      const docRef = doc(db, 'users', userId);

      for (const sync of this.syncQueue) {
        // Aquí iría la lógica de sincronización real
        // Por ahora, solo registro que fue procesado
        console.log('Synced:', sync.action);
      }

      this.syncQueue = [];
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Error syncing with Firebase:', e);
      return false;
    }
  }

  // Evento: usuario conectado online
  async handleOnline() {
    this.isOnline = true;
    console.log('🟢 Online');
    await this.syncWithFirebase();
  }

  // Evento: usuario desconectado
  handleOffline() {
    this.isOnline = false;
    console.log('🔴 Offline - Los cambios se sincronizarán cuando vuelvas online');
  }

  // Calcular severidad de síntomas
  calculateSeverity(symptoms) {
    const severeSymptoms = ['fever', 'discharge', 'severe_pain'];
    const hasSevere = symptoms.some(s => severeSymptoms.includes(s));
    return hasSevere ? 'high' : 'normal';
  }

  // Obtener ID único del usuario
  getUserId() {
    if (!this.userId) {
      let id = localStorage.getItem('userId');
      if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', id);
      }
      this.userId = id;
    }
    return this.userId;
  }

  // Obtener usuario por defecto
  getDefaultUser() {
    return {
      id: this.getUserId(),
      name: 'Lauren',
      createdAt: new Date().toISOString(),
      currentWeek: 1,
      totalWorkouts: 0,
      totalPoints: 0,
      medicalIntakeCompleted: false
    };
  }

  // Limpiar todo (para testing)
  async clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.syncQueue = [];
  }

  // Obtener datos consolidados
  async getConsolidatedData() {
    return {
      user: await this.getUser(),
      workouts: await this.getWorkouts(),
      symptoms: await this.getSymptoms(),
      achievements: await this.getAchievements(),
      points: await this.getPoints(),
      streak: await this.getStreak(),
    };
  }
}

export default new StorageManager();

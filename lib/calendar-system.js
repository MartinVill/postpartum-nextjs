// Sistema de calendario integrado para rastrear menstruación, eventos y retos

export class CalendarSystem {
  constructor(userId) {
    this.userId = userId;
    this.lastPeriodDate = null;
    this.cycleLengthDays = 28;
    this.events = [];
    this.challenges = [];
    this.notes = {};
  }

  // Rastrear menstruación
  setLastPeriodDate(date) {
    this.lastPeriodDate = new Date(date);
    return {
      nextExpected: this.getNextPeriodDate(),
      message: 'Fecha de menstruación registrada. Te avisaremos cuando se acerque.'
    };
  }

  getNextPeriodDate() {
    if (!this.lastPeriodDate) return null;
    const next = new Date(this.lastPeriodDate);
    next.setDate(next.getDate() + this.cycleLengthDays);
    return next;
  }

  getDaysUntilNextPeriod() {
    const next = this.getNextPeriodDate();
    if (!next) return null;
    const today = new Date();
    const daysUntil = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    return daysUntil;
  }

  // Detectar si podría haber nuevo embarazo
  checkLateperiod() {
    const daysLate = -this.getDaysUntilNextPeriod();
    if (daysLate > 5) {
      return {
        alert: true,
        message: '¿Estás retrasada?',
        suggestion: 'Si tienes relaciones sin protección, podría ser un nuevo embarazo. ¿Quieres hacerte una prueba?'
      };
    }
    return { alert: false };
  }

  // Agregar eventos
  addEvent(date, eventName, type = 'personal') {
    const event = {
      id: Date.now(),
      date: new Date(date),
      name: eventName,
      type: type // 'medical', 'baby', 'personal', 'challenge'
    };
    this.events.push(event);
    return event;
  }

  // Obtener eventos de hoy
  getTodayEvents() {
    const today = new Date();
    return this.events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.toDateString() === today.toDateString();
    });
  }

  // Obtener eventos de la semana
  getWeekEvents() {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return this.events.filter(e => {
      const eDate = new Date(e.date);
      return eDate >= weekStart && eDate <= weekEnd;
    });
  }

  // Agregar nota del día
  addDailyNote(date, note) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    this.notes[dateStr] = note;
    return { date: dateStr, note };
  }

  // Obtener nota del día
  getDailyNote(date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return this.notes[dateStr] || null;
  }

  // Programar reto diario
  scheduleDailyChallenge(dayOfMonth, challengeName, reward = 10) {
    const challenge = {
      id: `${dayOfMonth}-${challengeName}`,
      dayOfMonth,
      name: challengeName,
      reward,
      completed: false
    };
    this.challenges.push(challenge);
    return challenge;
  }

  // Obtener reto de hoy
  getTodayChallenge() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    return this.challenges.find(c => c.dayOfMonth === dayOfMonth && !c.completed) || null;
  }

  // Marcar reto como completado
  completeChallenge(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (challenge) {
      challenge.completed = true;
      challenge.completedDate = new Date().toISOString();
    }
    return challenge;
  }

  // Obtener estadísticas del mes
  getMonthStats() {
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    const monthEvents = this.events.filter(e => {
      const eDate = new Date(e.date);
      return eDate.getMonth() === thisMonth && eDate.getFullYear() === thisYear;
    });

    const completedChallenges = this.challenges.filter(c =>
      c.completed && new Date(c.completedDate).getMonth() === thisMonth
    ).length;

    return {
      totalEvents: monthEvents.length,
      completedChallenges,
      notes: Object.keys(this.notes).filter(dateStr =>
        new Date(dateStr).getMonth() === thisMonth
      ).length
    };
  }

  // Generar vista del mes para UI
  getMonthView(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const dayEvents = this.events.filter(e =>
        new Date(e.date).toISOString().split('T')[0] === dateStr
      );
      const challenge = this.challenges.find(c => c.dayOfMonth === i && c.completed);
      const note = this.notes[dateStr];

      days.push({
        day: i,
        date,
        hasEvent: dayEvents.length > 0,
        events: dayEvents,
        hasChallenge: !!challenge,
        hasNote: !!note,
        note,
        isPeriodDay: this.isPeriodDay(date),
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    return days;
  }

  // Detectar si es día de menstruación
  isPeriodDay(date) {
    if (!this.lastPeriodDate) return false;
    const daysSinceLastPeriod = Math.floor((date - this.lastPeriodDate) / (1000 * 60 * 60 * 24));
    const dayInCycle = daysSinceLastPeriod % this.cycleLengthDays;
    // Menstruación típicamente dura 5 días
    return dayInCycle >= this.cycleLengthDays - 5 || dayInCycle <= 4;
  }

  // Recomendación según el ciclo
  getCycleRecommendation(date = new Date()) {
    if (!this.lastPeriodDate) return null;

    const daysSinceLastPeriod = Math.floor((date - this.lastPeriodDate) / (1000 * 60 * 60 * 24));
    const dayInCycle = daysSinceLastPeriod % this.cycleLengthDays;

    if (dayInCycle <= 5) {
      return {
        phase: 'Menstruación',
        recommendation: 'Tómatelo con calma. Come algo de hierro. Mantente hidratada. 💙',
        emoji: '🩸'
      };
    } else if (dayInCycle <= 13) {
      return {
        phase: 'Fase Folicular (Energía)',
        recommendation: '¡Tienes más energía! Perfecto para ejercicio o nuevos proyectos. 💪',
        emoji: '⚡'
      };
    } else if (dayInCycle <= 20) {
      return {
        phase: 'Ovulación',
        recommendation: 'Eres un imán de energía. ¡Aprovecha para lo que quieras! ✨',
        emoji: '✨'
      };
    } else {
      return {
        phase: 'Fase Lútea (Introspección)',
        recommendation: 'Es normal sentir menos energía. Prioriza autocuidado y descanso. 🌙',
        emoji: '🌙'
      };
    }
  }
}

export const eventTypes = {
  medical: { label: 'Cita médica', icon: '🏥', color: '#FF6B6B' },
  baby: { label: 'Hito del bebé', icon: '👶', color: '#FFD93D' },
  personal: { label: 'Evento personal', icon: '⭐', color: '#6BCB77' },
  challenge: { label: 'Reto completado', icon: '🎯', color: '#9D84B7' },
};

export const predefinedChallenges = [
  'Ir al cine',
  'Mejor outfit',
  'Masaje facial',
  'Pintarse las uñas',
  'Peinado nuevo',
  'Estiramientos',
  'Yoga',
  'Carta para mí futura',
  'Lista de gratitud',
  'Carta para mi bebé',
];

export default {
  CalendarSystem,
  eventTypes,
  predefinedChallenges
};

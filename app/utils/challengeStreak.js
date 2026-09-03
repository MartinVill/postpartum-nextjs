const CHALLENGE_DATA_KEY = 'dailyChallengeData';
const CHALLENGE_HISTORY_KEY = 'completedChallengesHistory';

export function getChallengeDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

function daysBetween(from, to) {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  return Math.round((Date.UTC(toYear, toMonth - 1, toDay) - Date.UTC(fromYear, fromMonth - 1, fromDay)) / 86400000);
}

function getStoredData() {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGE_DATA_KEY) || '{}');
  } catch {
    return {};
  }
}

function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGE_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function inferStreakFromHistory(history) {
  const days = [...new Set(history.map(entry => getChallengeDayKey(entry.date)).filter(Boolean))].sort();
  if (!days.length) return { streak: 0, lastCompletedDate: null };

  let streak = 1;
  for (let index = days.length - 1; index > 0; index -= 1) {
    if (daysBetween(days[index - 1], days[index]) !== 1) break;
    streak += 1;
  }
  return { streak, lastCompletedDate: days.at(-1) };
}

export function getChallengeStreak() {
  const stored = getStoredData();
  const fallback = inferStreakFromHistory(getStoredHistory());
  const hasCurrentSchema = typeof stored.lastCompletedDate === 'string';
  const lastCompletedDate = hasCurrentSchema ? stored.lastCompletedDate : fallback.lastCompletedDate;
  const storedStreak = hasCurrentSchema ? Number(stored.streak) || 0 : fallback.streak || 0;

  if (!lastCompletedDate || daysBetween(lastCompletedDate, getChallengeDayKey()) > 1) {
    return { streak: 0, lastCompletedDate: lastCompletedDate || null };
  }

  return { streak: storedStreak, lastCompletedDate };
}

export function recordChallengeCompletion({ title = 'Reto del día', emoji = '🎯', mood = null } = {}) {
  const today = getChallengeDayKey();
  const stored = getStoredData();
  const current = getChallengeStreak();

  if (current.lastCompletedDate === today) {
    return { ...stored, streak: current.streak, lastCompletedDate: today, recorded: false };
  }

  const continuesStreak = current.lastCompletedDate && daysBetween(current.lastCompletedDate, today) === 1;
  const streak = continuesStreak ? current.streak + 1 : 1;
  const nextData = {
    ...stored,
    streak,
    longestStreak: Math.max(Number(stored.longestStreak) || 0, streak),
    lastCompletedDate: today,
    date: new Date().toDateString()
  };

  const history = getStoredHistory();
  history.push({
    date: new Date().toISOString(),
    challengeTitle: title,
    emoji,
    ...(mood ? { mood } : {})
  });

  localStorage.setItem(CHALLENGE_DATA_KEY, JSON.stringify(nextData));
  localStorage.setItem(CHALLENGE_HISTORY_KEY, JSON.stringify(history));
  return { ...nextData, recorded: true };
}

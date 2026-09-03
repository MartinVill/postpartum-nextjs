import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

function getBuenosAiresDateParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.filter(({ type }) => type !== 'literal').map(({ type, value: part }) => [type, part]));
  return new Date(Date.UTC(Number(value.year), Number(value.month) - 1, Number(value.day)));
}

function getWeekKey() {
  const date = getBuenosAiresDateParts();
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export async function GET(request) {
  try {
    const userId = new URL(request.url).searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const weekKey = getWeekKey();
    const snapshot = await getAdminDb().collection('users').doc(userId).collection('stats').doc('breathing').get();
    const weeks = snapshot.exists ? snapshot.data().weeks || {} : {};
    return NextResponse.json({ minutes: Number(weeks[weekKey]) || 0, weekKey });
  } catch (error) {
    console.error('[BREATHING] Unable to read weekly stats:', error);
    return NextResponse.json({ error: 'Unable to load breathing stats' }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    const { userId, minutes } = await request.json();
    if (!userId || !Number.isInteger(minutes) || minutes < 1 || minutes > 10) {
      return NextResponse.json({ error: 'Invalid breathing session' }, { status: 400 });
    }

    const weekKey = getWeekKey();
    const ref = getAdminDb().collection('users').doc(userId).collection('stats').doc('breathing');
    const total = await getAdminDb().runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const weeks = snapshot.exists ? snapshot.data().weeks || {} : {};
      const nextMinutes = (Number(weeks[weekKey]) || 0) + minutes;
      transaction.set(ref, {
        weeks: { ...weeks, [weekKey]: nextMinutes },
        totalMinutes: (Number(snapshot.exists ? snapshot.data().totalMinutes : 0) || 0) + minutes,
        updatedAt: new Date()
      }, { merge: true });
      return nextMinutes;
    });

    return NextResponse.json({ success: true, minutes: total, weekKey });
  } catch (error) {
    console.error('[BREATHING] Unable to save weekly stats:', error);
    return NextResponse.json({ error: 'Unable to save breathing stats' }, { status: 503 });
  }
}

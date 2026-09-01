/**
 * API Route: POST /api/notifications/send-scheduled
 * Sends the two daily push notifications while respecting quiet hours.
 */

import { NextResponse } from 'next/server';

/**
 * Check if current time falls within quiet hours
 */
function isWithinQuietHours(quietStart = "22:00", quietEnd = "08:00") {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [sHours, sMins] = quietStart.split(':').map(Number);
  const [eHours, eMins] = quietEnd.split(':').map(Number);

  const startMinutes = sHours * 60 + sMins;
  const endMinutes = eHours * 60 + eMins;

  if (startMinutes > endMinutes) {
    // Overnight window (e.g., 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Same-day window
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

const DAILY_TRIGGERS = {
  morning: {
    hour: 11,
    title: 'Tu check-in de hoy 💜',
    body: '¿Cómo te sientes hoy? 💜',
  },
  afternoon: {
    hour: 18,
    title: 'Un momento para vos ✨',
    body: '¿Hacemos una pausa? ✨',
  },
};

function getDateInTimeZone(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function hasCheckedInToday({ hasLoggedInToday, lastCheckinTimestamp, timeZone }, now) {
  if (hasLoggedInToday === true) return true;
  if (!lastCheckinTimestamp) return false;

  const lastCheckin = new Date(lastCheckinTimestamp);
  if (Number.isNaN(lastCheckin.getTime())) return false;

  const userTimeZone = timeZone || 'America/Argentina/Buenos_Aires';
  return getDateInTimeZone(lastCheckin, userTimeZone) === getDateInTimeZone(now, userTimeZone);
}

function resolveTrigger(trigger, now) {
  if (trigger && DAILY_TRIGGERS[trigger]) return { name: trigger, ...DAILY_TRIGGERS[trigger] };

  const triggerEntry = Object.entries(DAILY_TRIGGERS).find(([, schedule]) => schedule.hour === now.getHours());
  return triggerEntry ? { name: triggerEntry[0], ...triggerEntry[1] } : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      subscriptions = [],
      trigger,
      hasLoggedInToday,
      lastCheckinTimestamp,
      timeZone,
    } = body;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscriptions provided'
      }, { status: 400 });
    }

    const now = new Date();
    const activeTrigger = resolveTrigger(trigger, now);
    if (!activeTrigger) {
      return NextResponse.json({
        success: false,
        message: 'No daily notification is scheduled for this hour',
      }, { status: 400 });
    }

    const results = {
      sent: [],
      skippedAlreadyCheckedIn: [],
      blockedByQuietHours: [],
      errors: []
    };

    // Process each subscription
    for (const sub of subscriptions) {
      try {
        const { subscription, quietStart, quietEnd } = sub;
        const recipient = {
          hasLoggedInToday: sub.hasLoggedInToday ?? hasLoggedInToday,
          lastCheckinTimestamp: sub.lastCheckinTimestamp ?? lastCheckinTimestamp,
          timeZone: sub.timeZone ?? timeZone,
        };

        if (activeTrigger.name === 'morning' && hasCheckedInToday(recipient, now)) {
          results.skippedAlreadyCheckedIn.push({
            endpoint: subscription?.endpoint?.slice(-10),
            reason: 'Already logged in or checked in today',
          });
          continue;
        }

        // Check quiet hours BEFORE sending
        if (isWithinQuietHours(quietStart, quietEnd)) {
          console.log(`[SCHEDULER] Notification blocked by quiet hours: ${quietStart} - ${quietEnd}`);
          results.blockedByQuietHours.push({
            endpoint: subscription.endpoint?.slice(-10),
            reason: 'Within quiet hours'
          });
          continue;
        }

        // In production: use web-push library to send actual push
        // For MVP: log and simulate
        console.log(`[SCHEDULER] Would send ${activeTrigger.name} push to ${subscription?.endpoint?.slice(-10)}`, activeTrigger);

        // Simulate sending (replace with actual web-push.sendNotification() in production)
        results.sent.push({
          endpoint: subscription?.endpoint?.slice(-10),
          title: activeTrigger.title,
          body: activeTrigger.body,
        });
      } catch (error) {
        console.error('[SCHEDULER] Error processing subscription:', error);
        results.errors.push({
          endpoint: subscription.endpoint?.slice(-10),
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      trigger: activeTrigger.name,
      results
    });
  } catch (error) {
    console.error('[SCHEDULER] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to trigger test notification (for development)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trigger = searchParams.get('trigger') || 'morning';
    const notification = DAILY_TRIGGERS[trigger];
    if (!notification) {
      return NextResponse.json({ error: 'trigger must be "morning" or "afternoon"' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      trigger,
      previewNotification: notification,
      message: 'Use POST with trigger "morning" at 11:00 or "afternoon" at 18:00'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

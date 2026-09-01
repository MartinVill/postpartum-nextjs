/**
 * API Route: POST /api/notifications/send-scheduled
 * Sends scheduled push notifications respecting quiet hours
 * Adapts copy based on user's last mood score
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

/**
 * Generate notification copy based on mood score
 * Called when sending notifications to personalize message
 */
function getNotificationCopy(moodScore) {
  if (moodScore <= 4) {
    return {
      title: "Estamos aquí para ti 💜",
      body: "Sin presiones. Cuando tengas un ratito libre, entra a hacer un chequeo suave."
    };
  } else if (moodScore <= 7) {
    return {
      title: "Tu pausa del día ✨",
      body: "¿Cómo te sientes en este momento? Tómate un minuto para ti."
    };
  } else {
    return {
      title: "¡Qué alegría verte bien! 🌟",
      body: "Pásate a revisar tu reto del día y celebra cómo te sientes hoy."
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { moodScore = 5, subscriptions = [] } = body;

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No subscriptions provided'
      }, { status: 400 });
    }

    // Generate copy based on mood
    const notificationCopy = getNotificationCopy(moodScore);

    const results = {
      sent: [],
      blockedByQuietHours: [],
      errors: []
    };

    // Process each subscription
    for (const sub of subscriptions) {
      try {
        const { subscription, quietStart, quietEnd } = sub;

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
        console.log(`[SCHEDULER] Would send push to ${subscription.endpoint?.slice(-10)}`, notificationCopy);

        // Simulate sending (replace with actual web-push.sendNotification() in production)
        results.sent.push({
          endpoint: subscription.endpoint?.slice(-10),
          title: notificationCopy.title,
          body: notificationCopy.body
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
      moodScore,
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
    const moodScore = parseInt(searchParams.get('mood')) || 5;

    const notificationCopy = getNotificationCopy(moodScore);

    return NextResponse.json({
      success: true,
      moodScore,
      previewNotification: notificationCopy,
      message: 'Use POST to send to all subscriptions'
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

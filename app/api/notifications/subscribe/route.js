/**
 * API Route: POST /api/notifications/subscribe
 * Saves push notification subscriptions and quiet hour settings
 * Stores in-memory for MVP (ready for Firebase/DB migration)
 */

import { NextResponse } from 'next/server';

// In-memory store (replace with Firebase for production)
const subscriptions = new Map();

export async function POST(request) {
  try {
    const body = await request.json();
    const { subscription, quietStart, quietEnd, updateOnly } = body;

    if (!subscription && !updateOnly) {
      return NextResponse.json(
        { error: 'subscription required' },
        { status: 400 }
      );
    }

    // Generate a device ID from subscription endpoint (unique identifier)
    const deviceId = subscription?.endpoint?.split('/').pop() || `user-${Date.now()}`;

    // Store subscription and quiet hours
    if (!updateOnly) {
      subscriptions.set(deviceId, {
        subscription,
        quietStart: quietStart || '22:00',
        quietEnd: quietEnd || '08:00',
        subscribedAt: new Date().toISOString()
      });

      console.log(`[SUBSCRIBE] New subscription saved: ${deviceId}`);
    } else {
      // Just update quiet hours for existing subscription
      const existing = subscriptions.get(deviceId);
      if (existing) {
        existing.quietStart = quietStart || existing.quietStart;
        existing.quietEnd = quietEnd || existing.quietEnd;
        existing.updatedAt = new Date().toISOString();
        console.log(`[SUBSCRIBE] Quiet hours updated for ${deviceId}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscripción guardada',
      deviceId
    });
  } catch (error) {
    console.error('[SUBSCRIBE] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Optional: GET endpoint to verify subscription status
 */
export async function GET(request) {
  try {
    // Count total subscriptions for monitoring
    const count = subscriptions.size;
    return NextResponse.json({
      success: true,
      totalSubscriptions: count,
      message: `${count} suscripciones activas`
    });
  } catch (error) {
    console.error('[SUBSCRIBE GET] Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// Export for use in send-scheduled route
export function getAllSubscriptions() {
  return Array.from(subscriptions.values());
}

export function getSubscriptionByDeviceId(deviceId) {
  return subscriptions.get(deviceId);
}

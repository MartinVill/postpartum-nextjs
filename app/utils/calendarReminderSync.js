'use client';

const reminderValues = new Set(['15min', '30min', '1h', '1day']);

const localEventTimestamp = (event) => {
  const date = new Date(event.date);
  const datePart = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  return new Date(`${datePart}T${event.time || '09:00'}:00`).toISOString();
};

/**
 * Mirrors a calendar event's reminder choices to Firestore. The timestamp is
 * converted on the device, preserving the user's local date and time as UTC.
 */
export async function syncCalendarReminder(event) {
  if (!event?.id || event.type === 'sintoma') return { skipped: true };
  const userId = localStorage.getItem('userId');
  if (!userId) return { skipped: true, reason: 'missing-user-id' };

  const reminders = [...new Set((event.notifications || [event.notification]).filter(value => reminderValues.has(value)))];
  const response = await fetch('/api/notifications/reminders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      eventId: String(event.id),
      eventTitle: event.name || 'Evento',
      eventType: event.type || 'evento',
      eventTimestamp: localEventTimestamp(event),
      reminders,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'No se pudo programar el recordatorio');
  }
  return response.json();
}

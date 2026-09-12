import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) throw new Error('Firebase Admin is not configured');
  return getApps()[0] || initializeApp({ credential: cert({ projectId: FIREBASE_PROJECT_ID, clientEmail: FIREBASE_CLIENT_EMAIL, privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export async function getAdminAuth() {
  // Auth pulls in a separate dependency tree in Vercel. Loading it only for
  // authenticated routes keeps Firestore-only handlers (webhooks/push) usable.
  const { getAuth } = await import('firebase-admin/auth');
  return getAuth(getAdminApp());
}

/**
 * Verifies an end-user Firebase ID token through Firebase Auth's server API.
 *
 * The deployed Node runtime cannot load firebase-admin/auth because one of its
 * transitive CommonJS dependencies attempts to require an ESM-only module.
 * Firebase's accounts:lookup endpoint performs the same token validation on
 * Firebase's servers and lets billing routes remain secure and deployable.
 */
export async function verifyFirebaseIdToken(idToken) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!idToken || !apiKey) throw new Error('Firebase token verification is not configured');

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    cache: 'no-store'
  });
  const payload = await response.json().catch(() => ({}));
  const user = payload?.users?.[0];
  if (!response.ok || !user?.localId) {
    throw new Error(payload?.error?.message || 'Invalid Firebase ID token');
  }
  return { uid: user.localId, email: user.email || '', email_verified: Boolean(user.emailVerified) };
}

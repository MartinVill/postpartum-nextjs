import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) throw new Error('Firebase Admin is not configured');
  return getApps()[0] || initializeApp({ credential: cert({ projectId: FIREBASE_PROJECT_ID, clientEmail: FIREBASE_CLIENT_EMAIL, privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }) });
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

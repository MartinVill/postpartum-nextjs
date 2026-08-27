import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'dummy',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dummy',
};

let app, db, auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn('[Firebase] Init warning (expected during build):', error.message);
}

export { db, auth };

// User data management
export async function getUserProfile(userId) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function createUserProfile(userId, data) {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

export async function updateUserProfile(userId, data) {
  try {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
}

// Workout tracking
export async function logWorkout(userId, workoutData) {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    await setDoc(doc(workoutsRef), {
      ...workoutData,
      completedAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging workout:', error);
  }
}

export async function getWorkoutHistory(userId) {
  try {
    const workoutsRef = collection(db, 'users', userId, 'workouts');
    const querySnapshot = await getDocs(workoutsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting workout history:', error);
    return [];
  }
}

// Symptom tracking
export async function logSymptoms(userId, symptoms) {
  try {
    const symptomsRef = collection(db, 'users', userId, 'symptoms');
    await setDoc(doc(symptomsRef), {
      symptoms,
      loggedAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging symptoms:', error);
  }
}

export async function getSymptomHistory(userId) {
  try {
    const symptomsRef = collection(db, 'users', userId, 'symptoms');
    const querySnapshot = await getDocs(symptomsRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting symptom history:', error);
    return [];
  }
}

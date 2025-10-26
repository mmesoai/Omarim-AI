'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// A memoized object to hold the Firebase services.
let firebaseServices: { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } | null = null;

// This function initializes Firebase and returns the services.
// It's designed to be idempotent, meaning it will only initialize the app once.
export function initializeFirebase() {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseServices = { firebaseApp: app, auth, firestore };
  return firebaseServices;
}

// Re-export other necessary modules.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

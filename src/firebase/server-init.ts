
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK
export function initializeFirebase(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp({
    projectId: firebaseConfig.projectId
  });
}

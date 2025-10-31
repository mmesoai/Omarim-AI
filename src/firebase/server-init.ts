
import { initializeApp, getApps, App, ServiceAccount, cert } from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

// This function is for server-side initialization of the Firebase Admin SDK.
// It should not be used on the client.
export function initializeFirebase(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  
  // In a deployed environment, service account credentials will be automatically
  // discovered. In a local environment, you would need to set up a service
  // account key file. For this project, we will rely on the deployed environment.
  return initializeApp({
    projectId: firebaseConfig.projectId
  });
}

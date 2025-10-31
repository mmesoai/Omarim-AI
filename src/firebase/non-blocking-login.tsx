'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { initializeFirebase, setDocumentNonBlocking } from '@/firebase';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google Sign-In (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider)
    .then(async (result) => {
        const user = result.user;
        const additionalInfo = getAdditionalUserInfo(result);
        const { firestore } = initializeFirebase()!;
        
        // If it's a new user, create a document in Firestore
        if (additionalInfo?.isNewUser && firestore) {
            const userDocRef = doc(firestore, "users", user.uid);
            const nameParts = user.displayName?.split(" ") || ["", ""];
            const userData = {
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" "),
                email: user.email,
            };
            setDocumentNonBlocking(userDocRef, userData);
        }
    })
    .catch((error) => {
        // Handle Errors here.
        console.error("Google Sign-In Error:", error);
    });
}

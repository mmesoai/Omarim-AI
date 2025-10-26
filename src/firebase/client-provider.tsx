'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Firebase on the client side, once per component mount.
    const services = initializeFirebase();
    if (services) {
      setFirebaseServices(services);
    }
    // Regardless of outcome, initialization attempt is complete.
    setIsLoading(false);
  }, []); // Empty dependency array ensures this runs only once on mount

  // While attempting to initialize, show a loading state.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If initialization failed or returned null, render nothing or an error message.
  // This prevents children from trying to access a null context.
  if (!firebaseServices) {
    return (
       <div className="flex h-screen w-screen items-center justify-center bg-background text-destructive-foreground">
        <p>Could not connect to Firebase. Please try again later.</p>
      </div>
    ); 
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}

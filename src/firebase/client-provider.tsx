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

// Singleton promise to ensure Firebase initializes only once
let firebaseInitializationPromise: Promise<FirebaseServices | null> | null = null;

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (firebaseInitializationPromise === null) {
      firebaseInitializationPromise = new Promise((resolve) => {
        const services = initializeFirebase();
        resolve(services);
      });
    }

    firebaseInitializationPromise.then(services => {
      if (services) {
        setFirebaseServices(services);
      }
      setIsLoading(false);
    });
  }, []); 

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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

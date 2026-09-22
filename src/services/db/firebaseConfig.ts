// Firebase & Cloud Database Configuration Adapter for SafeNet
// Allows users to plug in Google Cloud Firebase Firestore credentials,
// while gracefully defaulting to the native IndexedDB Engine for 100% reliability.

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  enabled: boolean;
}

const FIREBASE_CONFIG_KEY = 'safenet_firebase_credentials';

export const getStoredFirebaseConfig = (): FirebaseConfig => {
  const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return {
    apiKey: '',
    authDomain: 'safenet-nagpur.firebaseapp.com',
    projectId: 'safenet-nagpur',
    storageBucket: 'safenet-nagpur.appspot.com',
    messagingSenderId: '1029384756',
    appId: '1:1029384756:web:8f9a0b1c2d3e4f5',
    enabled: false
  };
};

export const saveFirebaseConfig = (config: FirebaseConfig) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

export type DatabaseEngineType = 'IndexedDB' | 'Firestore';

export interface DatabaseStatus {
  activeEngine: DatabaseEngineType;
  isOnline: boolean;
  indexedDbReady: boolean;
  firestoreConnected: boolean;
  lastSyncTime: string;
  storageUsage: string;
}

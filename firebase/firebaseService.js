import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCoHCyEfvUjMgnCsrFZMjwZS2tivpb4V-8",
  authDomain: "magnoopus.firebaseapp.com",
  databaseURL: "https://magnoopus-default-rtdb.firebaseio.com",
  projectId: "magnoopus",
  storageBucket: "magnoopus.firebasestorage.app",
  messagingSenderId: "159965488539",
  appId: "1:159965488539:web:1d1f3c0177e4908265ed3e",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ▶️ Firestore CORRETO para React Native
const firestoreDB = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const database = getDatabase(app);
const storage = getStorage(app);

export { app, database, firestoreDB, auth, storage };

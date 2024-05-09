/**
 * All things firebase related.
 */
import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getApp } from "firebase/app";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// Must be called before getFirestore()
initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
});
const db = getFirestore();

const auth = getAuth();
setPersistence(auth, browserLocalPersistence);

// emulators
if (location.hostname === "localhost") {
  const storage = getStorage();
  const functions = getFunctions(getApp(), process.env.FIREBASE_REGION);
  connectFirestoreEmulator(
    db,
    "localhost",
    process.env.FIREBASE_EMULATOR_FIRESTORE_PORT
  );
  connectAuthEmulator(
    auth,
    `http://localhost:${process.env.FIREBASE_EMULATOR_AUTH_PORT}`
  );
  connectStorageEmulator(
    storage,
    "localhost",
    process.env.FIREBASE_EMULATOR_STORAGE_PORT
  );
  connectFunctionsEmulator(
    functions,
    "localhost",
    process.env.FIREBASE_EMULATOR_FUNCTIONS_PORT
  );
}
export { firebaseApp, db, auth };

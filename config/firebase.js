import firebase from 'firebase/app';
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

  try {
    firebase.initializeApp(firebaseConfig);
    // firebase.auth().useEmulator('http://localhost:9099');
    // firebase.firestore().useEmulator('http://localhost:8000')
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
} catch (err) {
    if (!/already exists/.test(err.message)) {
        console.error('Firebase initialization error', err)
    }
}

export default firebase;
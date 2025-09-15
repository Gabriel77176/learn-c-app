import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCPtnvIf5XBux3tCrJpcRWuK11D9yWEV24",
    authDomain: "learncapp-c6cbb.firebaseapp.com",
    projectId: "learncapp-c6cbb",
    messagingSenderId: "593016181660",
    appId: "1:593016181660:web:8aa0456521099aaa406e59",
    measurementId: "G-NGS0F61K6C"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Debug logging
console.log('Firebase initialized:', {
  app: app.name,
  auth: !!auth,
  db: !!db,
  config: {
    apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
  }
});

export default app;
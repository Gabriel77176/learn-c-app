// Temporary test file to check Firebase connection
import { auth, db } from './config.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

console.log('Firebase Auth:', auth);
console.log('Firebase DB:', db);
console.log('Firebase app config:', auth.app.options);

// Test authentication
window.testFirebaseAuth = async (email, password) => {
  try {
    console.log('Testing Firebase auth...');
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Auth test successful:', result);
    return result;
  } catch (error) {
    console.error('Auth test failed:', error);
    throw error;
  }
};

console.log('Firebase test loaded. Use window.testFirebaseAuth(email, password) to test authentication.');

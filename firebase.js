// Firebase initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import bcrypt from 'bcryptjs';

const firebaseConfig = {
  apiKey: "AIzaSyAdGIYiTkyYN6QTGMqJ_YVMI8ZF6HembjA",
  authDomain: "induspack-reportaje.firebaseapp.com",
  projectId: "induspack-reportaje",
  storageBucket: "induspack-reportaje.firebasestorage.app",
  messagingSenderId: "364943680120",
  appId: "1:364943680120:web:96929c789d6b70b6e2c38d",
  measurementId: "G-31SVVC2PDS"
};

// Initialize Firebase
let app;
let auth;
let db;
let rdb;

try {
  app = initializeApp(firebaseConfig);
  console.log('\u2705 Firebase app initialized successfully');
  
  auth = getAuth(app);
  console.log('\u2705 Firebase Auth initialized');

  // bcryptjs fallback for environments without WebCrypto / crypto module (React Native)
  try {
    bcrypt.setRandomFallback(function(len) {
      const arr = new Array(len);
      for (let i = 0; i < len; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    });
    console.log('\u2705 bcrypt fallback set');
  } catch (e) {
    console.warn('Could not set bcrypt fallback:', e);
  }
  
    db = getFirestore(app);
    console.log('\u2705 Firestore initialized');

    rdb = getDatabase(app);
    console.log('\u2705 Realtime Database initialized');
} catch (error) {
  console.error('\u274c Error initializing Firebase:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message
  });
}

export { app, auth, db, rdb };

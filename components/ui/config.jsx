// components/ui/config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJcEoffutlliV2PaKNQlVwYOiO-K7Czk4",
  authDomain: "dbnuptiae.firebaseapp.com",
  projectId: "dbnuptiae",
  storageBucket: "dbnuptiae.firebasestorage.app",
  messagingSenderId: "264172579650",
  appId: "1:264172579650:web:b7579c3b3e2622253876db",
  measurementId: "G-SXF3086Y1C"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta DB correctamente
export const db = getDatabase(app);

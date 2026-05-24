import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Añade esta línea para la autenticación
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYsf6tFbODMiQqK5gPiONXuylqNlwRG0w",
  authDomain: "gestioneventos-e93bd.firebaseapp.com",
  projectId: "gestioneventos-e93bd",
  storageBucket: "gestioneventos-e93bd.firebasestorage.app",
  messagingSenderId: "294546223563",
  appId: "1:294546223563:web:15e1dd0594124fd24b864e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exporta el servicio de autenticación
export const db = getFirestore(app);
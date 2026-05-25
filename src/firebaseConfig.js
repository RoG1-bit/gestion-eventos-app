import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCot0Ph2Q7KCnkg_kfHtmPPwsdk6NNt0Qo",
  authDomain: "gestion-eventos-58c66.firebaseapp.com",
  projectId: "gestion-eventos-58c66",
  storageBucket: "gestion-eventos-58c66.firebasestorage.app",
  messagingSenderId: "657840040251",
  appId: "1:657840040251:web:6622261b0b8a42a92def1e",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Añade esta línea para la autenticación

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCot0Ph2Q7KCnkg_kfHtmPPwsdk6NNt0Qo", // (Tus llaves reales estarán aquí)
  authDomain: "gestion-eventos-58c66.firebaseapp.com",
  projectId: "gestion-eventos-58c66",
  storageBucket: "gestion-eventos-58c66.firebasestorage.app",
  messagingSenderId: "657840040251",
  appId: "1:657840040251:web:...",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exporta el servicio de autenticación

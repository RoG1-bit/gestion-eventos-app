import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function RegisterScreen() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      if (typeof window !== "undefined") {
        window.alert("Por favor completa todos los campos.");
      } else {
        Alert.alert("Aviso", "Por favor completa todos los campos.");
      }
      return;
    }
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Guardar datos en la base de datos Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre: nombre,
        email: email,
        fechaRegistro: new Date().toISOString(),
      });

      if (typeof window !== "undefined") {
        window.alert("¡Éxito! Cuenta creada de forma correcta.");
      } else {
        Alert.alert("¡Éxito!", "Cuenta creada de forma correcta.");
      }
      router.replace("/eventos-lista" as any);
    } catch (error: any) {
      if (typeof window !== "undefined") {
        window.alert(
          "Error: No se pudo crear la cuenta o el correo ya existe.",
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo crear la cuenta o el correo ya existe.",
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        placeholderTextColor="#888"
        value={nombre}
        onChangeText={setNombre}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Correo Electrónico"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>← Volver al Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#1E1E1E",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#FFFFFF",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: "#FFF",
    backgroundColor: "#2A2A2A",
  },
  button: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  linkText: { marginTop: 10, color: "#4DA8DA", textAlign: "center" },
});

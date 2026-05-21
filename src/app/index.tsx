import { useRouter } from 'expo-router';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Proveedor de Google
  const googleProvider = new GoogleAuthProvider();

  // Función para Login con Correo (La que ya tenías)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Aviso", "Por favor ingresa tu correo y contraseña.");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("¡Inicio de sesión exitoso!", userCredential.user.email);
      Alert.alert("¡Éxito!", "Has iniciado sesión correctamente.");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error.message);
      Alert.alert("Error", "Credenciales incorrectas o el usuario no existe.");
    }
  };

  // NUEVA: Función para Login con Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("¡Login con Google exitoso!", result.user.displayName);
      Alert.alert("¡Éxito!", `Bienvenido ${result.user.displayName}`);
    } catch (error: any) {
      console.error("Error con Google:", error.message);
      Alert.alert("Error", "No se pudo iniciar sesión con Google.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos Comunitarios</Text>
      
      <TextInput 
        style={styles.input} 
        placeholder="Correo Electrónico" 
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Contraseña" 
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* NUEVO BOTÓN DE GOOGLE */}
      <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={handleGoogleLogin}>
        <Text style={styles.googleButtonText}>Iniciar Sesión con Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#1E1E1E' }, // Fondo oscuro como tu captura
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#FFFFFF' }, // Texto blanco
  input: { borderWidth: 1, borderColor: '#555', padding: 15, borderRadius: 8, marginBottom: 15, color: '#FFF' },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  googleButton: { backgroundColor: '#DB4437' }, // Color rojo de Google
  googleButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { marginTop: 10, color: '#4DA8DA', textAlign: 'center' }
});
import { useRouter } from 'expo-router';
import { GoogleAuthProvider } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Proveedor de Google
  const googleProvider = new GoogleAuthProvider();

  // Función para Login con Correo (Modificada con Bypass temporal)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Aviso", "Por favor ingresa tu correo y contraseña.");
      return;
    }

    // ========================================================
    // 🚀 BYPASS TEMPORAL DE DESARROLLO
    // Nos saltamos el Firebase bloqueado para entrar al flujo real
    // ========================================================
    router.replace('/explore');
    return; 
  };

  // Función para Login con Google
  const handleGoogleLogin = async () => {
    // También le ponemos bypass a Google para que te deje pasar si le das clic
    router.replace('/explore');
    return;

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventos Comunitarios</Text>
      
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
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* BOTÓN DE GOOGLE */}
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
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#1E1E1E' }, 
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#FFFFFF' }, 
  input: { borderWidth: 1, borderColor: '#555', padding: 15, borderRadius: 8, marginBottom: 15, color: '#FFF', backgroundColor: '#2A2A2A' },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  googleButton: { backgroundColor: '#DB4437' }, 
  googleButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { marginTop: 10, color: '#4DA8DA', textAlign: 'center' }
});
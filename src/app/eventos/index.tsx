import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EventosAdminScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administración</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/eventos/FormularioEvento")}
      >
        <Text style={styles.buttonText}>+ Crear Nuevo Evento</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonVolver}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>← Volver a la lista</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    justifyContent: "center",
    padding: 20,
  },
  title: { fontSize: 24, color: "#FFF", textAlign: "center", marginBottom: 30 },
  button: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  buttonVolver: {
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontWeight: "bold" },
});

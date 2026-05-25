import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";
import { useNotifications } from "../../hooks/use-notifications";

export default function FormularioEventoScreen() {
  // Obtenemos el id si se pasó como parámetro (Modo Edición)
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const { notifyEventChange } = useNotifications();

  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchEvento = async () => {
        try {
          const docRef = doc(db, "eventos", id as string);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setNombre(data.nombre || data.titulo || "");
            setFecha(data.fecha || "");
            setHora(data.hora || "");
            setUbicacion(data.ubicacion || data.lugar || "");
            setDescripcion(data.descripcion || "");
          } else {
            Alert.alert("Error", "El evento no existe.");
            router.back();
          }
        } catch (error) {
          Alert.alert("Error", "No se pudo cargar el evento.");
        } finally {
          setLoading(false);
        }
      };
      fetchEvento();
    }
  }, [id]);

  const handleSave = async () => {
    if (!nombre.trim() || !fecha.trim() || !descripcion.trim()) {
      if (typeof window !== "undefined") {
        window.alert("Por favor llena todos los campos.");
      } else {
        Alert.alert("Advertencia", "Por favor llena todos los campos.");
      }
      return;
    }

    setSaving(true);

    // Timeout para abortar si Firebase no responde en 5 segundos
    const abortTimeout = setTimeout(() => {
      setSaving(false);
      if (typeof window !== "undefined") {
        window.alert(
          "Firebase tardó demasiado. Revisa si configuraste Firestore en la consola, o tus reglas de Firebase.",
        );
      } else {
        Alert.alert("Error de Red", "Firebase no respondió a tiempo.");
      }
    }, 5000);

    try {
      const eventoData = { nombre, fecha, hora, ubicacion, descripcion };

      if (isEditing && typeof id === "string" && id !== "undefined") {
        await updateDoc(doc(db, "eventos", id), eventoData);
        notifyEventChange(nombre, "El evento ha sido modificado.");
      } else {
        await addDoc(collection(db, "eventos"), eventoData);
        notifyEventChange(nombre, "¡Nuevo evento creado!");
      }

      clearTimeout(abortTimeout);
      // Volver explícitamente a la lista
      router.replace("/eventos-lista");
    } catch (error: any) {
      clearTimeout(abortTimeout);
      if (typeof window !== "undefined") {
        window.alert("Hubo un problema: " + error?.message);
      } else {
        Alert.alert("Error", "Problema al guardar: " + error?.message);
      }
      console.error(error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Editar Evento" : "Crear Evento"}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre del evento</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Cumpleaños Juan"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha (día/mes/año)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 24/05/2026"
          value={fecha}
          onChangeText={setFecha}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 14:00"
          value={hora}
          onChangeText={setHora}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          placeholder="Lugar del evento..."
          value={ubicacion}
          onChangeText={setUbicacion}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detalles importantes..."
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {isEditing ? "Guardar Cambios" : "Crear Evento"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.cancelButton]}
        onPress={() => router.replace("/eventos-lista")}
        disabled={saving}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: "#f4f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, color: "#333" },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#555" },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  textArea: { height: 110, textAlignVertical: "top" },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#dc3545",
    marginTop: 15,
  },
  cancelButtonText: { color: "#dc3545", fontSize: 18, fontWeight: "bold" },
});

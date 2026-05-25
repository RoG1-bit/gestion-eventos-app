import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { db } from "../../firebaseConfig";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
};

export default function HistorialScreen() {
  const [eventosPasados, setEventosPasados] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = useCallback(async () => {
    try {
      const q = query(collection(db, "eventos"), orderBy("fecha", "desc"));
      const snap = await getDocs(q);
      
      const hoy = new Date().toISOString().split("T")[0]; // Fecha actual YYYY-MM-DD
      
      const lista: Evento[] = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Evento))
        .filter((evento) => evento.fecha < hoy); // Filtramos solo los que ya pasaron

      setEventosPasados(lista);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial();
  }, [cargarHistorial]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.texto}>Cargando tu historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Historial de Asistencia</Text>
      </View>

      {eventosPasados.length === 0 ? (
        <View style={styles.centrado}>
          <Text style={styles.texto}>No has asistido a eventos pasados aún.</Text>
        </View>
      ) : (
        <FlatList
          data={eventosPasados}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaPadding}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.eventoTitulo}>{item.titulo}</Text>
              <Text style={styles.eventoMeta}>📅 Realizado el: {item.fecha}</Text>
              <Text style={styles.eventoMeta}>📍 {item.lugar}</Text>
              <Text style={styles.eventoStatus}>✅ Asistido</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#1E1E1E" },
  centrado: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  header: { padding: 16, backgroundColor: "#2A2A2A", borderBottomWidth: 1, borderBottomColor: "#333" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  listaPadding: { padding: 16, paddingBottom: 40 },
  tarjeta: { backgroundColor: "#2A2A2A", borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#333", opacity: 0.8 },
  eventoTitulo: { fontSize: 17, fontWeight: "bold", color: "#FFF", marginBottom: 8 },
  eventoMeta: { fontSize: 13, color: "#B0B4BA", marginBottom: 4 },
  eventoStatus: { fontSize: 13, color: "#28A745", fontWeight: "bold", marginTop: 8 },
  texto: { color: "#888", fontSize: 16, textAlign: "center" },
});
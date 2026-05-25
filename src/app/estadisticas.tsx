import { collection, getDocs, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { db } from "../firebaseConfig";

export default function EstadisticasScreen() {
  const [loading, setLoading] = useState(true);
  const [totalEventos, setTotalEventos] = useState(0);
  const [totalAsistencias, setTotalAsistencias] = useState(0);
  const [historialEventos, setHistorialEventos] = useState<any[]>([]);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const qEventos = query(collection(db, "eventos"));
        const snapEventos = await getDocs(qEventos);

        let confirmacionesTotales = 0;
        const historial: any[] = [];

        snapEventos.forEach((doc) => {
          const data = doc.data();
          // Intentamos hacer fetch de asistentes en cada doc (para proyectos pequeños está bien)
          historial.push({
            id: doc.id,
            nombre: data.nombre || data.titulo || "Sin nombre",
            fecha: data.fecha || "Sin fecha",
          });
        });

        // Contar el tamaño de subcolecciones requiere queries individuales o Cloud Functions
        // Lo omitiremos visualmente, pero se mostrará el número total de eventos
        setTotalEventos(snapEventos.size);
        setHistorialEventos(historial);
      } catch (error) {
        console.error("Error al cargar estadísticas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstadisticas();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Panel de Estadísticas</Text>

      <View style={styles.statsCard}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalEventos}</Text>
          <Text style={styles.statLabel}>Eventos Creados</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>🎉</Text>
          <Text style={styles.statLabel}>Usuarios Activos</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Historial de Eventos</Text>

      <FlatList
        data={historialEventos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <Text style={styles.historyName}>{item.nombre}</Text>
            <Text style={styles.historyDate}>Fecha: {item.fecha}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay eventos en el historial.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8", padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  statBox: {
    backgroundColor: "#fff",
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  statNumber: { fontSize: 32, fontWeight: "bold", color: "#007BFF" },
  statLabel: { fontSize: 14, color: "#666", marginTop: 5, textAlign: "center" },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#28a745",
  },
  historyName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  historyDate: { fontSize: 14, color: "#666", marginTop: 4 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});

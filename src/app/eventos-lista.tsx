import { router } from "expo-router";
import { signOut } from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";

export default function EventosListaScreen() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de seguridad en caso de que Firebase demore mucho
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Lectura en tiempo real (Listener) quitamos orderBy por si causa problemas de índice
    const q = query(collection(db, "eventos"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(fallbackTimer);
        const eventosData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEventos(eventosData);
        setLoading(false);
      },
      (error) => {
        clearTimeout(fallbackTimer);
        console.error("Error en onSnapshot de Firestore:", error);
        Alert.alert("Error", "No se pudieron cargar los eventos.");
        setLoading(false);
      },
    );
    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  const eliminarEvento = (id: string) => {
    Alert.alert("Confirmar", "¿Eliminar este evento de forma permanente?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "eventos", id));
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar el evento.");
          }
        },
      },
    ]);
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
      <View style={styles.header}>
        <Text style={styles.title}>Mis Eventos</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/explore")}
            style={[
              styles.logoutButton,
              { backgroundColor: "#17a2b8", marginRight: 10 },
            ]}
          >
            <Text style={styles.logoutText}>📊 Historial</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardInfo}>
              <Text style={styles.eventName}>{item.nombre || item.titulo}</Text>
              <Text style={styles.eventDate}>
                📅 {item.fecha} {item.hora ? `⏰ ${item.hora}` : ""}
              </Text>
              <Text style={styles.eventDate}>
                📍 {item.ubicacion || item.lugar || "Ubicación pendiente"}
              </Text>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnView]}
                onPress={() =>
                  router.push({
                    pathname: "/eventos/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.btnText}>Ver Detalles</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnEdit]}
                onPress={() =>
                  router.push({
                    pathname: "/eventos",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.btnText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnDelete]}
                onPress={() => eliminarEvento(item.id)}
              >
                <Text style={styles.btnText}>Borrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay eventos creados todavía.
            </Text>
          </View>
        }
      />

      {/* Flotante para ir a 'Crear Evento' */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/eventos/FormularioEvento")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerRight: {
    flexDirection: "row",
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#dc3545",
    borderRadius: 8,
  },
  logoutText: { color: "#fff", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardInfo: { marginBottom: 10 },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#222",
  },
  eventDate: {
    fontSize: 14,
    color: "#007BFF",
    marginBottom: 5,
    fontWeight: "500",
  },
  eventDesc: { fontSize: 14, color: "#666" },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  btnView: { backgroundColor: "#007BFF" },
  btnEdit: { backgroundColor: "#ffc107" },
  btnDelete: { backgroundColor: "#dc3545" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#28a745",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, color: "#999", fontStyle: "italic" },
});

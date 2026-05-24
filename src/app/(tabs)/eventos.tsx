import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../firebaseConfig";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
};

export default function EventosScreen() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarEventos = useCallback(async () => {
    try {
      console.log('Iniciando carga de eventos...');
      const q = query(collection(db, "eventos"), orderBy("fecha", "asc"));
      const snap = await getDocs(q);
      console.log('Eventos obtenidos:', snap.docs.length);
      const lista: Evento[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Evento[];
      console.log('Lista procesada:', lista);
      setEventos(lista);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      setEventos([]);
    }
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      setCargando(true);
      await cargarEventos();
      setCargando(false);
    };
    inicializar();
  }, [cargarEventos]);

  const onRefrescar = async () => {
    setRefrescando(true);
    await cargarEventos();
    setRefrescando(false);
  };

  const esPasado = (fechaStr: string) => new Date(fechaStr) < new Date();

  const renderItem = ({ item }: { item: Evento }) => {
    const pasado = esPasado(item.fecha);
    return (
      <TouchableOpacity
        style={[styles.tarjeta, pasado && styles.tarjetaPasada]}
        onPress={() =>
          router.push({ pathname: "/evento-detalle", params: { id: item.id } })
        }
        activeOpacity={0.8}
      >
        <View style={styles.tarjetaEncabezado}>
          <Text style={styles.tarjetaTitulo} numberOfLines={2}>
            {item.titulo}
          </Text>
          {pasado ? (
            <View style={styles.badgePasado}>
              <Text style={styles.badgeTexto}>Finalizado</Text>
            </View>
          ) : (
            <View style={styles.badgeProximo}>
              <Text style={styles.badgeTexto}>Próximo</Text>
            </View>
          )}
        </View>

        <Text style={styles.tarjetaMeta}>
          📅{" "}
          {new Date(item.fecha).toLocaleDateString("es-ES", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.tarjetaMeta}>📍 {item.lugar}</Text>

        {item.descripcion ? (
          <Text style={styles.tarjetaDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        ) : null}

        <Text style={styles.verDetalle}>Ver detalles →</Text>
      </TouchableOpacity>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.cargandoTexto}>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.encabezado}>Eventos Comunitarios</Text>
      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefrescar}
            tintColor="#007BFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.centrado}>
            <Text style={styles.sinEventos}>No hay eventos disponibles.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#1E1E1E" },
  encabezado: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  lista: { paddingHorizontal: 16, paddingBottom: 32 },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  cargandoTexto: { color: "#FFF", marginTop: 12, fontSize: 16 },
  sinEventos: { color: "#888", fontSize: 16, textAlign: "center" },
  tarjeta: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  tarjetaPasada: { borderColor: "#444", opacity: 0.8 },
  tarjetaEncabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tarjetaTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
    marginRight: 8,
  },
  tarjetaMeta: { fontSize: 13, color: "#B0B4BA", marginBottom: 3 },
  tarjetaDescripcion: { fontSize: 13, color: "#999", marginTop: 6 },
  verDetalle: {
    color: "#4DA8DA",
    fontSize: 13,
    marginTop: 10,
    fontWeight: "600",
  },
  badgePasado: {
    backgroundColor: "#555",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeProximo: {
    backgroundColor: "#28A745",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTexto: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
});

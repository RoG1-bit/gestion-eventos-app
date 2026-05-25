import { useLocalSearchParams, useRouter } from "expo-router";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { useNotifications } from "../hooks/use-notifications";

type Evento = {
  id: string;
  nombre?: string;
  titulo?: string;
  descripcion?: string;
  fecha?: string;
  hora?: string;
  ubicacion?: string;
  lugar?: string;
};

type Comentario = {
  id: string;
  texto: string;
  usuarioId: string;
  fecha: string;
  rating: number; // 0-5
};

export default function EventoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { notifyRsvpConfirmed } = useNotifications();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [rating, setRating] = useState(0);
  const [yaConfirmo, setYaConfirmo] = useState(false);
  const [cargandoAsistencia, setCargandoAsistencia] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    // Cargar Evento
    const cargarDetalle = async () => {
      try {
        const docRef = doc(db, "eventos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvento({ id: docSnap.id, ...docSnap.data() } as Evento);
        } else {
          Alert.alert("Error", "Evento no encontrado");
          router.back();
        }
      } catch (error) {
        console.error("Error al cargar:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarDetalle();

    // Listener para Comentarios
    const q = query(
      collection(db, `eventos/${id}/comentarios`),
      orderBy("fecha", "desc"),
    );
    const unsubComentarios = onSnapshot(q, (snap) => {
      setComentarios(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Comentario),
      );
    });

    // Validar si el usuario ya asiste
    const currentUser = auth.currentUser;
    if (currentUser) {
      const assistRef = doc(db, `eventos/${id}/asistentes/${currentUser.uid}`);
      getDoc(assistRef).then((snap) => {
        if (snap.exists()) setYaConfirmo(true);
      });
    }

    return () => unsubComentarios();
  }, [id]);

  const confirmarAsistencia = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return Alert.alert("Error", "Debes iniciar sesión");

    setCargandoAsistencia(true);
    try {
      const assistRef = doc(
        db,
        `eventos/${id as string}/asistentes/${currentUser.uid}`,
      );
      if (yaConfirmo) {
        await deleteDoc(assistRef);
        setYaConfirmo(false);
        Alert.alert("Cancelado", "Has cancelado tu asistencia.");
      } else {
        await updateDoc(doc(db, "eventos", id as string), {
          timestamp: new Date(),
        }).catch(() => {});
        const { setDoc } = require("firebase/firestore");
        await setDoc(assistRef, {
          email: currentUser.email,
          fechaConfirmacion: new Date().toISOString(),
        });
        setYaConfirmo(true);
        notifyRsvpConfirmed(evento?.nombre || evento?.titulo || "Evento");
        Alert.alert(
          "Confirmado",
          "¡Genial! Has confirmado tu asistencia y se te enviarán notificaciones.",
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo cambiar el estado de asistencia");
    } finally {
      setCargandoAsistencia(false);
    }
  };

  const compartirEvento = async () => {
    if (!evento) return;
    try {
      await Share.share({
        message: `¡Únete al evento "${evento.nombre || evento.titulo}"! 📅 Fecha: ${evento.fecha} ⏰ Hora: ${evento.hora || "No especificada"} 📍 Ubicación: ${evento.ubicacion || evento.lugar}. ¡Confirma tu asistencia en la app Eventos Comunitarios!`,
      });
    } catch (error) {
      console.error("Error al compartir", error);
    }
  };

  const agregarComentario = async () => {
    if (!nuevoComentario.trim())
      return Alert.alert("Advertencia", "Escribe un comentario vacio.");
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      await addDoc(collection(db, `eventos/${id as string}/comentarios`), {
        texto: nuevoComentario,
        usuarioId: currentUser.email,
        rating: rating,
        fecha: new Date().toISOString(),
      });
      setNuevoComentario("");
      setRating(0);
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el comentario");
    }
  };

  const renderStars = (
    currentRating: number,
    setInteractive: boolean = false,
  ) => {
    return (
      <View style={{ flexDirection: "row", paddingVertical: 5 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => (setInteractive ? setRating(i) : null)}
            disabled={!setInteractive}
          >
            <Text
              style={{
                fontSize: 24,
                color:
                  i <= (setInteractive ? rating : currentRating)
                    ? "#FFD700"
                    : "#CCCCCC",
              }}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!evento) return <Text style={{ margin: 20 }}>Evento no encontrado.</Text>;

  return (
    <FlatList
      style={styles.container}
      data={comentarios}
      ListHeaderComponent={
        <View style={styles.headerComponent}>
          <Text style={styles.title}>{evento.nombre || evento.titulo}</Text>
          <Text style={styles.sub}>
            📅 {evento.fecha} {evento.hora ? `⏰ ${evento.hora}` : ""}
          </Text>
          <Text style={styles.sub}>
            📍 {evento.ubicacion || evento.lugar || "Ubicación no especificada"}
          </Text>
          <Text style={styles.desc}>{evento.descripcion}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.rsvpBtn, yaConfirmo && styles.rsvpBtnTrue]}
              onPress={confirmarAsistencia}
              disabled={cargandoAsistencia}
            >
              <Text style={styles.btnText}>
                {cargandoAsistencia
                  ? "Cargando..."
                  : yaConfirmo
                    ? "✅ Asistiré"
                    : "🙋Confirmar Asistencia"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={compartirEvento}>
              <Text style={styles.btnText}>🔗 Compartir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>Comentarios y Calificación</Text>
            {renderStars(0, true)}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputBody}
                placeholder="¿Qué te pareció el evento?"
                value={nuevoComentario}
                onChangeText={setNuevoComentario}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={agregarComentario}
              >
                <Text style={styles.btnText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      }
      keyExtractor={(item, index) => item.id || String(index)}
      renderItem={({ item }) => (
        <View style={styles.commentCard}>
          <View style={styles.commentRow}>
            <Text style={styles.commentUser}>
              {item.usuarioId?.split("@")[0]}
            </Text>
            {renderStars(item.rating, false)}
          </View>
          <Text style={styles.commentText}>{item.texto}</Text>
        </View>
      )}
      ListEmptyComponent={
        <Text
          style={{ textAlign: "center", color: "#999", marginVertical: 20 }}
        >
          Aún no hay calificaciones.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerComponent: { padding: 20, backgroundColor: "#fff", marginBottom: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 10 },
  sub: { fontSize: 16, color: "#007BFF", marginBottom: 5, fontWeight: "500" },
  desc: {
    fontSize: 16,
    color: "#555",
    marginTop: 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 30 },
  rsvpBtn: {
    flex: 1,
    backgroundColor: "#6c757d",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  rsvpBtnTrue: { backgroundColor: "#28a745" },
  shareBtn: {
    flex: 1,
    backgroundColor: "#17a2b8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  commentSection: { borderTopWidth: 1, borderColor: "#eee", paddingTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  inputRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  inputBody: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendBtn: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  commentCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
  },
  commentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  commentUser: { fontWeight: "bold", color: "#333" },
  commentText: { color: "#555" },
});
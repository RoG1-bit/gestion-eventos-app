import { useRouter } from "expo-router";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  hora?: string;
};

type Vista = "lista" | "crear" | "detalle" | "editar";

export default function EventosScreen() {
  const router = useRouter();
  const [vista, setVista] = useState<Vista>("lista");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);

  // Formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [lugar, setLugar] = useState("");
  const [guardando, setGuardando] = useState(false);

  const cargarEventos = useCallback(async () => {
    try {
      const q = query(collection(db, "eventos"), orderBy("fecha", "asc"));
      const snap = await getDocs(q);
      const lista: Evento[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Evento[];

      if (lista.length === 0) {
        const eventosPrueba: Evento[] = [
          {
            id: "1",
            titulo: "Concierto Comunitario",
            fecha: "2026-06-15",
            hora: "18:00",
            lugar: "Parque Central",
            descripcion: "Música en vivo para toda la familia. Trae tu silla y comparte.",
          },
          {
            id: "2",
            titulo: "Feria de Emprendedores",
            fecha: "2026-06-20",
            hora: "09:00",
            lugar: "Plaza Municipal",
            descripcion: "Apoya al comercio local. Encontrarás comida, artesanías y más.",
          },
        ];
        setEventos(eventosPrueba);
      } else {
        setEventos(lista);
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  const limpiarFormulario = () => {
    setTitulo("");
    setDescripcion("");
    setFecha("");
    setHora("");
    setLugar("");
  };

  const handleCrear = async () => {
    if (!titulo || !descripcion || !fecha || !lugar) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setGuardando(true);
    try {
      await addDoc(collection(db, "eventos"), {
        titulo,
        descripcion,
        fecha,
        hora: hora || "00:00",
        lugar,
      });
      Alert.alert("Éxito", "Evento creado correctamente");
      limpiarFormulario();
      await cargarEventos();
      setVista("lista");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el evento");
    } finally {
      setGuardando(false);
    }
  };

  const handleEditar = async () => {
    if (!eventoSeleccionado || !titulo || !descripcion || !fecha || !lugar) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setGuardando(true);
    try {
      await updateDoc(doc(db, "eventos", eventoSeleccionado.id), {
        titulo,
        descripcion,
        fecha,
        hora: hora || "00:00",
        lugar,
      });
      Alert.alert("Éxito", "Evento actualizado correctamente");
      limpiarFormulario();
      await cargarEventos();
      setVista("lista");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el evento");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = () => {
    if (!eventoSeleccionado) return;

    Alert.alert("Confirmar", `¿Deseas eliminar "${eventoSeleccionado.titulo}"?`, [
      { text: "Cancelar", onPress: () => {} },
      {
        text: "Eliminar",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "eventos", eventoSeleccionado.id));
            Alert.alert("Éxito", "Evento eliminado correctamente");
            await cargarEventos();
            setVista("lista");
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar el evento");
          }
        },
      },
    ]);
  };

  const goToList = () => {
    setVista("lista");
    setEventoSeleccionado(null);
    limpiarFormulario();
  };

  const goToCreate = () => {
    limpiarFormulario();
    setVista("crear");
  };

  const goToDetail = (evento: Evento) => {
    setEventoSeleccionado(evento);
    setVista("detalle");
  };

  const goToEdit = () => {
    if (!eventoSeleccionado) return;
    setTitulo(eventoSeleccionado.titulo);
    setDescripcion(eventoSeleccionado.descripcion);
    setFecha(eventoSeleccionado.fecha);
    setHora(eventoSeleccionado.hora || "");
    setLugar(eventoSeleccionado.lugar);
    setVista("editar");
  };

  const renderContent = () => {
    // VISTA: CARGANDO
    if (cargando) {
      return (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.texto}>Cargando eventos...</Text>
        </View>
      );
    }

    // VISTA: LISTA
    if (vista === "lista") {
      return (
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.titulo}>Eventos Comunitarios</Text>
            <TouchableOpacity
              style={styles.btnCrear}
              onPress={goToCreate}
            >
              <Text style={styles.btnTexto}>+ Crear</Text>
            </TouchableOpacity>
          </View>

          {eventos.length === 0 ? (
            <View style={styles.centrado}>
              <Text style={styles.texto}>No hay eventos disponibles</Text>
            </View>
          ) : (
            <FlatList
              data={eventos}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.tarjeta}
                  onPress={() => goToDetail(item)}
                >
                  <Text style={styles.eventoTitulo}>{item.titulo}</Text>
                  <Text style={styles.eventoMeta}>📅 {item.fecha}</Text>
                  <Text style={styles.eventoMeta}>⏰ {item.hora || "N/A"}</Text>
                  <Text style={styles.eventoMeta}>📍 {item.lugar}</Text>
                  <Text style={styles.eventoDesc} numberOfLines={2}>
                    {item.descripcion}
                  </Text>
                  <Text style={styles.verDetalles}>Ver detalles →</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listaPadding}
            />
          )}
        </View>
      );
    }

    // VISTA: DETALLE
    if (vista === "detalle" && eventoSeleccionado) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.btnVolver}
            onPress={goToList}
          >
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>

          <View style={styles.detalleContainer}>
            <Text style={styles.detalleTitle}>{eventoSeleccionado.titulo}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.metaTexto}>
                📅 Fecha: {eventoSeleccionado.fecha}
              </Text>
              <Text style={styles.metaTexto}>
                ⏰ Hora: {eventoSeleccionado.hora || "N/A"}
              </Text>
              <Text style={styles.metaTexto}>
                📍 Lugar: {eventoSeleccionado.lugar}
              </Text>
            </View>

            <Text style={styles.labelDesc}>Descripción:</Text>
            <Text style={styles.descripcionTexto}>
              {eventoSeleccionado.descripcion}
            </Text>

            <View style={styles.accionesRow}>
              <TouchableOpacity
                style={[styles.boton, styles.botonEditar]}
                onPress={goToEdit}
              >
                <Text style={styles.botonTexto}>✏️ Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.boton, styles.botonEliminar]}
                onPress={handleEliminar}
              >
                <Text style={styles.botonTexto}>🗑️ Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      );
    }

    // VISTA: CREAR/EDITAR
    if (vista === "crear" || vista === "editar") {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            style={styles.btnVolver}
            onPress={goToList}
          >
            <Text style={styles.btnVolverTexto}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.formTitulo}>
            {vista === "crear" ? "Crear Nuevo Evento" : "Editar Evento"}
          </Text>

          <View style={styles.formulario}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Concierto..."
              placeholderTextColor="#888"
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Detalles del evento..."
              placeholderTextColor="#888"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
            />

            <View style={styles.rowInputs}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Fecha *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-06-15"
                  placeholderTextColor="#888"
                  value={fecha}
                  onChangeText={setFecha}
                />
              </View>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Hora</Text>
                <TextInput
                  style={styles.input}
                  placeholder="18:00"
                  placeholderTextColor="#888"
                  value={hora}
                  onChangeText={setHora}
                />
              </View>
            </View>

            <Text style={styles.label}>Lugar *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Parque Central..."
              placeholderTextColor="#888"
              value={lugar}
              onChangeText={setLugar}
            />

            <TouchableOpacity
              style={[
                styles.boton,
                styles.botonGuardar,
                guardando && { opacity: 0.6 },
              ]}
              onPress={vista === "crear" ? handleCrear : handleEditar}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.botonTexto}>
                  {vista === "crear" ? "✅ Crear" : "✅ Guardar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return null;
  };

  return (
    <View style={styles.contenedor}>{renderContent()}</View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#1E1E1E" },
  scrollView: { flex: 1, backgroundColor: "#1E1E1E" },
  scrollContent: { padding: 16, paddingBottom: 40 },
  centrado: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#2A2A2A",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  btnCrear: {
    backgroundColor: "#28A745",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  listaPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  tarjeta: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#333",
  },
  eventoTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  eventoMeta: {
    fontSize: 13,
    color: "#B0B4BA",
    marginBottom: 2,
  },
  eventoDesc: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
  },
  verDetalles: {
    color: "#4DA8DA",
    fontSize: 12,
    marginTop: 10,
    fontWeight: "600",
  },
  btnVolver: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  btnVolverTexto: {
    color: "#4DA8DA",
    fontWeight: "600",
    fontSize: 15,
  },
  detalleContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  detalleTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  metaInfo: {
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  metaTexto: {
    fontSize: 14,
    color: "#B0B4BA",
    marginBottom: 6,
  },
  labelDesc: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  descripcionTexto: {
    fontSize: 14,
    color: "#DDD",
    lineHeight: 20,
    backgroundColor: "#1E1E1E",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  accionesRow: {
    flexDirection: "row",
    gap: 10,
  },
  boton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  botonEditar: {
    backgroundColor: "#FFC107",
  },
  botonEliminar: {
    backgroundColor: "#DC3545",
  },
  botonGuardar: {
    backgroundColor: "#28A745",
    marginTop: 16,
  },
  botonTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  formTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  formulario: {
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    color: "#FFF",
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  texto: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
  },
});

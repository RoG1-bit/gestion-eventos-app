import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { useNotifications } from '../../hooks/use-notifications';

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  organizador?: string;
};

type Comentario = {
  id: string;
  texto: string;
  autorNombre: string;
  autorId: string;
  fecha: any;
};

export default function EventoDetalleScreen() {
  const { id: eventoId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { scheduleEventReminder, notifyRsvpConfirmed } = useNotifications();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);

  // RSVP
  const [rsvpConfirmado, setRsvpConfirmado] = useState(false);
  const [totalAsistentes, setTotalAsistentes] = useState(0);
  const [cargandoRsvp, setCargandoRsvp] = useState(false);

  // Comentarios
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  // Calificación
  const [miCalificacion, setMiCalificacion] = useState(0);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);
  const [totalCalificaciones, setTotalCalificaciones] = useState(0);
  const [guardandoCalificacion, setGuardandoCalificacion] = useState(false);

  const usuario = auth.currentUser;
  const eventoYaPaso = evento ? new Date(evento.fecha) < new Date() : false;

  // ── Carga de datos ──────────────────────────────────────────────────────────

  const cargarEvento = useCallback(async () => {
    if (!eventoId) return;
    try {
      const docRef = doc(db, 'eventos', eventoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEvento({ id: docSnap.id, ...docSnap.data() } as Evento);
      }
    } catch (error) {
      console.error('Error cargando evento:', error);
    }
  }, [eventoId]);

  const cargarRsvp = useCallback(async () => {
    if (!eventoId) return;
    try {
      const asistentesSnap = await getDocs(
        collection(db, 'eventos', eventoId, 'asistentes')
      );
      setTotalAsistentes(asistentesSnap.size);

      if (usuario) {
        const miRsvpRef = doc(db, 'eventos', eventoId, 'asistentes', usuario.uid);
        const miRsvpSnap = await getDoc(miRsvpRef);
        setRsvpConfirmado(miRsvpSnap.exists());
      }
    } catch (error) {
      console.error('Error cargando RSVP:', error);
    }
  }, [eventoId, usuario]);

  const cargarComentarios = useCallback(async () => {
    if (!eventoId) return;
    try {
      const q = query(
        collection(db, 'eventos', eventoId, 'comentarios'),
        orderBy('fecha', 'desc')
      );
      const snap = await getDocs(q);
      const lista: Comentario[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Comentario[];
      setComentarios(lista);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  }, [eventoId]);

  const cargarCalificaciones = useCallback(async () => {
    if (!eventoId) return;
    try {
      const snap = await getDocs(
        collection(db, 'eventos', eventoId, 'calificaciones')
      );
      if (snap.empty) return;

      let suma = 0;
      snap.docs.forEach((d) => { suma += (d.data().valor as number) || 0; });
      setPromedioCalificacion(Math.round((suma / snap.size) * 10) / 10);
      setTotalCalificaciones(snap.size);

      if (usuario) {
        const miCalRef = doc(db, 'eventos', eventoId, 'calificaciones', usuario.uid);
        const miCalSnap = await getDoc(miCalRef);
        if (miCalSnap.exists()) {
          setMiCalificacion((miCalSnap.data().valor as number) || 0);
        }
      }
    } catch (error) {
      console.error('Error cargando calificaciones:', error);
    }
  }, [eventoId, usuario]);

  useEffect(() => {
    const inicializar = async () => {
      setCargando(true);
      await cargarEvento();
      await Promise.all([cargarRsvp(), cargarComentarios(), cargarCalificaciones()]);
      setCargando(false);
    };
    inicializar();
  }, [cargarEvento, cargarRsvp, cargarComentarios, cargarCalificaciones]);

  // ── RSVP ────────────────────────────────────────────────────────────────────

  const handleRsvp = async () => {
    if (!usuario) {
      Alert.alert('Aviso', 'Debes iniciar sesión para confirmar asistencia.');
      return;
    }
    if (!evento || !eventoId) return;

    setCargandoRsvp(true);
    try {
      const rsvpRef = doc(db, 'eventos', eventoId, 'asistentes', usuario.uid);

      if (rsvpConfirmado) {
        await updateDoc(rsvpRef, { activo: false, canceladoEn: serverTimestamp() });
        setRsvpConfirmado(false);
        setTotalAsistentes((prev) => Math.max(0, prev - 1));
        Alert.alert('Asistencia cancelada', 'Tu asistencia fue cancelada.');
      } else {
        await setDoc(rsvpRef, {
          usuarioId: usuario.uid,
          nombre: usuario.displayName || usuario.email,
          confirmadoEn: serverTimestamp(),
          activo: true,
        });
        setRsvpConfirmado(true);
        setTotalAsistentes((prev) => prev + 1);
        await notifyRsvpConfirmed(evento.titulo);
        await scheduleEventReminder(evento.titulo, new Date(evento.fecha), eventoId);
        Alert.alert('¡Asistencia confirmada!', `Te recordaremos antes de "${evento.titulo}".`);
      }
    } catch (error) {
      console.error('Error en RSVP:', error);
      Alert.alert('Error', 'No se pudo procesar tu asistencia.');
    } finally {
      setCargandoRsvp(false);
    }
  };

  // ── Comentarios ─────────────────────────────────────────────────────────────

  const handleEnviarComentario = async () => {
    if (!usuario) {
      Alert.alert('Aviso', 'Debes iniciar sesión para comentar.');
      return;
    }
    if (!nuevoComentario.trim() || !eventoId) return;

    setEnviandoComentario(true);
    try {
      await addDoc(collection(db, 'eventos', eventoId, 'comentarios'), {
        texto: nuevoComentario.trim(),
        autorId: usuario.uid,
        autorNombre: usuario.displayName || usuario.email || 'Usuario',
        fecha: serverTimestamp(),
      });
      setNuevoComentario('');
      await cargarComentarios();
    } catch (error) {
      console.error('Error enviando comentario:', error);
      Alert.alert('Error', 'No se pudo enviar el comentario.');
    } finally {
      setEnviandoComentario(false);
    }
  };

  // ── Calificación ─────────────────────────────────────────────────────────────

  const handleCalificar = async (estrellas: number) => {
    if (!usuario) {
      Alert.alert('Aviso', 'Debes iniciar sesión para calificar.');
      return;
    }
    if (!eventoId) return;

    setGuardandoCalificacion(true);
    try {
      await setDoc(doc(db, 'eventos', eventoId, 'calificaciones', usuario.uid), {
        valor: estrellas,
        usuarioId: usuario.uid,
        fecha: serverTimestamp(),
      });
      setMiCalificacion(estrellas);
      await cargarCalificaciones();
      Alert.alert('¡Gracias!', `Calificaste este evento con ${estrellas} estrella${estrellas !== 1 ? 's' : ''}.`);
    } catch (error) {
      console.error('Error guardando calificación:', error);
      Alert.alert('Error', 'No se pudo guardar tu calificación.');
    } finally {
      setGuardandoCalificacion(false);
    }
  };

  // ── Compartir ────────────────────────────────────────────────────────────────

  const handleCompartir = async () => {
    if (!evento) return;
    try {
      const mensaje =
        ` *${evento.titulo}*\n` +
        ` Fecha: ${new Date(evento.fecha).toLocaleDateString('es-ES', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })}\n` +
        ` Lugar: ${evento.lugar}\n` +
        (evento.descripcion ? `\n${evento.descripcion}\n` : '') +
        `\n¡Únete a nosotros! Descarga la app Eventos Comunitarios.`;

      await Share.share({ message: mensaje, title: evento.titulo });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.cargandoTexto}>Cargando evento...</Text>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>Evento no encontrado.</Text>
        <TouchableOpacity style={[styles.boton, styles.botonVolver]} onPress={() => router.back()}>
          <Text style={styles.botonTexto}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>

      {/* Encabezado del evento */}
      <View style={styles.tarjeta}>
        <Text style={styles.titulo}>{evento.titulo}</Text>
        <Text style={styles.metaDato}>
          📅 {new Date(evento.fecha).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </Text>
        <Text style={styles.metaDato}> {evento.lugar}</Text>
        {evento.organizador && (
          <Text style={styles.metaDato}> Organizador: {evento.organizador}</Text>
        )}
        {evento.descripcion ? (
          <Text style={styles.descripcion}>{evento.descripcion}</Text>
        ) : null}
        {eventoYaPaso && (
          <View style={styles.badgePasado}>
            <Text style={styles.badgePasadoTexto}>Evento finalizado</Text>
          </View>
        )}
      </View>

      /* RSVP — solo eventos futuros */
      {!eventoYaPaso && (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>📋 Asistencia</Text>
          <Text style={styles.asistentesTexto}>
            {totalAsistentes} {totalAsistentes === 1 ? 'persona confirmada' : 'personas confirmadas'}
          </Text>
          <TouchableOpacity
            style={[styles.boton, rsvpConfirmado ? styles.botonCancelar : styles.botonConfirmar]}
            onPress={handleRsvp}
            disabled={cargandoRsvp}
          >
            {cargandoRsvp ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>
                {rsvpConfirmado ? ' Cancelar asistencia' : 'Confirmar asistencia'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Calificación — solo eventos pasados */}
      {eventoYaPaso && (
        <View style={styles.tarjeta}>
          <Text style={styles.seccionTitulo}>⭐ Calificación</Text>
          {totalCalificaciones > 0 && (
            <Text style={styles.promedioTexto}>
              Promedio: {promedioCalificacion} / 5  ({totalCalificaciones}{' '}
              {totalCalificaciones === 1 ? 'calificación' : 'calificaciones'})
            </Text>
          )}
          <Text style={styles.subTexto}>
            {miCalificacion > 0
              ? `Tu calificación: ${'⭐'.repeat(miCalificacion)}`
              : '¿Cómo fue el evento? Toca una estrella:'}
          </Text>
          <View style={styles.estrellasContenedor}>
            {[1, 2, 3, 4, 5].map((estrella) => (
              <TouchableOpacity
                key={estrella}
                onPress={() => handleCalificar(estrella)}
                disabled={guardandoCalificacion}
              >
                <Text style={[styles.estrella, estrella <= miCalificacion && styles.estrellaActiva]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Compartir */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>Compartir</Text>
        <Text style={styles.subTexto}>Invita a más personas a este evento</Text>
        <TouchableOpacity style={[styles.boton, styles.botonCompartir]} onPress={handleCompartir}>
          <Text style={styles.botonTexto}>Compartir por redes sociales o correo</Text>
        </TouchableOpacity>
      </View>

      {/* Comentarios */}
      <View style={styles.tarjeta}>
        <Text style={styles.seccionTitulo}>Comentarios ({comentarios.length})</Text>

        <View style={styles.comentarioInputContenedor}>
          <TextInput
            style={styles.comentarioInput}
            placeholder="Escribe un comentario..."
            placeholderTextColor="#888"
            value={nuevoComentario}
            onChangeText={setNuevoComentario}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            style={[
              styles.botonEnviar,
              (!nuevoComentario.trim() || enviandoComentario) && styles.botonDesactivado,
            ]}
            onPress={handleEnviarComentario}
            disabled={!nuevoComentario.trim() || enviandoComentario}
          >
            {enviandoComentario ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.botonTexto}>Enviar</Text>
            )}
          </TouchableOpacity>
        </View>

        {comentarios.length === 0 ? (
          <Text style={styles.sinComentarios}>Sé el primero en comentar.</Text>
        ) : (
          comentarios.map((c) => (
            <View key={c.id} style={styles.comentarioItem}>
              <View style={styles.comentarioEncabezado}>
                <Text style={styles.comentarioAutor}>{c.autorNombre}</Text>
                {c.fecha?.toDate && (
                  <Text style={styles.comentarioFecha}>
                    {c.fecha.toDate().toLocaleDateString('es-ES')}
                  </Text>
                )}
              </View>
              <Text style={styles.comentarioTexto}>{c.texto}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={[styles.boton, styles.botonVolver]} onPress={() => router.back()}>
        <Text style={styles.botonTexto}>← Volver a eventos</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#1E1E1E' },
  contenido: { padding: 16, paddingBottom: 40 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E1E1E' },
  cargandoTexto: { color: '#FFF', marginTop: 12, fontSize: 16 },
  errorTexto: { color: '#FF6B6B', fontSize: 16, marginBottom: 16 },

  tarjeta: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  metaDato: { fontSize: 14, color: '#B0B4BA', marginBottom: 4 },
  descripcion: { fontSize: 15, color: '#DDD', marginTop: 10, lineHeight: 22 },
  badgePasado: {
    marginTop: 10,
    backgroundColor: '#555',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgePasadoTexto: { color: '#CCC', fontSize: 12 },

  seccionTitulo: { fontSize: 17, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  subTexto: { fontSize: 13, color: '#B0B4BA', marginBottom: 10 },
  asistentesTexto: { fontSize: 14, color: '#4DA8DA', marginBottom: 12 },

  boton: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  botonConfirmar: { backgroundColor: '#28A745' },
  botonCancelar: { backgroundColor: '#DC3545' },
  botonCompartir: { backgroundColor: '#6F42C1' },
  botonVolver: { backgroundColor: '#555' },
  botonDesactivado: { opacity: 0.5 },
  botonTexto: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  estrellasContenedor: { flexDirection: 'row', gap: 8, marginTop: 6 },
  estrella: { fontSize: 36, color: '#555' },
  estrellaActiva: { color: '#FFD700' },
  promedioTexto: { fontSize: 14, color: '#FFD700', marginBottom: 6 },

  comentarioInputContenedor: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  comentarioInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    padding: 10,
    color: '#FFF',
    maxHeight: 100,
    fontSize: 14,
  },
  botonEnviar: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  sinComentarios: { color: '#888', fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  comentarioItem: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
    marginTop: 6,
  },
  comentarioEncabezado: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  comentarioAutor: { fontWeight: 'bold', color: '#4DA8DA', fontSize: 13 },
  comentarioFecha: { color: '#888', fontSize: 12 },
  comentarioTexto: { color: '#DDD', fontSize: 14, lineHeight: 20 },
});
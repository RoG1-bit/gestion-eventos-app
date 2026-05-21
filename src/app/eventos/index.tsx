import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CardEvento from './CardEvento';
import FormularioEvento from './FormularioEvento';

const EVENTOS_INICIALES = [
  { id: '1', nombre: 'Concierto Comunitario', fecha: '2026-06-15', hora: '18:00', lugar: 'Parque Central', descripcion: 'Música en vivo para toda la familia. Trae tu silla y comparte.' },
  { id: '2', nombre: 'Feria de Emprendedores', fecha: '2026-06-20', hora: '09:00', lugar: 'Plaza Municipal', descripcion: 'Apoya al comercio local. Encontrarás comida, artesanías y más.' },
];

export default function ModuloEventos() {
  const [vista, setVista] = useState<'lista' | 'crear' | 'detalle' | 'editar'>('lista');
  const [eventoSeleccionado, setEventoSeleccionado] = useState<any>(null);

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [lugar, setLugar] = useState('');

  // Persistencia estable en localStorage
  const [eventos, setEventos] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const guardados = localStorage.getItem('local_eventos');
      return guardados ? JSON.parse(guardados) : EVENTOS_INICIALES;
    }
    return EVENTOS_INICIALES;
  });

  useEffect(() => {
    localStorage.setItem('local_eventos', JSON.stringify(eventos));
  }, [eventos]);

  const limpiarFormulario = () => {
    setNombre(''); setDescripcion(''); setFecha(''); setHora(''); setLugar('');
  };

  const handleGuardarNuevo = () => {
    if (!nombre || !descripcion || !fecha || !hora || !lugar) return alert('Por favor, llena todos los campos obligatorios.');
    const nuevo = { id: String(Date.now()), nombre, fecha, hora, lugar, descripcion };
    setEventos([...eventos, nuevo]);
    limpiarFormulario();
    setVista('lista');
  };

  const handleIniciarEdicion = () => {
    if (eventoSeleccionado) {
      setNombre(eventoSeleccionado.nombre);
      setDescripcion(eventoSeleccionado.descripcion);
      setFecha(eventoSeleccionado.fecha);
      setHora(eventoSeleccionado.hora);
      setLugar(eventoSeleccionado.lugar);
      setVista('editar');
    }
  };

  const handleGuardarCambios = () => {
    if (!nombre || !descripcion || !fecha || !hora || !lugar) return alert('Por favor, llena todos los campos obligatorios.');
    const modificados = events = eventos.map(e => e.id === eventoSeleccionado.id ? { ...e, nombre, fecha, hora, lugar, descripcion } : e);
    setEventos(modificados);
    setEventoSeleccionado({ id: eventoSeleccionado.id, nombre, fecha, hora, lugar, descripcion });
    limpiarFormulario();
    setVista('detalle');
  };

  return (
    <View style={styles.container}>
      {/* 1. VISTA LISTADO */}
      {vista === 'lista' && (
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>Eventos Comunitarios</Text>
            <TouchableOpacity style={styles.btnCrear} onPress={() => { limpiarFormulario(); setVista('crear'); }}>
              <Text style={styles.btnTextoBlanco}>+ Crear Evento</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CardEvento item={item} onPress={() => { setEventoSeleccionado(item); setVista('detalle'); }} />
            )}
          />
        </View>
      )}

      {/* 2. VISTA CREAR */}
      {vista === 'crear' && (
        <FormularioEvento 
          titulo="Crear Nuevo Evento" nombre={nombre} setNombre={setNombre} descripcion={descripcion} setDescripcion={setDescripcion}
          fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora} lugar={lugar} setLugar={setLugar}
          onGuardar={handleGuardarNuevo} onCancelar={() => setVista('lista')}
        />
      )}

      {/* 3. VISTA DETALLE */}
      {vista === 'detalle' && (
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.btnAtrasArriba} onPress={() => setVista('lista')}>
            <Text style={styles.btnAtrasArribaTexto}>Volver al listado</Text>
          </TouchableOpacity>
          <Text style={styles.titleForm}>Detalle del Evento</Text>
          <View style={styles.form}>
            <Text style={styles.eventoNombre}>{eventoSeleccionado?.nombre}</Text>
            <Text style={styles.cardInfo}><Text style={styles.negrita}>📅 Fecha: </Text>{eventoSeleccionado?.fecha}</Text>
            <Text style={styles.cardInfo}><Text style={styles.negrita}>⏰ Hora: </Text>{eventoSeleccionado?.hora}</Text>
            <Text style={styles.cardInfo}><Text style={styles.negrita}>📍 Lugar: </Text>{eventoSeleccionado?.lugar}</Text>
            <Text style={[styles.label, { marginTop: 15 }]}>Descripción:</Text>
            <Text style={styles.valueDesc}>{eventoSeleccionado?.descripcion}</Text>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.btnEditar} onPress={handleIniciarEdicion}><Text style={styles.btnTextoBlanco}>Editar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnEliminar} onPress={() => { setEventos(eventos.filter(e => e.id !== eventoSeleccionado.id)); setVista('lista'); }}><Text style={styles.btnTextoBlanco}>Eliminar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 4. VISTA EDITAR */}
      {vista === 'editar' && (
        <FormularioEvento 
          titulo="Modificar Evento" nombre={nombre} setNombre={setNombre} descripcion={descripcion} setDescripcion={setDescripcion}
          fecha={fecha} setFecha={setFecha} hora={hora} setHora={setHora} lugar={lugar} setLugar={setLugar}
          onGuardar={handleGuardarCambios} onCancelar={() => setVista('detalle')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20, marginTop: 90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  btnCrear: { backgroundColor: '#007bff', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  btnTextoBlanco: { color: '#fff', fontWeight: 'bold' },
  cardInfo: { fontSize: 15, color: '#555', marginTop: 4 },
  negrita: { fontWeight: 'bold', color: '#222' },
  formContainer: { maxWidth: 500, alignSelf: 'center', width: '100%' },
  btnAtrasArriba: { alignSelf: 'flex-start', marginBottom: 15, paddingVertical: 5 },
  btnAtrasArribaTexto: { color: '#007bff', fontWeight: '600', fontSize: 15 },
  titleForm: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5, marginTop: 10 },
  eventoNombre: { fontSize: 22, fontWeight: 'bold', color: '#007bff', marginBottom: 15 },
  valueDesc: { fontSize: 14, color: '#666', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginTop: 5 },
  rowActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btnEditar: { flex: 1, backgroundColor: '#ffc107', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnEliminar: { flex: 1, backgroundColor: '#dc3545', padding: 12, borderRadius: 8, alignItems: 'center' }
});
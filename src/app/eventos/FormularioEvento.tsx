import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FormProps {
  titulo: string;
  nombre: string; setNombre: (t: string) => void;
  descripcion: string; setDescripcion: (t: string) => void;
  fecha: string; setFecha: (t: string) => void;
  hora: string; setHora: (t: string) => void;
  lugar: string; setLugar: (t: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
}

export default function FormularioEvento({
  titulo, nombre, setNombre, descripcion, setDescripcion,
  fecha, setFecha, hora, setHora, lugar, setLugar, onGuardar, onCancelar
}: FormProps) {
  return (
    <View style={styles.formContainer}>
      <TouchableOpacity style={styles.btnAtrasArriba} onPress={onCancelar}>
        <Text style={styles.btnAtrasArribaTexto}>Cancelar y volver</Text>
      </TouchableOpacity>

      <Text style={styles.titleForm}>{titulo}</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Nombre del Evento *</Text>
        <TextInput style={styles.input} placeholder="Ej. Torneo de fútbol..." value={nombre} onChangeText={setNombre} />
        
        <Text style={styles.label}>Descripción *</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Detalles..." value={descripcion} onChangeText={setDescripcion} multiline numberOfLines={3} />
        
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Fecha *</Text>
            <TextInput 
              style={styles.input} 
              value={fecha} 
              onChangeText={setFecha} 
              // @ts-ignore
              type="date" 
            />
          </View>
          <View style={{ width: 15 }} />
          <View style={styles.flex1}>
            <Text style={styles.label}>Hora *</Text>
            <TextInput 
              style={styles.input} 
              value={hora} 
              onChangeText={setHora} 
              // @ts-ignore
              type="time" 
            />
          </View>
        </View>

        <Text style={styles.label}>Lugar *</Text>
        <TextInput style={styles.input} placeholder="Ej. Cancha municipal..." value={lugar} onChangeText={setLugar} />

        <TouchableOpacity style={styles.btnGuardar} onPress={onGuardar}>
          <Text style={styles.btnTextoBlanco}>💾 Guardar Evento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { maxWidth: 500, alignSelf: 'center', width: '100%' },
  btnAtrasArriba: { alignSelf: 'flex-start', marginBottom: 15, paddingVertical: 5 },
  btnAtrasArribaTexto: { color: '#007bff', fontWeight: '600', fontSize: 15 },
  titleForm: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  form: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 5, marginTop: 10 },
  input: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 5, color: '#333', fontSize: 15 },
  textArea: { height: 60, textAlignVertical: 'top' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  flex1: { flex: 1 },
  btnGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  btnTextoBlanco: { color: '#fff', fontWeight: 'bold' }
});
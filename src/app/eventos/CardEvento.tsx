import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CardProps {
  item: any;
  onPress: () => void;
}

export default function CardEvento({ item, onPress }: CardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{item.nombre}</Text>
      <Text style={styles.cardInfo}>📅 {item.fecha} - ⏰ {item.hora}</Text>
      <Text style={styles.cardInfo}>📍 {item.lugar}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  cardInfo: { fontSize: 15, color: '#555', marginTop: 4 },
});
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CardEvento({ titulo, lugar, fecha }: any) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{titulo}</Text>
      <Text style={styles.text}>📍 {lugar}</Text>
      <Text style={styles.text}>📅 {fecha}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2A2A2A",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  text: { color: "#AAA", marginTop: 5 },
});

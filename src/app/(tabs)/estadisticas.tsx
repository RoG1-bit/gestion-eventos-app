import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

export default function EstadisticasScreen() {
  const screenWidth = Dimensions.get("window").width - 32; // Margen

  // Datos mockeados (Puedes conectarlos a Firebase después si Krissia ya hizo la tabla de comentarios)
  const participacionMensual = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    datasets: [{ data: [1, 3, 2, 5, 4, 2] }]
  };

  const interacciones = [
    { name: "Asistencias", cantidad: 17, color: "#4DA8DA", legendFontColor: "#FFF", legendFontSize: 13 },
    { name: "Comentarios", cantidad: 8, color: "#28A745", legendFontColor: "#FFF", legendFontSize: 13 },
  ];

  const chartConfig = {
    backgroundGradientFrom: "#2A2A2A",
    backgroundGradientTo: "#2A2A2A",
    color: (opacity = 1) => `rgba(77, 168, 218, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.6,
  };

  return (
    <ScrollView style={styles.contenedor}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Estadísticas</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.subtitulo}>Eventos asistidos por mes</Text>
        <View style={styles.tarjetaG}>
          <BarChart
            data={participacionMensual}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.grafico}
            showValuesOnTopOfBars
          />
        </View>

        <Text style={styles.subtitulo}>Resumen de Interacción</Text>
        <View style={styles.tarjetaG}>
          <PieChart
            data={interacciones}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor={"cantidad"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#1E1E1E" },
  header: { padding: 16, backgroundColor: "#2A2A2A", borderBottomWidth: 1, borderBottomColor: "#333" },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#FFF" },
  body: { padding: 16 },
  subtitulo: { fontSize: 18, fontWeight: "bold", color: "#FFF", marginBottom: 12, marginTop: 8 },
  tarjetaG: { backgroundColor: "#2A2A2A", borderRadius: 12, overflow: "hidden", marginBottom: 24, borderWidth: 1, borderColor: "#333" },
  grafico: { marginVertical: 8, borderRadius: 12 },
});
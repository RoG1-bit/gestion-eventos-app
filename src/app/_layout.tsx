import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#1E1E1E" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Login", headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ title: "Registro", headerShown: true }}
      />
      <Stack.Screen
        name="eventos-lista"
        options={{ title: "Mis Eventos", headerBackVisible: false }}
      />
      <Stack.Screen
        name="eventos-detalle"
        options={{ title: "Detalle del Evento" }}
      />
      <Stack.Screen
        name="eventos/FormularioEvento"
        options={{ title: "Gestionar Evento" }}
      />
      <Stack.Screen
        name="estadisticas"
        options={{ title: "Historial y Estadísticas" }}
      />
    </Stack>
  );
}

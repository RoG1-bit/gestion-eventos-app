import { Stack } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Pantallas de Autenticación (Tu parte) */}
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />

        {/* Sistema Unificado de Pestañas de tus compañeros (Módulos Reales) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}

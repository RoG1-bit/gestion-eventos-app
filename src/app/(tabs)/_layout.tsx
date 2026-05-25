import AppTabsWeb from "@/components/app-tabs.web";
import { Colors } from "@/constants/theme";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, useColorScheme } from "react-native";

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  if (Platform.OS === "web") {
    return <AppTabsWeb />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundElement,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarLabel: "Explore",
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: "Eventos",
          tabBarLabel: "Eventos",
        }}
      />
      {/* ... tus otras pestañas arriba ... */}
      <Tabs.Screen
        name="historial"
        options={{
          title: "Historial",
          tabBarLabel: "Historial",
        }}
      />
      <Tabs.Screen
        name="estadisticas"
        options={{
          title: "Estadísticas",
          tabBarLabel: "Estadísticas",
        }}
      />
    </Tabs>
  );
}

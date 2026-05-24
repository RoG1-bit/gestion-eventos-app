import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import AppTabsWeb from '@/components/app-tabs.web';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export default function TabsLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  if (Platform.OS === 'web') {
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarLabel: 'Eventos',
        }}
      />
    </Tabs>
  );
}

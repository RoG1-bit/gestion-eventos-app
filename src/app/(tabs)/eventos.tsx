import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function EventosScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        // Aquí irá la lógica para cargar eventos de Firebase
        setEventos([]);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  const renderEvento = ({ item }: any) => (
    <ThemedView style={styles.eventoCard}>
      <ThemedText type="subtitle">{item.titulo || 'Evento'}</ThemedText>
      <ThemedText themeColor="textSecondary">{item.descripcion}</ThemedText>
    </ThemedView>
  );

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Eventos</ThemedText>
          {eventos.length === 0 && !loading && (
            <ThemedText style={styles.centerText} themeColor="textSecondary">
              No hay eventos disponibles
            </ThemedText>
          )}
        </ThemedView>

        {eventos.length > 0 && (
          <FlatList
            data={eventos}
            renderItem={renderEvento}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: Spacing.four,
  },
  eventoCard: {
    marginBottom: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
});

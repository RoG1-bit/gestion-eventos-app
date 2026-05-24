import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowAlert: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null );

  useEffect(() => {
    registerForPushNotificationsAsync();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notificación recibida:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Usuario tocó notificación:', response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  // 1 hora antes del evento
  const scheduleEventReminder = async (
    eventTitle: string,
    eventDate: Date,
    eventId: string
  ) => {
    const reminderDate = new Date(eventDate.getTime() - 60 * 60 * 1000);
    if (reminderDate <= new Date()) return null;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: ' Recordatorio de Evento',
        body: `"${eventTitle}" comienza en 1 hora`,
        data: { eventId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
    return identifier;
  };

  // Notificación cuando cambia
  const notifyEventChange = async (eventTitle: string, changeMessage: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Evento Actualizado',
        body: `"${eventTitle}": ${changeMessage}`,
      },
      trigger: null,
    });
  };

  // Notificación al confirmar RSVP
  const notifyRsvpConfirmed = async (eventTitle: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Asistencia Confirmada',
        body: `Tu asistencia a "${eventTitle}" fue registrada.`,
      },
      trigger: null,
    });
  };

  const cancelEventReminder = async (notificationId: string) => {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  return {
    scheduleEventReminder,
    notifyEventChange,
    notifyRsvpConfirmed,
    cancelEventReminder,
  };
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se otorgaron permisos de notificación.');
    }
  }
}
// NotificationManager.js

import { useEffect, useRef, Alert } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const useNotificationManager = () => {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        if (
          notification.request.content.data &&
          notification.request.content.data.type === "inbox_message"
        ) {
          displayInAppMessage(notification.request.content.data);
        }
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {});

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const displayInAppMessage = (data) => {
    // Example: Show an alert for simplicity
    // Alert.alert("In-App Message", data.body);
  };

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: "Here is the notification body",
        data: { type: "inbox_message", body: "Custom in-app message" },
        imageUrl: "https://www.w3schools.com/css/ocean.jpg",
      },
      trigger: { seconds: 10 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus === "granted") {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } else {
        console.warn("Failed to get push token for push notification!");
      }
    } else {
      console.warn("Must use a physical device for Push Notifications");
    }

    return token;
  }

  return {
    schedulePushNotification,
    registerForPushNotificationsAsync,
  };
};

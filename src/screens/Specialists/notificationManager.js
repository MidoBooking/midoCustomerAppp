import messaging from "@react-native-firebase/messaging";
import fbConfig from "../../firebase";

const NotificationManager = {
  // Initialize Firebase Cloud Messaging
  initializeFirebaseMessaging: async () => {
    // Use your Firebase configuration
    await messaging().initializeApp(fbConfig);

    // Get the Instance ID token
    const fcmToken = await messaging().getToken();
    console.log("FCM Token:", fcmToken);
  },

  // Request permission for notifications
  requestPermission: async () => {
    try {
      await messaging().requestPermission();
    } catch (error) {
      console.log("Permission rejected:", error);
    }
  },

  // Handle incoming messages
  onMessageReceived: () => {
    messaging().onMessage(async (remoteMessage) => {
      // Handle your notification here
      console.log("Notification received:", remoteMessage);
    });
  },
};

export default NotificationManager;

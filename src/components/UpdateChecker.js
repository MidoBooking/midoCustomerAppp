import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
} from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialIcons";
import fbConfig from "../firebase";
import COLORS from "../consts/colors";

// Initialize Firebase app
const firebaseApp = initializeApp(fbConfig);

// Get Firestore instance
const firestore = getFirestore(firebaseApp);

const UpdateStatusChecker = ({ children }) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [firebaseVersion, setFirebaseVersion] = useState(null);
  const [updateUrl, setUpdateUrl] = useState(null); // State to hold update URL

  useEffect(() => {
    console.log("Fetching version from Firebase...");
    const unsubscribe = onSnapshot(
      doc(collection(firestore, "versions"), "customerApp"),
      (snapshot) => {
        const versionData = snapshot.data();
        console.log("Received version from Firebase:", versionData);
        setFirebaseVersion(versionData.version);
        setUpdateUrl(versionData.updateUrl); // Set the update URL from Firestore
      }
    );

    return () => {
      console.log("Unsubscribing from Firebase snapshot listener...");
      unsubscribe(); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (firebaseVersion !== null) {
      console.log("Checking for update...");
      checkForUpdate();
    }
  }, [firebaseVersion]);

  const checkForUpdate = () => {
    const currentVersion = "1.0.0".trim(); // Trim any leading or trailing whitespace
    console.log("Current app version:", currentVersion);

    if (firebaseVersion && currentVersion !== firebaseVersion.trim()) {
      console.log("Update is available!");
      setIsUpdateAvailable(true);
    } else {
      console.log("No update available.");
      setIsUpdateAvailable(false);
    }
    setIsChecking(false); // Update checking is completed
  };

  const handleUpdate = () => {
    // Open the update URL in the browser
    if (updateUrl) {
      Linking.openURL(updateUrl);
    }
  };

  return (
    <View style={styles.container}>
      {isChecking ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text style={styles.loadingText}>Checking for updates...</Text>
        </View>
      ) : isUpdateAvailable ? (
        <Modal visible={true} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.messageContainer}>
              <Icon name="system-update" size={50} color="blue" />
              <Text style={styles.titleText}>Update Available</Text>
              <Text style={styles.subtitleText}>
                A new version of the Mido is available. Please update to
                continue using the app.
              </Text>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdate} // Call handleUpdate onPress
              >
                <Text style={styles.updateButtonText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  subtitleText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  updateButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default UpdateStatusChecker;

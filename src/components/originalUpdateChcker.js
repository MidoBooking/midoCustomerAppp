import React, { useState, useEffect } from "react";
import { View, Text, Modal, Button } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot } from "firebase/firestore";
import fbConfig from "../firebase";

// Initialize Firebase app
const firebaseApp = initializeApp(fbConfig);

// Get Firestore instance
const firestore = getFirestore(firebaseApp);

const UpdateChecker = () => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [firebaseVersion, setFirebaseVersion] = useState(null);

  useEffect(() => {
    console.log("Fetching version from Firebase...");
    const unsubscribe = onSnapshot(
      doc(collection(firestore, "versions"), "w6rV2FzBtvVngWSshcjP"),
      (snapshot) => {
        const versionData = snapshot.data();
        console.log("Received version from Firebase:", versionData);
        setFirebaseVersion(versionData.version);
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

    if (firebaseVersion && currentVersion === firebaseVersion.trim()) {
      console.log("No update available.");
      setShowUpdateModal(false);
    } else {
      console.log("Update is available!");
      setShowUpdateModal(true);
    }
  };

  const handleUpdate = () => {
    // Handle update logic here
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
  };

  return (
    <View>
      {/* Your app content */}

      <Modal visible={showUpdateModal} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
          >
            <Text style={{ marginBottom: 10 }}>A new update is available!</Text>
            <Button title="Update Now" onPress={handleUpdate} />
            <Button title="Close" onPress={handleCloseModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UpdateChecker;

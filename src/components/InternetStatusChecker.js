// InternetStatusChecker.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Icon from "react-native-vector-icons/MaterialIcons";

const InternetStatusChecker = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleReload = () => {
    setIsReloading(true);

    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);

      // Simulate a delay of 2 seconds before setting isReloading to false
      setTimeout(() => {
        setIsReloading(false);
      }, 2000);
    });
  };

  return (
    <View style={styles.container}>
      {isReloading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text style={styles.loadingText}>Reloading...</Text>
        </View>
      ) : isConnected ? (
        children
      ) : (
        <View style={styles.messageContainer}>
          <Icon name="warning" size={50} color="red" />
          <Text style={styles.titleText}>Internet Connection Error</Text>
          <Text style={styles.subtitleText}>
            We are having some trouble loading the app. Please try again.
          </Text>
          <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
            <Text style={styles.reloadButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  messageContainer: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  reloadButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  reloadButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default InternetStatusChecker;

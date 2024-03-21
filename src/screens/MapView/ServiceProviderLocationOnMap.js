import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import COLORS from "../../consts/colors";

const ServicePorviderOnMapScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { latitude, longitude, imageUrl, businessName } = route.params;

  const destLatitude = latitude;
  const destLongitude = longitude;

  // State to manage loading state
  const [isLoading, setIsLoading] = useState(true);

  // State to hold the user's current location
  const [userLocation, setUserLocation] = useState(null);
  // Reference for the MapView component
  const mapViewRef = useRef(null);

  useEffect(() => {
    // Request permission to access the device's location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      // Get the user's current location
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setIsLoading(false); // Set loading state to false once location is obtained
    })();
  }, []); // Empty dependency array to ensure useEffect runs only once

  const centerMapOnUser = () => {
    if (userLocation && mapViewRef.current) {
      // Centralize the map on the user's location
      mapViewRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backButtonCircle}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </View>
      </TouchableOpacity>
      {userLocation ? (
        <MapView
          ref={mapViewRef}
          style={styles.map}
          provider="google"
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Marker for the user's current location */}
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
          ></Marker>
          {/* Marker for the destination */}
          <Marker
            coordinate={{ latitude: destLatitude, longitude: destLongitude }}
          >
            <Image
              source={{ uri: imageUrl }}
              style={styles.destinationMarker}
            />
            <Text style={styles.destinationText}>{businessName}</Text>
          </Marker>
          {/* Direction line from user's current location to destination */}
          <MapViewDirections
            origin={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            destination={{ latitude: destLatitude, longitude: destLongitude }}
            apikey={"AIzaSyAUe76yQq5_3m_OVGhYa_gYvnZ2YsCuB6M"}
            strokeWidth={3}
            strokeColor="hotpink"
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Floating button to centralize the user's location */}
      <TouchableOpacity style={styles.centerButton} onPress={centerMapOnUser}>
        <Text style={styles.centerButtonText}>Centralize</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: Constants.statusBarHeight,
    left: 30,
    zIndex: 1,
  },

  backButtonCircle: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: "absolute",
    bottom: 46,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    padding: 10,
    elevation: 5,
  },
  centerButtonText: {
    flexDirection: "row",
    alignItems: "center",
    color: COLORS.white,
  },
  centerButtonIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  destinationMarker: {
    width: 50,
    height: 50,
    borderRadius: 50, // Make it circular
  },
  destinationText: {
    color: COLORS.black,
    fontWeight: "bold",
  },
});

export default ServicePorviderOnMapScreen;

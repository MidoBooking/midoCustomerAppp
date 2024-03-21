import React from "react";
import { Text, View } from "react-native";
import { useSelector } from "react-redux";

const DistanceCalculator = ({ serviceProviderLocation }) => {
  // Use useSelector to get the user's location from the Redux store
  const userLocation = useSelector((state) => state.location.location);

  // Function to calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers

    return distance;
  };

  // Helper function to convert degrees to radians
  const toRadians = (angle) => {
    return (angle * Math.PI) / 180;
  };

  // Check if both user and service provider locations are available
  if (userLocation && serviceProviderLocation) {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      serviceProviderLocation.latitude,
      serviceProviderLocation.longitude
    );

    if (!isNaN(distance)) {
      return (
        <View>
          {distance < 1 ? (
            <Text
              style={{
                fontWeight: "bold",
              }}
            >
              {(distance * 1000).toFixed(2)} Meter{" "}
            </Text>
          ) : (
            <Text style={{ fontWeight: "bold" }}>
              {distance.toFixed(2)} Km{" "}
            </Text>
          )}
        </View>
      );
    } else {
      console.error(
        "Distance calculation failed. Check user and serviceProviderLocation data:",
        userLocation,
        serviceProviderLocation
      );
      return <Text>Distance calculation failed</Text>;
    }
  } else {
    return <Text>Location data not available</Text>;
  }
};

export default DistanceCalculator;

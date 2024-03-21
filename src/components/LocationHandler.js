import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as Location from "expo-location";
import { setLocation } from "../redux/locationStore";

const LocationHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          throw new Error("Permission to access location was denied");
        }

        let location = await Location.getCurrentPositionAsync({});
        console.log("Current Location:", location);

        // Dispatch the location to the combined Redux store
        dispatch(setLocation(location.coords));
      } catch (error) {
        console.error("Error fetching location:", error.message);
        // Handle the error gracefully, maybe show a message to the user
      }
    };

    fetchLocation();
  }, [dispatch]);

  // You can render something here if needed, but this component is primarily for fetching location.
  return null;
};

export default LocationHandler;

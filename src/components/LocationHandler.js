import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLocation } from "../redux/locationStore";

const LocationHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const apiKey = "AIzaSyAUe76yQq5_3m_OVGhYa_gYvnZ2YsCuB6M";
        const response = await fetch(
          `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch location: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        if (data && data.location) {
          const location = {
            latitude: data.location.lat,
            longitude: data.location.lng,
          };
          console.log("Location:", location);
          dispatch(setLocation(location));
        } else {
          throw new Error("Location data not found in response");
        }
      } catch (error) {
        console.error("Error fetching location:", error.message);
        // Handle error gracefully
      }
    };

    fetchLocation();
  }, [dispatch]);

  return null;
};

export default LocationHandler;

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { AntDesign } from "@expo/vector-icons";
import Constants from "expo-constants";

import * as Location from "expo-location";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../components/apiConfig";
import COLORS from "../../consts/colors";

const LocationMapScreen = () => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedBusinessLocation, setSelectedBusinessLocation] =
    useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mapLoading, setMapLoading] = useState(true);

  // State for pagination
  const [page, setPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Ref for ScrollView
  const scrollViewRef = useRef(null);

  // Function to fetch users from the server
  const fetchUsers = async () => {
    try {
      const response = await axios.post(`${API_URL}/allUsers`, {
        userLocation: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        page,
      });

      if (response.status !== 200) {
        throw new Error("Network request failed");
      }

      const data = response.data;

      // If it's the first page, set the data directly, otherwise append
      setBusinesses((prevBusinesses) =>
        page === 1 ? [...data] : [...prevBusinesses, ...data]
      );

      if (data.length === 0) {
        setHasMoreItems(false);
      }
      console.log(
        `Total items after page ${page}:`,
        businesses.length + data.length
      );
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Fetch data if userLocation is available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      fetchUsers();
    } else {
      console.log("User location is not available. Skipping data fetch.");
    }
  }, [page, userLocation]);

  useEffect(() => {
    // Fetch user location
    getLocation();
  }, []);

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Location permission denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    setUserLocation(location.coords);
    setMapLoading(false);
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBusinesses([]);
    } else {
      // Filter businesses based on search query
      const filtered = businesses.filter(
        (business) =>
          business.businessName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          business.services.some((service) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredBusinesses(filtered);
    }
  }, [searchQuery, businesses]);

  useEffect(() => {
    if (selectedBusinessLocation) {
      mapViewRef.current.animateToRegion({
        latitude: selectedBusinessLocation.latitude,
        longitude: selectedBusinessLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [selectedBusinessLocation]);

  const handleServicePress = (businessId) => {
    const business = businesses.find((b) => b.id === businessId);
    if (business) {
      if (!mapLoading) {
        setSelectedBusinessLocation({
          latitude: business.latitudeOnDatabase,
          longitude: business.longitudeOnDatabase,
        });
      }
    }
  };

  const handleMarkerPress = (businessId) => {
    const business = businesses.find((b) => b.id === businessId);

    if (business) {
      navigation.navigate("UserDetails", {
        userData: business,
        distance: business.distance,
        serviceProviderLatitude: business.latitudeOnDatabase,
        serviceProviderLongitude: business.longitudeOnDatabase,
      });
    }
  };

  const handleScrollEnd = () => {
    if (!loading && hasMoreItems) {
      setLoadingMore(true);
      setPage(page + 1);
    }
  };

  const mapViewRef = useRef(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchLabelText}>Search</Text>
            <AntDesign
              name="search1"
              size={24}
              color="gray"
              style={styles.searchIcon}
            />
            <TextInput
              style={[
                styles.searchInput,
                isSearchFocused && styles.searchInputActive,
                { minWidth: 300 },
              ]}
              placeholder="search by business name or services"
              placeholderTextColor="gray" // Change placeholder color
              onChangeText={(text) => setSearchQuery(text)}
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && ( // Show clear button when there's text in the search field
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery("")}
              >
                <AntDesign name="close" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          {mapLoading ? (
            <ActivityIndicator
              style={styles.loadingIndicator}
              size="large"
              color={COLORS.primary}
            />
          ) : (
            <MapView
              ref={mapViewRef}
              style={styles.map}
              provider="google"
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
            >
              {filteredBusinesses.map((business) => (
                <Marker
                  key={business.id}
                  coordinate={{
                    latitude: business.latitudeOnDatabase,
                    longitude: business.longitudeOnDatabase,
                  }}
                  title={business.businessName}
                  onPress={() => handleMarkerPress(business.id)}
                >
                  <View style={styles.marker}>
                    <Image
                      source={{ uri: business.businessPicture }}
                      style={styles.markerImage}
                    />
                    <Text style={styles.markerText}>
                      {business.businessName}
                    </Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
          <ScrollView
            ref={scrollViewRef}
            onScroll={({ nativeEvent }) => {
              if (isCloseToBottom(nativeEvent)) {
                handleScrollEnd();
              }
            }}
            scrollEventThrottle={400}
            horizontal
            style={styles.businessList}
          >
            {filteredBusinesses.map((business) => (
              <TouchableOpacity
                key={business.id}
                style={[
                  styles.businessItem,
                  selectedItem === business.id && styles.selectedItem,
                ]}
                onPress={() => {
                  handleServicePress(business.id);
                  setSelectedItem(business.id);
                }}
              >
                <Image
                  source={{ uri: business.businessPicture }}
                  style={[
                    styles.businessItemImage,
                    selectedItem === business.id && styles.selectedItemImage,
                  ]}
                />
                <Text style={styles.businessItemText}>
                  {business.businessName}
                </Text>
              </TouchableOpacity>
            ))}
            {loadingMore && <ActivityIndicator size="small" color="#0000ff" />}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.width + contentOffset.x >=
    contentSize.width - paddingToBottom
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    position: "absolute",
    top: Constants.statusBarHeight + 16,
    alignSelf: "center",
    zIndex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  searchLabelText: {
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: 5,
    fontSize: 20,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    paddingLeft: 40,
  },
  map: {
    flex: 1,
  },
  marker: {
    alignItems: "center",
  },
  markerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  markerText: {
    fontWeight: "bold",
  },
  businessList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
  },
  businessItem: {
    marginRight: 10,
  },
  businessItemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  businessItemText: {
    textAlign: "center",
    marginTop: 5,
    fontWeight: "bold",
  },
  selectedItem: {
    transform: [{ scale: 1.1 }],
    padding: 10,
    paddingTop: 12,
  },
  selectedItemImage: {
    transform: [{ scale: 1.1 }],
    borderRadius: 10,
  },
  loadingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  searchIcon: {
    position: "absolute",
    left: 15,
    top: "65%",
    //    transform: [{ translateY: -12 }],
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: "30%",
    transform: [{ translateY: -12 }], // Adjust the vertical position
  },
});

export default LocationMapScreen;

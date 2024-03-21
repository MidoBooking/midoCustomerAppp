import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  FlatList,
} from "react-native";
import Constants from "expo-constants";
import Icon from "react-native-vector-icons/MaterialIcons";
import COLORS from "./consts/colors";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import fbConfig from "./firebase";
import { onSnapshot } from "firebase/firestore";
const app = initializeApp(fbConfig);

import { useSelector } from "react-redux";
import { Colors } from "react-native/Libraries/NewAppScreen";
import axios from "axios";
import { API_URL } from "./components/apiConfig";
import DistanceCalculator from "./components/DistanceCalculator";

const { width } = Dimensions.get("screen");
const cardWidth = width / 1.8;

const HomeScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [bookingsList, setBookingsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const userId = useSelector((state) => state.user.userId);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false); // State variable for overlay
  console.log("user id from home is", userId);
  // Function to toggle popup visibility
  const togglePopupVisibility = (visible) => {
    setPopupVisible(visible);
    setOverlayVisible(visible); // Show/hide overlay accordingly
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    fetchData();
  }, [userId]);
  useEffect(() => {
    // Display popup banner when component mounts
    setTimeout(() => {
      setPopupVisible(true);
    }, 5000); // Show popup after 5 seconds
  }, []);
  useEffect(() => {
    // Close popup and hide overlay when popup is closed
    if (!popupVisible) {
      setOverlayVisible(false);
    }
  }, [popupVisible]);
  const renderPopupBanner = () => {
    if (!popupVisible) return null;
    return (
      <View style={styles.popupBanner}>
        <Image
          source={require("./assets/Homepage/hairCut.png")}
          style={styles.bannerImage}
        />
        <TouchableOpacity
          onPress={() => togglePopupVisibility(false)} // Close popup when button is pressed
          style={styles.closeButton}
        >
          <Icon name="close" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderOverlay = () => {
    if (!overlayVisible) return null;
    return (
      <TouchableOpacity
        style={styles.overlay}
        onPress={() => togglePopupVisibility(false)} // Close popup when overlay is pressed
      />
    );
  };

  useEffect(() => {});
  const renderNoStylistMessage = () => (
    <View style={styles.noStylistContainer}>
      <Text style={styles.noStylistText}>No Stylist</Text>
    </View>
  );
  const fetchData = async () => {
    setRefreshing(true);

    try {
      const userBookingsRef = collection(getFirestore(app), "bookings");

      // Listen for real-time updates
      const unsubscribe = onSnapshot(
        query(userBookingsRef, where("userId", "==", userId)),
        (querySnapshot) => {
          if (querySnapshot.empty) {
            setLoading(false);
            setBookingsList([]);
          } else {
            const currentDate = new Date();
            const formattedCurrentDate = formatDate(currentDate);

            const bookings = querySnapshot.docs
              .filter((doc) => doc.data().selectedDate >= formattedCurrentDate)
              .map((doc) => ({
                key: doc.id,
                id: doc.id,
                ...doc.data(),
              }));

            // Sort bookings based on createdAt timestamp
            const sortedBookings = bookings.sort((a, b) => {
              const createdAtA = new Date(a.createdAt);
              const createdAtB = new Date(b.createdAt);
              return createdAtB - createdAtA; // Sort in descending order
            });

            const latestBookingsByBusinessName = {};

            // Keep track of the latest booking for each business name
            sortedBookings.forEach((booking) => {
              const businessName = booking.businessName;
              if (!latestBookingsByBusinessName[businessName]) {
                latestBookingsByBusinessName[businessName] = booking;
              }
            });

            // Set state with the latest bookings
            setBookingsList(Object.values(latestBookingsByBusinessName));

            setLoading(false);
          }
        }
      );

      // Store the unsubscribe function to stop listening when the component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching data:", error);
      setBookingsList([]);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  const renderLoadingIndicator = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={COLORS.dark} />
    </View>
  );
  const handleMenuItemPress = (itemId) => {
    const screenName = screenMappings[itemId];
    if (screenName) {
      navigation.navigate(screenName);
    } else {
      // Handle other cases
    }
  };
  const screenMappings = {
    1: "barbershop",
    2: "Nails",
    3: "Massage",
    4: "Makeup",
    5: "Spa",
    6: "BridaService",
    7: "SkinCare",
    8: "HandandFoot",
  };
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item.id)}
    >
      <View style={styles.menuItemContainer}>
        <Text style={styles.menuItemText}>{item.title}</Text>

        <Image source={item.image} style={styles.menuItemImage} />
      </View>
    </TouchableOpacity>
  );

  const menuItems = [
    {
      id: 1,
      title: "Barber \nShop",
      image: require("./assets/Homepage/hairCut.png"),
    },
    {
      id: 2,
      title: "Nails",
      image: require("./assets/Homepage/nailSalon.png"),
    },
    {
      id: 3,
      title: "Massage",
      image: require("./assets/Homepage/massage.png"),
    },
    {
      id: 4,
      title: "Makeup",
      image: require("./assets/Homepage/makeUp.png"),
    },
    {
      id: 5,
      title: "Spa",
      image: require("./assets/Homepage/spa.png"),
    },
    {
      id: 6,
      title: "Bridal \nService",
      image: require("./assets/Homepage/bridal.png"),
    },
    {
      id: 7,
      title: "Skin Care",
      image: require("./assets/Homepage/skincare.jpg"),
    },
    {
      id: 8,
      title: " Hand, foot \n treatments",
      image: require("./assets/Homepage/hand_foot.jpg"),
    },

    // Add more menu items as needed
  ];

  const handleBookingItem = async (bookingItem) => {
    try {
      console.log("booking item is ", bookingItem);
      setLoadingUserData(true);

      const response = await axios.get(
        `${API_URL}/users/${bookingItem.businessOwnerId}`
      );

      if (response.status === 200) {
        const myStylistClicked = response.data;

        navigation.navigate("UserDetails", {
          userData: myStylistClicked,
          serviceProviderLatitude: myStylistClicked.location._latitude,
          serviceProviderLongitude: myStylistClicked.location._longitude,
          distance: (
            <DistanceCalculator
              serviceProviderLocation={{
                latitude: myStylistClicked.location._latitude,
                longitude: myStylistClicked.location._longitude,
              }}
            />
          ),
        });
        console.log("my stylist", myStylistClicked);
      } else {
        console.error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // You might want to handle the error appropriately, e.g., show an error message
    } finally {
      // Set loadingUserData to false to hide the loading screen
      setLoadingUserData(false);
    }
  };
  const handleSearchPress = () => {
    navigation.navigate("Search");
  };
  const renderMenuSection = () => (
    <View style={styles.menuGroup}>
      <Text style={styles.sectionTitle}>Categories</Text>

      <FlatList
        numColumns={2}
        data={menuItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMenuItem}
      />
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      nestedScrollEnabled={true}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {/* {renderPopupBanner()} */}
      {renderOverlay()}
      <View>
        <View style={styles.topBar}>
          <View style={styles.header}>
            <View style={{ paddingBottom: 15 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: COLORS.white,
                }}
              >
                Discover
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: COLORS.white,
                  }}
                >
                  Book{" "}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: COLORS.white,
                  }}
                >
                  What You Love
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.searchInputContainer}
            onPress={handleSearchPress}
          >
            <Icon name="search" size={20} style={{ marginLeft: 20 }} />
            <TextInput
              placeholder="Search"
              style={{ fontSize: 17, paddingLeft: 10 }}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>My Stylist</Text>

        {/* Horizontal FlatList for Bookings */}
        {loading ? (
          renderLoadingIndicator()
        ) : bookingsList.length === 0 ? (
          renderNoStylistMessage()
        ) : (
          <FlatList
            horizontal
            data={bookingsList}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userItems}
                onPress={() => handleBookingItem(item)}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: 100, height: 100, borderRadius: 10 }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text>{item.businessName}</Text>

                    <View style={{ marginTop: 8 }}>
                      <Text
                        style={{ color: COLORS.primary, fontWeight: "bold" }}
                      >
                        Book Again
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ width: 10 }} />} // Space between items
            showsHorizontalScrollIndicator={false}
            removeClippedSubviews={false}
          />
        )}

        {loadingUserData && (
          // Loading screen UI
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={COLORS.dark} />
          </View>
        )}
        {renderMenuSection()}
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  topBar: {
    backgroundColor: COLORS.primary,
    paddingBottom: 40,
  },
  noStylistContainer: {
    margin: 20,
  },
  noStylistText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    top: Constants.statusBarHeight,
    paddingBottom: 5,
  },
  searchInputContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: Constants.statusBarHeight + 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333", // Choose an appropriate color for a classic look
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 20, // Adjust the margin as needed
  },
  userItems: {
    elevation: 2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },

  menuItem: {
    flex: 1,
    margin: 8,
    borderRadius: 10,

    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemContainer: {
    flexDirection: "row", // Align items in a row
    alignItems: "center",
    justifyContent: "flex-start", // Align items to the start of the row (left)
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    resizeMode: "cover",
    marginLeft: 10,
  },
  menuItemText: {
    marginTop: 8,
    fontSize: 16,
    marginRight: 8,
  },
  popupBanner: {
    position: "absolute",
    top: Constants.statusBarHeight + 290,
    left: 20,
    right: 20,
    zIndex: 9999, // Ensure a high z-index value
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  closeButton: {
    padding: 5,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black color
    zIndex: 999, // Ensure the overlay appears above other content
  },
});

export default HomeScreen;

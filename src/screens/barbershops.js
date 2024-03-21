// Importing necessary React Native components and dependencies
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Constants from "expo-constants";
import COLORS from "../consts/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { API_URL } from "../components/apiConfig";

import { FontAwesome6 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import LocationHandler from "../components/LocationHandler";

// Component for the "At Business" menu
const BusinessMenu = ({
  users,
  renderUserItem,
  handleEndReached,
  renderFooter,
}) => {
  return (
    <FlatList
      data={users}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={renderUserItem}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
};

// Component for the "At Home" menu
const HomeMenu = () => {
  // Code related to "At Home" goes here
  // ...
  return (
    <View style={styles.comingSoonContainer}>
      <Text style={styles.comingSoonText}>
        Door to Door Service Coming Soon
      </Text>
    </View>
  );
};

// Main App Component
const App = () => {
  // State variables
  const [selectedMenu, setSelectedMenu] = useState("At Business");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const navigation = useNavigation();
  const userLocation = useSelector((state) => state.location.location);
  const [hasMoreItems, setHasMoreItems] = useState(true);

  // Inside fetchUsers function
  const fetchUsers = async () => {
    try {
      const response = await axios.post(`${API_URL}/barbershopUser`, {
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
      setUsers((prevUsers) =>
        page === 1 ? [...data] : [...prevUsers, ...data]
      );

      if (data.length === 0) {
        setHasMoreItems(false);
      }
      console.log(
        `Total items after page ${page}:`,
        users.length + data.length
      );
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // Check if userLocation is available before fetching data
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      console.log("User location is not available. Skipping data fetch.");
      return;
    }
    <LocationHandler />;

    // Fetch data if userLocation and userId are available
    fetchUsers();
  }, [page]);

  // Function to handle the end of the list and trigger loading more users
  const handleEndReached = () => {
    if (!loadingMore) {
      setLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Function to render each user item in the list
  const renderUserItem = ({ item }) => {
    const handleUserDetailsNavigation = () => {
      console.log("Item Data:", item.latitudeOnDatabase); // Log the item data
      navigation.navigate("UserDetails", {
        userData: item,
        distance: item.distance,
        serviceProviderLatitude: item.latitudeOnDatabase,
        serviceProviderLongitude: item.longitudeOnDatabase,
      });
    };
    return (
      <View style={styles.recommendedGroup}>
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={handleUserDetailsNavigation}
        >
          <View style={styles.userContainer}>
            <Image
              source={{ uri: item.businessPicture }}
              style={styles.userImage}
            />
            {item.portfolioImages && item.portfolioImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.portfolioImagesContainer}
              >
                {item.portfolioImages.map((portfolioImage, index) => (
                  <Image
                    key={index}
                    source={{ uri: portfolioImage }}
                    style={styles.portfolioImage}
                  />
                ))}
              </ScrollView>
            )}
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{item.businessName}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Icon
                  name="location-pin"
                  size={18}
                  style={{ marginLeft: -5 }}
                  color={COLORS.primary}
                />
                <Text style={{ fontWeight: "bold" }}>{item.distance} away</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  // Function to render the footer of the list, indicating no more items or displaying a loading indicator
  const renderFooter = () => {
    if (!hasMoreItems) {
      return (
        <View style={{ alignItems: "center", marginBottom: 80 }}>
          <Text style={{ color: COLORS.primary }}>No more items</Text>
        </View>
      );
    }

    if (loadingMore) {
      return (
        <ActivityIndicator
          size="large"
          style={{ alignSelf: "center", padding: 80 }}
          color={COLORS.primary}
        />
      );
    }

    return null;
  };

  // Array of menu items with icons
  const menuItems = [
    { label: "At Business", icon: "shop" },
    { label: "At Home", icon: "door-open" },
  ];

  // Function to handle menu item selection
  const handleMenuChange = (menuItem) => {
    setSelectedMenu(menuItem);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.statusbar} />

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View>
            <AntDesign name="back" size={24} color="black" />
          </View>
        </TouchableOpacity>
        {menuItems.map((menuItem, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              selectedMenu === menuItem.label && styles.selectedMenuItem,
            ]}
            onPress={() => handleMenuChange(menuItem.label)}
          >
            <FontAwesome6
              name={menuItem.icon}
              size={20}
              color={
                selectedMenu === menuItem.label ? COLORS.primary : COLORS.grey
              }
              style={{ paddingBottom: 5 }}
            />
            <Text
              style={[
                styles.menuItemText,
                selectedMenu === menuItem.label && styles.selectedMenuItemText,
              ]}
            >
              {menuItem.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content based on selected menu */}
      {!loading ? (
        selectedMenu === "At Business" ? (
          <BusinessMenu
            users={users}
            renderUserItem={renderUserItem}
            handleEndReached={handleEndReached}
            renderFooter={renderFooter}
          />
        ) : (
          <HomeMenu />
        )
      ) : (
        <View
          style={[
            {
              position: "absolute",
              margin: 200,
              marginTop: 300,
            },
          ]}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};
// Styles
const styles = StyleSheet.create({
  userContainer: {
    flex: 1,
    flexDirection: "column",
    marginBottom: 0,
    marginTop: 0,
    borderBottomColor: "gray",
    backgroundColor: COLORS.white,
  },
  recommendedGroup: {
    elevation: 2,
    backgroundColor: COLORS.white,

    marginTop: 1,
    padding: 10,
    marginBottom: 2,
  },
  userImage: {
    width: "100%",
    aspectRatio: 365 / 214.71, // Adjust the aspect ratio based on the original width and height
    borderRadius: 10,
    marginBottom: 10,
  },

  portfolioImagesContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  portfolioImage: {
    width: 81,
    height: 81,
    marginRight: 5,
    borderRadius: 8,
  },
  userInfoContainer: {
    padding: 8,
    borderRadius: 8,
    width: "85%",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    marginTop: Constants.statusBarHeight,
  },
  menuContainer: {
    flexDirection: "row",
    padding: 10,
    paddingBottom: 0,
  },
  backButton: {
    top: 10,
    left: 0,
    zIndex: 1,
  },

  menuItem: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,

    borderBottomColor: "transparent",
  },

  selectedMenuItem: {
    borderBottomColor: COLORS.primary,
  },

  menuItemText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8, // Add padding between icon and text
    color: COLORS.grey,
  },

  selectedMenuItemText: {
    color: COLORS.primary,
  },
  comingSoonContainer: {
    marginTop: Constants.statusBarHeight,

    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  comingSoonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
  },
});

export default App;

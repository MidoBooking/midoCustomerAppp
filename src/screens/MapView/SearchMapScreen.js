import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DistanceCalculator from "../../components/DistanceCalculator";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../consts/colors";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../components/apiConfig";

const SearchBusinesses = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true); // State to track loading status
  const navigation = useNavigation();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
      setLoading(false); // Data fetched, set loading to false
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false); // Error occurred, set loading to false
    }
  };

  const filterUsers = () => {
    return users.filter((user) => {
      return (
        user.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.services.some((service) =>
          service.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        user.serviceProviders.some((provider) =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    });
  };

  const handleUserSelect = (business) => {
    navigation.navigate("UserDetails", {
      userData: business,
      distance: (
        <DistanceCalculator
          serviceProviderLocation={{
            latitude: business.location._latitude,
            longitude: business.location._longitude,
          }}
        />
      ),
    });
  };

  const renderBusinessImage = (item) => {
    return (
      <TouchableOpacity onPress={() => handleUserSelect(item)}>
        <Image
          source={{ uri: item.businessPicture }}
          style={styles.businessImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderBusinessDetails = (item) => {
    const services = item.services.map((service) => service.name).join("\n");

    return (
      <TouchableOpacity onPress={() => handleUserSelect(item)}>
        <View style={styles.businessDetails}>
          <Text style={styles.businessName}>{item.businessName}</Text>
          <Text style={styles.services}>{services}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading indicator if data is being fetched
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
        <Ionicons
          name="search"
          size={24}
          color="black"
          style={styles.searchIcon}
        />
      </View>
      <FlatList
        data={filterUsers()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserSelect(item)}>
            <View style={styles.userContainer}>
              {renderBusinessImage(item)}
              {renderBusinessDetails(item)}
            </View>
          </TouchableOpacity>
        )}
      />

      {selectedBusiness && (
        <Modal visible={true} transparent={true}>
          <View style={styles.modalContainer}>
            <Image
              source={{ uri: selectedBusiness.businessPicture }}
              style={styles.selectedBusinessImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedBusiness(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    marginTop: Constants.statusBarHeight,
    backgroundColor: COLORS.white, // Background color for the search container
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    marginLeft: 10, // Add some left margin to separate input from icon
  },
  searchIcon: {
    marginRight: 10, // Add right margin to separate icon from input
  },

  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5, // Elevation for Android shadow
    shadowColor: "#000", // Elevation for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // Elevation for iOS shadow
    shadowOpacity: 0.25, // Elevation for iOS shadow
    shadowRadius: 3.84, // Elevation for iOS shadow
  },
  businessImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  businessContainer: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5, // Elevation for Android shadow
    shadowColor: "#000", // Elevation for iOS shadow
    shadowOffset: { width: 0, height: 2 }, // Elevation for iOS shadow
    shadowOpacity: 0.25, // Elevation for iOS shadow
    shadowRadius: 3.84, // Elevation for iOS shadow
  },
  businessDetails: {
    marginLeft: 10,
    marginLeft: 10,
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  businessOwner: {
    fontSize: 14,
    color: "gray",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  selectedBusinessImage: {
    width: "80%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  services: {
    fontSize: 14,
    color: "gray",
  },
});

export default SearchBusinesses;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import COLORS from "../../consts/colors";
import { StatusBar } from "expo-status-bar";
import { FontAwesome } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import axios from "axios";
import { API_URL } from "../../components/apiConfig";

const menus = [
  {
    title: "Gift Cards",
    goTo: "comingSoon",
    description: "Manage gift cards for your salon",
    icon: "card-giftcard",
  },
  {
    title: "Sign Out",
    description: "Sign out of your account",
    icon: "logout",
    textColor: "red",
  },
];

function SettingScreen({ navigation, route }) {
  const userId = useSelector((state) => state.user.userId);
  const { onRefresh } = route.params || {};

  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  useEffect(() => {
    // Execute the callback when the component mounts or when onRefresh changes
    if (onRefresh) {
      fetchClientData();
    }
  }, [onRefresh]);
  useEffect(() => {
    if (userId) {
      fetchClientData();
    }
  }, [userId]);
  const fetchClientData = async () => {
    try {
      const response = await axios.get(`${API_URL}/client/${userId}`);
      setClientData(response.data);
      console.log(response);
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            // Clear the user session and remove user data from AsyncStorage
            await AsyncStorage.removeItem("userId");
            navigation.replace("LoginByPhoneNumber");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleLogin = () => {
    // Navigate to the login screen
    navigation.navigate("LoginByPhoneNumber");
  };

  // Conditionally render either the full settings page or just a login button
  if (!userId) {
    return (
      <View style={styles.Logincontainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.loginMessage}>
          You are not logged in. Please login to access settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setting and Profile</Text>
      <ScrollView>
        <View style={styles.profileContainer}>
          {clientData ? (
            <>
              <View style={[styles.border, { borderColor: COLORS.primary }]}>
                {clientData.profilePicture ? (
                  <Image
                    source={{ uri: clientData.profilePicture }}
                    style={styles.profileImage}
                    onLoadStart={() => setLoadingImage(true)}
                    onLoad={() => setLoadingImage(false)}
                  />
                ) : (
                  <AntDesign
                    name="user"
                    size={150}
                    color={COLORS.dark}
                    style={{ padding: 10 }}
                  />
                )}
              </View>
              <Text style={styles.name}>{clientData.name}</Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("Profile", {
                    profilePicture: clientData.profilePicture,
                  })
                }
                style={styles.editContainer}
              >
                <FontAwesome
                  name="edit"
                  size={18}
                  color={COLORS.primary}
                  style={styles.editIcon}
                />
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ActivityIndicator size="large" color={COLORS.primary} />
          )}
        </View>

        <View style={{ padding: 20 }}>
          {menus.map((menu, index) => (
            <TouchableOpacity
              style={styles.menuItem}
              key={index}
              onPress={() =>
                menu.title === "Sign Out"
                  ? handleSignOut()
                  : navigation.navigate(menu.goTo)
              }
            >
              <View style={styles.menuItemInner}>
                {menu.icon && (
                  <MaterialIcons
                    name={menu.icon}
                    size={24}
                    color={menu.title === "Sign Out" ? "red" : "#555"}
                    style={styles.menuIcon}
                  />
                )}
                <View style={styles.menuTextContainer}>
                  <Text
                    style={[
                      styles.menuText,
                      menu.title === "Sign Out" && { color: "red" },
                    ]}
                  >
                    {menu.title}
                  </Text>
                  <Text style={styles.menuDescription}>{menu.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },
  Logincontainer: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center", // Add this to center horizontally
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: COLORS.white,
    backgroundColor: COLORS.primary,

    paddingTop: Constants.statusBarHeight,

    paddingBottom: 20,
  },
  profileContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: COLORS.white,
    borderWidth: 2,
  },
  border: {
    alignItems: "center",
    borderWidth: 3,
    borderRadius: 100,
  },
  editParentContainer: {
    justifyContent: "center", // Center items horizontally
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editIcon: {
    marginRight: 5, // Add margin to the right of the icon
    marginTop: 5,
  },
  editProfileText: {
    color: COLORS.primary,
    fontSize: 16,
  },

  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  editProfileText: {
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 5,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  menuItem: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  menuItemInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  menuIcon: {
    marginRight: 10,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000", // Default text color
  },
  menuDescription: {
    fontSize: 14,
    color: "#888",
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 55,
    borderRadius: 5,
    marginBottom: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  loginMessage: {
    color: "#888",
    marginTop: 10,
  },
});

export default SettingScreen;

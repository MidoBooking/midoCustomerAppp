import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import WebView from "react-native-webview";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import COLORS from "../../consts/colors";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { updateDoc, doc, collection, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import fbConfig from "../../firebase";
import { API_URL } from "../../components/apiConfig";

const SubAccountPayment = ({ route }) => {
  const [loading, setLoading] = useState(true);
  const [subaccountId] = useState("8775c4a5-8c99-4fc7-a8eb-395e78eff563");
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const bookingId = route.params?.bookingId;
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  console.log("booking id from subaccout is ", bookingId);

  const app = initializeApp(fbConfig);

  useEffect(() => {
    initializeSplitPayment();
  }, []);

  const initializeSplitPayment = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/payment/initialize-transaction`,
        {
          subaccountId,
        }
      );

      const createdCheckoutUrl = response.data.checkoutUrl;
      setCheckoutUrl(createdCheckoutUrl);
      setLoading(false); // Set loading to false when the URL is received
    } catch (error) {
      console.error(
        "Error initializing transaction:",
        error.response?.data || error.message
      );
      setLoading(false); // Set loading to false in case of an error
    }
  };
  const handleWebViewNavigation = async (newNavState) => {
    const { url, title } = newNavState;

    console.log("URL:", url);
    console.log("Title:", title);

    // Check if the URL matches the expected return URL
    if (url && url.includes(`${API_URL}/payment/chapa-callback`)) {
      try {
        // Update the Firebase database to mark the payment as successful
        const userBookingsRef = collection(getFirestore(app), "bookings");
        const bookingDocRef = doc(userBookingsRef, bookingId);

        await updateDoc(bookingDocRef, {
          payment: true,
        });

        console.log("Payment Successful");
        // You can trigger any additional actions upon successful payment here
      } catch (error) {
        console.error("Error updating payment status:", error);
      }
    }

    // Set checkoutUrl only if the navigation is not to the expected return URL
    if (url !== `${API_URL}/payment/chapa-callback`) {
      setCheckoutUrl(url);
    }
  };

  if (loading) {
    // Show loading indicator while waiting for the URL
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.chapa} />
      </View>
    );
  }

  if (checkoutUrl) {
    // Show WebView when URL is available
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.chapa} barStyle="light-content" />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back-outline" size={24} color="black" />
          </View>
        </TouchableOpacity>

        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={handleWebViewNavigation}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    top: Constants.statusBarHeight + 15,
    left: 10,
    zIndex: 1,
  },
  backButtonCircle: {
    backgroundColor: COLORS.white,
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SubAccountPayment;

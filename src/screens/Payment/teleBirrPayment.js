import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
import WebView from "react-native-webview";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { doc, onSnapshot, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import fbConfig from "../../firebase";
import COLORS from "../../consts/colors";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../components/apiConfig";

const app = initializeApp(fbConfig);
const firestore = getFirestore(app);

const TeleBirrPayment = () => {
  const [loading, setLoading] = useState(false);
  const telebirrLogo = require("../../assets/telebirr.png");
  const route = useRoute();
  const { bookingId, totalPrice, selectedServices } = route.params;
  console.log("totla price is", totalPrice);
  const navigation = useNavigation();
  useEffect(() => {
    const bookingRef = doc(firestore, "bookings", bookingId);

    const unsubscribe = onSnapshot(bookingRef, (doc) => {
      if (doc.exists()) {
        const paymentStatus = doc.data().payment;
        if (paymentStatus === true) {
          setTimeout(() => {
            navigation.goBack(); // Navigate back after 3 seconds
          }, 3000);
        }
      } else {
        // Handle the case where the booking document doesn't exist
      }
    });

    return () => {
      unsubscribe();
      // Clear the bookingId when component unmounts or when effect dependencies change
      bookingId = null;
    };
  }, [bookingId, navigation]);

  console.log("booking id is", bookingId);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  const generateRandomString = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const makePayment = async () => {
    setLoading(true);
    try {
      const halfTotalPrice = totalPrice / 2;
      const serviceFee = parseFloat((totalPrice * 0.015).toFixed(2));
      const nonce = generateRandomString(20); // Generate a random nonce
      const outTradeNo = generateRandomString(16); // Generate a random outTradeNo
      const finalPayment = halfTotalPrice + serviceFee;
      console.log("final Payment is", finalPayment);
      const payload = {
        nonce: nonce,
        totalAmount: halfTotalPrice + serviceFee,
        outTradeNo: outTradeNo,
        receiveName: "BOLD TECHNOLOGIES",
        returnApp: `${API_URL}/notifyUrl`,
        returnUrl: `${API_URL}/notifyUr`,
        subject:
          "Half payment for " +
          selectedServices.join(", ") +
          " (including booking fee) " +
          serviceFee +
          " Birr",

        bookingId: bookingId,
      };

      const response = await axios.post(`${API_URL}/make-payment`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseData = response.data;
      setPaymentResponse(responseData);
      console.log(responseData);
      if (
        responseData.success &&
        responseData.response &&
        responseData.response.data &&
        responseData.response.data.toPayUrl
      ) {
        setPaymentUrl(responseData.response.data.toPayUrl);
        setWebViewVisible(true);
      }
    } catch (error) {
      console.error("Error making payment:", error);
    } finally {
      setLoading(false); // Hide loading indicator when payment process is complete
    }
  };
  const handleGoBack = () => {
    navigation.goBack();
  };
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {webViewVisible && (
        <View style={styles.childContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
      )}
      {webViewVisible ? (
        <WebView source={{ uri: paymentUrl }} />
      ) : (
        <View style={styles.container}>
          <View style={styles.secondChildContainer}>
            <TouchableOpacity onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={makePayment}
            style={styles.paymentOption}
            activeOpacity={0.7}
          >
            <Image source={telebirrLogo} style={styles.logo} />
            <Text style={styles.paymentText}>Pay with telebirr</Text>
            {loading && <ActivityIndicator size="small" color="#0000ff" />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingLeft: 20,
    paddingRight: 20,
  },

  childContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 15,

    marginTop: Constants.statusBarHeight + 16,
  },
  secondChildContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 20,

    marginTop: Constants.statusBarHeight + 16,
  },

  paymentOption: {
    width: "100%",

    flexDirection: "row", // Make the container a row to align items horizontally
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.white,
    padding: 10,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    alignSelf: "flex-start", // Align the image to the left within its container
  },
  paymentText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 30,
  },
});

export default TeleBirrPayment;

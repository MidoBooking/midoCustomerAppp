import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import axios from "axios"; // Import axios for making HTTP requests
import OtpInput from "../../components/OtpInput";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUserId } from "../../redux/store";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../components/apiConfig";
import COLORS from "../../consts/colors";

const LoginByPhoneNumber = ({ setUserId, navigation }) => {
  const [selectedCountry, setSelectedCountry] = useState("+251");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [verificationId, setVerificationID] = useState(""); // Initialize verificationId state variable

  useEffect(() => {
    startCountdown(); // Start the countdown when the component mounts

    // Clear the countdown interval when the component unmounts
    return () => clearInterval();
  }, []);

  const startCountdown = () => {
    setResendDisabled(true);
    const intervalId = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          setResendDisabled(false);
          clearInterval(intervalId);
          return 60; // Reset countdown when it reaches zero
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = () => {
    startCountdown();
    handleSendVerificationCode();
  };

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);

      // Validate that the phone number has exactly 9 digits
      const numericPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
      if (numericPhoneNumber.length !== 9) {
        setInfo(<Text style={styles.errorText}>Invalid phone number</Text>);
        setLoading(false);
        return;
      }
      const fullPhoneNumber = selectedCountry + phoneNumber;

      // Check if the phone number exists in the users' collection
      const userRecord = await fetchUserRecordFromDatabase(fullPhoneNumber);

      if (userRecord) {
        // Send a POST request to your custom OTP sending route
        const response = await axios.post(
          "http://192.168.1.2:9900/otp", // Replace with your custom route URL
          { phoneNumber: fullPhoneNumber }
        );

        if (response.status === 200) {
          setVerificationID("YOUR_VERIFICATION_ID_HERE"); // Set your verification ID here
          setInfo("Verification code has been sent to your phone");
          startCountdown();
        } else {
          setInfo("Failed to send verification code");
        }
      } else {
        setInfo("Phone number not registered");
      }
    } catch (error) {
      setInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getUserRecord = async (phoneNumber) => {
    try {
      const userRecord = await fetchUserRecordFromDatabase(phoneNumber);
      return userRecord;
    } catch (error) {
      console.error("Error fetching user record:", error);
      return null;
    }
  };

  const checkPhoneNumber = async (phoneNumber) => {
    const usersCollection = collection(firestore, "Clients");
    const q = query(usersCollection, where("phoneNumber", "==", phoneNumber));

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userRecord = querySnapshot.docs[0].data();
        return userRecord;
      } else {
        return null; // User not found
      }
    } catch (error) {
      console.error("Error fetching user record:", error);
      return null;
    }
  };

  const fetchUserRecordFromDatabase = async (phoneNumber) => {
    console.log("Fetching user record for phone number:", phoneNumber);
    try {
      // Make a POST request to the /check route to verify if the phone number exists
      const response = await axios.post("http://192.168.1.2:9900/check", {
        phoneNumber,
      });

      if (response.status === 200 && response.data.exists) {
        // Phone number exists
        console.log("User record found for phone number:", phoneNumber);
        return true;
      } else {
        // Phone number doesn't exist
        console.log("User record not found for phone number:", phoneNumber);
        return false;
      }
    } catch (error) {
      console.error("Error fetching user record:", error);
      return null;
    }
  };
  const [userToken, setUserToken] = useState();
  useEffect(() => {
    // Request permission for push notifications
    const getPushNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        console.log("Notification permissions granted!");
      }
    };

    // Get the device token
    const getDevicePushToken = async () => {
      const { data: token } = await Notifications.getExpoPushTokenAsync();
      console.log("Expo Push Token:", token);
      setUserToken(token);
    };

    getPushNotificationPermission();
    getDevicePushToken();
  }, []);

  const sendExpoPushNotification = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/send-expo-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userToken,
          title: "Notification Title",
          body: "Notification Body",
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Expo push notification sent successfully:", responseData);
      } else {
        console.error("Error sending Expo push notification:", responseData);
      }
    } catch (error) {
      console.error("Error sending Expo push notification:", error);
    }
  };

  const notRegistered = () => {
    navigation.navigate("RegisterbyPhoneNumber");
  };

  useEffect(() => {
    AsyncStorage.getItem("userId").then((userId) => {
      if (userId) {
        setUserId(userId);
        navigation.navigate("Main");
      }
    });
  }, [setUserId, navigation]);

  useEffect(() => {
    startCountdown(); // Start the countdown when the component mounts

    // Clear the countdown interval when the component unmounts
    return () => clearInterval();
  }, []);
  const handleVerifyVerificationCode = async () => {
    try {
      setVerifyLoading(true);

      // Perform verification of the verification code entered by the user
      const numericPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
      if (numericPhoneNumber.length !== 9) {
        setInfo(<Text style={styles.errorText}>Invalid phone number</Text>);
        setLoading(false);
        return;
      }
      const fullPhoneNumber = selectedCountry + numericPhoneNumber;
      // Example: Send a POST request to your backend to verify the code
      const response = await axios.post(
        "http://192.168.1.2:9900/verify", // Replace with your backend route URL
        { phoneNumber: fullPhoneNumber, otp: verificationCode }
      );

      // Handle response based on the verification result
      if (response.status === 200) {
        // Verification successful
        console.log("Verification successful");
        // Proceed with further actions such as setting the user ID or navigating to the main screen
      } else {
        // Verification failed
        console.log("Verification failed");
        // Handle the failure case accordingly
      }
    } catch (error) {
      console.error("Error verifying verification code:", error);
      // Handle error
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.statusbar} />

      <Image
        source={require("../../assets/Mido_Colored_Logo.png")}
        style={styles.logo}
      />
      {info && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{info}</Text>
        </View>
      )}
      {!verificationId ? (
        <View>
          <Text style={styles.headerText}>Login with Phone Number</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.countryCodeText}>{selectedCountry}</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              maxLength={9}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/[^0-9]/g, ""))
              }
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendVerificationCode}
            disabled={!phoneNumber || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Send Verification Code</Text>
            )}
          </TouchableOpacity>

          <View
            style={{ flexDirection: "row", marginTop: 20, alignSelf: "center" }}
          >
            <Text style={styles.registerText}> Not registered yet? </Text>
            <TouchableOpacity onPress={notRegistered}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <OtpInput numberOfInputs={6} onOtpChange={setVerificationCode} />
          <TouchableOpacity
            style={styles.button}
            disabled={
              !verificationCode ||
              verificationCode.length !== 6 ||
              verifyLoading
            } // Disable button when loading
            onPress={handleVerifyVerificationCode}
          >
            {verifyLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={resendDisabled}
          >
            <Text style={styles.resendButtonText}>
              Resend{resendDisabled ? ` (${countdown}s)` : ""}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  headerText: {
    color: COLORS.dark,
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
  },
  subHeaderText: {
    color: COLORS.primary,
    fontSize: 18,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: "center",
  },
  errorText: {
    color: COLORS.warning,
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderColor: COLORS.primary,
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  countryCodeText: {
    marginRight: 5,
    fontSize: 18,
    color: COLORS.dark,
    fontWeight: "bold",
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  verificationCodeInput: {
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  infoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
  },
  infoText: {
    color: "black",
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  registerLink: {
    color: "#003f5c",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerText: {
    color: "black",
    fontSize: 16,
  },
  resendButton: {
    marginLeft: 10,
    padding: 10,
  },
  resendButtonText: {
    color: COLORS.primary,
    fontSize: 16,
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    setUserId: (userId) => dispatch(setUserId(userId)),
  };
};

export default connect(null, mapDispatchToProps)(LoginByPhoneNumber);

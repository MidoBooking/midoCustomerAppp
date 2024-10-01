import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios"; // Import axios for making HTTP requests
import OtpInput from "../../components/OtpInput";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setUserId } from "../../redux/store";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../components/apiConfig";
import COLORS from "../../consts/colors";
import { useNavigation } from "@react-navigation/native";

const RegisterbyPhoneNumber = ({ setUserId }) => {
  const navigation = useNavigation();
  const [selectedCountry, setSelectedCountry] = useState("+251");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [verificationId, setVerificationID] = useState(false);

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
        console.log("user record found again");
        setInfo("You are already registered please login");

        setVerificationID(false);
        setLoading(false);
      } else {
        // User record not found, proceed to send verification code directly
        const response = await axios.post(
          `${API_URL}/registerOTP`, // Replace with your custom route URL
          { phoneNumber: fullPhoneNumber }
        );

        if (response.status === 200) {
          setInfo(
            <Text style={styles.verificaitonCode}>
              Verification code sent to {fullPhoneNumber}
            </Text>
          );
          setVerificationID(true); // <-- Here we should set verificationId to true
          startCountdown();
        } else {
          setInfo("Failed to send verification code");
        }
      }
    } catch (error) {
      setInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecordFromDatabase = async (phoneNumber) => {
    console.log("Fetching user record for phone number:", phoneNumber);
    try {
      // Make a POST request to the /check route to verify if the phone number exists
      const response = await axios.post(`${API_URL}/registerCheck`, {
        phoneNumber,
      });

      if (response.status === 200 && response.data.exists) {
        const userId = response.data.userId; // Extracting user ID from the response
        setUserId(userId);
        console.log(
          "User record found for phone number:",
          phoneNumber,
          "User ID:",
          userId
        );
        return { exists: true, userId }; // Return object with exists flag and userId
      } else {
        // Phone number doesn't exist
        console.log("User record not found for phone number:", phoneNumber);
        return { exists: false };
      }
    } catch (error) {
      console.error("Error fetching user record:", error);
      return null;
    }
  };

  const alreadyRegistered = () => {
    navigation.navigate("LoginByPhoneNumber");
  };

  useEffect(() => {
    AsyncStorage.getItem("userId").then((userId) => {
      if (userId) {
        setUserId(userId);
        console.log("user from register page", userId);
        navigation.navigate("Main");
      }
    });
  }, [setUserId]);

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
        `${API_URL}/registerVerify`, // Replace with your backend route URL
        { phoneNumber: fullPhoneNumber, otp: verificationCode }
      );

      if (response.status === 200) {
        // Verification successful
        const userId = response.data.userId; // Extract userId from the response

        console.log("Verification successful");
        // Store the userId in AsyncStorage
        await AsyncStorage.setItem("userId", userId);
        setUserId(userId); // Update userId in Redux state
        console.log("user id from register is", userId);
        // In the source component where you're navigating from
        navigation.replace("AboutYou");
      } else {
        // Verification failed
        console.log("Verification failed");
        // Handle the failure case accordingly
      }
    } catch (error) {
      console.error("Error verifying verification code:", error);
      setInfo("Verification code is not correct");
      // Handle error
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        <View>
          {verificationId ? (
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
          ) : (
            <View>
              <Text style={styles.headerText}>Register with Phone Number</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.countryCodeText}>{selectedCountry}</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="911223344"
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
                style={{
                  flexDirection: "row",
                  marginTop: 20,
                  alignSelf: "center",
                }}
              >
                <Text style={styles.registerText}> Already registered? </Text>
                <TouchableOpacity onPress={alreadyRegistered}>
                  <Text style={styles.registerLink}>Login here</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
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
  verificaitonCode: {
    color: COLORS.approvedBookingColor,
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
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
    color: "red",
    fontSize: 16,
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
  },
  registerLink: {
    color: "#007bff",
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

export default connect(null, mapDispatchToProps)(RegisterbyPhoneNumber);

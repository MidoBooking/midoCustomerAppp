import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import fbConfig from "../../firebase";
import { setUserId } from "../../redux/store";
import { connect } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../consts/colors";
import OtpInput from "../../components/OtpInput";
try {
  initializeApp(fbConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const auth = getAuth();

const RegisterbyPhoneNumber = ({ setUserId }) => {
  const [selectedCountry, setSelectedCountry] = useState("+251");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationID] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);

  const [resendActive, setResendActive] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const navigation = useNavigation();
  const recaptchaVerifier = useRef(null);

  const attemptInvisibleVerification = false;

  const savePhoneNumberToFirestore = async (user, phoneNumber) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, "Clients", user.uid);
      await setDoc(userDocRef, { phoneNumber }, { merge: true });
      console.log("Phone number saved to Firestore");
    } catch (error) {
      console.error("Error saving phone number to Firestore:", error);
    }
  };
  const handleSendVerificationCode = async () => {
    try {
      setIsLoading(true); // Set loading state to true
      // Validate that the phone number has exactly 9 digits
      const numericPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
      if (numericPhoneNumber.length !== 9) {
        setInfo(<Text style={styles.errorText}>Invalid phone number</Text>);
        setIsLoading(false);
        return;
      }
      const fullPhoneNumber = selectedCountry + phoneNumber;
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        fullPhoneNumber,
        recaptchaVerifier.current
      );
      setVerificationID(verificationId);
      setInfo(
        <Text style={styles.verificaitonCode}>
          Verification code sent to ${fullPhoneNumber}
        </Text>
      );

      setResendActive(true);
      const interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      setTimeout(() => {
        setResendActive(false);
        setIsLoading(false); // Set loading state to false
        clearInterval(interval);
        setResendTimer(60);
      }, 60000);
    } catch (error) {
      if (error.code === "auth/invalid-phone-number") {
        setInfo(<Text style={styles.errorText}>Invalid phone number</Text>);
        setIsLoading(false);
      } else {
        setInfo(`Error: ${error.message}`);
        setIsLoading(false); // Set loading state to false on error
      }
    }
  };

  const handleVerifyVerificationCode = async () => {
    try {
      setIsLoadingVerify(true); // Set loading state to true

      const credential = PhoneAuthProvider.credential(
        verificationId,
        confirmationCode
      );
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      console.log(user.uid);
      setUserId(user.uid);
      savePhoneNumberToFirestore(user, selectedCountry + phoneNumber);

      setInfo("Success: Phone authentication successful");
      navigation.replace("AboutYou");
    } catch (error) {
      setInfo(`Error: ${error.message}`);
    } finally {
      setIsLoadingVerify(false); // Set loading state to false
    }
  };

  const alreadyRegisterd = () => {
    navigation.navigate("LoginByPhoneNumber");
  };
  return (
    <View style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={fbConfig}
      />
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
          <Text style={styles.text}>Enter your phone number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCodeText}>{selectedCountry}</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="912131415"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              maxLength={9}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/[^0-9]/g, ""))
              }
            />
          </View>

          <TouchableOpacity
            style={styles.sendVerificationCode}
            onPress={handleSendVerificationCode}
            disabled={!phoneNumber || resendActive}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.sendVerificationCodeText}>Next</Text>
            )}
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              marginTop: 20,
              alignSelf: "center",
            }}
          >
            <Text style={styles.loginText}> Not registered yet? </Text>
            <TouchableOpacity onPress={alreadyRegisterd}>
              <Text style={styles.loginLink}>Login here</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <Text style={styles.text}>Enter the verification code</Text>

          <OtpInput numberOfInputs={6} onOtpChange={setConfirmationCode} />

          <TouchableOpacity
            style={
              confirmationCode
                ? styles.sendVerificationCode
                : styles.sendVerificationCodeDisabled
            }
            onPress={handleVerifyVerificationCode}
            disabled={!confirmationCode}
          >
            <Text style={styles.sendVerificationCodeText}>Verify</Text>
          </TouchableOpacity>

          {resendActive ? (
            <TouchableOpacity disabled>
              <Text style={styles.ResendVerificationCodeText}>
                {`Resend Code in ${resendTimer} seconds`}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resendContainer}>
              <Text>Didn't receive a code? </Text>
              <TouchableOpacity onPress={handleSendVerificationCode}>
                <Text style={styles.resendVerificationCodeText}> Resend</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
      {attemptInvisibleVerification && <FirebaseRecaptchaBanner />}
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
  text: {
    color: COLORS.dark,
    fontSize: 16,
    marginBottom: 10,
    alignSelf: "center",
  },
  verificationCodeText: {
    fontSize: 18,
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
  phoneInputContainer: {
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

    borderColor: "#333",
    fontSize: 20,
  },
  sendVerificationCode: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: "center",
    borderRadius: 10,
  },
  sendVerificationCodeDisabled: {
    marginTop: 20,
    backgroundColor: "gray",
    padding: 16,
    alignItems: "center",
    borderRadius: 10,
  },
  verificationCodeInput: {
    fontSize: 18,
    borderWidth: 1, // Added border properties
    borderColor: "#333",
    borderRadius: 5,
    padding: 10,
  },
  resendContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center", // Center items vertically
    justifyContent: "center", // Center items horizontally
  },
  ResendVerificationCodeText: {
    marginTop: 20,
    color: COLORS.dark,
    alignSelf: "center",
  },
  resendVerificationCodeText: {
    color: "#0059D6",
    fontSize: 18,
  },
  sendVerificationCodeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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
    textAlign: "center", // Center text horizontally
  },
  loginLink: {
    color: "#003f5c",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginText: {
    color: "black",

    fontSize: 16,
  },
});

const mapDispatchToProps = (dispatch) => {
  return {
    setUserId: (userId) => dispatch(setUserId(userId)),
  };
};

export default connect(null, mapDispatchToProps)(RegisterbyPhoneNumber);

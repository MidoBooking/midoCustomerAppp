import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import useInternetConnectivity from "../../components/useInternetConnectivity";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { API_URL } from "../../components/apiConfig";
import COLORS from "../../consts/colors";
import axios from "axios";

function AboutYou() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const userId = useSelector((state) => state.user.userId);

  console.log("user id is from about you page is ", userId);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPickerShow, setIsPickerShow] = useState(false);
  const [dateOfBirth, setdateOfBirth] = useState(new Date());
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);

  const formatDate = (date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${month}/${day}/${year}`;
  };

  const showGenderModal = () => {
    setIsGenderModalVisible(true);
  };

  const hideGenderModal = () => {
    setIsGenderModalVisible(false);
  };

  const selectGender = (selectedGender) => {
    setGender(selectedGender);
    hideGenderModal();
  };

  const showPicker = () => {
    setIsPickerShow(true);
  };

  const onChange = (event, value) => {
    if (value !== undefined) {
      setdateOfBirth(value);
    }
    if (Platform.OS === "android") {
      setIsPickerShow(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !gender || !dateOfBirth) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);

    const formattedDateOfBirth = `${(dateOfBirth.getMonth() + 1)
      .toString()
      .padStart(
        2,
        "0"
      )}/${dateOfBirth.getDate().toString().padStart(2, "0")}/${dateOfBirth.getFullYear()}`;

    console.log(name, gender, formattedDateOfBirth);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const location = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };
      console.log("location is", location);

      const aboutYouSet = true;

      const response = await axios.post(`${API_URL}/clientRegister/${userId}`, {
        name,
        gender,
        dateOfBirth: formattedDateOfBirth,
        location,
        aboutYouSet,
      });

      if (response.status === 200) {
        console.log("User information stored successfully");
        navigation.navigate("profileImage");
      } else {
        console.error("Failed to store user information:", response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.header}></View>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Text style={styles.pageTitle}>Profile Setup</Text>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Select</Text>

            <TouchableOpacity onPress={showGenderModal} style={styles.input}>
              {gender ? (
                <Text>{gender}</Text>
              ) : (
                <Text style={styles.placeholderText}>Select Gender</Text>
              )}
            </TouchableOpacity>
          </View>
          <Modal
            isVisible={isGenderModalVisible}
            onBackdropPress={hideGenderModal}
            animationIn="fadeIn"
            animationOut="fadeOut"
            backdropTransitionOutTiming={0}
            backdropTransitionInTiming={0}
          >
            <View style={styles.genderModalContainer}>
              <Text style={styles.genderModalTitle}>Select Gender</Text>
              <TouchableOpacity
                onPress={() => selectGender("male")}
                style={styles.genderOption}
              >
                <Text>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => selectGender("female")}
                style={styles.genderOption}
              >
                <Text>Female</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Birth Date</Text>
            {!isPickerShow && (
              <View style={styles.btnContainer}>
                <TouchableOpacity
                  onPress={showPicker}
                  style={styles.selectDateButton}
                >
                  <Text style={styles.selectDateButtonText}>
                    {dateOfBirth.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isPickerShow && (
              <DateTimePicker
                value={dateOfBirth}
                mode={"date"}
                display="spinner"
                is24Hour={true}
                onChange={onChange}
                style={styles.datePicker}
              />
            )}
          </View>
          <TouchableOpacity onPress={handleRegister} style={styles.registerBtn}>
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.registerText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Constants.statusBarHeight + 16,
    marginBottom: 20,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: Constants.statusBarHeight - 100,
    paddingBottom: 20,
    alignSelf: "center",
  },
  inputContainer: {
    flexDirection: "column",
    marginBottom: 20,
  },

  input: {
    width: "80%", // Take up 80% of the width
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginTop: 8, // Add some spacing between label and input
    alignSelf: "center", // Align input in the center of the container
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.dark,
    fontWeight: "bold",
    marginLeft: 40,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  registerBtn: {
    width: "70%",
    backgroundColor: COLORS.dark,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginVertical: 8,
    alignSelf: "center",
    width: "80%",
  },
  datePicker: {
    width: 320,
    height: 260,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    color: COLORS.dark,
  },
  genderModalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  genderModalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  genderOption: {
    padding: 10,
  },
  placeholderText: {
    color: "#777",
  },
});

export default AboutYou;

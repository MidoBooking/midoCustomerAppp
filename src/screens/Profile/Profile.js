import React, { useEffect, useState } from "react";
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
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as Location from "expo-location";
import Constants from "expo-constants";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal"; // Import the react-native-modal library
import COLORS from "../../consts/colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import axios from "axios";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../components/apiConfig";

const Profile = ({ route }) => {
  const { profilePicture } = route.params;
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const userId = useSelector((state) => state.user.userId);
  console.log("user id is", userId);
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
    setIsLoading(true);
    const formattedDateOfBirth = `${(dateOfBirth.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${dateOfBirth
      .getDate()
      .toString()
      .padStart(2, "0")}/${dateOfBirth.getFullYear()}`;

    console.log(name, gender, formattedDateOfBirth);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        setIsLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const location = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };
      const aboutYouSet = true;

      const response = await axios.post(`${API_URL}/updateClient/${userId}`, {
        name,
        gender,
        dateOfBirth: formattedDateOfBirth,
        location,
        aboutYouSet,
      });

      if (response.status === 200) {
        console.log("User information updated successfully");
        // Move the navigation here after the successful response
        Alert.alert("Success", "Updated successfully", [
          { text: "OK", onPress: () => navigation.navigate("Main") },
        ]);
      } else {
        const responseBody = await response.json();
        console.error("Failed to update user information:", responseBody.error);
        // Handle the failure case, e.g., show an error message to the user
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDetails();
  }, []);
  const parseDateString = (dateString) => {
    const [month, day, year] = dateString.split("/");
    // Ensure that month, day, and year are valid numbers
    const parsedMonth = parseInt(month, 10);
    const parsedDay = parseInt(day, 10);
    const parsedYear = parseInt(year, 10);

    // Check if the parsed values are valid numbers
    if (isNaN(parsedMonth) || isNaN(parsedDay) || isNaN(parsedYear)) {
      console.error("Invalid date format:", dateString);
      return null; // Return null or handle the error as needed
    }

    return new Date(parsedYear, parsedMonth - 1, parsedDay); // Month is 0-indexed
  };
  const fetchClientDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/client/${userId}`);
      const clientDetails = response.data;
      console.log(clientDetails);

      // Use setUserName to update the state with the fetched name
      setName(clientDetails.name);
      const formattedDateOfBirth = parseDateString(clientDetails.dateOfBirth);

      if (formattedDateOfBirth) {
        setdateOfBirth(formattedDateOfBirth);
      } else {
        console.error("Failed to parse date of birth");
      }
      setGender(clientDetails.gender);
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.statusbar}
        />

        <Text style={styles.title}>Edit your profile</Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color={COLORS.dark} />
        </TouchableOpacity>

        <View style={styles.profileContainer}>
          <View style={[styles.border, { borderColor: COLORS.primary }]}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <AntDesign
                name="user"
                size={155}
                color="black"
                style={{ padding: 10 }}
              />
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate("editProfileImage")}
              style={styles.editContainer}
            >
              <FontAwesome
                name="edit"
                size={18}
                color={COLORS.primary}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity onPress={showGenderModal} style={styles.input}>
          {gender ? (
            <Text>{gender}</Text>
          ) : (
            <Text style={styles.placeholderText}>gender</Text>
          )}
        </TouchableOpacity>
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

        <TouchableOpacity
          onPress={handleRegister}
          style={styles.RegisterBtn}
          disabled={isLoading} // Disable the button when loading
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.RegisterText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: Constants.statusBarHeight + 16,
    left: 16,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 170,
    height: 170,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    position: "absolute",
    top: Constants.statusBarHeight + 16,
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
  profileContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },

  editContainer: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 12,
    marginVertical: 8,
    alignSelf: "center",
    width: "80%",
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  alreadyRegisteredText: {
    color: "black",
    fontSize: 19,
  },
  noteRegisteredLink: {
    color: "#003f5c",
    fontWeight: "bold",
    fontSize: 19,
  },
  RegisterBtn: {
    width: "50%",
    backgroundColor: COLORS.dark,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  RegisterText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  pickedDateContainer: {
    padding: 20,
    backgroundColor: "#eee",
    borderRadius: 10,
  },
  pickedDate: {
    fontSize: 18,
    color: "black",
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
  // This only works on iOS
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
  genderModalCloseButton: {
    marginTop: 10,
  },
  placeholderText: {
    color: "#777",
  },
});

export default Profile;

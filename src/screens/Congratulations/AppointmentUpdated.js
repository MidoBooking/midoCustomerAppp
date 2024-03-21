import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import COLORS from "../../consts/colors";

const AppointmentUpdated = () => {
  const navigation = useNavigation();

  const handleLoginButtonPress = () => {
    navigation.navigate("Appointments", { refresh: true }); // Replace 'Login' with the actual name of your login screen
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <FontAwesome
        name="check-circle"
        size={80}
        color="white"
        style={styles.icon}
      />
      <Text style={styles.congratulationsText}>Updated successfully</Text>

      <TouchableOpacity style={styles.button} onPress={handleLoginButtonPress}>
        <Text style={styles.buttonText}>Go to Appointments</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 40, // Add padding to accommodate the button at the bottom
  },
  icon: {
    marginBottom: 20,
  },
  congratulationsText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Customize the text color
  },
  subtitleText: {
    fontSize: 16,
    textAlign: "center",
    color: "white", // Customize the text color
    marginTop: 10,
  },
  button: {
    backgroundColor: "#191919", // Customize the button background color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white", // Customize the button text color
  },
});

export default AppointmentUpdated;

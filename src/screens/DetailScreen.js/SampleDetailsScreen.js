import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "react-native-vector-icons";
import COLORS from "../../consts/colors";

const SampleDetailsScreen = ({ route }) => {
  const { userData } = route.params;
  const [selectedServices, setSelectedServices] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    console.log("User Data:", userData);
  }, [userData]);
  const handleServiceSelection = (service) => {
    const isSelected = selectedServices.includes(service);
    if (isSelected) {
      setSelectedServices(selectedServices.filter((item) => item !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleBookButtonPress = () => {
    if (selectedServices.length === 0) {
      Alert.alert(
        "Please Select a Service",
        "You need to select at least one service before booking."
      );
      return;
    }

    const selectedServiceNames = selectedServices.map(
      (service) => service.name
    );
    const totalPrice = selectedServices.reduce(
      (acc, service) => acc + parseFloat(service.price),
      0
    );
    const totalDuration = selectedServices.reduce(
      (acc, service) => acc + parseFloat(service.duration),
      0
    );

    navigation.navigate("EmployeeList", {
      sourceComponent: "userDetails",
      userId: userData.id,
      serviceDuration: totalDuration,
      selectedServiceNames: selectedServiceNames,
      businessName: userData.businessName,
      businessPhoneNumber: userData.phoneNumber,
      imageUrl: userData.businessPicture,
      totalPrice: totalPrice,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.businessName}>{userData.businessName}</Text>
        <Text style={styles.sectionTitle}>Services</Text>
        {userData.services && userData.services.length > 0 ? (
          <View>
            {userData.services.map((service, index) => (
              <TouchableOpacity
                key={index}
                style={styles.serviceContainer}
                onPress={() => handleServiceSelection(service)}
              >
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    selectedServices.includes(service) &&
                      styles.selectedRadioButton,
                  ]}
                  onPress={() => handleServiceSelection(service)}
                >
                  {selectedServices.includes(service) && (
                    <MaterialIcons
                      name="check"
                      style={styles.radioButtonIcon}
                    />
                  )}
                </TouchableOpacity>
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNameContainer}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDuration}>
                      {service.duration} minutes
                    </Text>
                  </View>
                  <View style={styles.servicePriceContainer}>
                    <Text style={styles.servicePrice}>
                      {service.price} Birr
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noServicesText}>No services available</Text>
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.bottomBookButton}
        onPress={handleBookButtonPress}
      >
        <Text style={styles.bottomBookButtonText}>Book</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  businessName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.dark,
    marginTop: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: COLORS.dark,
  },
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    backgroundColor: COLORS.primary,
  },
  radioButtonIcon: {
    fontSize: 16,
    color: COLORS.white,
  },
  serviceInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceNameContainer: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  serviceDuration: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  servicePriceContainer: {
    marginLeft: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  noServicesText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: 20,
  },
  bottomBookButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.dark,
    alignItems: "center",
  },
  bottomBookButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default SampleDetailsScreen;

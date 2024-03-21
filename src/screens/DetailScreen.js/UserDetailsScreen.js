import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Button,
  PanResponder,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "react-native-vector-icons";
import COLORS from "../../consts/colors";
import { WebView } from "react-native-webview";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const UserDetailsScreen = ({ route }) => {
  const {
    distance,
    userData,
    serviceProviderLatitude,
    serviceProviderLongitude,
  } = route.params;

  const userLocation = useSelector((state) => state.location.location);
  const [mapLocation, setMapLocation] = useState([]);
  console.log("service provider latitude", serviceProviderLatitude);
  console.log("service provider longitude", serviceProviderLongitude);

  useEffect(() => {
    if (userLocation && serviceProviderLatitude && serviceProviderLongitude) {
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${serviceProviderLatitude},${serviceProviderLongitude}`;
      const serviceProviderLocation = [origin, destination];
      setMapLocation([origin, destination]);

      console.log("Map Location:", serviceProviderLocation);
    }
  }, [userLocation, serviceProviderLatitude, serviceProviderLongitude]);

  const [selectedMenuItem, setSelectedMenuItem] = useState("Services");
  const [selectedServices, setSelectedServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Index of the selected image
  const navigation = useNavigation();

  const handleServiceSelection = (service) => {
    const isSelected = selectedServices.includes(service);

    if (isSelected) {
      setSelectedServices(selectedServices.filter((item) => item !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleBookButtonPress = () => {
    if (selectedServices.length > 0) {
      const selectedServiceNames = selectedServices.map(
        (service) => service.name
      );
      const selectedServicePrices = selectedServices.map((service) =>
        parseFloat(service.price)
      ); // Convert to numbers
      const selectedServiceDurations = selectedServices.map((service) =>
        parseFloat(service.duration)
      ); // Convert to numbers

      // Calculate the total price by summing selected prices
      const totalPrice = selectedServicePrices.reduce(
        (acc, price) => acc + price,
        0
      );

      // Calculate the total duration by summing selected durations
      const totalDuration = selectedServiceDurations.reduce(
        (acc, duration) => acc + duration,
        0
      );

      console.log("Selected Service Names:", selectedServiceNames);
      console.log("Total Price:", totalPrice);
      console.log("Total Duration:", totalDuration);

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
    }
  };

  const handleMenuItemPress = (item) => {
    setSelectedMenuItem(item);
  };

  const handlePortfolioImagePress = (index) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === userData.portfolioImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prevIndex) =>
      prevIndex === 0 ? userData.portfolioImages.length - 1 : prevIndex - 1
    );
  };
  const closeModal = () => {
    setModalVisible(false);
  };
  const menuItems = ["Services", "Portfolio", "Information"];
  const businessInformation = {
    businessName: userData.businessName,
    businessCategories: userData.businesscategories.join(", "),
    businessPhoneNumber: userData.phoneNumber,
  };

  const userInformation = {
    userName: userData.name,
    phoneNumber: userData.serviceProviders[0].phone, // Assuming the first service provider's phone is the user's phone
  };

  const serviceProvidersInformation = userData.serviceProviders.map(
    (provider) => ({
      name: provider.name,
      phone: provider.phone,
    })
  );

  const servicesInformation = userData.services.map((service) => ({
    name: service.name,
    duration: `${service.duration} minutes`,
    price: `${service.price} Birr`,
  }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      // Handle swipe gestures here
      const { dx } = gestureState;
      if (Math.abs(dx) > 50) {
        // Minimum swipe distance threshold
        if (dx > 0) {
          handlePrevImage();
        } else {
          handleNextImage();
        }
      }
    },
  });

  const handleMapIconClick = () => {
    console.log(
      "location data is",
      userData.latitudeOnDatabase,
      userData.longitudeOnDatabase
    );
    navigation.navigate("ServiceProviderOnMapScreen", {
      latitude: serviceProviderLatitude,
      longitude: serviceProviderLongitude,
      imageUrl: userData.businessPicture,
      businessName: userData.businessName,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.userDetails}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Image
            source={{ uri: userData.businessPicture }}
            style={styles.userImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.businessInfoContainer}>
          <Text style={styles.businessName}>{userData.businessName}</Text>
        </View>
        <View style={styles.locationContainer}>
          <MaterialIcons
            name="location-on"
            size={18}
            color={COLORS.primary}
            style={styles.locationIcon}
          />
          <Text style={styles.location}>{distance} Away</Text>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.menuScrollView}
          showsHorizontalScrollIndicator={false}
        >
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                selectedMenuItem === item && styles.activeMenuItem,
              ]}
              onPress={() => handleMenuItemPress(item)}
            >
              <Text
                style={[
                  styles.menuItemText,
                  selectedMenuItem === item && styles.activeMenuItemText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.menuLine} />

        {selectedMenuItem === "Services" && userData.services ? (
          <View style={styles.container}>
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
                  </View>
                  <View style={styles.servicePriceContainer}>
                    <Text style={styles.servicePrice}>
                      {service.price} Birr
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.bottomBookButton}
              onPress={handleBookButtonPress}
            >
              <Text style={styles.bottomBookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        ) : selectedMenuItem === "Portfolio" &&
          userData.portfolioImages &&
          userData.portfolioImages.length > 0 ? (
          <ScrollView
            horizontal
            contentContainerStyle={styles.portfolioImagesContainer}
            showsHorizontalScrollIndicator={false}
            {...panResponder.panHandlers}
          >
            {userData.portfolioImages.map((portfolioImage, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePortfolioImagePress(index)}
              >
                <Image
                  source={{ uri: portfolioImage }}
                  style={styles.portfolioImage}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          selectedMenuItem === "Information" && (
            <View style={styles.container}>
              <View style={styles.businessInfoContainer}>
                <Text style={styles.sectionTitle}>Business Information</Text>
                <Text style={styles.boldInfoText}>
                  <Text style={styles.labelText}>Name:</Text>{" "}
                  {businessInformation.businessName}
                </Text>

                <Text style={styles.boldInfoText}>
                  <Text style={styles.labelText}>business Categories:</Text>{" "}
                  {businessInformation.businessCategories}
                </Text>
                <Text style={styles.boldInfoText}>
                  <Text style={styles.labelText}>business Phone Number:</Text>{" "}
                  {businessInformation.businessPhoneNumber}
                </Text>
              </View>

              <View style={styles.businessInfoContainer}>
                <Text style={styles.sectionTitle}>Service Providers</Text>
                {serviceProvidersInformation.map((provider, index) => (
                  <Text
                    key={index}
                    style={styles.boldInfoText}
                  >{`${provider.name}: ${provider.phone}`}</Text>
                ))}
              </View>

              <View style={styles.businessInfoContainer}>
                <Text style={styles.sectionTitle}>Services</Text>
                {servicesInformation.map((service, index) => (
                  <Text
                    key={index}
                    style={styles.boldInfoText}
                  >{`${service.name}: ${service.duration}, ${service.price}`}</Text>
                ))}
              </View>
            </View>
          )
        )}
      </ScrollView>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Modal
            transparent={true} // Make modal background transparent
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(false);
            }}
          >
            <TouchableOpacity
              style={styles.modalBackdrop} // Style to cover the entire screen
              onPress={() => setModalVisible(false)} // Close modal when backdrop is clicked
            >
              <View style={styles.modalContainer}>
                <Image
                  source={{ uri: userData.portfolioImages[selectedImageIndex] }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.prevImageButton}
                    onPress={handlePrevImage}
                  >
                    <Text style={styles.buttonText}>Prev</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.nextImageButton}
                    onPress={handleNextImage}
                  >
                    <Text style={styles.buttonText}>Next</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>
      <TouchableOpacity
        style={styles.mapIconContainer}
        onPress={handleMapIconClick}
      >
        <MaterialIcons name="location-on" size={30} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    top: Constants.statusBarHeight + 16,
    left: 0,
    zIndex: 1,
  },

  backButtonCircle: {
    backgroundColor: COLORS.dark,
    width: 30,
    height: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  userImage: {
    width: windowWidth,
    aspectRatio: 16 / 9.39,
    borderRadius: 8,
    marginBottom: 8,
  },
  userDetails: {
    alignItems: "center",
  },
  businessInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  businessName: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "bold",
    marginRight: 8,
  },

  phoneIcon: {
    marginRight: 4,
  },
  phoneText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationIcon: {
    marginRight: 4,
  },
  location: {
    fontSize: 14,
    textAlign: "left",
    color: COLORS.primary,
  },
  menuScrollView: {
    alignItems: "center",
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activeMenuItem: {
    backgroundColor: COLORS.dark,
  },
  activeMenuItemText: {
    color: "white",
  },
  menuLine: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginVertical: 16,
  },
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomColor: "gray",
    elevation: 2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 10,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  serviceNameContainer: {
    flex: 1,
  },
  serviceName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  servicePriceContainer: {
    marginLeft: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  radioButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedRadioButton: {
    backgroundColor: COLORS.primary,
  },
  radioButtonIcon: {
    fontSize: 16,
    color: "white",
  },
  bottomBookButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.dark,
    alignItems: "center",
  },
  bottomBookButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 5,
  },
  portfolioImagesContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10, //
    flexDirection: "column",
  },

  portfolioImage: {
    width: windowWidth - 35, // Adjust the width as needed
    height: windowWidth / 2, // Adjust the height as needed
    marginBottom: 10, // Add margin at the bottom if needed
    borderRadius: 8,
  },
  businessInfoContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: COLORS.dark,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.textDark,
  },

  labelText: {
    fontWeight: "bold",
    color: COLORS.labelColor, // You can define a color for the label text
    marginRight: 5, // Adjust the spacing between the label and the value if needed
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    position: "relative", // Position relative for absolute positioning of buttons
  },

  modalImage: {
    width: Dimensions.get("window").width, // Adjust width to full screen width
    aspectRatio: 16 / 16, // Adjust aspect ratio as needed
    borderRadius: 8,
    marginBottom: 10,
    position: "relative", // Position relative for absolute positioning of buttons
  },
  modalButtons: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align buttons vertically in the middle
    width: "100%", // Full width of the image container
    height: "100%", // Full height of the image container
    top: 0, // Positioned at the top of the image container
    padding: 0,
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    justifyContent: "center",
    alignItems: "center",
  },
  prevImageButton: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    paddingVertical: "50%", // Take full height of the image
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  nextImageButton: {
    backgroundColor: "rgba(0, 0, 0, 0)",
    paddingVertical: "50%", // Take full height of the image
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
  },
  mapIconContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default UserDetailsScreen;

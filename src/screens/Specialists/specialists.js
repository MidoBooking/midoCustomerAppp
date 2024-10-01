import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
  StatusBar,
} from "react-native";
import Modal from "react-native-modal";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { Platform } from "react-native";

import moment from "moment";
import momentTimezone from "moment-timezone";
import { useRoute } from "@react-navigation/native";
import { API_URL } from "../../components/apiConfig";
import COLORS from "../../consts/colors";
import { useNavigation } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import axios from "axios";
import Snackbar from "../../components/SnackBar";
const ServiceProviderList = () => {
  //const userId = useSelector((state) => state.user.userId);
  const userId = "2WTmB1OoKfOwsbGAZbD5xGcztil1";
  const expoPushToken = useSelector(
    (state) => state.pushNotification.pushNotification.data
  );
  console.log("expo push token", expoPushToken);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [selectedServiceProvider, setSelectedServiceProvider] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedBusinessOwnerId, setSelectedBusinessOwnerId] = useState(null);
  const [bookingDataFromDatabase, setBookingDataFromDatabase] = useState([]);
  const [allBookedBookings, setAllBookedBookings] = useState([]);
  const [selectedServiceProviderId, setSelectedServiceProviderId] =
    useState(null);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [clients, setClient] = useState([]);

  const [isConfirmationModalVisible, setIsConfirmationModalVisible] =
    useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const navigation = useNavigation();
  const [bookingData, setBookingData] = useState({
    businessOwnerId: null,
    serviceProviderId: null,
    selectedDate: null,
    selectedCalendar: null,
    services: [],
    selectedServiceProviderImage: null,
    selectedServiceProviderName: null,
    totalPrice: 0,
    selectedTimeSlot: null,
    businessName: null,
    imageUrl: null,
  });

  const route = useRoute();
  const sourceComponent = route.params?.sourceComponent;
  const serviceDuration = route.params?.serviceDuration;
  const businessOwnerId = route.params?.userId;
  const selectedServiceNames = route.params?.selectedServiceNames;
  const totalPrice = route.params?.totalPrice;
  const businessName = route.params?.businessName;
  const imageUrl = route.params?.imageUrl;
  const businessPhoneNumber = route.params?.businessPhoneNumber;
  const selectedBookingId = route.params?.selectedBookingId;
  const [selectedTimeSlotColor, setSelectedTimeSlotColor] = useState("#3F66DA"); // Set the initial color

  const handleServiceProviderSelect = (provider) => {
    setSelectedServiceProviderId(provider.serviceProviderId);
    setSelectedBusinessOwnerId(businessOwnerId);

    // Clear the previous selections
    setSelectedDay(null);
    setSelectedStartTime(null);
    setSelectedEndTime(null);
    setSelectedTimeSlot(null);

    setSelectedServiceProvider(provider);
  };

  const handleTimeSlotSelect = (timeSlot) => {
    const formattedTimeSlot = getFormattedTime(moment(timeSlot, "hh:mm A "));
    setSelectedTimeSlot(formattedTimeSlot);
  };

  useEffect(() => {
    fetch(`${API_URL}/users/${businessOwnerId}/serviceProviders`)
      .then((response) => response.json())
      .then((data) => {
        // Filter service providers with workingHoursStatus set to true
        const filteredServiceProviders = data.filter(
          (provider) => provider.workingHoursStatus === true
        );

        setServiceProviders(filteredServiceProviders);
        setIsLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const period = hours < 12 ? "AM" : "PM";
    return `${hours % 12}:${minutes} ${period}`;
  };

  const today = moment().format("dddd");
  const todayIndex = weekDays.indexOf(today);
  const filteredWeekDays = weekDays
    .slice(todayIndex)
    .concat(weekDays.slice(0, todayIndex));

  const convertToEthiopianTime = (currentTime) => {
    const ethiopianOffset = 6; // Ethiopian time is 6 hours ahead of GMT
    const ethiopianCurrentTime = currentTime
      .clone()
      .add(ethiopianOffset, "hours");

    // Adjust time based on Ethiopian intervals
    const ethiopianHour = ethiopianCurrentTime.hour();

    if (ethiopianHour >= 0 && ethiopianHour < 6) {
      ethiopianCurrentTime.add(-12, "hours");
    } else if (ethiopianHour >= 6 && ethiopianHour < 12) {
      ethiopianCurrentTime.add(-12, "hours");
    } else if (ethiopianHour >= 12 && ethiopianHour < 18) {
      ethiopianCurrentTime.add(-12, "hours");
    } else {
      ethiopianCurrentTime.add(-12, "hours");
    }

    return ethiopianCurrentTime;
  };
  const calculateTimeSlots = () => {
    if (
      selectedStartTime &&
      selectedEndTime &&
      serviceDuration &&
      selectedDay
    ) {
      const currentTime = moment(); // Get the current time

      // Convert the current time to Ethiopian time manually
      const ethiopianCurrentTime = convertToEthiopianTime(currentTime);

      let startTime = moment(selectedStartTime, "hh:mm A");
      let endTime = moment(selectedEndTime, "hh:mm A");

      if (selectedDay === today && startTime.isBefore(ethiopianCurrentTime)) {
        // If the selected day is today, manually set the start time
        startTime = ethiopianCurrentTime.clone().add(10, "minutes");
      }

      // Use the dynamic booking data from the server
      const bookedSlots = bookingDataFromDatabase.map((bookedData) => ({
        start: moment(bookedData.selectedTimeSlot, "hh:mm A"),
        end: moment(bookedData.selectedEndTime, "hh:mm A"),
        duration: bookedData.serviceDuration, // Add duration of existing bookings
      }));

      // Sort booked slots by start time
      bookedSlots.sort((a, b) => a.start.diff(b.start));

      const timeSlots = [];
      let currentTimeSlot = startTime.clone();

      // Generate time slots dynamically based on the current time, start time, and end time
      while (
        currentTimeSlot.isBefore(endTime) ||
        currentTimeSlot.isSame(endTime, "minute")
      ) {
        const formattedTime = getFormattedTime(currentTimeSlot);
        const isTimeSlotEnabled =
          selectedServiceProvider?.workingHours[selectedDay]?.isEnabled ||
          false;

        if (isTimeSlotEnabled) {
          let isOverlapping = false;

          // Check for overlapping with booked slots
          for (let i = 0; i < bookedSlots.length; i++) {
            const bookedSlot = bookedSlots[i];

            // Calculate the end time of the current slot based on its duration
            const endTimeOfCurrentSlot = currentTimeSlot
              .clone()
              .add(serviceDuration, "minutes");

            // Check if the current slot overlaps with the booked slot
            if (
              currentTimeSlot.isSameOrBefore(bookedSlot.end) && // Current slot starts before or at the same time as booked slot
              endTimeOfCurrentSlot.isSameOrAfter(bookedSlot.start) // Current slot ends after or at the same time as booked slot
            ) {
              isOverlapping = true;
              break; // No need to check further if overlapping is found
            }
          }

          if (!isOverlapping) {
            timeSlots.push(formattedTime);
          }
        }

        currentTimeSlot.add(15, "minutes");
      }

      return timeSlots;
    }

    return [];
  };

  const getFormattedTimeWithoutAMPM = (time) => {
    const hour = moment(time, "hh:mm A").hour();
    let formattedTime = moment(time, "hh:mm A").format("hh:mm");
    let label;
    let labelColor;

    if (hour >= 0 && hour < 6) {
      label = "AM";
      labelColor = "#9C27B0";
    } else if (hour >= 6 && hour < 12) {
      label = "AM";
      labelColor = "#2E8B57"; // Change this to your desired color
    } else if (hour >= 12 && hour < 18) {
      label = "PM";
      labelColor = "#9C27B0";
    } else {
      label = "PM";
      labelColor = "#2E8B57";
    }

    return { formattedTime, label, labelColor };
  };

  const getFormattedTime = (time) => {
    const hour = time.hour();
    const formattedTime = time.format("HH:mm");

    if (hour >= 0 && hour < 6) {
      return formattedTime;
    } else if (hour >= 6 && hour < 12) {
      return formattedTime;
    } else if (hour >= 12 && hour < 18) {
      return formattedTime;
    } else {
      return formattedTime;
    }
  };

  const timeSlots = calculateTimeSlots();

  const numCols = 4;
  const numRows = Math.ceil(timeSlots.length / numCols);

  const timeSlotRows = [];
  for (let row = 0; row < numRows; row++) {
    const rowStart = row * numCols;
    const rowEnd = Math.min(rowStart + numCols, timeSlots.length);
    timeSlotRows.push(timeSlots.slice(rowStart, rowEnd));
  }
  const handleDaySelect = async (day) => {
    setSelectedTimeSlot(null);
    setBookingDataFromDatabase([]);
    setAllBookedBookings([]);
    setSelectedDay(day);
    const startWorkingHour = moment(
      selectedServiceProvider.workingHours[day].start,
      "hh:mm A"
    );
    const endWorkingHour = moment(
      selectedServiceProvider.workingHours[day].end,
      "hh:mm A"
    );

    setSelectedStartTime(startWorkingHour.format("HH:mm")); // Set in 24-hour format
    setSelectedEndTime(endWorkingHour.format("HH:mm"));

    // Format the date as "DD/MM/YYYY" and update the selectedCalendar state
    const currentDate = moment().add(filteredWeekDays.indexOf(day), "days");
    const formattedDate = currentDate.format("DD/MM/YYYY");
    setSelectedCalendar((prevSelectedCalendar) => {
      return formattedDate;
    });
  };
  useEffect(() => {
    if (
      selectedBusinessOwnerId &&
      selectedServiceProviderId &&
      selectedCalendar
    ) {
      const fetchData = async () => {
        try {
          const apiUrl = `${API_URL}/fetchBooking?businessOwnerId=${selectedBusinessOwnerId}&selectedCalendar=${selectedCalendar}&serviceProviderId=${selectedServiceProviderId}`;

          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();

          if (data && data.bookings && data.bookings.length > 0) {
            // Filter bookings based on the 'approved' field
            const approvedBookings = data.bookings.filter(
              (booking) => booking.approved === true
            );
            const allBookedBookings = data.bookings;
            setAllBookedBookings(allBookedBookings);
            setBookingDataFromDatabase(approvedBookings);

            data.bookings.forEach((bookedData, index) => {});
          } else {
            console.log(
              "No matching bookings found for the specified criteria."
            );
          }
        } catch (error) {
          console.error("Error fetching booking data:", error);
        }
      };

      fetchData(); // Call the fetchData function when the relevant state is updated
    }
  }, [selectedBusinessOwnerId, selectedServiceProviderId, selectedCalendar]);
  // ...

  const handleBooking = async () => {
    // Check if userId is available
    if (!userId) {
      // Display an alert notifying the user to log in
      Alert.alert(
        "Not Logged In",
        "Please log in to proceed with the booking.",
        [
          {
            text: "Login",
            onPress: () => {
              // Navigate to the login screen
              navigation.navigate("LoginByPhoneNumber");
            },
          },
        ],
        { cancelable: false }
      );
      return;
    }
    // Check if all required data is available
    if (
      businessOwnerId &&
      selectedServiceProvider &&
      selectedDay &&
      selectedTimeSlot
    ) {
      try {
        setIsLoadingBooking(true);

        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.error("Permission to access location was denied");
          // Handle the case where location permission is denied
          // Display an alert to notify the user about the denied permission
          Alert.alert(
            "Permission Denied",
            "Permission to access location was denied. Please enable location services in your device settings.",
            [{ text: "OK", onPress: () => console.log("OK Pressed") }],
            { cancelable: false }
          );
          return;
        }

        // Get the user's current location
        const locationData = await Location.getCurrentPositionAsync({});

        const location = {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        };

        // Calculate end time based on selected time slot and service duration
        const startTime = moment(selectedTimeSlot, "hh:mm A");
        const endTime = startTime.clone().add(serviceDuration, "minutes");

        // Update the bookingData state
        setBookingData({
          businessOwnerId,
          serviceProviderId: selectedServiceProvider.serviceProviderId,
          selectedDate: selectedDay,
          selectedCalendar,
          services: selectedServiceNames,
          selectedServiceProviderImage: selectedServiceProvider.imageUrl,
          selectedServiceProviderName: selectedServiceProvider.name,
          totalPrice,
          selectedTimeSlot: getFormattedTime(startTime),
          selectedEndTime: getFormattedTime(endTime),
          userId,
          businessName,
          serviceDuration,
          userLocation: location,
          imageUrl,
          expoPushToken,
        });
        // Log the booking data
        console.log("Booking Data:", bookingData);

        // Check for double booking
        // Check for double booking

        const isDoubleBooking = allBookedBookings.some((booking) => {
          return (
            booking.selectedCalendar === selectedCalendar &&
            booking.selectedTimeSlot === selectedTimeSlot &&
            booking.businessOwnerId === businessOwnerId &&
            booking.serviceProviderId ===
              selectedServiceProvider.serviceProviderId &&
            booking.userId === userId
          );
        });

        if (isDoubleBooking) {
          // Show alert for double booking

          Alert.alert(
            "Double Booking Detected",
            "You already have another pending appointment with the same day, time slot, and service provider.",
            [{ text: "OK", onPress: () => {} }]
          );
          setIsLoadingBooking(false); // Set loading state to false
          return;
        } else {
          setIsLoadingBooking(false);

          // Show the confirmation modal

          setIsConfirmationModalVisible(true);
        }

        if (isDoubleBooking) {
          // Show alert for double booking
          Alert.alert(
            "Double Booking Detected",
            "You already have another pending appointment with the same day, time slot, and service provider.",
            [{ text: "OK", onPress: () => {} }]
          );
        } else {
          setIsLoadingBooking(false);

          // Show the confirmation modal
          setIsConfirmationModalVisible(true);
        }
      } catch (error) {
        console.error("Error getting location", error);
        // Handle the case where an error occurs while getting the location
      }
    } else {
      // Handle the case where required data is missing
      console.error("Missing required data for booking");
      // Optionally, you can display an error message to the user.
    }
  };

  const handleUpdate = async () => {
    selectedServiceProvider.serviceProviderId,
      selectedDay,
      selectedCalendar,
      selectedBookingId;

    const startTime = moment(selectedTimeSlot, "hh:mm A");
    const endTime = startTime.clone().add(serviceDuration, "minutes");

    getFormattedTime(endTime);
    getFormattedTime(endTime);
    try {
      // Calculate endTime
      const startTime = moment(selectedTimeSlot, "hh:mm A");
      const endTime = startTime.clone().add(serviceDuration, "minutes");

      // Format endTime
      const formattedEndTime = getFormattedTime(endTime);

      // Make HTTP request to update booking
      await axios.put(`${API_URL}/editBooking/${selectedBookingId}`, {
        selectedServiceProviderId: selectedServiceProvider.serviceProviderId,
        selectedDate: selectedDay,
        selectedCalendar,
        selectedBookingId,
        selectedTimeSlot,
        serviceDuration,
        formattedEndTime,
      });

      // Handle success

      navigation.navigate("appointmentUpdated");
    } catch (error) {
      // Handle error
      console.error("Error updating booking:", error);
    }
  };
  const sendSms = async () => {
    const requestData = {
      phoneNumber: businessPhoneNumber,
      name: clients.name,
      businessName: businessName,
      selectedServiceProviderName: selectedServiceProvider.name,
      selectedServiceProviderPhone: selectedServiceProvider.phone,
      selectedtimeslot: selectedTimeSlot,
      selectedCalendar: selectedCalendar,
      businessOwnerId: selectedBusinessOwnerId,
      serviceProviderId: selectedServiceProviderId,
    };

    try {
      // Send data to the server
      const response = await fetch(`${API_URL}/marketing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Check the response status
      if (response.ok) {
        console.log("sms sent seucessfully");
      } else {
        console.error("Failed to send sms");
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };
  const handleConfirmation = async () => {
    // Perform any actions you want when the user confirms the booking.
    // For example, you can navigate to a confirmation screen or display a success message.

    // Make the API request to submit the booking data
    if (bookingData) {
      fetch(`${API_URL}/setBooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response from the server (e.g., success or error)

          // Optionally, you can navigate to a confirmation screen or display a success message.
          sendSms();

          navigation.navigate("Appointments", {
            showSnackbar: true,
            businessName: businessName, // Assuming businessName is defined in your component
          });
          console.log("business name is", businessName);
        })
        .catch((error) => {
          console.error("Error making the booking:", error);
          // Handle the error, e.g., show an error message to the user.
        });
      setIsLoadingBooking(false);
      // Close the confirmation modal
      setIsConfirmationModalVisible(false);
    }
  };
  const closeModal = () => {
    setIsConfirmationModalVisible(false);
    setIsLoadingBooking(false);
  };

  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.statusbar} />

      {isLoadingBooking && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
        </View>
      )}

      <Modal
        isVisible={isConfirmationModalVisible}
        onBackdropPress={closeModal}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        backdropTransitionInTiming={0}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButtonContainer}
              onPress={() => setIsConfirmationModalVisible(false)}
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              hitSlop={{ top: 10, right: 10, bottom: 20, left: 20 }}
            ></TouchableOpacity>

            <View style={styles.titleAndCloseContainer}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitleText}>Booking Confirmation</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsConfirmationModalVisible(false)}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <Feather name="x" style={styles.closeButtonText} />
              </TouchableOpacity>
            </View>
            <View style={styles.imangeNameContainer}>
              <Image
                source={{ uri: bookingData.selectedServiceProviderImage }}
                style={styles.providerImage}
              />
            </View>
            <View style={styles.bookingDataContainer}>
              <View style={styles.bookingDataItem}>
                <Text style={styles.bookingDataLabel}>Service Provider:</Text>
                <Text style={styles.bookingDataValue}>
                  {bookingData.selectedServiceProviderName}
                </Text>
              </View>
              <View style={styles.bookingDataItem}>
                <Text style={styles.bookingDataLabel}>Date:</Text>
                <Text style={styles.bookingDataValue}>
                  {selectedDay} {bookingData.selectedCalendar}
                </Text>
              </View>

              <View style={styles.bookingDataItem}>
                <Text style={styles.bookingDataLabel}>Service:</Text>
                <Text style={styles.bookingDataValue}>
                  {selectedServiceNames.join(", ")}
                </Text>
              </View>

              <View style={styles.bookingDataItem}>
                <Text style={styles.bookingDataLabel}>Total Price:</Text>
                <Text style={styles.bookingDataValue}>
                  {bookingData.totalPrice.toFixed(2)} Birr
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmation}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Select Specialist</Text>
        </View>

        <FlatList
          data={serviceProviders}
          keyExtractor={(item) => item.serviceProviderId}
          horizontal={true}
          renderItem={({ item }) => (
            <View
              style={[
                styles.serviceProviderContainer,
                styles.serviceProviderItem,
                selectedServiceProvider === item &&
                  styles.selectedServiceProviderItem,
              ]}
            >
              <TouchableOpacity
                onPress={() => handleServiceProviderSelect(item)}
              >
                <Image
                  source={
                    item.imageUrl
                      ? { uri: item.imageUrl }
                      : require("../../assets/avator.png")
                  }
                  onError={() => handleImageError(item)}
                  style={styles.serviceProviderImage}
                />

                <Text
                  style={[
                    styles.serviceProviderName,
                    selectedServiceProvider === item &&
                      styles.selectedServiceProviderName,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {serviceProviders.length === 0 && (
          <View style={styles.noServiceProviderContainer}>
            <Text style={styles.noServiceProviderText}>
              service providers not found
            </Text>
          </View>
        )}

        {selectedServiceProvider && (
          <View style={styles.workingHoursContainer}>
            <Text style={styles.sectionTitle}>Select a day</Text>
            <ScrollView horizontal={true}>
              {filteredWeekDays.map((day, index) => {
                // Calculate the date for this day of the week
                const currentDate = moment().add(index, "days");
                const isToday = currentDate.isSame(moment(), "day"); // Check if it's today

                // Check if the day is closed
                const isDayEnabled =
                  selectedServiceProvider.workingHours[day]?.isEnabled || false;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayColumn,
                      !isDayEnabled && {
                        backgroundColor: "#e0e0e0",
                      },
                      selectedDay === day && styles.highlighted,
                    ]}
                    onPress={() => handleDaySelect(day)}
                  >
                    <View style={styles.dayInfoContainer}>
                      {isToday ? (
                        <Text
                          style={[
                            styles.todayText,
                            selectedDay === day && {
                              color: "white",
                            },
                          ]}
                        >
                          Today
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.dayText,
                            selectedDay === day && styles.selectedDayText,
                          ]}
                        >
                          {day}
                        </Text>
                      )}
                      {/* Add conditional styling for day of the month circle and text */}
                      <View
                        style={[
                          styles.dayOfMonthCircle,
                          selectedDay === day && {
                            backgroundColor: "white",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayOfMonthText,
                            selectedDay === day && {
                              color: COLORS.primary,
                            },
                          ]}
                        >
                          {currentDate.date()}
                        </Text>
                      </View>
                    </View>

                    {/* Display "Closed" text for closed days */}
                    {!isDayEnabled && (
                      <View style={styles.closedTextContainer}>
                        <Text style={styles.closedText}>Closed</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.sectionTitle}>
            Available Slot - Ethiopian Time
          </Text>

          {timeSlotRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.timeSlotsRow}>
              {row.map((timeSlot, colIndex) => {
                const isTimeSlotEnabled =
                  selectedServiceProvider?.workingHours[selectedDay]
                    ?.isEnabled || false;

                // Use the getFormattedTimeWithoutAMPM function
                const { formattedTime, label, labelColor } =
                  getFormattedTimeWithoutAMPM(timeSlot);

                return (
                  isTimeSlotEnabled && (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.timeSlotItem,
                        selectedTimeSlot === timeSlot &&
                          styles.selectedTimeSlot,
                      ]}
                      onPress={() => handleTimeSlotSelect(timeSlot)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedTimeSlot === timeSlot &&
                            styles.selectedTimeSlotText,
                          {
                            color:
                              selectedTimeSlot === timeSlot
                                ? "white"
                                : labelColor,
                          }, // Change text color dynamically
                        ]}
                      >
                        {formattedTime}
                      </Text>
                      <Text
                        style={[
                          styles.labelText,
                          selectedTimeSlot === timeSlot &&
                            styles.selectedLabelText,
                          {
                            color:
                              selectedTimeSlot === timeSlot
                                ? "white"
                                : labelColor,
                          }, // Change label color dynamically
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  )
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
      {sourceComponent === "userDetails" &&
        selectedServiceProvider &&
        selectedDay &&
        selectedTimeSlot && (
          <TouchableOpacity
            style={styles.bookNowButton}
            onPress={handleBooking} // Call the handleBooking function when the button is pressed
          >
            <Text style={styles.bookNowButtonText}>Book Now</Text>
          </TouchableOpacity>
        )}
      {sourceComponent === "Appointments" &&
        selectedServiceProvider &&
        selectedDay &&
        selectedTimeSlot && (
          <TouchableOpacity
            style={styles.updateNowButton}
            onPress={handleUpdate} // Call the handleUpdate function when the button is pressed
          >
            <Text style={styles.updateNowButtonText}>Update Now</Text>
          </TouchableOpacity>
        )}
    </View>
  );
};
const styles = StyleSheet.create({
  serviceProviderContainer: {
    marginRight: 10,
    alignItems: "center", // Center the content horizontally
    elevation: 2, // Add a subtle shadow effect
    backgroundColor: COLORS.white, // Add a background color if needed
    borderRadius: 10, // Customize border radius
    padding: 5, // Add padding to the group
  },
  serviceProviderItem: {
    alignItems: "center", // Center the content horizontally
  },
  serviceProviderImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10, // Add some margin for spacing
  },

  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
    marginTop: Platform.OS === "ios" ? 25 : 0,
  },
  serviceProviderItem: {
    width: 120,
    marginRight: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  serviceProviderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  workingHoursContainer: {
    marginTop: 20,
    elevation: 2, // Add a subtle shadow effect
    backgroundColor: COLORS.white, // Add a background color if needed
    borderRadius: 10, // Customize border radius
    padding: 10, // Add padding to the group
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 15,
    marginLeft: 10,
  },
  dayColumn: {
    marginRight: 20,
    padding: 10,
    backgroundColor: "#e0e0e0",

    borderWidth: 1,
    borderColor: "gray",
  },

  selectedDayColumn: {
    backgroundColor: "lightblue", // Change the background color when selected
  },

  dayText: {
    fontWeight: "bold",
    marginBottom: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  selectedDay: {
    fontSize: 16,
    marginTop: 10,
  },
  timeRange: {
    fontSize: 16,
  },
  timeSlotsContainer: {
    marginTop: 20,

    elevation: 2, // Add a subtle shadow effect
    backgroundColor: COLORS.white, // Add a background color if needed
    borderRadius: 10, // Customize border radius
    padding: 10, // Add padding to the group
    marginBottom: 18,
  },
  timeSlotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeSlotItem: {
    flex: 1,
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
  },
  bookNowButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 16,
    alignItems: "center",
  },
  updateNowButton: {
    marginTop: 20,
    backgroundColor: COLORS.updateNow,
    padding: 16,
    alignItems: "center",
  },
  bookNowButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  updateNowButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  serviceProviderItem: {
    marginRight: 10,
  },
  serviceProviderImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  serviceProviderName: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    textAlign: "center",
    fontSize: 12, // Adjust the font size as needed
    fontWeight: "bold",
    color: COLORS.white,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dayColumn: {
    marginRight: 20,
    padding: 10,
    borderRadius: 8,
  },
  // Define the highlight style
  highlighted: {
    backgroundColor: COLORS.primary, // Customize the highlight color
  },
  selectedServiceProviderItem: {
    backgroundColor: COLORS.primary, // Change the background color when selected
  },
  selectedTimeSlotText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    color: "white", // Set text color to white for selected time slot
  },
  selectedDayText: {
    fontWeight: "bold",
    marginBottom: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "white", // Set text color to white for selected day
  },
  dayOfMonthCircle: {
    width: 25, // Adjust the size of the circle as needed
    height: 25, // Adjust the size of the circle as needed
    borderRadius: 12, // Make sure it's half of the width and height to create a circle
    backgroundColor: COLORS.primary, // Change the background color as needed
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
  },

  dayOfMonthText: {
    color: "white", // Set the text color to white
    fontSize: 16, // Adjust the font size as needed
  },

  dayInfoContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Center horizontally
  },
  todayText: {
    color: COLORS.primary,
    fontSize: 19, // Adjust the font size as needed
    fontWeight: "bold", // Adjust the weight as needed
    textAlign: "center", // Center the text horizontally
    borderRadius: 8, // Adjust the border radius as needed
    paddingTop: 6,
    paddingBottom: 10, // Adjust the padding as needed
  },
  modalContainer: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    width: "100%", // Adjust the width as needed
    position: "relative", // Add relative positioning
    borderRadius: 20,
  },
  titleAndCloseContainer: {
    marginBottom: 10,
  },
  modalTitleContainer: {
    //backgroundColor: COLORS.secondary,
    padding: 15,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginBottom: 10,
  },
  modalTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.dark,
  },
  modalTitle: {
    fontSize: 20, // Increase the font size for the title
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  imangeNameContainer: {
    alignItems: "center",
  },
  providerImage: {
    width: 150, // Increase the image size
    height: 150, // Increase the image size
    borderRadius: 15, // Make it a perfect circle
    marginTop: 10,
    marginBottom: 10,
  },
  bookingDataContainer: {
    marginTop: 20,
    marginLeft: 55,
  },
  bookingDataItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 10,
  },
  bookingDataLabel: {
    fontWeight: "bold",
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 5,
  },
  bookingDataValue: {
    flex: 1,

    fontSize: 16,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: COLORS.dark,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButtonContainer: {
    position: "absolute",
    top: 10, // Adjust the top positioning
    right: 10, // Adjust the right positioning
  },
  closeButton: {
    position: "absolute",
    top: 15, // Move it to the top
    right: 10, // Move it to the right
    backgroundColor: COLORS.warning,
    padding: 4,
    borderRadius: 10, // Make it a circle
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  closedTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closedText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.warning,
  },
  noServiceProviderContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noServiceProviderText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
});

export default ServiceProviderList;

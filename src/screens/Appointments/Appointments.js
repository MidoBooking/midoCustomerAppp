import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Linking,
} from "react-native";
import Constants from "expo-constants";
import { useSelector } from "react-redux";
import { API_URL } from "../../components/apiConfig";
import Modal from "react-native-modal";
import COLORS from "../../consts/colors";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import fbConfig from "../../firebase";
import { initializeApp } from "firebase/app";
import axios from "axios";
import WebView from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import DistanceCalculator from "../../components/DistanceCalculator";

const app = initializeApp(fbConfig);
export default function Appointments({ route }) {
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigation = useNavigation();

  const userId = useSelector((state) => state.user.userId);
  const handleSearchPress = () => {
    navigation.navigate("Search");
  };
  const fetchData = () => {
    const userBookingsRef = collection(getFirestore(app), "bookings");

    // Listen for real-time updates
    const unsubscribe = onSnapshot(
      query(userBookingsRef, where("userId", "==", userId)),
      (querySnapshot) => {
        if (querySnapshot.empty) {
          setLoading(false);
          setBookingsList([]);
        } else {
          const currentDate = new Date();
          const formattedCurrentDate = formatDate(currentDate);

          const bookings = querySnapshot.docs
            .map((doc) => ({
              id: doc.id, // Make sure to include the document ID as 'id'
              ...doc.data(),
            }))
            .filter((booking) => {
              return booking.selectedCalendar >= formattedCurrentDate;
            })
            .map((booking) => ({
              key: booking.id,
              id: booking.id,
              businessName: booking.businessName,
              selectedDate: booking.selectedDate,
              selectedCalendar: booking.selectedCalendar,
              selectedTimeSlot: booking.selectedTimeSlot,
              imageUrl: booking.imageUrl,
              approved: booking.approved,
              payment: booking.payment,
              businessOwnerId: booking.businessOwnerId,
              totalPrice: booking.totalPrice,
              bookedServices: booking.services,
            }));

          setBookingsList(bookings);
          console.log(bookings);
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
        setBookingsList([]);
      }
    );
    return () => unsubscribe();
  };
  const handleRejection = async () => {
    if (!selectedBooking) {
      return; // No appointment selected, handle accordingly
    }

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this booking?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const userBookingsRef = collection(getFirestore(app), "bookings");

            try {
              await deleteDoc(doc(userBookingsRef, selectedBooking.id));
              // Successful deletion, update the state to re-render the UI
              setBookingsList((prevBookings) =>
                prevBookings.filter(
                  (booking) => booking.id !== selectedBooking.id
                )
              );
              setModalVisible(false);
            } catch (error) {
              console.error("Error deleting appointment:", error);
              // Handle deletion error, show user-friendly message if needed
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleEdit = () => {
    console.log("edit appointment");
  };
  const handleAppointmentPress = (appointment) => {
    console.log("Selected Booking on Press:", appointment.id);
    setSelectedBooking(appointment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handlePayment = () => {
    if (selectedBooking && selectedBooking.approved) {
      navigation.navigate("teleBirrPayment", {
        bookingId: selectedBooking.id,
        totalPrice: selectedBooking.totalPrice,
        selectedServices: selectedBooking.bookedServices,
      });
      closeModal();
    }
  };
  const handleReschedule = async (bookingItem) => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/booking/${bookingItem.id}`);

      if (response.status === 200) {
        const selectedBooking = response.data;

        navigation.navigate("EmployeeList", {
          sourceComponent: "Appointments",
          userId: selectedBooking.businessOwnerId,
          serviceDuration: selectedBooking.serviceDuration,
          selectedServiceNames: selectedBooking.services,
          totalPrice: selectedBooking.totalPrice,
          selectedBookingId: bookingItem.id,
        });
      } else {
        console.error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // You might want to handle the error appropriately, e.g., show an error message
    } finally {
      setModalVisible(false);

      //setLoadingUserData(false);
    }
  };
  const getTimePeriod = (time) => {
    if (!time) {
      return { period: "", time: "" }; // Return empty values if time is undefined
    }

    const hours = parseInt(time.split(":")[0]);
    const minutes = parseInt(time.split(":")[1]);
    let period;

    if (hours >= 0 && hours < 12) {
      period = hours < 6 ? "Morning" : "Afternoon";
    } else {
      period = "Evening";
    }

    const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert hours to 12-hour format
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, "0")}`;

    return { period, time: formattedTime };
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <FlatList
        data={bookingsList}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleAppointmentPress(item)}>
            <View style={styles.bookingContainer}>
              <View style={styles.rowContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.bookingImage}
                />
                <View style={styles.textContainer}>
                  <Text style={styles.businessName}>{item.businessName}</Text>

                  <Text style={styles.businessName}>{item.selectedDate}</Text>

                  <View style={styles.timeContainer}>
                    <Text style={styles.selectedTimeSlot}>
                      {getTimePeriod(item.selectedTimeSlot).time}
                    </Text>
                    <Text style={styles.selectedTimeIndicator}>
                      {getTimePeriod(item.selectedTimeSlot).period}
                    </Text>
                  </View>

                  {item.approved && (
                    <View style={styles.approvedContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={COLORS.secondary}
                      />
                      <Text style={styles.approvedText}>Approved</Text>
                    </View>
                  )}
                  {item.payment && (
                    <View style={styles.approvedContainer}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="green"
                      />
                      <Text style={styles.paymentText}>Payment Successful</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.key}
        ListEmptyComponent={() => (
          <View style={styles.noAppointmentsContainer}>
            <Text style={styles.noAppointmentsHeader}>
              No Upcomming Appointments
            </Text>
            <Text style={styles.noAppointmentsText}>
              Your upcoming appointments will appear when you book.
            </Text>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchPress}
            >
              <Text style={styles.searchButtonText}>Search Salons</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Selected Salon</Text>
          <Text style={styles.value}>{selectedBooking?.businessName}</Text>

          <Text style={styles.label}>Selected Date</Text>
          <Text style={styles.value}>{selectedBooking?.selectedDate}</Text>

          <Text style={styles.label}>Selected Time </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.value}>
              {getTimePeriod(selectedBooking?.selectedTimeSlot).time}
            </Text>
            <Text style={styles.value}>
              {getTimePeriod(selectedBooking?.selectedTimeSlot).period}
            </Text>
          </View>

          <Text style={styles.label}>Total Price </Text>
          <Text style={styles.value}>{selectedBooking?.totalPrice} Birr</Text>
          <Text style={styles.label}>First payment (half price) </Text>
          <Text style={styles.value}>
            {selectedBooking?.totalPrice / 2} Birr
          </Text>
          <Text style={styles.label}>Booking Fee </Text>
          <Text style={styles.value}>
            {(selectedBooking?.totalPrice * 0.015).toFixed(2)} Birr
          </Text>
          <View style={styles.buttonContainer}>
            {selectedBooking?.payment ? (
              <TouchableOpacity
                style={styles.rescheduleButton}
                onPress={() => handleReschedule(selectedBooking)}
              >
                <Text style={styles.buttonText}>Edit Booking</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleRejection}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={
                !selectedBooking?.approved
                  ? styles.payButton
                  : styles.hiddenButton
              }
            >
              <Text style={styles.buttonText}>Pending...</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={selectedBooking?.payment ? () => {} : handlePayment}
              style={
                selectedBooking?.approved && selectedBooking?.payment
                  ? styles.successfulButton // If payment is successful, show successful button
                  : selectedBooking?.approved
                    ? styles.payButton // If booking is approved and payment is pending, show pay button
                    : styles.hiddenButton // If booking is not approved, hide the button
              }
            >
              <Text style={styles.buttonText}>
                {selectedBooking?.payment ? "Payment Successful" : "Pay"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
    color: COLORS.white,
    backgroundColor: COLORS.primary,

    paddingTop: Constants.statusBarHeight,
    paddingBottom: 20,
  },
  bookingContainer: {
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: "#fff",
    shadowColor: "transparent",
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 15,
    color: COLORS.dark,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 4,
    marginTop: 10,
    color: COLORS.primary,
  },

  noAppointmentsContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: "50%",
  },
  noAppointmentsHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noAppointmentsText: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: "center",
  },

  searchButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    alignSelf: "center",
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: "row",
  },
  bookingImage: {
    width: 113,
    height: 113,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    marginLeft: 20,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.dark,
    marginBottom: 4,
    padding: 1,
  },
  selectedTimeSlot: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
    padding: 1,
  },
  selectedTimeIndicator: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
    padding: 1,
  },
  approvedContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  approvedText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: "bold",
    maxWidth: "80%",
    marginBottom: 10,
    marginLeft: 5,
  },
  paymentText: {
    color: "green",
    fontSize: 16,
    fontWeight: "bold",
    maxWidth: "80%",
    marginLeft: 5,
  },
  successfulButton: {
    flex: 1,
    backgroundColor: "green", // Adjust color as needed
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    padding: 8,
    borderRadius: 8,
    textAlign: "center",
    marginLeft: 5,
  },

  buttonContainer: {
    flexDirection: "row", // Change to column layout
    marginTop: 20,
  },

  buttonContainer: {
    flexDirection: "row", // Change to row layout
    justifyContent: "space-between", // Add space between buttons
    marginTop: 20,
  },

  // Update styles.cancelButton and styles.payButton
  cancelButton: {
    flex: 1, // Take equal width
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
    marginRight: 5, // Add margin between buttons
  },

  payButton: {
    flex: 1, // Take equal width
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    padding: 8,
    borderRadius: 8,
    textAlign: "center",
    marginLeft: 5, // Add margin between buttons
  },
  hiddenButton: {
    display: "none",
  },

  rescheduleButton: {
    backgroundColor: COLORS.chapa,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

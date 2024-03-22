import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import { MaterialIcons } from "@expo/vector-icons";
import HomeScreen from "../Home";
import BarbershopScreen from "../screens/barbershops";
import Nails from "../screens/Nails/Nails";
import BridalService from "../screens/BridalService/BridalService";
import UserDetailsScreen from "../screens/DetailScreen.js/UserDetailsScreen";
import EmployeeList from "../screens/Specialists/specialists";
import Congratulations from "../screens/Congratulations/congratulations";
import Confirmation from "../screens/Confirmation/confirmation";
import LoginByPhoneNumber from "../screens/SignIn/SignIn";
import RegisterbyPhoneNumber from "../screens/SignUp/RegisterbyPhoneNumber";
import { setUserId } from "../redux/store";
import { connect, useDispatch } from "react-redux";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingComponent from "../components/LoadingComponent";
import Appointments from "../screens/Appointments/Appointments";
import SettingScreen from "../screens/Setting/Setting";
import AboutYou from "../screens/SignUp/AboutYou";
import * as Location from "expo-location";
import COLORS from "../consts/colors";
import ImageUpload from "../screens/ImageUpload/ImageUpload";
import { View } from "react-native";
import Profile from "../screens/Profile/Profile";
import { setLocation } from "../redux/locationStore";
import { StatusBar } from "react-native";
import EditProfileImage from "../screens/Profile/EditProfileImage";
import ComingSoon from "../screens/ComingSoon";
import MassageUsers from "../screens/Massage/MassageUsers";
import SpaUsers from "../screens/Spa/SpaUsers";
import MakeupUsers from "../screens/Makeup/MakeupUsers";
import SkincareUsers from "../screens/SkinCare/SkincareUsers";
import HandandFootUsers from "../screens/HandandFoot/HandandFootUsers";
import PaymentPage from "../screens/Payment/Payment";
import SubAccountPayment from "../screens/Payment/SubAccountPayment";
import AppointmentUpdated from "../screens/Congratulations/AppointmentUpdated";
import ServiceProviderLocationOnMap from "../screens/MapView/ServiceProviderLocationOnMap";
import SearchMapScreen from "../screens/MapView/SearchMapScreen";
import teleBirrPayment from "../screens/Payment/teleBirrPayment";
import LocationMapScreen from "../screens/MapView/Searchmap";
import servicePorviderOnMapScreen from "../screens/MapView/ServiceProviderLocationOnMap";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const LocationHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        dispatch(setLocation(location.coords));
      } catch (error) {
        console.error("Error fetching location:", error.message);
      }
    })();
  }, [dispatch]);

  return null;
};
const MainTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        // ... existing configuration ...
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconComponent;
          switch (route.name) {
            case "Home":
              iconComponent = (
                <MaterialIcons
                  name="home-filled"
                  size={focused ? size + 10 : size + 3}
                  color={focused ? COLORS.primary : COLORS.dark}
                  style={{ fontWeight: "bold" }}
                />
              );
              break;
            case "Appointments":
              iconComponent = (
                <FontAwesome5
                  name="calendar-day"
                  size={focused ? size + 10 : size + 3}
                  color={focused ? COLORS.primary : COLORS.dark}
                  style={{ fontWeight: "bold" }}
                />
              );
              break;
            case "Search":
              iconComponent = (
                <FontAwesome5
                  name="search"
                  size={focused ? size + 10 : size + 3}
                  color={focused ? COLORS.primary : COLORS.dark}
                  style={{ fontWeight: "bold" }}
                />
              );

              break;
            case "Setting":
              iconComponent = (
                <FontAwesome5
                  name="user"
                  size={focused ? size + 10 : size + 3}
                  color={focused ? COLORS.primary : COLORS.dark}
                  style={{ fontWeight: "bold" }}
                />
              );

              break;

            default:
              iconComponent = null;
              break;
          }
          return iconComponent;
        },
        tabBarStyle: { backgroundColor: COLORS.white },
        tabBarItemStyle: { justifyContent: "center", alignItems: "center" },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarActiveBackgroundColor: "transparent",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={Appointments} />
      <Tab.Screen name="Search" component={LocationMapScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  );
};

const LoggedInStack = ({ setUserId }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    checkUserLoggedIn();
  }, []);
  const checkUserLoggedIn = async () => {
    try {
      // Check if the user is logged in by retrieving the user ID from AsyncStorage.
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        // Dispatch the user ID to the Redux store if it exists.
        setUserId(userId);
      }
    } catch (error) {
      console.error("Error checking user login:", error);
    } finally {
      setLoading(false); // Set loading to false when the check is complete
    }
    if (loading) {
      // You can return a loading indicator or a blank screen while checking the user login.
      return <LoadingComponent />; // Replace LoadingComponent with your actual loading component.
    }
  };
  return (
    <>
      <LocationHandler />
      <Stack.Navigator
        initialRouteName={"Main"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Main" component={MainTab} />

        <Stack.Screen
          name="RegisterbyPhoneNumber"
          component={RegisterbyPhoneNumber}
        />
        <Stack.Screen
          name="LoginByPhoneNumber"
          component={LoginByPhoneNumber}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="barbershop" component={BarbershopScreen} />
        <Stack.Screen name="Makeup" component={MakeupUsers} />
        <Stack.Screen name="Nails" component={Nails} />
        <Stack.Screen name="BridaService" component={BridalService} />
        <Stack.Screen name="Massage" component={MassageUsers} />
        <Stack.Screen name="Spa" component={SpaUsers} />
        <Stack.Screen name="SkinCare" component={SkincareUsers} />
        <Stack.Screen name="HandandFoot" component={HandandFootUsers} />

        <Stack.Screen name="UserDetails" component={UserDetailsScreen} />
        <Stack.Screen name="EmployeeList" component={EmployeeList} />
        <Stack.Screen name="Congratulations" component={Congratulations} />
        <Stack.Screen name="confirmation" component={Confirmation} />

        <Stack.Screen name="AboutYou" component={AboutYou} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="profileImage" component={ImageUpload} />
        <Stack.Screen name="editProfileImage" component={EditProfileImage} />
        <Stack.Screen
          name="appointmentUpdated"
          component={AppointmentUpdated}
        />
        <Stack.Screen name="comingSoon" component={ComingSoon} />
        <Stack.Screen name="Payment" component={PaymentPage} />
        <Stack.Screen name="SubAccountPayment" component={SubAccountPayment} />
        <Stack.Screen
          name="ServiceProviderLocation"
          component={ServiceProviderLocationOnMap}
        />
        <Stack.Screen name="searchMapScreen" component={SearchMapScreen} />
        <Stack.Screen name="smap" component={LocationMapScreen} />
        <Stack.Screen name="teleBirrPayment" component={teleBirrPayment} />
        <Stack.Screen
          name="ServiceProviderOnMapScreen"
          component={servicePorviderOnMapScreen}
        />
      </Stack.Navigator>
    </>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserId: (myuserid) => dispatch(setUserId(myuserid)), // Dispatch the action
  };
};

export default connect(null, mapDispatchToProps)(LoggedInStack);

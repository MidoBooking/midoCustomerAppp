import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainStack from "./src/Stack/MainStack";
import { Provider } from "react-redux";
import userIdReducer from "./src/redux/store";
import InternetStatusChecker from "./src/components/InternetStatusChecker";
import { combineReducers, createStore } from "redux";

import { LogBox, StatusBar } from "react-native";
import COLORS from "./src/consts/colors";
import { useState } from "react";
import { useEffect } from "react";
import LoggedInStack from "./src/Stack/LoggedInStack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LocationHandler from "./src/components/LocationHandler";
import { locationStore, locationReducer } from "./src/redux/locationStore";
LogBox.ignoreAllLogs();

const rootReducer = combineReducers({
  user: userIdReducer,
  location: locationReducer,
});
const rootStore = createStore(rootReducer);
const App = () => {
  return (
    <Provider store={rootStore}>
      <InternetStatusChecker>
        <LocationHandler />
        <NavigationContainer>
          <LoggedInStack />
        </NavigationContainer>
      </InternetStatusChecker>
    </Provider>
  );
};

export default App;

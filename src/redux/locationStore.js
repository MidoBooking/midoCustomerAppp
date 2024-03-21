// locationStore.js
import { createStore } from "redux";

// Actions
const SET_LOCATION = "SET_LOCATION";

const setLocation = (location) => ({
  type: SET_LOCATION,
  payload: location,
});

// Reducer
const initialState = {
  location: null,
};

const locationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOCATION:
      return {
        ...state,
        location: action.payload,
      };
    default:
      return state;
  }
};

// Store
const locationStore = createStore(locationReducer);

export { setLocation, locationStore, locationReducer };

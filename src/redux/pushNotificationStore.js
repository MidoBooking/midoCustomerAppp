// pushNotificationStore.js
import { createStore } from "redux";

// Actions
const SET_PUSH_NOTIFICATION = "SET_PUSH_NOTIFICATION";
const setPushNotification = (pushNotification) => ({
  type: SET_PUSH_NOTIFICATION,
  payload: pushNotification,
});

// Reducer
const initialState = {
  pushNotification: null,
};

const pushNotificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PUSH_NOTIFICATION:
      return {
        ...state,
        pushNotification: action.payload,
      };
    default:
      return state;
  }
};

// Store
const pushNotificationStore = createStore(pushNotificationReducer);

export { setPushNotification, pushNotificationStore, pushNotificationReducer };

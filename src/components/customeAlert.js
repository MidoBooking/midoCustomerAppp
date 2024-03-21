import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

const CustomAlert = ({ visible, message, onLogin }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // This is required for Android
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
        >
          <Text style={{ marginBottom: 20, fontSize: 16 }}>{message}</Text>
          <TouchableOpacity
            onPress={onLogin}
            style={{ backgroundColor: "#007AFF", padding: 10, borderRadius: 5 }}
          >
            <Text style={{ color: "white", fontSize: 16 }}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

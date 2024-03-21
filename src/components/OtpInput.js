import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import COLORS from "../consts/colors";

const OtpInput = ({ numberOfInputs = 6, onOtpChange }) => {
  const DEFAULT_OTP = Array(numberOfInputs).fill("");
  const [otp, setOtp] = useState(DEFAULT_OTP);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus the first input when the component mounts
    inputRefs.current[0].focus();
  }, []);

  const handleInputChange = (text, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = text;

    setOtp(updatedOtp);
    onOtpChange(updatedOtp.join(""));

    if (text !== "" && index < numberOfInputs - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const focusPrevInput = (index) => {
    if (index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const renderInput = (_, index) => (
    <View key={index} style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={otp[index]}
        onChangeText={(text) => handleInputChange(text, index)}
        keyboardType="numeric"
        maxLength={1}
        ref={(ref) => (inputRefs.current[index] = ref)}
        onFocus={() => inputRefs.current[index].clear()}
        onKeyPress={({ nativeEvent: { key } }) => {
          if (key === "Backspace") {
            focusPrevInput(index);
          }
        }}
      />
      {index < numberOfInputs - 1 && <View style={styles.line} />}
    </View>
  );

  return (
    <View style={styles.container}>
      {Array(numberOfInputs).fill("").map(renderInput)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    width: 40,
    height: 40,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8, // Border radius
    textAlign: "center",
    fontSize: 20,
    color: COLORS.dark,
  },
  line: {
    height: 1,
    width: 10,
    marginHorizontal: 0,
  },
});

export default OtpInput;

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import COLORS from '../../consts/colors';
import Constants from "expo-constants";
import { StatusBar } from 'expo-status-bar';

const PaymentButton = () => {
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const webViewRef = useRef(null);
  const navigation = useNavigation();

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://192.168.1.13:3001/api/pay');

      if (response.status === 200) {
        const paymentUrl = response.data;
        setCheckoutUrl(paymentUrl);
      } else {
        Alert.alert('Error', 'Failed to initiate payment. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Network error. Please check your internet connection.');
    }
  };
  useEffect(() => {
    handlePayment();
  }, []);
  const handleWebViewNavigation = (event) => {
    const { url } = event?.nativeEvent || {};
  
    if (url) {
      // You can add custom logic based on the URL if needed
      // For example, check if the URL contains a specific keyword to determine if it's the final page
  
      // For this example, let's simply update the checkoutUrl state
      setCheckoutUrl(url);
    }
  };
  


  if (checkoutUrl) {
    return (
      <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.chapa} />
    
      <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
  
        <WebView
          ref={webViewRef}
          source={{ uri: checkoutUrl }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={handleWebViewNavigation}
        />
      </View>
    );
  }

  return (
    <View>
      <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    paddingTop:Constants.statusBarHeight,
  },
  backButton: {
    position: "absolute",
    top: Constants.statusBarHeight+15,
    left: 10,
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
  // Add other styles as needed
});

export default PaymentButton;

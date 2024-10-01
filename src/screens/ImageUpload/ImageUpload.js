import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import ProgressBar from "react-native-progress";

import COLORS from "../../consts/colors";
import { API_URL } from "../../components/apiConfig";
const desiredImageWidth = 365;
const desiredImageHeight = 214.71;

const ImageUpload = () => {
  const [imageURI, setImageURI] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigation = useNavigation();
  const userId = useSelector((state) => state.user.userId);
  const [uploadButtonVisible, setUploadButtonVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant camera roll permissions to upload images."
        );
      }
    })();
  }, []);

  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [desiredImageWidth, desiredImageHeight],
      quality: 1,
    });

    if (!result.canceled) {
      setImageURI(result.assets[0].uri);
      setUploadButtonVisible(true);
    }
  };

  const skipUpload = () => {
    // Handle skip functionality here
    // For now, just navigate away
    navigation.navigate("Main");
  };

  const uploadImage = async () => {
    setIsLoading(true);

    if (!imageURI) {
      Alert.alert("No image selected", "Please select an image to upload.");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: imageURI,
      type: "image/jpeg",
      name: `businessImage_${Date.now()}.jpg`,
    });
    formData.append("userId", userId);
    try {
      const response = await fetch(`${API_URL}/clientProfileImage`, {
        method: "POST",
        body: formData,

        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error("Image upload failed");
      }

      const responseData = await response.json();
      const imageUrl = responseData.imageUrl;

      // Use imageUrl as needed in your component

      setIsLoading(false);
      navigation.navigate("Main");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Upload failed", "Failed to upload image. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.pageName}>Profile Picture</Text>
        <View style={styles.imageContainer}>
          <View style={styles.dottedBox} />

          {imageURI ? (
            <Image
              source={{ uri: imageURI }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <AntDesign name="user" size={100} color="black" />
          )}
        </View>
        <View style={styles.buttonContainer}>
          {!uploadButtonVisible && (
            <TouchableOpacity
              style={styles.selectImage}
              onPress={isLoading ? null : selectImage}
            >
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>
          )}
          {uploadButtonVisible && (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={isLoading ? null : uploadImage}
              disabled={!imageURI}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Upload</Text>
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.skipButton} onPress={skipUpload}>
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {uploadProgress > 0 && (
          <ProgressBar
            progress={uploadProgress / 100}
            width={desiredImageWidth}
            height={10}
            color={COLORS.progressBar}
            style={styles.progress}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 35,
    left: 20,
    zIndex: 2,
  },
  pageName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 60,
  },
  container2: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    width: desiredImageWidth,
    height: desiredImageHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: desiredImageWidth,
    height: desiredImageHeight,
  },
  dottedBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: desiredImageWidth,
    height: desiredImageHeight,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "black",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
  },
  selectImage: {
    backgroundColor: COLORS.dark,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  skipButton: {
    backgroundColor: COLORS.dark,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  progress: {
    marginTop: 20,
  },
});

export default ImageUpload;

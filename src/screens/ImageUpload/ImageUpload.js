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
import { Ionicons } from "@expo/vector-icons";
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
    }
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

          {imageURI && (
            <>
              <Image
                source={{ uri: imageURI }}
                style={styles.image}
                resizeMode="contain"
              />
            </>
          )}
        </View>
        <TouchableOpacity
          style={styles.selectImage}
          onPress={isLoading ? null : selectImage}
        >
          <Text style={styles.nextText}>Select Image</Text>
        </TouchableOpacity>

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

      <TouchableOpacity
        style={styles.nextBtn}
        onPress={isLoading ? null : uploadImage}
        disabled={!imageURI}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.nextText}>Upload</Text>
        )}
      </TouchableOpacity>
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
  progress: {
    marginTop: 20,
  },
  progressText: {
    marginTop: 10,
  },
  selectImage: {
    width: "90%",
    backgroundColor: COLORS.dark,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  nextBtn: {
    width: "90%",
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  nextText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ImageUpload;

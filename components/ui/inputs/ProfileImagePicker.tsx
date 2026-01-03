import { ProfileImagePickerProps } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  value,
  onImageChange,
  size = 120,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: mediaLibraryStatus } =
        await MediaLibrary.requestPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (mediaLibraryStatus !== "granted" || cameraStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Please grant camera and photo library permissions to upload images."
        );
        return false;
      }
    }
    return true;
  };

  const showImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    Alert.alert("Select Image", "Choose how you want to select an image", [
      {
        text: "Camera",
        onPress: openCamera,
      },
      {
        text: "Photo Library",
        onPress: openImageLibrary,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const openCamera = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera");
    } finally {
      setIsLoading(false);
    }
  };

  const openImageLibrary = async () => {
    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open image library");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center">
      <TouchableOpacity
        onPress={showImagePicker}
        disabled={isLoading}
        className="relative"
      >
        {/* Main Circle Container */}
        <View
          className="bg-[#11293A] rounded-full justify-center items-center relative"
          style={{ width: size, height: size }}
        >
          {value ? (
            /* User's Selected Image */
            <Image
              source={{ uri: value }}
              style={{ width: size, height: size, borderRadius: 100 }}
              contentFit="cover"
            />
          ) : (
            /* Default Avatar Icon */
            <View className="items-center justify-center">
              {/* Head */}
              <View
                className="bg-white rounded-full mb-2"
                style={{
                  width: size * 0.25,
                  height: size * 0.25,
                }}
              />

              {/* Body */}
              <View
                className="bg-white rounded-full"
                style={{
                  width: size * 0.45,
                  height: size * 0.3,
                }}
              />
            </View>
          )}

          {/* Edit Icon */}
          <View
            className="absolute bg-white rounded-full justify-center items-center border-2 border-gray-100"
            style={{
              width: size * 0.25,
              height: size * 0.25,
              bottom: size * 0.05,
              right: size * 0.05,
            }}
          >
            {/* Pencil Icon */}
            <MaterialCommunityIcons
              name="pencil-outline"
              size={24}
              color="black"
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Upload Text */}
      <Text className="text-sm text-[#212121] mt-3 text-center">
        {value ? "Tap to change photo" : "Upload profile photo"}
      </Text>

      {isLoading && (
        <Text className="text-xs text-blue-500 mt-1">Processing...</Text>
      )}
    </View>
  );
};

export default ProfileImagePicker;

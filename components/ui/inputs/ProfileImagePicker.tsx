import { ProfileImagePickerProps } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

const ProfileImagePicker = ({
  value,
  onImageChange,
  size = 120,
}: ProfileImagePickerProps) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (cameraStatus !== "granted") {
        Alert.alert(
          t("user.setup.businessSetup.permissionRequired"),
          t("user.setup.businessSetup.cameraPermissionMessage")
        );
        return false;
      }
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status: mediaLibraryStatus } =
        await MediaLibrary.requestPermissionsAsync();

      if (mediaLibraryStatus !== "granted") {
        Alert.alert(
          t("user.setup.businessSetup.permissionRequired"),
          t("user.setup.businessSetup.mediaLibraryPermissionMessage")
        );
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert(t("user.setup.businessSetup.chooseOption"), t("common.profileImagePicker.chooseHowToSelect"), [
      {
        text: t("user.setup.businessSetup.takePhoto"),
        onPress: openCamera,
      },
      {
        text: t("user.setup.businessSetup.chooseFromGallery"),
        onPress: openImageLibrary,
      },
      {
        text: t("user.setup.businessSetup.cancel"),
        style: "cancel",
      },
    ]);
  };

  const openCamera = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert(t("common.error"), t("common.profileImagePicker.failedToOpenCamera"));
    } finally {
      setIsLoading(false);
    }
  };

  const openImageLibrary = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLibraryPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageChange(result.assets[0].uri);
      }
    } catch {
      Alert.alert(t("common.error"), t("common.profileImagePicker.failedToOpenImageLibrary"));
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
        {value ? t("common.profileImagePicker.tapToChange") : t("user.setup.businessSetup.uploadProfilePhoto")}
      </Text>

      {isLoading && (
        <Text className="text-xs text-blue-500 mt-1">{t("user.profile.processing")}</Text>
      )}
    </View>
  );
};

export default ProfileImagePicker;

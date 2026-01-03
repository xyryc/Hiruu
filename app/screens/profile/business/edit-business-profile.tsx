import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const EditBusinessProfile = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return false;
    }
    return true;
  };

  const handleImageSelection = async (
    type: "profile" | "cover",
    result: ImagePicker.ImagePickerResult
  ) => {
    if (!result.canceled && result.assets[0]) {
      setUploading(true);

      try {
        // Simulate upload process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (type === "profile") {
          setProfileImage(result.assets[0].uri);
        } else {
          setCoverImage(result.assets[0].uri);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const pickImage = async (type: "profile" | "cover") => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [4, 1],
      quality: 0.7,
    });

    await handleImageSelection(type, result);
  };

  const takePhoto = async (type: "profile" | "cover") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera permissions to take photos!"
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === "profile" ? [1, 1] : [4, 1],
      quality: 0.7,
    });

    await handleImageSelection(type, result);
  };

  const showImagePickerOptions = (type: "profile" | "cover") => {
    if (uploading) return;

    Alert.alert(
      `${type === "profile" ? "Profile" : "Cover"} Photo`,
      "Choose an option",
      [
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(type),
        },
        {
          text: "Take Photo",
          onPress: () => takePhoto(type),
        },
        ...((type === "profile" && profileImage) ||
        (type === "cover" && coverImage)
          ? [
              {
                text: "Remove Photo",
                style: "destructive",
                onPress: () => removeImage(type),
              },
            ]
          : []),
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const removeImage = (type: "profile" | "cover") => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          if (type === "profile") {
            setProfileImage(null);
          } else {
            setCoverImage(null);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <SafeAreaView
        className="flex-1 bg-[#F7F7F7] border dark:bg-dark-background"
        edges={["left", "right", "bottom"]}
      >
        <LinearGradient
          colors={["#BDE4F9", "#F7F7F7"]}
          locations={[0, 0.38]}
          className="flex-1"
          style={{ paddingTop: insets.top + 10 }}
        >
          <ScreenHeader
            className="mt-3 mx-5"
            onPressBack={() => router.back()}
            title="Edit Profile"
            titleClass="text-primary dark:text-dark-primary "
            iconColor={isDark ? "#fff" : "#111"}
          />

          <ScrollView
            className="mx-5 pt-8"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 120,
            }}
          >
            {/* Profile Photo */}
            <View className="items-center">
              <View className="bg-[#ffffff] h-[119px] w-[119px] flex-row justify-center items-center rounded-full relative">
                {uploading ? (
                  <View className="h-32 w-32 rounded-full bg-gray-200 items-center justify-center">
                    <ActivityIndicator size="large" color="#4FB2F3" />
                  </View>
                ) : (
                  <Image
                    source={
                      profileImage || require("@/assets/images/reward/user.svg")
                    }
                    contentFit="cover"
                    style={{ height: 116, width: 116, borderRadius: 100 }}
                    transition={300}
                  />
                )}

                {!uploading && (
                  <TouchableOpacity
                    onPress={() => showImagePickerOptions("profile")}
                    className="h-8 w-8 border border-[#EEEEEE] bg-white rounded-full absolute bottom-2 right-2 flex-row justify-center items-center"
                  >
                    <Feather name="edit-2" size={16} color="#282930" />
                  </TouchableOpacity>
                )}
              </View>
              <Text className="pt-2.5 font-proximanova-regular text-sm text-primary dark:text-dark-primary text-center">
                {uploading
                  ? "Uploading..."
                  : profileImage
                    ? "Change profile photo"
                    : "Upload profile photo"}
              </Text>
            </View>

            {/* Cover Photo */}
            <View className="relative mt-8">
              <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2">
                {coverImage ? "Cover Photo" : "Upload Cover Photo"}
              </Text>
              <View className="relative">
                {uploading ? (
                  <View className="w-full h-32 bg-gray-200 rounded-xl items-center justify-center">
                    <ActivityIndicator size="large" color="#4FB2F3" />
                    <Text className="text-gray-500 mt-2">Uploading...</Text>
                  </View>
                ) : coverImage ? (
                  <View>
                    <Image
                      source={coverImage}
                      contentFit="cover"
                      style={{
                        width: "100%",
                        height: 150,
                        borderRadius: 12,
                      }}
                      transition={300}
                    />

                    <TouchableOpacity
                      onPress={() => showImagePickerOptions("cover")}
                      className="h-8 w-8 border border-white bg-[#4FB2F3] rounded-full absolute bottom-2 right-2 z10 flex-row justify-center items-center"
                    >
                      <Feather name="edit-2" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => showImagePickerOptions("cover")}
                    className="flex items-center justify-center py-6 border border-dotted rounded-xl"
                  >
                    <Ionicons
                      name="add-circle-sharp"
                      size={36}
                      color="#053C5A"
                    />
                    <Text className="font-proximanova-semibold text-sm mt-2">
                      Upload Photo
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* inpute field  */}
            <View className="flex-row justify-between items-center mt-8 ">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Business Name
              </Text>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </View>

            <View>
              <TextInput
                placeholder="Enter your business name"
                className="w-full pl-3 pr-4 py-4 bg-white border mt-2.5 border-[#EEEEEE] rounded-xl text-[#7A7A7A]"
                keyboardType="default"
                autoCapitalize="none"
              />
            </View>

            {/* select location  */}
            <View className="mt-8">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Location
              </Text>

              <View className="flex-row mt-2.5 gap-2.5">
                {/* City Dropdown */}
                <TouchableOpacity className="flex-1 flex-row justify-between items-center w-32 border border-gray-300 rounded-xl px-4 py-3 bg-white">
                  <Text className="text-gray-500">City</Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>

                {/* Area Dropdown */}
                <TouchableOpacity className="flex-1 flex-row justify-between items-center w-32 border border-gray-300 rounded-xl px-4 py-3 bg-white">
                  <Text className="text-gray-500">Area</Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Add a About Business */}
            <View className="flex-row justify-between items-center mt-8 ">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Add a About Business
              </Text>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </View>

            <View>
              <TextInput
                placeholder="Type here..."
                placeholderTextColor="#7A7A7A"
                className="w-full pl-3 pr-4 pt-4 pb-4 bg-white border mt-2.5 border-[#EEEEEE] rounded-xl text-primary text-base"
                keyboardType="default"
                autoCapitalize="sentences"
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
              />
            </View>
          </ScrollView>

          <PrimaryButton
            className="absolute bottom-0 mt-4 mx-5 "
            title="Save Change"
            onPress={() => router.back()}
          />
        </LinearGradient>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditBusinessProfile;

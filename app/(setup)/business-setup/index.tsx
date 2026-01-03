import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import PhoneInput from "react-native-phone-input";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BusinessSetup = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // profile and cover photo
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  // phone number
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);

  let phoneRef: any = null;

  const handlePhoneChange = () => {
    const number = phoneRef.getValue();
    const isValid = phoneRef.isValidNumber();

    setPhoneNumber(number);
    setIsValidPhone(isValid);
  };

  // location
  const [value, setValue] = useState(null);
  const states = [
    {
      label: "Central Park, New York, NY",
      value: "Central Park, New York, NY",
    },
    { label: "Central Park, New York, NY", value: "AK" },
    {
      label: "central park South, New York, NY",
      value: "central park South, New York, NY",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#F7F7F7]"
      edges={["left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient
        className="flex-1"
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
      >
        <ScreenHeader
          style={{ paddingTop: insets.top + 12 }}
          className="px-5 py-3 mb-5"
          title="Create a business"
          onPressBack={() => router.back()}
        />

        {/* content */}
        <ScrollView className="px-5" contentContainerClassName="pb-10">
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
                    className="h-8 w-8 border border-white bg-white rounded-full absolute bottom-2 right-2 z10 flex-row justify-center items-center"
                  >
                    <Feather name="edit-2" size={16} color="#282930" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => showImagePickerOptions("cover")}
                  className="flex items-center justify-center py-6 border border-dotted rounded-xl"
                >
                  <Ionicons name="add-circle-sharp" size={36} color="#053C5A" />
                  <Text className="font-proximanova-semibold text-sm mt-2">
                    Upload Photo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* phone number */}
          <View className="mt-7">
            <Text className="text-sm mb-2 text-primary font-proximanova-semibold">
              Phone number
            </Text>

            <PhoneInput
              ref={(ref) => {
                phoneRef = ref;
              }}
              onChangePhoneNumber={handlePhoneChange}
              initialCountry={"us"}
              style={{
                borderWidth: 1,
                borderColor: "#EEEEEE",
                borderRadius: 10,
                paddingHorizontal: 15,
                paddingVertical: 12,
                backgroundColor: "#fff",
              }}
              textStyle={{
                fontSize: 14,
                color: "#7A7A7A",
              }}
              flagStyle={{
                width: 25,
                height: 18,
              }}
              autoFormat={true}
              allowZeroAfterCountryCode={false}
              textProps={{
                placeholder: "Enter phone number",
                placeholderTextColor: "#9CA3AF",
              }}
            />

            {!isValidPhone && phoneNumber && (
              <Text className="text-red-500 text-xs mt-1 ml-1">
                Please enter a valid phone number
              </Text>
            )}
          </View>

          {/* business name */}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Business Name
            </Text>

            <TextInput
              placeholder="Enter your business name"
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* location*/}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Location
            </Text>

            <Dropdown
              data={states}
              labelField="label"
              valueField="value"
              placeholder="Select location"
              value={value}
              onChange={(item) => setValue(item.value)}
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={styles.containerStyle}
              itemTextStyle={styles.itemTextStyle}
            />
          </View>

          {/* add a business */}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Add a About Business
            </Text>

            <TextInput
              placeholder="Type here..."
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm h-20"
              autoCapitalize="none"
              multiline={true}
              textAlignVertical="top"
            />
          </View>

          {/* socials */}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Connect Your Socials
            </Text>

            <ConnectSocials />
          </View>
        </ScrollView>

        {/* button */}
        <PrimaryButton
          onPress={() => router.push("/(tabs)/business-home")}
          title="Create Profile"
          className="mx-5 my-4"
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default BusinessSetup;

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 10,
    padding: 12,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 14,
    color: "#111111",
  },
  containerStyle: {
    borderRadius: 10,
    backgroundColor: "white",
  },
  itemTextStyle: {
    fontSize: 14,
    color: "#3D3D3D",
  },
});

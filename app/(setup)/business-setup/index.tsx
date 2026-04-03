import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput, {
  getCountryByCca2,
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const ADDRESS_MAX_LENGTH = 200;

type LocationOption = {
  label: string;
  value: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
};

const toOptionalString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const toOptionalNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const BusinessSetup = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { createBusinessProfile, isLoading } = useBusinessStore();

  // profile and cover photo
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<"profile" | "cover" | null>(
    null,
  );

  const handleImageSelection = async (
    type: "profile" | "cover",
    result: ImagePicker.ImagePickerResult,
  ) => {
    if (!result.canceled && result.assets[0]) {
      setUploadingType(type);

      try {
        // Simulate upload process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (type === "profile") {
          setProfileImage(result.assets[0].uri);
        } else {
          setCoverImage(result.assets[0].uri);
        }
      } catch {
        Alert.alert("Error", "Failed to upload image");
      } finally {
        setUploadingType(null);
      }
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Sorry, we need camera roll permissions to make this work!",
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
        "Sorry, we need camera permissions to take photos!",
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
    if (uploadingType) return;

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
      ],
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
  const [countryCode, setCountryCode] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const fallbackCountry = useMemo(() => getCountryByCca2("US"), []);

  const getDialCode = (country?: ICountry | null) => {
    if (!country?.idd?.root) return "";
    const suffix = country.idd.suffixes?.[0] || "";
    return `${country.idd.root}${suffix}`;
  };

  const validatePhone = (value: string, country?: ICountry | null) => {
    const countryToUse = country ?? selectedCountry ?? fallbackCountry;
    if (!countryToUse || !value) return true;
    return isValidPhoneNumber(value, countryToUse);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setCountryCode(getDialCode(selectedCountry ?? fallbackCountry) || "");
    setIsValidPhone(validatePhone(value));
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
    setCountryCode(getDialCode(country));
    setIsValidPhone(validatePhone(phoneNumber, country));
  };

  useEffect(() => {
    setCountryCode(getDialCode(fallbackCountry) || "");
  }, [fallbackCountry]);

  // location
  const [value, setValue] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocationOption, setSelectedLocationOption] =
    useState<LocationOption | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const hasShownGeoapifyMissingKey = useRef(false);

  useEffect(() => {
    if (!locationSearch || locationSearch.trim().length < 3) {
      setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
      setIsSearchingLocation(false);
      return;
    }

    if (!GEOAPIFY_API_KEY) {
      setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
      setIsSearchingLocation(false);
      if (!hasShownGeoapifyMissingKey.current) {
        hasShownGeoapifyMissingKey.current = true;
        toast.error("Geoapify API key missing. Set EXPO_PUBLIC_GEOAPIFY_API_KEY.");
      }
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const query = encodeURIComponent(locationSearch.trim());
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&limit=8&apiKey=${GEOAPIFY_API_KEY}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Geoapify request failed: ${response.status}`);
        }

        const result = await response.json();
        const features = Array.isArray(result?.features) ? result.features : [];
        const nextOptions: LocationOption[] = features
          .map((item: any) => {
            const props = item?.properties || {};
            const coordinates = Array.isArray(item?.geometry?.coordinates)
              ? item.geometry.coordinates
              : [];
            const longitude = Number(coordinates[0]);
            const latitude = Number(coordinates[1]);
            const label =
              props.formatted ||
              [props.address_line1, props.address_line2].filter(Boolean).join(", ");

            if (!label || Number.isNaN(latitude) || Number.isNaN(longitude)) {
              return null;
            }

            return {
              label,
              value: label,
              latitude,
              longitude,
              placeId:
                props.place_id ||
                props.datasource?.raw?.place_id ||
                props.datasource?.raw?.osm_id?.toString?.(),
              city: props.city || props.county || props.suburb,
              state: props.state || props.state_code,
              country: props.country,
            };
          })
          .filter(Boolean) as LocationOption[];

        const uniqueByLabel = Array.from(
          new Map(nextOptions.map((item) => [item.label, item])).values(),
        );

        if (selectedLocationOption) {
          setLocationOptions(
            Array.from(
              new Map(
                [selectedLocationOption, ...uniqueByLabel].map((item) => [
                  item.label,
                  item,
                ]),
              ).values(),
            ),
          );
        } else {
          setLocationOptions(uniqueByLabel);
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
          toast.error("Failed to fetch location suggestions.");
        }
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [locationSearch, selectedLocationOption]);

  // business name
  const [businessName, setBusinessName] = useState("");

  // about
  const [about, setAbout] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState<any>({});

  const getPhonePayload = () => {
    const trimmed = phoneNumber.trim();
    if (!trimmed || !countryCode) {
      return { countryCode: "", phoneNumber: "" };
    }

    const ccDigits = countryCode.replace(/\D/g, "");
    const numberOnly = trimmed.replace(/\D/g, "");
    const phoneOnly = numberOnly.startsWith(ccDigits)
      ? numberOnly.slice(ccDigits.length)
      : numberOnly;

    return { countryCode, phoneNumber: phoneOnly };
  };

  const handleCreateBusiness = async () => {
    const phonePayload = getPhonePayload();
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }
    if (!phonePayload.phoneNumber || !phonePayload.countryCode) {
      toast.error("Please enter a valid phone number.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    const resolvedAddress = (value || locationSearch || "")
      .trim()
      .slice(0, ADDRESS_MAX_LENGTH);
    if (!resolvedAddress) {
      toast.error("Location is required.");
      return;
    }
    if (!selectedLocationOption) {
      toast.error("Please select a valid location from suggestions.");
      return;
    }
    const latitude = toOptionalNumber(selectedLocationOption?.latitude);
    const longitude = toOptionalNumber(selectedLocationOption?.longitude);
    const payload = {
      name: businessName.trim(),
      description: about.trim(),
      address: {
        address: resolvedAddress,
        latitude,
        longitude,
        placeId: toOptionalString(selectedLocationOption?.placeId),
        city: toOptionalString(selectedLocationOption?.city),
        state: toOptionalString(selectedLocationOption?.state),
        country: toOptionalString(selectedLocationOption?.country),
      },
      phoneNumber: phonePayload.phoneNumber,
      countryCode: phonePayload.countryCode,
      email: email.trim(),
      website: website.trim(),
      social: socialLinks,
      logo: profileImage,
      coverPhoto: coverImage,
    };

    try {
      const result = await createBusinessProfile(payload);
      const messageKey = result?.message || "business_created_successfully";
      const messageText = translateApiMessage(messageKey);
      toast.success(messageText);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("create business error", error)
      toast.error(error.message || t("common.error"));
    }
  };

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
        <ScrollView className="px-5" contentContainerClassName="pb-10"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 200
          }}
        >
          {/* Profile Photo */}
          <View className="items-center">
            <View className="bg-[#ffffff] h-[119px] w-[119px] flex-row justify-center items-center rounded-full relative">
              {uploadingType === "profile" ? (
                <View className="h-32 w-32 rounded-full bg-gray-200 items-center justify-center">
                  <ActivityIndicator size="large" color="#4FB2F3" />
                </View>
              ) : (
                <Image
                  source={
                    profileImage || require("@/assets/images/placeholder.png")
                  }
                  contentFit="cover"
                  style={{ height: 116, width: 116, borderRadius: 100 }}
                  transition={300}
                />
              )}

              {uploadingType !== "profile" && (
                <TouchableOpacity
                  onPress={() => showImagePickerOptions("profile")}
                  className="h-8 w-8 border border-[#EEEEEE] bg-white rounded-full absolute bottom-2 right-2 flex-row justify-center items-center"
                >
                  <Feather name="edit-2" size={16} color="#282930" />
                </TouchableOpacity>
              )}
            </View>
            <Text className="pt-2.5 font-proximanova-regular text-sm text-primary dark:text-dark-primary text-center">
              {uploadingType === "profile"
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
              {uploadingType === "cover" ? (
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
              value={phoneNumber}
              onChangePhoneNumber={handlePhoneChange}
              selectedCountry={selectedCountry}
              onChangeSelectedCountry={handleSelectedCountry}
              defaultCountry="US"
              placeholder="Enter phone number"
              phoneInputStyles={{
                container: {
                  borderWidth: 1,
                  borderColor: "#EEEEEE",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                },
                input: {
                  fontSize: 14,
                  color: "#7A7A7A",
                },
                divider: {
                  backgroundColor: "#E5E7EB",
                },
              }}
              phoneInputPlaceholderTextColor="#9CA3AF"
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
              onChangeText={setBusinessName}
              placeholder="Enter your business name"
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* email */}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Business Email
            </Text>
            <TextInput
              onChangeText={setEmail}
              placeholder="Enter business email"
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* website */}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Website
            </Text>
            <TextInput
              onChangeText={setWebsite}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
              autoCapitalize="none"
            />
          </View>

          {/* location*/}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Location
            </Text>

            <TextInput
              value={locationSearch}
              onFocus={() => setIsLocationFocused(true)}
              onBlur={() => {
                setTimeout(() => setIsLocationFocused(false), 250);
              }}
              onChangeText={(text) => {
                const nextText = text.slice(0, ADDRESS_MAX_LENGTH);
                setLocationSearch(nextText);
                if (selectedLocationOption && nextText !== selectedLocationOption.label) {
                  setSelectedLocationOption(null);
                  setValue(null);
                }
              }}
              placeholder="Search location"
              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
              autoCapitalize="none"
              maxLength={ADDRESS_MAX_LENGTH}
            />

            {isLocationFocused &&
              locationSearch.trim().length >= 3 &&
              locationOptions.length > 0 ? (
              <View className="mt-2 border border-[#EEEEEE] bg-white rounded-[10px] overflow-hidden">
                {locationOptions.map((item, index) => (
                  <TouchableOpacity
                    key={`${item.value}-${index}`}
                    onPress={() => {
                      const trimmedLabel = item.label.slice(0, ADDRESS_MAX_LENGTH);
                      setValue(trimmedLabel);
                      setLocationSearch(trimmedLabel);
                      setSelectedLocationOption(item);
                      setLocationOptions([item]);
                      setIsLocationFocused(false);
                    }}
                    className="px-4 py-3 border-b border-[#F5F5F5]"
                  >
                    <Text className="text-sm text-[#111111]">{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {isSearchingLocation ? (
              <Text className="mt-2 text-xs font-proximanova-regular text-secondary">
                Searching locations...
              </Text>
            ) : null}
            {isLocationFocused &&
              locationSearch.trim().length >= 3 &&
              !isSearchingLocation &&
              locationOptions.length === 0 ? (
              <Text className="mt-2 text-xs font-proximanova-regular text-secondary">
                No locations found.
              </Text>
            ) : null}
          </View>

          {/* add a business */}
          <View className="mt-7">
            <Text className="text-sm font-proximanova-semibold mb-2.5">
              Add a About Business
            </Text>

            <TextInput
              onChangeText={setAbout}
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

            <ConnectSocials
              value={socialLinks}
              onChange={(next) => setSocialLinks((prev: any) => ({ ...prev, ...next }))}
              canEdit={true}
            />
          </View>

          {/* button */}
          <PrimaryButton
            // onPress={() => router.push("/(tabs)/business-home")}
            onPress={handleCreateBusiness}
            title="Create Profile"
            className="my-10"
            loading={isLoading}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default BusinessSetup;

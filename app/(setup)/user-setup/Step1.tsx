import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import DateOfBirthInput from "@/components/ui/inputs/DateOfBirthInput";
import GenderSelection from "@/components/ui/inputs/GenderSelection";
import { useProfileStore } from "@/stores/profileStore";
import { GenderOption, SocialData } from "@/types";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { toast } from "sonner-native";

const AnimatedView = Animated.createAnimatedComponent(View);
const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

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

export default function Step1({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const { updateProfile, isLoading } = useProfileStore();

  // Form state
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocationOption, setSelectedLocationOption] =
    useState<LocationOption | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const hasShownGeoapifyMissingKey = useRef(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [selectedGender, setSelectedGender] = useState<GenderOption | null>(
    "male",
  );
  const [socialLinks, setSocialLinks] = useState<SocialData>({
    facebook: "",
    linkedin: "",
    whatsapp: "",
    twitter: "",
    telegram: "",
    instagram: "",
  });

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

  // Validation with i18n
  const validateStep1 = () => {
    if (!fullName.trim()) {
      Alert.alert(t("validation.validationError"), t("validation.enterName"));
      return false;
    }

    if (!selectedLocationOption) {
      Alert.alert(
        t("validation.validationError"),
        t("validation.selectLocation")
      );
      return false;
    }

    if (!dateOfBirth) {
      Alert.alert(
        t("validation.validationError"),
        t("validation.selectDateOfBirth"),
      );
      return false;
    }

    if (!selectedGender) {
      Alert.alert(
        t("validation.validationError"),
        t("validation.selectGender"),
      );
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleNext = async () => {
    if (!validateStep1()) {
      return;
    }

    try {
      // Prepare data for API - Just the data fields, no step wrapper
      const profileData = {
        name: fullName.trim(),
        address: {
          address: selectedLocationOption?.label || location || "",
          latitude: selectedCoords?.latitude,
          longitude: selectedCoords?.longitude,
          placeId: selectedLocationOption?.placeId,
          city: selectedLocationOption?.city,
          state: selectedLocationOption?.state,
          country: selectedLocationOption?.country,
        },
        dateOfBirth: dateOfBirth?.toISOString(),
        gender: selectedGender,
        social: socialLinks,
        onboarding: 1,
      };

      // console.log(
      //   "Sending profile data:",
      //   JSON.stringify(profileData, null, 2)
      // );

      // Call API - Pass data directly
      await updateProfile(profileData);

      // Success - move to next step
      // console.log("Profile updated:", result);
      onComplete();
    } catch (error: any) {
      toast.error(error.message || t("user.setup.profileUpdateError"));
      console.error("Profile update error:", error);
    }
  };





  return (
    <AnimatedView
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      className="flex-1"
    >
      <ScreenHeader
        onPressBack={handleBack}
        title="Personal Details"
        className="mt-3"
      />

      {/* progress details */}
      <View className="my-7">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm font-proximanova-semibold">
            Your Progress: {currentStep * 20}%
          </Text>

          <Text className="text-sm font-proximanova-semibold">
            {getStepName(currentStep)}
          </Text>
        </View>

        <AnimatedView layout={Layout.springify()}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={11}
            color="#11293A"
            unfilledColor="#FFFFFF"
            borderWidth={0}
            borderRadius={100}
            animated={true}
            animationConfig={{ duration: 300 }}
          />
        </AnimatedView>
      </View>

      {/* main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }} // Add padding here
        className="flex-1" // Add flex-1 to ScrollView
      >
        {/* name */}
        <View>
          <Text className="text-sm font-proximanova-semibold mb-2.5">Name</Text>

          <TextInput
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
            keyboardType="email-address"
            autoCapitalize="none"
            value={fullName}
            onChangeText={setFullName}
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
              setLocationSearch(text);
              if (selectedLocationOption && text !== selectedLocationOption.label) {
                setSelectedLocationOption(null);
                setSelectedCoords(null);
                setLocation(null);
              }
            }}
            placeholder={t("user.setup.selectLocation")}
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {isLocationFocused &&
            locationSearch.trim().length >= 3 &&
            locationOptions.length > 0 ? (
            <View className="mt-2 border border-[#EEEEEE] bg-white rounded-[10px] overflow-hidden">
              {locationOptions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.value}-${index}`}
                  onPress={() => {
                    setLocation(item.value);
                    setLocationSearch(item.label);
                    setSelectedLocationOption(item);
                    setSelectedCoords({
                      latitude: item.latitude,
                      longitude: item.longitude,
                    });
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

        {/* date of birth */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Date of Birth
          </Text>

          <DateOfBirthInput value={dateOfBirth} onDateChange={setDateOfBirth} />
        </View>

        {/* gender */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Gender
          </Text>

          <GenderSelection
            value={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </View>

        {/* socials */}
        <View className="mt-7">
          <Text className="text-sm font-proximanova-semibold mb-2.5">
            Connect Your Socials
          </Text>

          <ConnectSocials
            value={socialLinks}
            onChange={(next) => setSocialLinks((prev) => ({ ...prev, ...next }))}
          />
        </View>
      </ScrollView>

      {/* Button fixed at bottom */}
      <View className="pb-10 pt-4 bg-transparent">
        <PrimaryButton
          title="Next"
          className="w-full"
          onPress={handleNext}
          loading={isLoading}
        />
      </View>
    </AnimatedView>
  );
}

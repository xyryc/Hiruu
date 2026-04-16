import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { toast } from "sonner-native";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const ADDRESS_MAX_LENGTH = 200;

type LocationOption = {
  label: string;
  value: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
};

type AddressPayload = {
  address: string;
  latitude?: number;
  longitude?: number;
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

const EditBusinessProfile = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { selectedBusinesses, updateMyBusinessProfile, isLoading, getBusinessProfile } =
    useBusinessStore();
  const businessId = selectedBusinesses[0];

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploadingImageType, setUploadingImageType] = useState<"profile" | "cover" | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [about, setAbout] = useState("");
  const [isEditingBusinessName, setIsEditingBusinessName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocationOption, setSelectedLocationOption] =
    useState<LocationOption | null>(null);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const hasShownGeoapifyMissingKey = useRef(false);
  const profileRequestIdRef = useRef(0);
  const [addressDetails, setAddressDetails] = useState<AddressPayload | null>(null);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const isProfileUploading = uploadingImageType === "profile";
  const isCoverUploading = uploadingImageType === "cover";
  const showInitialSkeleton =
    loadingProfile &&
    !businessName &&
    !about &&
    !profileImage &&
    !coverImage;

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
        toast.error(t("user.setup.businessSetup.geoapifyKeyMissing"));
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
          { signal: controller.signal }
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
          new Map(nextOptions.map((item) => [item.label, item])).values()
        );

        if (selectedLocationOption) {
          setLocationOptions(
            Array.from(
              new Map(
                [selectedLocationOption, ...uniqueByLabel].map((item) => [
                  item.label,
                  item,
                ])
              ).values()
            )
          );
        } else {
          setLocationOptions(uniqueByLabel);
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
          toast.error(t("user.setup.businessSetup.failedToFetchLocationSuggestions"));
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

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!businessId) return;
      const requestId = ++profileRequestIdRef.current;
      try {
        setLoadingProfile(true);
        const data = await getBusinessProfile(businessId);
        if (!isMounted || requestId !== profileRequestIdRef.current) return;
        setBusinessName(data?.name || "");
        setAbout(data?.description || "");
        setProfileImage(data?.logo || null);
        setCoverImage(data?.coverPhoto || null);
        setSocialLinks(data?.social || {});
        const rawAddress = data?.address;
        const resolvedAddress =
          typeof rawAddress === "string"
            ? rawAddress
            : rawAddress?.address || "";
        setValue(resolvedAddress);
        setLocationSearch(resolvedAddress);

        if (rawAddress && typeof rawAddress === "object") {
          const nextDetails: AddressPayload = {
            address: resolvedAddress,
            latitude: toOptionalNumber(rawAddress?.latitude),
            longitude: toOptionalNumber(rawAddress?.longitude),
            placeId: toOptionalString(rawAddress?.placeId),
            city: toOptionalString(rawAddress?.city),
            state: toOptionalString(rawAddress?.state),
            country: toOptionalString(rawAddress?.country),
          };
          setAddressDetails(nextDetails);
          if (resolvedAddress) {
            const seededOption = {
              label: resolvedAddress,
              value: resolvedAddress,
              latitude: nextDetails.latitude,
              longitude: nextDetails.longitude,
              placeId: nextDetails.placeId,
              city: nextDetails.city,
              state: nextDetails.state,
              country: nextDetails.country,
            };
            setSelectedLocationOption(seededOption);
            setLocationOptions([seededOption]);
          }
        } else if (resolvedAddress) {
          setAddressDetails({ address: resolvedAddress });
        }
      } catch (error: any) {
        if (!isMounted || requestId !== profileRequestIdRef.current) return;
        toast.error(error?.message || t("user.profile.failedToLoadBusinessProfile"));
      } finally {
        if (isMounted && requestId === profileRequestIdRef.current) {
          setLoadingProfile(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [businessId, getBusinessProfile]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("user.setup.businessSetup.permissionRequired"),
        t("user.setup.businessSetup.mediaLibraryPermissionMessage")
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
      setUploadingImageType(type);

      try {
        // Simulate upload process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (type === "profile") {
          setProfileImage(result.assets[0].uri);
        } else {
          setCoverImage(result.assets[0].uri);
        }
      } catch {
        Alert.alert(t("common.error"), t("user.setup.businessSetup.failedToUploadImage"));
      } finally {
        setUploadingImageType((prev) => (prev === type ? null : prev));
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
        t("user.setup.businessSetup.permissionRequired"),
        t("user.setup.businessSetup.cameraPermissionMessage")
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
    if (uploadingImageType) return;

    Alert.alert(
      t(
        type === "profile"
          ? "user.setup.businessSetup.profilePhotoTitle"
          : "user.setup.businessSetup.coverPhotoTitle"
      ),
      t("user.setup.businessSetup.chooseOption"),
      [
        {
          text: t("user.setup.businessSetup.chooseFromGallery"),
          onPress: () => pickImage(type),
        },
        {
          text: t("user.setup.businessSetup.takePhoto"),
          onPress: () => takePhoto(type),
        },
        ...((type === "profile" && profileImage) ||
          (type === "cover" && coverImage)
          ? [
              {
                text: t("user.setup.businessSetup.removePhoto"),
                style: "destructive" as const,
                onPress: () => removeImage(type),
              },
          ]
          : []),
          {
            text: t("user.setup.businessSetup.cancel"),
            style: "cancel" as const,
          },
      ]
    );
  };

  const removeImage = (type: "profile" | "cover") => {
    Alert.alert(t("user.setup.businessSetup.removePhoto"), t("user.setup.businessSetup.removePhotoConfirmMessage"), [
        {
          text: t("user.setup.businessSetup.cancel"),
          style: "cancel" as const,
        },
        {
          text: t("user.setup.businessSetup.remove"),
          style: "destructive" as const,
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

  const handleSave = async () => {
    if (!businessId) {
      toast.error(t("user.profile.noBusinessSelected"));
      return;
    }

    const resolvedAddress = (value || locationSearch || "")
      .trim()
      .slice(0, ADDRESS_MAX_LENGTH);
    if (!resolvedAddress) {
      toast.error(t("user.setup.businessSetup.locationRequired"));
      return;
    }
    if (!selectedLocationOption) {
      toast.error(t("user.setup.businessSetup.selectValidLocation"));
      return;
    }
    const latitude = toOptionalNumber(
      selectedLocationOption?.latitude ?? addressDetails?.latitude
    );
    const longitude = toOptionalNumber(
      selectedLocationOption?.longitude ?? addressDetails?.longitude
    );
    const payload = {
      name: businessName.trim(),
      description: about.trim(),
      address: {
        address: resolvedAddress,
        latitude,
        longitude,
        placeId: toOptionalString(
          selectedLocationOption?.placeId ?? addressDetails?.placeId
        ),
        city: toOptionalString(selectedLocationOption?.city ?? addressDetails?.city),
        state: toOptionalString(
          selectedLocationOption?.state ?? addressDetails?.state
        ),
        country: toOptionalString(
          selectedLocationOption?.country ?? addressDetails?.country
        ),
      },
      logo: profileImage,
      coverPhoto: coverImage,
      social: socialLinks,
    };

    try {
      const result = await updateMyBusinessProfile(businessId, payload);
      const messageKey = result?.message || "business_updated_successfully";
      toast.success(translateApiMessage(messageKey));
      router.back();
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.failedToUpdateBusiness"));
    }
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
          style={{ paddingTop: insets.top }}
        >
          <ScreenHeader
            className="mt-3 mx-5"
            onPressBack={() => router.back()}
            title={t("user.profile.businessEditProfileTitle")}
            titleClass="text-primary dark:text-dark-primary "
            iconColor={isDark ? "#fff" : "#111"}
          />

          <ScrollView
            className="mx-5 pt-8"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: 120,
            }}
          >
            {showInitialSkeleton ? (
              <AutoSkeletonView isLoading={true} defaultRadius={12}>
                <View className="items-center">
                  <View className="h-[119px] w-[119px] rounded-full bg-[#E5E7EB]" />
                  <View className="h-4 w-40 rounded-md bg-[#E5E7EB] mt-3" />
                </View>

                <View className="mt-8">
                  <View className="h-4 w-36 rounded-md bg-[#E5E7EB] mb-2.5" />
                  <View className="h-[150px] w-full rounded-xl bg-[#E5E7EB]" />
                </View>

                <View className="mt-8">
                  <View className="h-4 w-32 rounded-md bg-[#E5E7EB] mb-2.5" />
                  <View className="h-12 w-full rounded-xl bg-[#E5E7EB]" />
                </View>

                <View className="mt-8">
                  <View className="h-4 w-24 rounded-md bg-[#E5E7EB] mb-2.5" />
                  <View className="h-12 w-full rounded-xl bg-[#E5E7EB]" />
                </View>

                <View className="mt-8">
                  <View className="h-4 w-36 rounded-md bg-[#E5E7EB] mb-2.5" />
                  <View className="h-[120px] w-full rounded-xl bg-[#E5E7EB]" />
                </View>

                <View className="mt-8">
                  <View className="h-4 w-28 rounded-md bg-[#E5E7EB] mb-2.5" />
                  <View className="h-[220px] w-full rounded-xl bg-[#E5E7EB]" />
                </View>

                <View className="h-12 w-full rounded-full bg-[#E5E7EB] my-10" />
              </AutoSkeletonView>
            ) : (
              <>
            {/* Profile Photo */}
            <View className="items-center">
              <View className="bg-[#ffffff] h-[119px] w-[119px] flex-row justify-center items-center rounded-full relative">
                <AutoSkeletonView
                  isLoading={isProfileUploading || (loadingProfile && !profileImage)}
                  defaultRadius={100}
                >
                  <Image
                    source={
                      profileImage || require("@/assets/images/placeholder.png")
                    }
                    style={{ height: 116, width: 116, borderRadius: 100 }}
                    transition={300}
                    contentFit="cover"
                  />
                </AutoSkeletonView>

                {!isProfileUploading && (
                  <TouchableOpacity
                    onPress={() => showImagePickerOptions("profile")}
                    className="h-8 w-8 border border-[#EEEEEE] bg-white rounded-full absolute bottom-2 right-2 flex-row justify-center items-center"
                  >
                    <Feather name="edit-2" size={16} color="#282930" />
                  </TouchableOpacity>
                )}
              </View>
              <Text className="pt-2.5 font-proximanova-regular text-sm text-primary dark:text-dark-primary text-center">
                {isProfileUploading
                  ? t("user.setup.businessSetup.uploading")
                  : profileImage
                    ? t("user.setup.businessSetup.changeProfilePhoto")
                    : t("user.setup.businessSetup.uploadProfilePhoto")}
              </Text>
            </View>

            {/* Cover Photo */}
            <View className="relative mt-8">
              <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2">
                {coverImage
                  ? t("user.setup.businessSetup.coverPhoto")
                  : t("user.setup.businessSetup.uploadCoverPhoto")}
              </Text>
              <View className="relative">
                {isCoverUploading ? (
                  <AutoSkeletonView isLoading={true} defaultRadius={12}>
                    <View className="w-full h-[150px] rounded-xl bg-[#E5E7EB]" />
                  </AutoSkeletonView>
                ) : loadingProfile && !coverImage ? (
                  <AutoSkeletonView isLoading={true} defaultRadius={12}>
                    <View className="w-full h-[150px] rounded-xl bg-[#E5E7EB]" />
                  </AutoSkeletonView>
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
                      {t("user.setup.businessSetup.uploadPhoto")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* inpute field  */}
            <View className="flex-row justify-between items-center mt-8 ">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {t("user.setup.businessSetup.businessName")}
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditingBusinessName((prev) => !prev)}
              >
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                  {isEditingBusinessName ? t("user.profile.done") : t("user.profile.edit")}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <TextInput
                placeholder={t("user.setup.businessSetup.enterBusinessName")}
                className="w-full pl-3 pr-4 py-4 bg-white border mt-2.5 border-[#EEEEEE] rounded-xl text-[#7A7A7A]"
                keyboardType="default"
                autoCapitalize="none"
                value={businessName}
                onChangeText={setBusinessName}
                editable={isEditingBusinessName}
              />
            </View>

            {/* location */}
            <View className="mt-8">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {t("user.setup.businessSetup.location")}
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
                placeholder={t("user.setup.businessSetup.searchLocation")}
                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm mt-2.5"
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
                        setAddressDetails({
                          address: trimmedLabel,
                          latitude: item.latitude,
                          longitude: item.longitude,
                          placeId: item.placeId,
                          city: item.city,
                          state: item.state,
                          country: item.country,
                        });
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
                  {t("user.setup.businessSetup.searchingLocations")}
                </Text>
              ) : null}
              {isLocationFocused &&
                locationSearch.trim().length >= 3 &&
                !isSearchingLocation &&
                locationOptions.length === 0 ? (
                <Text className="mt-2 text-xs font-proximanova-regular text-secondary">
                  {t("user.setup.businessSetup.noLocationsFound")}
                </Text>
              ) : null}
            </View>

            {/* Add a About Business */}
            <View className="flex-row justify-between items-center mt-8 ">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {t("user.setup.businessSetup.aboutBusiness")}
              </Text>
              <TouchableOpacity onPress={() => setIsEditingAbout((prev) => !prev)}>
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                  {isEditingAbout ? t("user.profile.done") : t("user.profile.edit")}
                </Text>
              </TouchableOpacity>
            </View>

            <View>
              <TextInput
                placeholder={t("user.setup.businessSetup.typeHere")}
                placeholderTextColor="#7A7A7A"
                className="w-full pl-3 pr-4 pt-4 pb-4 bg-white border mt-2.5 border-[#EEEEEE] rounded-xl text-primary text-base"
                keyboardType="default"
                autoCapitalize="sentences"
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
                style={{ minHeight: 120 }}
                value={about}
                onChangeText={setAbout}
                editable={isEditingAbout}
              />
            </View>

            <View className="mt-8">
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {t("user.profile.contactUsOn")}
                </Text>
                <TouchableOpacity onPress={() => setIsEditingSocials((prev) => !prev)}>
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                    {isEditingSocials ? t("user.profile.done") : t("user.profile.edit")}
                  </Text>
                </TouchableOpacity>
              </View>
              <ConnectSocials
                value={socialLinks}
                onChange={(next) => setSocialLinks((prev: any) => ({ ...prev, ...next }))}
                canEdit={isEditingSocials}
              />
            </View>

            <PrimaryButton
              className='my-10'
              title={t("user.profile.saveChange")}
              onPress={handleSave}
              loading={isLoading}
            />
              </>
            )}
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditBusinessProfile;

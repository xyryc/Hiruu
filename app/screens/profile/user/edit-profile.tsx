import ScreenHeader from "@/components/header/ScreenHeader";
import DynamicBackground from "@/components/layout/DynamicBackground";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import BasicNameplateCard from "@/components/ui/cards/BasicNameplateCard";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
import MultiSelectCompanyDropdown from "@/components/ui/inputs/MultiSelectCompanyDropdown";
import ProfileImagePicker from "@/components/ui/inputs/ProfileImagePicker";
import ColorPickerModal from "@/components/ui/modals/ColorPickerModal";
import EditBadgeModal from "@/components/ui/modals/EditBadgeModal";
import InterestModal from "@/components/ui/modals/InterestModal";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { Companies, Company } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
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

const DEFAULT_PROFILE_COLOR = "#E5F4FD";
const DEFAULT_GRADIENT_COLORS: [string, string] = ["#E5F4FD", "#FFFFFF"];
const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const NAME_ALLOWED_CHARS_REGEX = /[^\p{L}\s.'-]/gu;
const NAME_VALIDATION_REGEX = /^[\p{L}][\p{L}\s.'-]{0,48}[\p{L}]$/u;

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

const Edit = () => {
  const { t } = useTranslation();
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionIconStyle = {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
  } as const;
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "sports",
    "music",
    "photography",
    "art",
  ]);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [shortIntro, setShortIntro] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Companies[]>([]);
  const [hasExperienceEdits, setHasExperienceEdits] = useState(false);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [pickerType, setPickerType] = useState<"solid" | "gradient">("solid");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [profileColor, setProfileColor] = useState(DEFAULT_PROFILE_COLOR);
  const [gradientColors, setGradientColors] =
    useState<[string, string]>(DEFAULT_GRADIENT_COLORS);
  const [isAppearanceDirty, setIsAppearanceDirty] = useState(false);
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
  const profileRequestIdRef = useRef(0);
  const hasShownGeoapifyMissingKey = useRef(false);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const getProfile = useProfileStore((state) => state.getProfile);
  const syncExperiences = useProfileStore((state) => state.syncExperiences);
  const setLocalProfileAppearance = useProfileStore(
    (state) => state.setLocalProfileAppearance
  );
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const equippedNameplate = profileData?.appearance?.nameplate;
  const showInitialSkeleton = isLoadingProfile && !profileData;
  const profileAddress =
    profileData?.address?.address ||
    [profileData?.address?.city, profileData?.address?.country]
      .filter(Boolean)
      .join(", ");
  const sanitizeName = (value: string) =>
    value
      .normalize("NFKC")
      .replace(NAME_ALLOWED_CHARS_REGEX, "")
      .replace(/\s{2,}/g, " ")
      .trimStart();

  const loadProfile = useCallback(async () => {
    const requestId = ++profileRequestIdRef.current;
    try {
      setIsLoadingProfile(true);
      const result = await getProfile();
      if (requestId !== profileRequestIdRef.current) return;
      setProfileData(result.data);
      setDisplayName(result.data?.name || "");
      setAvatarUri(result.data?.avatar || null);
      const address = result.data?.address;
      if (address?.address) {
        const initialOption: LocationOption = {
          label: address.address,
          value: address.address,
          latitude: Number(address.latitude || 0),
          longitude: Number(address.longitude || 0),
          placeId: address.placeId,
          city: address.city,
          state: address.state,
          country: address.country,
        };
        setLocationSearch(address.address);
        setSelectedLocationOption(initialOption);
        if (
          typeof address.latitude === "number" &&
          typeof address.longitude === "number"
        ) {
          setSelectedCoords({
            latitude: address.latitude,
            longitude: address.longitude,
          });
        }
      } else {
        setLocationSearch("");
        setSelectedLocationOption(null);
        setSelectedCoords(null);
      }
      setShortIntro(result.data?.bio || "");
      if (Array.isArray(result.data?.interest)) {
        setSelectedInterests(result.data.interest);
      }
      if (Array.isArray(result.data?.experiences)) {
        const mappedExperiences: Companies[] = result.data.experiences.map(
          (exp: any) => ({
            id: exp?.id,
            companyId:
              exp?.businessId ||
              exp?.companyId ||
              `custom_${exp?.customBusinessName || exp?.company?.name || Date.now()}`,
            businessId: exp?.businessId || exp?.companyId || undefined,
            companyName:
              exp?.company?.name ||
              exp?.business?.name ||
              exp?.customBusinessName ||
              "Company",
            logo:
              exp?.company?.logo ||
              exp?.business?.logo ||
              exp?.customBusinessLogo ||
              undefined,
            isOfficial: exp?.isOfficial === true,
            customBusinessName: exp?.customBusinessName || undefined,
            customBusinessLogo: exp?.customBusinessLogo || null,
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            position: exp.position || "",
            description: exp.description || "",
            isCurrent: Boolean(exp.isCurrent),
          })
        );

        const companyMap = new Map<string, Company>();
        mappedExperiences.forEach((exp) => {
          if (!exp.companyId) return;
          if (!companyMap.has(exp.companyId)) {
            companyMap.set(exp.companyId, {
              id: exp.companyId,
              name: exp.companyName || "Company",
              logo: exp.logo || undefined,
              isCustom: !exp.businessId,
            });
          }
        });

        setWorkExperiences(mappedExperiences);
        setSelectedCompanies(Array.from(companyMap.values()));
        setHasExperienceEdits(false);
      }
      if (result.data?.social && typeof result.data.social === "object") {
        setSocialLinks(result.data.social);
      }
    } catch {
      // Silent fail to keep edit screen stable.
    } finally {
      if (requestId !== profileRequestIdRef.current) return;
      setIsLoadingProfile(false);
    }
  }, [getProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      return () => { };
    }, [loadProfile])
  );

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
  }, [locationSearch, selectedLocationOption, t]);

  useEffect(() => {
    if (isAppearanceDirty || isSaving) return;

    const apiTheme = profileData?.appearance?.profileTheme;
    if (apiTheme && typeof apiTheme === "object") {
      setPickerType(apiTheme.type === "gradient" ? "gradient" : "solid");
      setProfileColor(String(apiTheme.solidColor || DEFAULT_PROFILE_COLOR));
      setGradientColors(
        Array.isArray(apiTheme.gradientColors) && apiTheme.gradientColors.length >= 2
          ? [
            String(apiTheme.gradientColors[0] || DEFAULT_GRADIENT_COLORS[0]),
            String(apiTheme.gradientColors[1] || DEFAULT_GRADIENT_COLORS[1]),
          ]
          : DEFAULT_GRADIENT_COLORS
      );
      return;
    }

    const appearance = user?.profileAppearance;
    if (!appearance) return;

    setPickerType(appearance.pickerType === "gradient" ? "gradient" : "solid");
    setProfileColor(appearance.profileColor || DEFAULT_PROFILE_COLOR);
    setGradientColors(
      Array.isArray(appearance.gradientColors) &&
        appearance.gradientColors.length >= 2
        ? [
          String(appearance.gradientColors[0] || DEFAULT_GRADIENT_COLORS[0]),
          String(appearance.gradientColors[1] || DEFAULT_GRADIENT_COLORS[1]),
        ]
        : DEFAULT_GRADIENT_COLORS
    );
  }, [isAppearanceDirty, isSaving, profileData?.appearance?.profileTheme, user?.profileAppearance]);

  const handleColorSelect = (color: string | string[]) => {
    setIsAppearanceDirty(true);

    if (Array.isArray(color)) {
      setGradientColors([
        String(color[0] || DEFAULT_GRADIENT_COLORS[0]),
        String(color[1] || DEFAULT_GRADIENT_COLORS[1]),
      ]);
      return;
    }

    setProfileColor(color);
  };

  const handlePickerTypeChange = (
    nextType: SetStateAction<"solid" | "gradient">
  ) => {
    setIsAppearanceDirty(true);
    setPickerType((prev) =>
      typeof nextType === "function" ? nextType(prev) : nextType
    );
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const normalizedExperiences = workExperiences.filter(
        (exp) =>
          Boolean(
            exp?.businessId ||
              exp?.customBusinessName ||
              exp?.companyId ||
              exp?.companyName
          )
      );

      for (const exp of normalizedExperiences) {
        const hasBusinessRef = Boolean(exp?.businessId);
        const hasCustomName = Boolean(String(exp?.customBusinessName || exp?.companyName || "").trim());
        const hasPosition = Boolean(String(exp?.position || "").trim());
        const hasStartDate = Boolean(exp?.startDate);

        if (!hasBusinessRef && !hasCustomName) {
          console.log("[EditProfile] experience validation failed: missing company reference", {
            experience: exp,
          });
          toast.error("Please select a company or enter a custom company name.");
          return;
        }
        if (!hasPosition) {
          console.log("[EditProfile] experience validation failed: missing position", {
            experience: exp,
          });
          toast.error("Please enter your position for each experience.");
          return;
        }
        if (!hasStartDate) {
          console.log("[EditProfile] experience validation failed: missing startDate", {
            experience: exp,
          });
          toast.error("Please select a start date for each experience.");
          return;
        }
      }

      // Keep one draft per company from UI
      const uniqueExperienceDrafts = new Map<string, Companies>();
      normalizedExperiences.forEach((exp) => {
        const key =
          exp?.id ||
          exp?.businessId ||
          exp?.companyId ||
          exp?.customBusinessName;
        if (!key) return;
        if (!uniqueExperienceDrafts.has(String(key))) {
          uniqueExperienceDrafts.set(String(key), exp);
        }
      });

      const payload: any = {
        bio: shortIntro,
        interest: selectedInterests,
        social: socialLinks,
      };

      const normalizedName = displayName.trim();
      const fallbackName = String(profileData?.name || "").trim();
      const nextName = normalizedName || fallbackName;

      if (nextName && !NAME_VALIDATION_REGEX.test(nextName)) {
        toast.error(t("validation.invalidName"));
        return;
      }

      if (nextName) {
        payload.name = nextName;
      }

      const selectedAddress = selectedLocationOption;
      if (selectedAddress) {
        payload.address = {
          address: selectedAddress.label,
          latitude: selectedCoords?.latitude ?? selectedAddress.latitude,
          longitude: selectedCoords?.longitude ?? selectedAddress.longitude,
          placeId: selectedAddress.placeId,
          city: selectedAddress.city,
          state: selectedAddress.state,
          country: selectedAddress.country,
        };
      }

      const trimmedAvatarUri = String(avatarUri || "").trim();
      const originalAvatarUri = String(profileData?.avatar || "").trim();
      const avatarChanged = Boolean(trimmedAvatarUri) && trimmedAvatarUri !== originalAvatarUri;
      if (avatarChanged && !/^https?:\/\//i.test(trimmedAvatarUri)) {
        const filename = trimmedAvatarUri.split("/").pop() || "avatar.jpg";
        const extensionMatch = /\.(\w+)$/.exec(filename);
        const extension = extensionMatch?.[1]?.toLowerCase();
        const mimeType =
          extension === "png"
            ? "image/png"
            : extension === "webp"
              ? "image/webp"
              : "image/jpeg";

        payload.avatar = {
          uri: trimmedAvatarUri,
          type: mimeType,
          name: filename,
        };
      }

      console.log(
        "[EditProfile] updateProfile payload",
        JSON.stringify(
          {
            ...payload,
            avatar: payload.avatar
              ? {
                name: payload.avatar.name,
                type: payload.avatar.type,
                uri: payload.avatar.uri,
              }
              : undefined,
          },
          null,
          2
        )
      );

      const result = await updateProfile(payload);
      console.log("[EditProfile] updateProfile response", JSON.stringify(result, null, 2));
      const profileThemePayload =
        pickerType === "gradient"
          ? {
            type: "gradient" as const,
            gradientColors: [gradientColors[0], gradientColors[1]],
          }
          : {
            type: "solid" as const,
            solidColor: profileColor,
          };

      await axiosInstance.patch("/cosmetics/appearance", {
        profileTheme: profileThemePayload,
      });
      await setLocalProfileAppearance({
        pickerType,
        profileColor,
        gradientColors,
      });
      let experienceSyncSummary: any = null;
      if (hasExperienceEdits) {
        experienceSyncSummary = await syncExperiences(
          Array.from(uniqueExperienceDrafts.values()),
          Array.isArray(profileData?.experiences) ? profileData.experiences : []
        );
        console.log("[EditProfile] syncExperiences completed", {
          draftCount: uniqueExperienceDrafts.size,
          summary: experienceSyncSummary,
        });
      }
      await getProfile();

      if (
        hasExperienceEdits &&
        experienceSyncSummary?.skippedSystemManaged > 0 &&
        experienceSyncSummary?.created === 0 &&
        experienceSyncSummary?.updated === 0 &&
        experienceSyncSummary?.deleted === 0
      ) {
        toast.error(
          translateApiMessage(
            "exceptions_system_added_experiences_cannot_be_edited_or_deleted"
          )
        );
        return;
      }

      const messageKey = result?.message || "profile_updated_successfully";
      toast.success(translateApiMessage(messageKey));
      router.replace({
        pathname: "/(tabs)/user-profile",
        params: { refreshAt: Date.now().toString() },
      });
    } catch (error: any) {
      const messageKey =
        (Array.isArray(error?.response?.data?.data) &&
          error.response.data.data.length > 0 &&
          String(error.response.data.data[0])) ||
        error?.response?.data?.message ||
        error?.message ||
        "UNKNOWN_ERROR";
      toast.error(translateApiMessage(messageKey));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveExperience = useCallback(async (experience: Companies) => {
    try {
      if (experience?.isOfficial === true) {
        toast.error(
          translateApiMessage(
            "exceptions_system_added_experiences_cannot_be_edited_or_deleted"
          )
        );
        return false;
      }

      if (!experience?.id) {
        return true;
      }

      await axiosInstance.delete(`/experiences/${experience.id}`);
      return true;
    } catch (error: any) {
      const messageKey =
        error?.response?.data?.message ||
        error?.message ||
        "failed_to_delete_experience";
      toast.error(translateApiMessage(messageKey));
      return false;
    }
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <DynamicBackground
        className="rounded-b-2xl overflow-hidden"
        style={{
          paddingTop: insets.top + 10,
        }}
        pickerType={pickerType}
        profileColor={profileColor}
        gradientColors={gradientColors}
      >
        <ScreenHeader
          className="px-4 pb-6"
          onPressBack={() => router.back()}
          title={t("user.profile.businessEditProfileTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity
              onPress={() => setShowColorPicker(true)}
              className="h-10 w-10 bg-white rounded-full items-center justify-center"
            >
              <Ionicons name="brush-outline" size={20} color="black" />
            </TouchableOpacity>
          }
        />
      </DynamicBackground>

      <ScrollView
        contentContainerClassName='mt-6'
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {showInitialSkeleton ? (
          <View>
            <View className="mx-5">
              <View className="h-6 w-40 rounded-md bg-[#E5E7EB] mb-3" />
              <View className="h-28 rounded-2xl bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-8">
              <View className="h-6 w-28 rounded-md bg-[#E5E7EB] mb-3" />
              <View className="h-20 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />
            </View>

            <View className="mx-5 mt-8">
              <View className="h-6 w-32 rounded-md bg-[#E5E7EB] mb-3" />
              <View className="h-14 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />
            </View>

            <View className="mx-5 mt-8">
              <View className="h-6 w-28 rounded-md bg-[#E5E7EB] mb-3" />
              <View className="h-14 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />
            </View>

            <View className="mx-5 mt-8">
              <View className="h-6 w-36 rounded-md bg-[#E5E7EB] mb-3" />
              <View className="h-44 rounded-2xl border border-[#EEEEEE] bg-[#F3F4F6]" />
            </View>

            <View className="mx-5 my-10 h-14 rounded-full bg-[#E5E7EB]" />
          </View>
        ) : null}

        {!showInitialSkeleton ? (
          <>
            <View className="mx-5">
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                  {t("user.profile.editUserProfile.yourNameplate")}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push("/screens/profile/nameplate-options")}
                >
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline">
                    {t("user.profile.edit")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* equipped nameplate */}
              {equippedNameplate?.metadata ? (
                <DynamicNameplateCard
                  metadata={equippedNameplate.metadata}
                  mode="redeem"
                  preview={{
                    avatarUrl: profileData?.avatar,
                    name: profileData?.name,
                    location: profileAddress,
                    rating: profileData?.rating ?? 0,
                    isVerified: Boolean(profileData?.isEmailVerified),
                  }}
                />
              ) : (
                <BasicNameplateCard
                  avatarUrl={profileData?.avatar}
                  name={profileData?.name}
                  location={profileAddress}
                  rating={profileData?.rating ?? 0}
                  isVerified={Boolean(profileData?.isEmailVerified)}
                />
              )}
            </View>

            {/* Name + Avatar */}
            <View className="mx-5 mt-8">
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                  Name
                </Text>
                <TouchableOpacity onPress={() => setIsEditingIdentity((prev) => !prev)}>
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                    {isEditingIdentity ? t("user.profile.done") : t("user.profile.edit")}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                value={displayName}
                onChangeText={(text) => setDisplayName(sanitizeName(text))}
                placeholder={t("user.profile.editUserProfile.enterYourName", { defaultValue: "Enter your name" })}
                placeholderTextColor="#7A7A7A"
                className="w-full text-sm text-primary border border-[#0000000D] rounded-xl p-3"
                editable={isEditingIdentity}
              />

              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-6 mb-3">
                Avatar
              </Text>
              <ProfileImagePicker
                value={avatarUri}
                onImageChange={setAvatarUri}
                size={96}
              />
            </View>

            {/* Badge item */}
            {/* Location */}
            <View className="mx-5 mt-8">
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                  {t("user.setup.location", { defaultValue: "Location" })}
                </Text>
                <TouchableOpacity onPress={() => setIsEditingLocation((prev) => !prev)}>
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                    {isEditingLocation ? t("user.profile.done") : t("user.profile.edit")}
                  </Text>
                </TouchableOpacity>
              </View>

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
                  }
                }}
                placeholder={t("user.setup.selectLocation", { defaultValue: "Select location" })}
                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-[10px] text-placeholder text-sm"
                autoCapitalize="none"
                editable={isEditingLocation}
              />

              {isSearchingLocation && isEditingLocation ? (
                <Text className="text-xs text-secondary mt-2">
                  {t("common.loading", { defaultValue: "Loading..." })}
                </Text>
              ) : null}

              {isEditingLocation &&
              isLocationFocused &&
              locationSearch.trim().length >= 3 &&
              locationOptions.length > 0 ? (
                <View className="mt-2 border border-[#EEEEEE] bg-white rounded-[10px] overflow-hidden">
                  {locationOptions.map((item, index) => (
                    <TouchableOpacity
                      key={`${item.value}-${index}`}
                      activeOpacity={0.8}
                      onPress={() => {
                        setLocationSearch(item.label);
                        setSelectedLocationOption(item);
                        setSelectedCoords({
                          latitude: item.latitude,
                          longitude: item.longitude,
                        });
                        setIsLocationFocused(false);
                      }}
                      className="px-4 py-3 border-b border-[#F3F4F6]"
                    >
                      <Text className="text-sm text-primary">{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Badge item */}
            <View className="mx-5 flex-row justify-between mt-8 items-center">
              <View className="flex-row gap-2.5 items-center">
                <DynamicBackground
                  className="h-8 w-8 rounded-full flex-row items-center justify-center overflow-hidden"
                  style={sectionIconStyle}
                  pickerType={pickerType}
                  profileColor={profileColor}
                  gradientColors={gradientColors}
                >
                  <FontAwesome6 name="id-badge" size={14} color="black" />
                </DynamicBackground>
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                  {t("user.profile.userProfile.badge")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsBadgeVisible(true)}>
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                  {t("user.profile.edit")}
                </Text>
              </TouchableOpacity>
            </View>
            <BadgeCard
              className="mx-5 mt-3.5"
              badges={Array.isArray(profileData?.appearance?.badges) ? profileData.appearance.badges : []}
            />

            <EditBadgeModal
              visible={isBadgeVisible}
              onClose={() => setIsBadgeVisible(false)}
            />

            {/* short intro */}
            <View>
              <View className="flex-row justify-between items-center mx-5 mt-8 ">
                <View className="flex-row gap-2.5">
                  <DynamicBackground
                    className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
                    style={sectionIconStyle}
                    pickerType={pickerType}
                    profileColor={profileColor}
                    gradientColors={gradientColors}
                  >
                    <MaterialCommunityIcons
                      name="file-document-check-outline"
                      size={16}
                      color="black"
                    />
                  </DynamicBackground>
                  <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                    {t("user.profile.userProfile.shortIntro")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsEditingIntro((prev) => !prev)}>
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                    {isEditingIntro ? t("user.profile.done") : t("user.profile.edit")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mx-5 mt-4">
                {isEditingIntro ? (
                  <TextInput
                    value={shortIntro}
                    onChangeText={setShortIntro}
                    placeholder={t("user.setup.businessSetup.typeHere")}
                    placeholderTextColor="#7A7A7A"
                    className="w-full text-sm text-primary border border-[#0000000D] rounded-xl p-3"
                    multiline
                    textAlignVertical="top"
                  />
                ) : (
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary border border-[#0000000D] rounded-xl p-3">
                    {shortIntro || t("user.profile.editUserProfile.noBioYet")}
                  </Text>
                )}
              </View>
            </View>


            {/* Experience */}
            <View>
              <View className="flex-row justify-between items-center mx-5 mt-8">
                <View className="flex-row gap-2.5">
                  <DynamicBackground
                    className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
                    style={sectionIconStyle}
                    pickerType={pickerType}
                    profileColor={profileColor}
                    gradientColors={gradientColors}
                  >
                    <MaterialCommunityIcons
                      name="file-document-check-outline"
                      size={16}
                      color="black"
                    />
                  </DynamicBackground>
                  <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                    {t("user.profile.userProfile.experience")}
                  </Text>
                </View>
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                  {t("user.profile.edit")}
                </Text>
              </View>

              <View className="mx-5 mt-4">
                <MultiSelectCompanyDropdown
                  selectedCompanies={selectedCompanies}
                  workExperiences={workExperiences}
                  onCompaniesChange={(companies) => {
                    setSelectedCompanies(companies);
                    setHasExperienceEdits(true);
                  }}
                  onWorkExperiencesChange={(experiences) => {
                    setWorkExperiences(experiences);
                    setHasExperienceEdits(true);
                  }}
                  onRemoveExperience={handleRemoveExperience}
                />
              </View>
            </View>

            {/*  Interests */}
            <View>
              <View className="flex-row justify-between items-center mx-5 mt-8 ">
                <View className="flex-row gap-2.5">
                  <DynamicBackground
                    className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
                    style={sectionIconStyle}
                    pickerType={pickerType}
                    profileColor={profileColor}
                    gradientColors={gradientColors}
                  >
                    <MaterialCommunityIcons
                      name="file-document-check-outline"
                      size={16}
                      color="black"
                    />
                  </DynamicBackground>
                  <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                    {t("user.profile.userProfile.interests")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setVisible(true)}>
                  <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                    {t("user.profile.edit")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mx-5 mt-4">
                <InterestSelection
                  selectedInterests={selectedInterests}
                  onInterestsChange={setSelectedInterests}
                  readonly
                  showSelectedOnly
                />
              </View>
            </View>

            <InterestModal
              visible={visible}
              initialInterests={selectedInterests}
              onClose={(next) => {
                setSelectedInterests(next);
                setVisible(false);
              }}
            />

            {/* Contact Us On */}
            <View className="flex-row justify-between items-center mx-5 mt-8 ">
              <View className="flex-row gap-2.5">
                <DynamicBackground
                  className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
                  style={sectionIconStyle}
                  pickerType={pickerType}
                  profileColor={profileColor}
                  gradientColors={gradientColors}
                >
                  <Ionicons name="call-outline" size={16} color="black" />
                </DynamicBackground>
                <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  {t("user.profile.contactUsOn")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditingSocials((prev) => !prev)}>
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                  {isEditingSocials ? t("user.profile.done") : t("user.profile.edit")}
                </Text>
              </TouchableOpacity>
            </View>

            <ConnectSocials
              className="mx-5 my-4"
              value={socialLinks}
              onChange={(next) => setSocialLinks((prev: any) => ({ ...prev, ...next }))}
              canEdit={isEditingSocials}
            />

            <PrimaryButton
              title={t("user.profile.editUserProfile.saveChanges")}
              onPress={handleSaveProfile}
              loading={isSaving}
              className='mx-5 my-10'
            />
          </>
        ) : null}
      </ScrollView>

      <ColorPickerModal
        pickerType={pickerType}
        setPickerType={handlePickerTypeChange}
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        onSelectColor={handleColorSelect}
        initialColor={profileColor}
        initialGradientColors={gradientColors}
      />
    </SafeAreaView>
  );
};

export default Edit;

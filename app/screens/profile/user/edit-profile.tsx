import ScreenHeader from "@/components/header/ScreenHeader";
import DynamicBackground from "@/components/layout/DynamicBackground";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import BasicNameplateCard from "@/components/ui/cards/BasicNameplateCard";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
import MultiSelectCompanyDropdown from "@/components/ui/inputs/MultiSelectCompanyDropdown";
import ColorPickerModal from "@/components/ui/modals/ColorPickerModal";
import EditBadgeModal from "@/components/ui/modals/EditBadgeModal";
import InterestModal from "@/components/ui/modals/InterestModal";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { Companies, Company } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useState } from "react";
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

const Edit = () => {
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "sports",
    "music",
    "photography",
    "art",
  ]);
  const [profileData, setProfileData] = useState<any>(null);
  const [shortIntro, setShortIntro] = useState("");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const [workExperiences, setWorkExperiences] = useState<Companies[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [pickerType, setPickerType] = useState<"solid" | "gradient">("solid");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [profileColor, setProfileColor] = useState(DEFAULT_PROFILE_COLOR);
  const [gradientColors, setGradientColors] =
    useState<[string, string]>(DEFAULT_GRADIENT_COLORS);
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
  const profileAddress =
    profileData?.address?.address ||
    [profileData?.address?.city, profileData?.address?.country]
      .filter(Boolean)
      .join(", ");

  const loadProfile = useCallback(async () => {
    try {
      const result = await getProfile();
      setProfileData(result.data);
      setShortIntro(result.data?.bio || "");
      if (Array.isArray(result.data?.interest)) {
        setSelectedInterests(result.data.interest);
      }
      if (Array.isArray(result.data?.experiences)) {
        const mappedExperiences: Companies[] = result.data.experiences.map(
          (exp: any) => ({
            companyId: exp.companyId,
            companyName: exp?.company?.name || "Company",
            logo: exp?.company?.logo || undefined,
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            position: exp.position || "",
            description: exp.description || "",
            isCurrent: Boolean(exp.isCurrent),
          })
        );

        const companyMap = new Map<string, Company>();
        mappedExperiences.forEach((exp) => {
          if (!companyMap.has(exp.companyId)) {
            companyMap.set(exp.companyId, {
              id: exp.companyId,
              name: exp.companyName || "Company",
              logo: exp.logo || undefined,
            });
          }
        });

        setWorkExperiences(mappedExperiences);
        setSelectedCompanies(Array.from(companyMap.values()));
      }
      if (result.data?.social && typeof result.data.social === "object") {
        setSocialLinks(result.data.social);
      }
    } catch {
      // Silent fail to keep edit screen stable.
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
  }, [user?.profileAppearance]);

  const handleColorSelect = (color: string | string[]) => {
    if (Array.isArray(color)) {
      setGradientColors([
        String(color[0] || DEFAULT_GRADIENT_COLORS[0]),
        String(color[1] || DEFAULT_GRADIENT_COLORS[1]),
      ]);
      return;
    }

    setProfileColor(color);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      // Keep one draft per company from UI
      const uniqueExperienceDrafts = new Map<string, Companies>();
      workExperiences.forEach((exp) => {
        if (!exp?.companyId) return;
        if (!uniqueExperienceDrafts.has(exp.companyId)) {
          uniqueExperienceDrafts.set(exp.companyId, exp);
        }
      });

      const payload = {
        bio: shortIntro,
        interest: selectedInterests,
        social: socialLinks,
      };

      const result = await updateProfile(payload);
      await setLocalProfileAppearance({
        pickerType,
        profileColor,
        gradientColors,
      });
      await syncExperiences(
        Array.from(uniqueExperienceDrafts.values()),
        Array.isArray(profileData?.experiences) ? profileData.experiences : []
      );
      await getProfile();

      const messageKey = result?.message || "profile_updated_successfully";
      toast.success(translateApiMessage(messageKey));
      router.replace({
        pathname: "/(tabs)/user-profile",
        params: { refreshAt: Date.now().toString() },
      });
    } catch (error: any) {
      const messageKey = error?.message || "UNKNOWN_ERROR";
      toast.error(translateApiMessage(messageKey));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <DynamicBackground
        className="rounded-b-2xl mb-6 overflow-hidden"
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
          title="Edit Profile"
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

      <ScrollView>
        <View className="mx-5">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Your Nameplate
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/screens/profile/nameplate-options")}
            >
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline">
                Edit
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

        {/* Badge item */}
        <View>
          <View className="mx-5 flex-row justify-between mt-8 items-center">
            <View className="flex-row gap-2.5 items-center">
              <DynamicBackground
                className="h-8 w-8 rounded-full flex-row items-center justify-center overflow-hidden"
                pickerType={pickerType}
                profileColor={profileColor}
                gradientColors={gradientColors}
              >
                <FontAwesome6 name="id-badge" size={14} color="black" />
              </DynamicBackground>
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Badge
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsBadgeVisible(true)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <BadgeCard className="mx-5 mt-3.5" />
        </View>


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
                Short Intro
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsEditingIntro((prev) => !prev)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                {isEditingIntro ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mx-5 mt-4">
            {isEditingIntro ? (
              <TextInput
                value={shortIntro}
                onChangeText={setShortIntro}
                placeholder="Type here..."
                placeholderTextColor="#7A7A7A"
                className="w-full text-sm text-primary border border-[#0000000D] rounded-xl p-3"
                multiline
                textAlignVertical="top"
              />
            ) : (
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary border border-[#0000000D] rounded-xl p-3">
                {shortIntro || "No bio yet."}
              </Text>
            )}
          </View>
        </View>


        {/* Experience */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <DynamicBackground
                className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
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
                Experience
              </Text>
            </View>
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              Edit
            </Text>
          </View>
          <View className="mx-5 mt-4">
            <MultiSelectCompanyDropdown
              selectedCompanies={selectedCompanies}
              workExperiences={workExperiences}
              onCompaniesChange={setSelectedCompanies}
              onWorkExperiencesChange={setWorkExperiences}
            />
          </View>
        </View>

        {/*  Interests */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <DynamicBackground
                className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
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
                Interests
              </Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
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
              pickerType={pickerType}
              profileColor={profileColor}
              gradientColors={gradientColors}
            >
              <Ionicons name="call-outline" size={16} color="black" />
            </DynamicBackground>
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              Contact Us On
            </Text>
          </View>
          <TouchableOpacity onPress={() => setIsEditingSocials((prev) => !prev)}>
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              {isEditingSocials ? "Done" : "Edit"}
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
          title="Save Changes"
          onPress={handleSaveProfile}
          loading={isSaving}
          className='mx-5 my-10'
        />
      </ScrollView>
      <ColorPickerModal
        pickerType={pickerType}
        setPickerType={setPickerType}
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

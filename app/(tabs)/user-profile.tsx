import DynamicBackground from "@/components/layout/DynamicBackground";
import GradientButton from "@/components/ui/buttons/GradientButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SmallButton from "@/components/ui/buttons/SmallButton";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import ExperienceCard from "@/components/ui/cards/ExperienceCard";
import NamePlateCard from "@/components/ui/cards/NamePlateCard";
import StatCardPrimary from "@/components/ui/cards/StatCardPrimary";
import Dropdown from "@/components/ui/dropdown/DropDown";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
import ColorPickerModal from "@/components/ui/modals/ColorPickerModal";
import ProfileSwitchModal from "@/components/ui/modals/ProfileSwitchModal";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { useProfileStore } from "@/stores/profileStore";
import { translateApiMessage } from "@/utils/apiMessages";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Profile = () => {
  const [showText, setShowText] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("traditional");
  const [profileData, setProfileData] = useState<any>(null);
  const issues = [
    { label: "traditional", value: "traditional" },
    { label: "sidebar-left", value: "sidebar-left" },
    { label: "sidebar-right", value: "sidebar-right" },
  ];
  const [isOn, setIsOn] = useState(false);
  const [isProfileSwitchOpen, setIsProfileSwitchOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { setSelectedBusinesses } = useBusinessStore();
  const {
    updateProfile,
    getProfile,
    getAnalyticsSummary,
    analyticsSummary,
    startCvBuild,
    pollCvBuildStatus,
    cancelCvBuild,
    isGeneratingCv,
    isPollingCv,
    cvBuildStatus,
    cvResult,
  } = useProfileStore();
  const getMyJobProfile = useJobStore((state) => state.getMyJobProfile);
  const jobProfile = useJobStore((state) => state.jobProfile);
  const { refreshAt } = useLocalSearchParams<{ refreshAt?: string }>();
  const insets = useSafeAreaInsets();

  // color
  const [pickerType, setPickerType] = useState<"solid" | "gradient">("solid");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [profileColor, setProfileColor] = useState("#E5F4FD");
  const [gradientColors, setGradientColors] = useState<[string, string]>([
    "#E5F4FD",
    "#fff",
  ]);

  const loadProfile = React.useCallback(async () => {
    try {
      const result = await getProfile();
      setProfileData(result.data);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load profile");
    }
  }, [getProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile, refreshAt]);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
      return () => { };
    }, [loadProfile])
  );

  useFocusEffect(
    React.useCallback(() => {
      getMyJobProfile().catch(() => null);
      return () => { };
    }, [getMyJobProfile])
  );

  useFocusEffect(
    React.useCallback(() => {
      getAnalyticsSummary().catch(() => null);
      return () => { };
    }, [getAnalyticsSummary])
  );

  const handleColorSelect = (color: string | string[]) => {
    if (Array.isArray(color)) {
      // Handle gradient
      // console.log("Selected gradient:", color);
      //@ts-ignore
      setGradientColors(color);
    } else {
      // Handle solid color
      setProfileColor(color);
    }
  };

  const bioText =
    typeof profileData?.bio === "string" ? profileData.bio.trim() : "";
  const hasBio = bioText.length > 0;
  const shortBio =
    bioText.length > 140 ? `${bioText.slice(0, 140)}...` : bioText;
  const interests: string[] = Array.isArray(profileData?.interest)
    ? profileData.interest
    : [];
  const socialLinks = profileData?.social || {};
  const experiences = Array.isArray(profileData?.experiences)
    ? profileData.experiences
    : [];
  const jobProfilePreview = [
    typeof jobProfile?.headline === "string" ? jobProfile.headline.trim() : "",
    typeof jobProfile?.about === "string" ? jobProfile.about.trim() : "",
  ].find((value) => value.length > 0);
  const formatMetric = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "0%";
    return `${Math.round(value)}%`;
  };
  const analyticsMetrics = analyticsSummary?.metrics;

  const handleSocialLinksChange = async (nextSocial: Record<string, string>) => {
    const previousSocial = profileData?.social || {};
    setProfileData((prev: any) => ({
      ...(prev || {}),
      social: { ...previousSocial, ...nextSocial },
    }));

    try {
      const mergedSocial = { ...previousSocial, ...nextSocial };
      const response = await updateProfile({ social: mergedSocial });
      if (response?.data) {
        setProfileData(response.data);
      }
    } catch (error: any) {
      setProfileData((prev: any) => ({
        ...(prev || {}),
        social: previousSocial,
      }));
      toast.error(error?.message || "Failed to update socials");
    }
  };

  const handleGenerateCv = async () => {
    try {
      const layout = (selectedIssue || "traditional") as
        | "traditional"
        | "sidebar-left"
        | "sidebar-right";

      const payload = {
        language: String((user as any)?.appSettings?.language || "en"),
        templateStyle: "modern-1",
        layout,
        demo: false as const,
      };

      const startResult = await startCvBuild(payload);
      if (startResult?.status === "completed") {
        toast.success("CV generated successfully");
        return;
      }

      const pollResult = await pollCvBuildStatus();
      if (pollResult?.status === "completed") {
        toast.success("CV generated successfully");
      } else if (useProfileStore.getState().cvBuildStatus === "timeout") {
        toast.error("CV generation is taking longer than expected");
      }
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || "Failed to generate CV"));
    }
  };

  const handleCancelCv = async () => {
    try {
      await cancelCvBuild();
      toast.success(translateApiMessage("ai_engine_cv_cancelled"));
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || "Failed to cancel CV generation"));
    }
  };

  const handleOpenCvPreview = (type: "pdf" | "image", url?: string) => {
    if (!url) return;
      router.push({
      pathname: "/screens/profile/cv-preview",
      params: {
        type,
        url,
      },
    });
  };

  const handleDownloadCv = async (url?: string) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      toast.error("Unable to open download link");
    }
  };
  return (
    <View className="flex-1 bg-white dark:bg-dark-background">
      <StatusBar style="dark" backgroundColor="#E5F4FD" translucent={false} />

      <DynamicBackground
        className="rounded-b-xl pb-3 overflow-hidden"
        style={{
          paddingTop: insets.top,
        }}
        pickerType={pickerType}
        profileColor={profileColor}
        gradientColors={gradientColors}
      >
        <View className={`flex-row justify-between items-center mt-5 mx-5`}>
          {/* profile switch */}
          <TouchableOpacity
            onPress={() => setIsProfileSwitchOpen(true)}
            className="flex-row items-center gap-2"
          >
            <Text
              className={`font-proximanova-bold text-2xl text-primary dark:text-dark-primary`}
            >
              Profile
            </Text>

            <Ionicons
              name={isProfileSwitchOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="black"
            />
          </TouchableOpacity>

          <ProfileSwitchModal
            visible={isProfileSwitchOpen}
            onClose={() => setIsProfileSwitchOpen(false)}
            onSelectUserProfile={() => {
              setIsProfileSwitchOpen(false);
              setSelectedBusinesses([]);
              requestAnimationFrame(() => {
                router.replace("/(tabs)/user-profile");
              });
            }}
            onSelectBusinessProfile={(businessId) => {
              setIsProfileSwitchOpen(false);
              setSelectedBusinesses([businessId]);
              requestAnimationFrame(() => {
                router.replace("/(tabs)/business-profile");
              });
            }}
          />


          <View className="flex-row gap-1.5 items-center justify-center">
            {/* color picker */}
            <TouchableOpacity
              onPress={() => setShowColorPicker(true)}
              className="h-10 w-10 bg-white rounded-full items-center justify-center"
            >
              <Ionicons name="brush-outline" size={20} color="black" />
            </TouchableOpacity>

            {/* color picker modal */}
            <ColorPickerModal
              pickerType={pickerType}
              setPickerType={setPickerType}
              visible={showColorPicker}
              onClose={() => setShowColorPicker(false)}
              onSelectColor={handleColorSelect}
              initialColor={profileColor}
            />

            {/* user edit screen */}
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/user/edit-profile")}
              className="h-10 w-10 bg-white rounded-full items-center justify-center"
            >
              <SimpleLineIcons name="pencil" size={18} color="black" />
            </TouchableOpacity>

            {/* setting */}
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/settings/settings")}
              className="h-10 w-10 bg-white rounded-full items-center justify-center"
            >
              <Ionicons name="settings-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </DynamicBackground>

      <ScrollView
        className="bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/screens/profile/rating")}
          className="mx-5 mt-3.5"
        >
          <NamePlateCard
            variant="variant4"
            name={profileData?.name || profileData?.email || "User"}
            address={profileData?.address?.address || "Location unavailable"}
            profileImage={profileData?.avatar || require("@/assets/images/placeholder.png")}
          />
        </TouchableOpacity>

        {/* Badge item */}
        <View className="mx-5 flex-row justify-between mt-5 items-center">
          <View className="flex-row gap-2.5 items-center">
            <DynamicBackground
              className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
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

          <TouchableOpacity
            onPress={() => router.push("/screens/profile/badge")}
          >
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              View all Badge
            </Text>
          </TouchableOpacity>
        </View>
        <BadgeCard className="mx-5 mt-3.5" />

        {/* short intro */}
        <View className="mx-5 mt-7 flex-row items-center gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            {/* <Foundation name="clipboard" size={16} color="black" /> */}
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

        {hasBio ? (
          <View className="mx-5 mt-3 rounded-xl p-3">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {showText ? bioText : shortBio}
              {bioText.length > 140 && (
                <Text
                  onPress={() => setShowText(!showText)}
                  className="font-proximanova-semibold text-sm text-[#11293A]"
                >
                  {showText ? "See less" : "Read More"}
                </Text>
              )}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/screens/profile/user/edit-profile")}
            className="mx-5 mt-4 border border-[#0000000D] rounded-xl p-3"
          >
            <Text className="font-proximanova-regular text-sm text-[#7A7A7A] dark:text-dark-secondary">
              Add a bio
            </Text>
          </TouchableOpacity>
        )}

        {/* Experience */}
        <View className="mx-5 mt-7 flex-row gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
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

        {experiences.map((experience: any, index: number) => (
          <ExperienceCard
            key={experience?.id || `${experience?.companyId}-${index}`}
            isCurrent={Boolean(experience?.isCurrent)}
            className={index === 0 ? "mt-2.5 mx-5" : "mt-2.5 mx-5"}
            companyName={experience?.company?.name}
            position={experience?.position}
            companyLogo={experience?.company?.logo}
            isVerified={Boolean(experience?.company?.isVerified)}
          />
        )
        )}

        {/* Achievement */}
        <View className=" mx-5 mt-7">
          <View className="flex-row gap-2.5 items-center">
            <DynamicBackground
              className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
              pickerType={pickerType}
              profileColor={profileColor}
              gradientColors={gradientColors}
            >
              <MaterialCommunityIcons
                className="rotate-180"
                name="medal-outline"
                size={16}
                color="black"
              />
            </DynamicBackground>
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Achievement
            </Text>
          </View>
          <View className="flex-row gap-3 mb-4 mt-4">
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.onTimeArrivalPercent)}
              title="On-Time Arrival"
              subtitle={"This month"}
              background={require("@/assets/images/stats-bg.svg")}
            />
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.taskCompletionPercent)}
              title="Task Completion"
              subtitle={"completed"}
              background={require("@/assets/images/stats-bg.svg")}
            />
          </View>
          <View className="flex-row gap-3 mb-4">
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.positiveFeedbackPercent)}
              title="Positive Feedback"
              subtitle={"positive"}
              background={require("@/assets/images/stats-bg.svg")}
            />
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.growthScorePercent)}
              title="Growth Score"
              subtitle={"growth"}
              background={require("@/assets/images/stats-bg.svg")}
            />
          </View>
        </View>

        {/* Interests */}
        <View className="mx-5 mt-2 flex-row gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
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

        <View className="mx-5 mt-5">
          <InterestSelection
            selectedInterests={interests}
            onInterestsChange={() => { }}
            readonly
            showSelectedOnly
          />
        </View>

        <View className="mx-5 mt-7 flex-row gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            <MaterialCommunityIcons
              name="briefcase-outline"
              size={16}
              color="black"
            />
          </DynamicBackground>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Job Profile
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/screens/profile/user/job-profile")}
          className="mx-5 mt-4 rounded-xl border border-[#0000000D] px-4 py-3"
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
                {jobProfile?.headline?.trim() || "Set up your job profile"}
              </Text>
              <Text className="mt-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {jobProfilePreview || "Add your role preferences, salary expectation, skills, and weekly availability."}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#7A7A7A" />
          </View>
        </TouchableOpacity>

        {/* Contact Us On */}
        <View className="flex-row items-center gap-2.5 mt-6 mx-5">
          <DynamicBackground
            className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            <Ionicons name="call-outline" size={16} color="black" />
          </DynamicBackground>

          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            Contact Me On
          </Text>
        </View>

        <ConnectSocials
          className="mx-5 my-4"
          value={socialLinks}
          onChange={handleSocialLinksChange}
          hideEmpty
          canEdit={false}
        />

        {/* generate cv */}
        <View className="mx-5 mt-6 flex-row justify-between items-center">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Options for export
          </Text>

          {/* <ToggleButton isOn={isOn} setIsOn={setIsOn} title="Keep colors" /> */}
        </View>

        <View className="mx-5 mt-4">
          <Dropdown
            placeholder="Select Style"
            options={issues}
            value={selectedIssue}
            onSelect={setSelectedIssue}
          />
        </View>

        <GradientButton
          className="mx-5 mt-3"
          title={
            isGeneratingCv || isPollingCv
              ? "Generating CV..."
              : "Generate CV With AI"
          }
          icon={
            <Ionicons
              name={isGeneratingCv || isPollingCv ? "time-outline" : "sparkles-outline"}
              size={18}
              color="#FFFFFF"
            />
          }
          disabled={isGeneratingCv || isPollingCv}
          onPress={handleGenerateCv}
        />

        {cvBuildStatus === "pending" && (
          <View className="mx-5 mt-3">
            <PrimaryButton
              title="Cancel"
              onPress={handleCancelCv}
              showIcon={false}
              className="bg-[#EF4444] py-3 px-4"
            />
          </View>
        )}

        {cvBuildStatus === "completed" && (cvResult?.pdf || cvResult?.image) && (
          <View className="mx-5 mt-4 border border-[#0000000D] rounded-xl p-3">
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary mb-2">
              Generated CV
            </Text>

            {cvResult?.pdf ? (
              <View className="flex-row justify-between items-center py-2">
                <TouchableOpacity onPress={() => handleOpenCvPreview("pdf", cvResult.pdf)}>
                  <Text className="font-proximanova-medium text-[#4FB2F3] underline">
                    PDF CV
                  </Text>
                </TouchableOpacity>
                <View className="w-28">
                  <SmallButton
                    title="Download"
                    onPress={() => handleDownloadCv(cvResult.pdf)}
                    className="rounded-xl py-3 px-4"
                  />
                </View>
              </View>
            ) : null}

            {cvResult?.image ? (
              <View className="flex-row justify-between items-center py-2">
                <TouchableOpacity onPress={() => handleOpenCvPreview("image", cvResult.image)}>
                  <Text className="font-proximanova-medium text-[#4FB2F3] underline">
                    Image CV
                  </Text>
                </TouchableOpacity>
                <View className="w-28">
                  <SmallButton
                    title="Download"
                    onPress={() => handleDownloadCv(cvResult.image)}
                    className="rounded-xl py-3 px-4"
                  />
                </View>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;


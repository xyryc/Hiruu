import DynamicBackground from "@/components/layout/DynamicBackground";
import GradientButton from "@/components/ui/buttons/GradientButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SmallButton from "@/components/ui/buttons/SmallButton";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import BasicNameplateCard from "@/components/ui/cards/BasicNameplateCard";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import ExperienceCard from "@/components/ui/cards/ExperienceCard";
import StatCardPrimary from "@/components/ui/cards/StatCardPrimary";
import Dropdown from "@/components/ui/dropdown/DropDown";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
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
import { AutoSkeletonView } from "react-native-auto-skeleton";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Profile = () => {
  const { t } = useTranslation();
  const [showText, setShowText] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("traditional");
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const profileRequestIdRef = useRef(0);
  const issues = [
    { label: t("user.profile.userProfile.cvStyles.traditional"), value: "traditional" },
    { label: t("user.profile.userProfile.cvStyles.sidebarLeft"), value: "sidebar-left" },
    { label: t("user.profile.userProfile.cvStyles.sidebarRight"), value: "sidebar-right" },
  ];
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

  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };

  // color
  const pickerType =
    user?.profileAppearance?.pickerType === "gradient" ? "gradient" : "solid";
  const profileColor =
    user?.profileAppearance?.profileColor || "#E5F4FD";
  const gradientColors: [string, string] =
    Array.isArray(user?.profileAppearance?.gradientColors) &&
      user.profileAppearance.gradientColors.length >= 2
      ? [
        String(user.profileAppearance.gradientColors[0] || "#E5F4FD"),
        String(user.profileAppearance.gradientColors[1] || "#fff"),
      ]
      : ["#E5F4FD", "#fff"];

  const loadProfile = React.useCallback(async () => {
    const requestId = ++profileRequestIdRef.current;
    try {
      setIsLoadingProfile(true);
      const result = await getProfile();
      if (requestId !== profileRequestIdRef.current) return;
      setProfileData(result.data);
    } catch (error: any) {
      if (requestId !== profileRequestIdRef.current) return;
      if (isExpectedAuthError(error)) return;
      toast.error(error?.message || t("user.profile.userProfile.failedToLoadProfile"));
    } finally {
      if (requestId !== profileRequestIdRef.current) return;
      setIsLoadingProfile(false);
    }
  }, [getProfile, t]);

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
  const equippedNameplate = profileData?.appearance?.nameplate;
  const isFullyVerified = Boolean(
    profileData?.isEmailVerified && profileData?.isNumberVerified
  );
  const showInitialSkeleton = isLoadingProfile && !profileData;
  const profileAddress =
    profileData?.address?.address ||
    [profileData?.address?.city, profileData?.address?.country]
      .filter(Boolean)
      .join(", ");

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
      toast.error(error?.message || t("user.profile.userProfile.failedToUpdateSocials"));
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
        toast.success(t("user.profile.userProfile.cvGeneratedSuccessfully"));
        return;
      }

      const pollResult = await pollCvBuildStatus();
      if (pollResult?.status === "completed") {
        toast.success(t("user.profile.userProfile.cvGeneratedSuccessfully"));
      } else if (useProfileStore.getState().cvBuildStatus === "timeout") {
        toast.error(t("user.profile.userProfile.cvGenerationTakingLonger"));
      }
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || t("user.profile.userProfile.failedToGenerateCv")));
    }
  };

  const handleCancelCv = async () => {
    try {
      await cancelCvBuild();
      toast.success(translateApiMessage("ai_engine_cv_cancelled"));
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || t("user.profile.userProfile.failedToCancelCvGeneration")));
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
      toast.error(t("user.profile.userProfile.unableToOpenDownloadLink"));
    }
  };
  return (
    <View className="flex-1 bg-white dark:bg-dark-background">
      <StatusBar style="dark" backgroundColor={profileColor} translucent={false} />

      <DynamicBackground
        className="rounded-b-2xl overflow-hidden"
        style={{
          paddingTop: insets.top,
        }}
        pickerType={pickerType}
        profileColor={profileColor}
        gradientColors={gradientColors}
      >
        <View className="flex-row justify-between items-center px-5 pt-2.5 pb-4">
          {/* profile switch */}
          <TouchableOpacity
            onPress={() => setIsProfileSwitchOpen(true)}
            className="flex-row items-center gap-2"
          >
            <Text
              className={`font-proximanova-bold text-2xl text-primary dark:text-dark-primary`}
            >
              {t("user.profile.userProfile.profile")}
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
        {showInitialSkeleton ? (
          <AutoSkeletonView isLoading={true} defaultRadius={12}>
            <View className="mx-5 mt-3.5 h-28 rounded-2xl bg-[#E5E7EB]" />

            <View className="mx-5 mt-5 flex-row items-center justify-between">
              <View className="h-5 w-28 rounded-md bg-[#E5E7EB]" />
              <View className="h-4 w-20 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-3.5 h-20 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />

            <View className="mx-5 mt-7 h-5 w-32 rounded-md bg-[#E5E7EB]" />
            <View className="mx-5 mt-3 h-4 w-full rounded-md bg-[#E5E7EB]" />
            <View className="mx-5 mt-2 h-4 w-[82%] rounded-md bg-[#E5E7EB]" />

            <View className="mx-5 mt-7 h-5 w-36 rounded-md bg-[#E5E7EB]" />
            <View className="mx-5 mt-3 h-20 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />
            <View className="mx-5 mt-2.5 h-20 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />

            <View className="mx-5 mt-7 h-5 w-28 rounded-md bg-[#E5E7EB]" />
            <View className="mx-5 mt-3 h-24 rounded-xl border border-[#EEEEEE] bg-[#F3F4F6]" />
          </AutoSkeletonView>
        ) : null}

        {!showInitialSkeleton ? (
          <>
        <TouchableOpacity
          onPress={() => router.push("/screens/profile/rating")}
          className="mx-5 mt-3.5"
        >
          {equippedNameplate?.metadata ? (
            <DynamicNameplateCard
              metadata={equippedNameplate.metadata}
              mode="redeem"
              preview={{
                avatarUrl: profileData?.avatar,
                name: profileData?.name,
                location: profileAddress,
                rating: profileData?.rating ?? 0,
                isVerified: isFullyVerified,
              }}
            />
          ) : (
            <BasicNameplateCard
              avatarUrl={profileData?.avatar}
              name={profileData?.name}
              location={profileAddress}
              rating={profileData?.rating ?? 0}
              isVerified={isFullyVerified}
            />
          )}
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
              {t("user.profile.userProfile.badge")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/screens/profile/badge")}
          >
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              {t("user.profile.userProfile.viewAllBadge")}
            </Text>
          </TouchableOpacity>
        </View>
        <BadgeCard
          className="mx-5 mt-3.5"
          badges={Array.isArray(profileData?.appearance?.badges) ? profileData.appearance.badges : []}
        />

        {/* short intro */}
        <View className="mx-5 mt-7 flex-row items-center gap-2.5 mb-4">
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
            {t("user.profile.userProfile.shortIntro")}
          </Text>
        </View>

        {hasBio ? (
          <View className="mx-5 rounded-xl">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {showText ? bioText : shortBio}
              {bioText.length > 140 && (
                <Text
                  onPress={() => setShowText(!showText)}
                  className="font-proximanova-semibold text-sm text-[#11293A]"
                >
                  {showText
                    ? t("user.profile.userProfile.seeLess")
                    : t("user.profile.userProfile.readMore")}
                </Text>
              )}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/screens/profile/user/edit-profile")}
            className="mx-5 border border-[#0000000D] rounded-xl p-3"
          >
            <Text className="font-proximanova-regular text-sm text-[#7A7A7A] dark:text-dark-secondary">
              {t("user.profile.userProfile.addBio")}
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
            {t("user.profile.userProfile.experience")}
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
              {t("user.profile.userProfile.achievement")}
            </Text>
          </View>
          <View className="flex-row gap-3 mb-4 mt-4">
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.onTimeArrivalPercent)}
              title={t("user.profile.userProfile.onTimeArrival")}
              subtitle={t("user.profile.userProfile.thisMonth")}
              background={require("@/assets/images/stats-bg.svg")}
            />
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.taskCompletionPercent)}
              title={t("user.profile.userProfile.taskCompletion")}
              subtitle={t("user.profile.userProfile.completed")}
              background={require("@/assets/images/stats-bg.svg")}
            />
          </View>
          <View className="flex-row gap-3 mb-4">
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.positiveFeedbackPercent)}
              title={t("user.profile.userProfile.positiveFeedback")}
              subtitle={t("user.profile.userProfile.positive")}
              background={require("@/assets/images/stats-bg.svg")}
            />
            <StatCardPrimary
              point={formatMetric(analyticsMetrics?.growthScorePercent)}
              title={t("user.profile.userProfile.growthScore")}
              subtitle={t("user.profile.userProfile.growth")}
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
            {t("user.profile.userProfile.interests")}
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
            {t("user.profile.userProfile.jobProfile")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/screens/profile/user/job-profile")}
          className="mx-5 mt-4 rounded-xl border border-[#0000000D] px-4 py-3"
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
                {jobProfile?.headline?.trim() || t("user.profile.userProfile.setUpYourJobProfile")}
              </Text>
              <Text className="mt-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {jobProfilePreview || t("user.profile.userProfile.jobProfileFallbackDescription")}
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
            {t("user.profile.userProfile.contactMeOn")}
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
            {t("user.profile.userProfile.optionsForExport")}
          </Text>

          {/* <ToggleButton isOn={isOn} setIsOn={setIsOn} title="Keep colors" /> */}
        </View>

        <View className="mx-5 mt-4">
          <Dropdown
            placeholder={t("user.profile.userProfile.selectStyle")}
            options={issues}
            value={selectedIssue}
            onSelect={setSelectedIssue}
          />
        </View>

        <GradientButton
          className="mx-5 mt-3"
          title={
            isGeneratingCv || isPollingCv
              ? t("user.profile.userProfile.generatingCv")
              : t("user.profile.userProfile.generateCvWithAi")
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
              title={t("user.profile.userProfile.cancel")}
              onPress={handleCancelCv}
              showIcon={false}
              className="bg-[#EF4444] py-3 px-4"
            />
          </View>
        )}

        {cvBuildStatus === "completed" && (cvResult?.pdf || cvResult?.image) && (
          <View className="mx-5 mt-4 border border-[#0000000D] rounded-xl p-3">
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary mb-2">
              {t("user.profile.userProfile.generatedCv")}
            </Text>

            {cvResult?.pdf ? (
              <View className="flex-row justify-between items-center py-2">
                <TouchableOpacity onPress={() => handleOpenCvPreview("pdf", cvResult.pdf)}>
                  <Text className="font-proximanova-medium text-[#4FB2F3] underline">
                    {t("user.profile.userProfile.pdfCv")}
                  </Text>
                </TouchableOpacity>
                <View className="w-28">
                  <SmallButton
                    title={t("user.profile.userProfile.download")}
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
                    {t("user.profile.userProfile.imageCv")}
                  </Text>
                </TouchableOpacity>
                <View className="w-28">
                  <SmallButton
                    title={t("user.profile.userProfile.download")}
                    onPress={() => handleDownloadCv(cvResult.image)}
                    className="rounded-xl py-3 px-4"
                  />
                </View>
              </View>
            ) : null}
          </View>
        )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default Profile;

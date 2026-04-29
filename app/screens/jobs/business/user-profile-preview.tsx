import ScreenHeader from "@/components/header/ScreenHeader";
import DynamicBackground from "@/components/layout/DynamicBackground";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import BasicNameplateCard from "@/components/ui/cards/BasicNameplateCard";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import ExperienceCard from "@/components/ui/cards/ExperienceCard";
import StatCardPrimary from "@/components/ui/cards/StatCardPrimary";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import InterestSelection from "@/components/ui/inputs/InterestSelection";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { useJobStore } from "@/stores/jobStore";
import {
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ExpoLinking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const APP_LINK_BASE_URL =
  (process.env.EXPO_PUBLIC_APP_LINK_BASE_URL || "https://hiruu.app").replace(/\/+$/, "");

type PreviewParams = {
  userId?: string;
  profileId?: string;
  businessId?: string;
  canRate?: string;
};

const UserProfilePreview = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<PreviewParams>();
  const getJobProfileByUserId = useJobStore((s) => s.getJobProfileByUserId);
  const [showText, setShowText] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const currentUser = useAuthStore((state) => state.user);
  const userId = typeof params.userId === "string" ? params.userId : "";
  const businessId =
    typeof params.businessId === "string" ? params.businessId : "";
  const canRate = params.canRate === "true" && Boolean(businessId);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        toast.error(t("user.jobs.candidateRequests.businessUnavailable"));
        return;
      }

      try {
        setIsLoading(true);
        const result = await getJobProfileByUserId(userId);
        if (isMounted) {
          setProfile(result);
        }
      } catch (error: any) {
        if (isMounted) {
          setProfile(null);
        }
        toast.error(error?.message || t("user.profile.userProfile.failedToLoadProfile"));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [getJobProfileByUserId, t, userId]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/business-jobs");
  };

  const profileAddress = useMemo(() => {
    const address = profile?.user?.address;

    if (!address) return t("common.locationUnavailable");
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      return (
        address?.city ||
        address?.state ||
        address?.address ||
        address?.country ||
        t("common.locationUnavailable")
      );
    }

    return t("common.locationUnavailable");
  }, [profile, t]);

  const shortIntro = useMemo(() => {
    return (
      profile?.about ||
      profile?.highlightedExperience ||
      profile?.user?.bio ||
      t("user.profile.userProfile.noProfileSummary")
    );
  }, [profile, t]);
  const interests = useMemo(() => {
    const source = Array.isArray(profile?.user?.interest)
      ? profile.user.interest
      : Array.isArray(profile?.interest)
        ? profile.interest
        : [];

    return source
      .filter((item: unknown) => typeof item === "string")
      .map((item: string) => item.trim().toLowerCase())
      .filter(Boolean);
  }, [profile]);

  const formatMetric = (value?: number) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "0%";
    return `${Math.round(value)}%`;
  };
  const analyticsMetrics = profile?.user?.analytics?.metrics;
  const roundedRating = useMemo(() => {
    const value = Number(profile?.user?.rating ?? 0);
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 10) / 10;
  }, [profile?.user?.rating]);

  const isOwnProfile = useMemo(() => {
    const previewUserId = profile?.userId || profile?.user?.id;
    return Boolean(previewUserId && currentUser?.id && previewUserId === currentUser.id);
  }, [currentUser?.id, profile?.user?.id, profile?.userId]);

  const profileTheme = profile?.user?.appearance?.profileTheme;
  const pickerType =
    profileTheme?.type === "gradient" ? "gradient" : "solid";
  const profileColor = String(profileTheme?.solidColor || "#E5F4FD");
  const gradientColors: [string, string] =
    Array.isArray(profileTheme?.gradientColors) &&
      profileTheme.gradientColors.length >= 2
      ? [
        String(profileTheme.gradientColors[0] || "#E5F4FD"),
        String(profileTheme.gradientColors[1] || "#FFFFFF"),
      ]
      : ["#E5F4FD", "#FFFFFF"];

  const handleShare = async () => {
    try {
      const targetUserId = profile?.userId || profile?.user?.id || userId;
      if (!targetUserId) {
        Alert.alert(t("common.error"), t("common.couldNotShareProfile"));
        return;
      }

      const appLink = `${APP_LINK_BASE_URL}/u/${encodeURIComponent(targetUserId)}`;
      const deepLink = ExpoLinking.createURL("/u/[userId]", {
        queryParams: { userId: targetUserId },
      });

      await Share.share({
        message: `${t("common.shareProfileMessage", {
          name: profile?.user?.name || t("common.thisProfile"),
        })}\n${deepLink}\n${appLink}`,
        url: deepLink,
        title: `${profile?.user?.name || t("common.user")}'s ${t("user.profile.userProfile.profile")}`,
      });
    } catch {
      Alert.alert(t("common.error"), t("common.couldNotShareProfile"));
    }
  };

  const handleMessagePress = async () => {
    const participantId = profile?.userId || profile?.user?.id;
    if (!participantId) {
      toast.error(t("user.jobs.candidateRequests.businessUnavailable"));
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(participantId);
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error("Chat room id is missing");
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(error?.message || t("common.failedToStartChat"));
    } finally {
      setIsCreatingChat(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-dark-background"
        edges={["left", "right", "top"]}
      >
        <ScreenHeader
          className="mx-5 py-3.5"
          onPressBack={handleBack}
          title=""
          buttonTitle=""
          components={(
            <TouchableOpacity onPress={handleShare}>
              <Ionicons
                className="p-2"
                name="share-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
          )}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <AutoSkeletonView isLoading={true} defaultRadius={12}>
            <View className="mx-5 mt-3.5">
              <View className="bg-white rounded-xl border border-[#4FB2F330] p-4">
                <View className="flex-row items-center gap-3">
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 999,
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        height: 16,
                        width: "70%",
                        borderRadius: 8,
                        backgroundColor: "#E5E7EB",
                      }}
                    />
                    <View
                      style={{
                        height: 12,
                        width: "45%",
                        marginTop: 10,
                        borderRadius: 6,
                        backgroundColor: "#E5E7EB",
                      }}
                    />
                    <View
                      style={{
                        height: 12,
                        width: "55%",
                        marginTop: 10,
                        borderRadius: 6,
                        backgroundColor: "#E5E7EB",
                      }}
                    />
                  </View>
                </View>
                <View
                  style={{
                    height: 12,
                    width: "92%",
                    marginTop: 16,
                    borderRadius: 6,
                    backgroundColor: "#E5E7EB",
                  }}
                />
                <View
                  style={{
                    height: 12,
                    width: "78%",
                    marginTop: 10,
                    borderRadius: 6,
                    backgroundColor: "#E5E7EB",
                  }}
                />
              </View>
            </View>

            {/* Section headers + cards */}
            <View className="mx-5 mt-6">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    backgroundColor: "#E5E7EB",
                  }}
                />
                <View
                  style={{
                    height: 18,
                    width: 140,
                    borderRadius: 8,
                    backgroundColor: "#E5E7EB",
                  }}
                />
              </View>
              <View
                style={{
                  height: 90,
                  marginTop: 14,
                  borderRadius: 12,
                  backgroundColor: "#E5E7EB",
                }}
              />
            </View>

            <View className="mx-5 mt-8">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    backgroundColor: "#E5E7EB",
                  }}
                />
                <View
                  style={{
                    height: 18,
                    width: 170,
                    borderRadius: 8,
                    backgroundColor: "#E5E7EB",
                  }}
                />
              </View>
              <View
                style={{
                  height: 12,
                  width: "96%",
                  marginTop: 16,
                  borderRadius: 6,
                  backgroundColor: "#E5E7EB",
                }}
              />
              <View
                style={{
                  height: 12,
                  width: "88%",
                  marginTop: 10,
                  borderRadius: 6,
                  backgroundColor: "#E5E7EB",
                }}
              />
              <View
                style={{
                  height: 12,
                  width: "74%",
                  marginTop: 10,
                  borderRadius: 6,
                  backgroundColor: "#E5E7EB",
                }}
              />
            </View>

            <View className="mx-5 mt-8">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    backgroundColor: "#E5E7EB",
                  }}
                />
                <View
                  style={{
                    height: 18,
                    width: 150,
                    borderRadius: 8,
                    backgroundColor: "#E5E7EB",
                  }}
                />
              </View>
              <View
                style={{
                  height: 110,
                  marginTop: 18,
                  borderRadius: 12,
                  backgroundColor: "#E5E7EB",
                }}
              />
            </View>

            <View className="mx-5 mt-8">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    backgroundColor: "#E5E7EB",
                  }}
                />
                <View
                  style={{
                    height: 18,
                    width: 160,
                    borderRadius: 8,
                    backgroundColor: "#E5E7EB",
                  }}
                />
              </View>
              <View
                style={{
                  height: 70,
                  marginTop: 14,
                  borderRadius: 12,
                  backgroundColor: "#E5E7EB",
                }}
              />
            </View>
          </AutoSkeletonView>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["left", "right", "top"]}
    >
      <ScreenHeader
        className="mx-5 py-3.5"
        onPressBack={handleBack}
        title=""
        buttonTitle=""
        components={(
          <TouchableOpacity onPress={handleShare}>
            <Ionicons
              className="p-2"
              name="share-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        )}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/screens/profile/rating",
              params: {
                userId: profile?.userId || profile?.user?.id || "",
                ...(canRate ? { businessId, canRate: "true" } : {}),
              },
            })
          }
          className="mx-5 mt-3.5"
        >
          {/* dynamic nameplate, equipped */}
          {profile?.user?.appearance?.nameplate?.metadata ? (
            <DynamicNameplateCard
              metadata={profile.user.appearance.nameplate.metadata}
              mode="redeem"
              preview={{
                avatarUrl: profile?.user?.avatar || null,
                name: profile?.user?.name || t("common.user"),
                location: profileAddress,
                rating: roundedRating,
                isVerified: true,
              }}
            />
          ) : (
            <BasicNameplateCard
              avatarUrl={profile?.user?.avatar || null}
              name={profile?.user?.name || t("common.user")}
              location={profileAddress}
              rating={roundedRating}
              isVerified
            />
          )}
        </TouchableOpacity>

        {/* Badge item */}
        <View className="mx-5 flex-row justify-between mt-5 items-center">
          <View className="flex-row gap-2.5 items-center">
            <DynamicBackground
              className="h-8 w-8 rounded-full flex-row items-center justify-center overflow-hidden"
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
              {t("user.profile.userProfile.badge")}
            </Text>
          </View>
        </View>
        <BadgeCard className="mx-5 mt-3.5" />

        {/* short intro */}
        <View className="mx-5 mt-8 flex-row gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            <Foundation name="clipboard" size={16} color="black" />
          </DynamicBackground>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            {t("user.profile.userProfile.shortIntro")}
          </Text>
        </View>
        <View className="mx-5 mt-4">
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {showText
              ? shortIntro
              : `${shortIntro.slice(0, 120)}${shortIntro.length > 120 ? "..." : ""}`}
            {"   "}
            <Text
              onPress={() => setShowText(!showText)}
              className="font-proximanova-semibold text-sm text-[#11293A]"
            >
              {shortIntro.length > 120 ? (showText ? t("user.profile.userProfile.seeLess") : t("user.profile.userProfile.readMore")) : ""}
            </Text>
          </Text>
        </View>

        {/* Experience */}
        <View className="mx-5 mt-8 flex-row gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            <Foundation name="clipboard" size={16} color="black" />
          </DynamicBackground>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            {t("user.profile.userProfile.experience")}
          </Text>
        </View>

        <ExperienceCard
          focus
          className="mt-8 mx-5"
          companyName={profile?.user?.name || t("common.user")}
          position={profile?.headline || t("user.profile.userProfile.roleNotSpecified")}
          companyLogo={
            profile?.user?.avatar ||
            require("@/assets/images/placeholder.png")
          }
          isVerified
          isCurrent={Boolean(profile?.isOpenToWork)}
        />

        {/* Achievement */}
        <View className=" mx-5 mt-8">
          <View className="flex-row gap-2.5 items-center">
            <DynamicBackground
              className="h-8 w-8 rounded-full flex-row items-center justify-center overflow-hidden"
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
        <View className="mx-5 mt-8 flex-row gap-2.5">
          <DynamicBackground
            className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            <Foundation name="clipboard" size={16} color="black" />
          </DynamicBackground>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            {t("user.profile.userProfile.interests")}
          </Text>
        </View>

        <View className="mx-5 mt-4">
          <InterestSelection
            selectedInterests={interests}
            onInterestsChange={() => { }}
            readonly
            showSelectedOnly
          />
        </View>

        {/* Employee Info */}
        <View className="flex-row items-center gap-2.5 mt-8 mx-5">
          <DynamicBackground
            className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
            pickerType={pickerType}
            profileColor={profileColor}
            gradientColors={gradientColors}
          >
            <Ionicons name="person" size={16} color="black" />
          </DynamicBackground>
          <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
            {t("user.profile.userProfile.employeeInfo")}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mx-5 mt-4 p-2.5 bg-[#4FB2F3] rounded-xl">
          <View className="flex-row items-center gap-2.5">
            <View>
              <Image
                source={
                  profile?.user?.avatar ||
                  require("@/assets/images/placeholder.png")
                }
                contentFit="cover"
                style={{ height: 40, width: 40, borderRadius: 99 }}
              />
            </View>
            <Text className="font-proximanova-bold text-white">
              {profile?.user?.name || t("common.user")}
            </Text>
          </View>

          {!isOwnProfile ? (
            <TouchableOpacity
              onPress={handleMessagePress}
              disabled={isCreatingChat}
              className="h-10 w-10 bg-white rounded-full flex-row items-center justify-center"
            >
              {isCreatingChat ? (
                <ActivityIndicator size="small" color="#4FB2F3" />
              ) : (
                <Image
                  source={require("@/assets/images/messages-fill.svg")}
                  contentFit="contain"
                  style={{ height: 22, width: 22 }}
                />
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Contact Me On */}
        <View className="flex-row items-center gap-2.5 mt-6 mx-5">
          <DynamicBackground
            className="h-8 w-8 rounded-full flex-row justify-center items-center overflow-hidden"
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
          value={profile?.user?.social || {}}
          hideEmpty
          canEdit={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserProfilePreview;

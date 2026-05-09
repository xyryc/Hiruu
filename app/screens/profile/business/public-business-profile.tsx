import ScreenHeader from "@/components/header/ScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import RatingBanner from "@/components/ui/cards/RatingBanner";
import RatingProgress from "@/components/ui/cards/RatingProgress";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import { chatService } from "@/services/chatService";
import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import {
  EvilIcons,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const PublicBusinessProfile = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ businessId?: string }>();
  const businessId =
    typeof params.businessId === "string" ? params.businessId : "";
  const getPublicBusinessProfile = useBusinessStore(
    (state) => state.getPublicBusinessProfile
  );
  const getBusinessRatingSummary = useProfileStore(
    (state) => state.getBusinessRatingSummary
  );
  const businessRatingSummary = useProfileStore(
    (state) => state.businessRatingSummary
  );

  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [selectedTab, setSelectedTab] = useState("about");

  const loadBusiness = useCallback(async () => {
    if (!businessId) {
      setBusinessData(null);
      return;
    }

    try {
      setLoading(true);
      const data = await getPublicBusinessProfile(businessId);
      setBusinessData(data);
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.businessProfile.failedToLoadBusiness"));
    } finally {
      setLoading(false);
    }
  }, [businessId, getPublicBusinessProfile, t]);

  const loadRatingSummary = useCallback(async () => {
    if (!businessId) return;

    try {
      await getBusinessRatingSummary(businessId);
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.businessProfile.failedToLoadRatingSummary"));
    }
  }, [businessId, getBusinessRatingSummary, t]);

  useEffect(() => {
    loadBusiness();
    loadRatingSummary();
  }, [loadBusiness, loadRatingSummary]);

  useFocusEffect(
    useCallback(() => {
      loadBusiness();
      loadRatingSummary();
      return () => { };
    }, [loadBusiness, loadRatingSummary])
  );
  const workEnvironmentRating = Number(
    businessRatingSummary?.ratingBreakdown?.workEnvironment?.average ?? 0
  );
  const payOnTimeRating = Number(
    businessRatingSummary?.ratingBreakdown?.payOnTime?.average ?? 0
  );
  const communicationRating = Number(
    businessRatingSummary?.ratingBreakdown?.communication?.average ?? 0
  );
  const averageRating = Number(
    businessRatingSummary?.averageRating ?? businessData?.rating ?? 0
  );
  const totalRatings = Number(businessRatingSummary?.totalRatings ?? 0);
  const totalEmployeeCount = Number(
    businessData?._count?.employments ?? businessData?.activeEmployeeCount ?? 0
  );
  const publicRecruitments = Array.isArray(businessData?.recruitments)
    ? businessData.recruitments
      .filter((item: any) => item?.isActive !== false)
      .map((job: any) => ({
        ...job,
        name:
          job?.name ||
          job?.role?.role?.name ||
          job?.role?.name ||
          t("user.profile.businessProfile.openPosition"),
        businessId: job?.businessId || businessData?.id,
        business: job?.business || {
          id: businessData?.id,
          name: businessData?.name,
          logo: businessData?.logo,
          address: businessData?.address,
          isPremium: businessData?.isPremium,
        },
        _count: job?._count || {
          recruitmentApplications: 0,
        },
      }))
    : [];
  const showInitialSkeleton = loading && !businessData;

  const handleOpenRatings = useCallback(() => {
    router.push({
      pathname: "/screens/profile/rating",
      params: { businessId },
    });
  }, [businessId]);

  const handleContactOwner = useCallback(async () => {
    const ownerId = businessData?.owner?.id;

    if (!ownerId || !businessId || isCreatingChat) {
      if (!ownerId) {
        toast.error(t("common.noContactInfo"));
      }
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(ownerId, {
        businessId,
      });
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error(t("common.chat.chatRoomIdMissing"));
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
  }, [businessData?.owner?.id, businessId, isCreatingChat, t]);

  const socialLinks = businessData?.social || {};
  const hasSocialLinks = Object.values(socialLinks).some((value) => Boolean(value));

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "top"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScreenHeader
        className="mx-5 py-3.5"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace("/(tabs)/user-schedule");
        }}
        title={t("user.profile.businessProfile.businessProfileTitle")}
        buttonTitle=""
      />

      <ScrollView
        className="bg-[#ffffff] dark:bg-dark-border rounded-b-2xl"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {showInitialSkeleton ? (
          <View pointerEvents="none">
            <View className="relative">
              <View className="w-full h-[137px] bg-[#E5E7EB]" />
              <View
                className="absolute -bottom-11 left-6 h-[90px] w-[90px] bg-[#E5E7EB]"
                style={{ borderRadius: 999, overflow: "hidden" }}
              />
              <View className="absolute -bottom-3 right-6 h-7 w-28 rounded-full bg-[#E5E7EB]" />
            </View>

            <View className="mx-6 mt-16">
              <View className="flex-row items-center gap-2">
                <View className="h-5 w-40 rounded-md bg-[#E5E7EB]" />
                <View className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
                <View className="h-5 w-5 rounded-full bg-[#E5E7EB]" />
              </View>
              <View className="mt-3 flex-row items-center gap-2">
                <View className="h-4 w-4 rounded-full bg-[#E5E7EB]" />
                <View className="h-4 w-56 rounded-md bg-[#E5E7EB]" />
              </View>
            </View>

            <View className="mx-5 mt-4 flex-row gap-4">
              <View className="h-7 flex-1 rounded-md bg-[#E5E7EB]" />
              <View className="h-7 flex-1 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-6 border border-[#EEEEEE] rounded-2xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="h-5 w-40 rounded-md bg-[#E5E7EB]" />
                <View className="h-4 w-20 rounded-md bg-[#E5E7EB]" />
              </View>
              <View className="mt-5 flex-row items-center justify-between">
                <View className="h-16 flex-1 rounded-xl bg-[#E5E7EB]" />
                <View className="mx-2 h-16 w-[1px] bg-[#E5E7EB]" />
                <View className="h-16 flex-1 rounded-xl bg-[#E5E7EB]" />
                <View className="mx-2 h-16 w-[1px] bg-[#E5E7EB]" />
                <View className="h-16 flex-1 rounded-xl bg-[#E5E7EB]" />
              </View>
            </View>

            <View className="mx-5 mt-8 flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-[#E5E7EB]" />
              <View className="h-6 w-28 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-4">
              <View className="h-4 w-full rounded-md bg-[#E5E7EB]" />
              <View className="h-4 w-[85%] rounded-md bg-[#E5E7EB] mt-2.5" />
              <View className="h-4 w-[70%] rounded-md bg-[#E5E7EB] mt-2.5" />
            </View>

            <View className="mx-5 mt-8 flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-[#E5E7EB]" />
              <View className="h-6 w-44 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-4 border border-[#EEEEEE] rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="h-4 w-32 rounded-md bg-[#E5E7EB]" />
                <View className="h-4 w-8 rounded-md bg-[#E5E7EB]" />
              </View>
            </View>

            <View className="mx-5 mt-4 border border-[#EEEEEE] rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="h-4 w-36 rounded-md bg-[#E5E7EB]" />
                <View className="h-4 w-10 rounded-md bg-[#E5E7EB]" />
              </View>
              <View className="mt-4 flex-row items-center justify-between">
                <View className="h-4 w-36 rounded-md bg-[#E5E7EB]" />
                <View className="h-4 w-10 rounded-md bg-[#E5E7EB]" />
              </View>
            </View>

            <View className="mx-5 mt-8 flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-[#E5E7EB]" />
              <View className="h-6 w-36 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-4 rounded-2xl bg-[#E5E7EB] px-3 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-10 w-10 bg-[#D7D9DE]"
                    style={{ borderRadius: 999, overflow: "hidden" }}
                  />
                  <View className="h-4 w-24 rounded-md bg-[#D7D9DE]" />
                </View>
                <View className="h-11 w-11 rounded-full bg-[#D7D9DE]" />
              </View>
            </View>

            <View className="mx-5 mt-8 flex-row items-center gap-3">
              <View className="h-8 w-8 rounded-full bg-[#E5E7EB]" />
              <View className="h-6 w-28 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-4 mb-4">
              <View className="h-12 w-full rounded-xl bg-[#E5E7EB]" />
              <View className="h-12 w-full rounded-xl bg-[#E5E7EB] mt-3" />
            </View>
          </View>
        ) : null}

        {!showInitialSkeleton ? (
          <>
            <View className="relative">
              <Image
                source={
                  businessData?.coverPhoto ||
                  require("@/assets/images/placeholder.png")
                }
                style={{ width: "100%", height: 137 }}
                contentFit="cover"
              />

              {businessData?.logo ? (
                <View className="absolute -bottom-11 left-6">
                  <View className="h-[90px] w-[90px] bg-white flex-row justify-center items-center rounded-full">
                    <Image
                      source={businessData.logo}
                      contentFit="cover"
                      style={{ height: 86, width: 86, borderRadius: 100 }}
                    />
                  </View>
                </View>
              ) : null}

              {businessData?.isRecruiting ? (
                <View className="absolute -bottom-3 right-6">
                  <Text className="bg-[#11293A] py-1 px-4 rounded-full border font-proximanova-semibold text-sm p-1 text-[#FFFFFF] capitalize">
                    {t("user.profile.businessProfile.activelyRecruiting")}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="mx-6 mt-16">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {businessData?.name || t("user.profile.businessProfile.business")}
                </Text>

                {businessData?.isVerified ? (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={20}
                    color="#3EBF5A"
                  />
                ) : null}

                {businessData?.isPremium ? (
                  <View className="h-5 w-5 bg-[#4E57FF] flex-row justify-center items-center rounded-full">
                    <MaterialCommunityIcons name="crown" size={10} color="white" />
                  </View>
                ) : null}
              </View>

              <View className="flex-row items-center gap-1">
                <EvilIcons name="location" size={18} color="black" />

                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {businessData?.address?.state ||
                    businessData?.address?.city ||
                    businessData?.address?.address ||
                    businessData?.address?.country ||
                    t("user.profile.businessProfile.locationUnavailable")}
                </Text>
              </View>
            </View>

            <View className="flex-row mx-5 mt-4 dark:bg-dark-background">
              {["about", "job"].map((tab) => (
                <TouchableOpacity
                  className={`w-1/2 ${selectedTab === tab ? "border-b-2 border-[#11293A] pb-2" : "border-b-hairline"}`}
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                >
                  <View className="flex-row justify-center gap-2">
                    <Text
                      className={`text-center capitalize dark:text-dark-primary ${selectedTab === tab ? "font-proximanova-semibold" : "font-proximanova-regular"}`}
                    >
                      {tab === "about"
                        ? t("user.profile.businessProfile.about")
                        : t("user.profile.businessProfile.job")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {selectedTab === "about" ? (
              <View>
                <View className="flex-row justify-between items-centers mx-5 mt-6">
                  <View className="flex-row items-centers gap-2.5">
                    <View className="bg-[#E5F4FD] h-7 w-7 rounded-full flex-row items-center justify-center">
                      <SimpleLineIcons name="star" size={14} color="black" />
                    </View>
                    <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                      {t("user.profile.businessProfile.ratingSummary")}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={handleOpenRatings} className="items-center">
                    <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                      {t("user.profile.businessProfile.seeAllRatings")}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="mx-5 pt-4 px-2.5 pb-3 border mt-4 border-[#EEEEEE] rounded-2xl">
                  <RatingBanner
                    averageRating={averageRating}
                    totalRatings={totalRatings}
                  />

                  <View className="flex-row items-start justify-between mt-5">
                    <View className="flex-1 items-center px-1">
                      <RatingProgress rating={workEnvironmentRating} />
                      <Text
                        className="font-proximanova-semibold text-xs text-primary dark:text-dark-primary text-center mt-1.5"
                        style={{ maxWidth: 110 }}
                        numberOfLines={1}
                      >
                        {t("user.profile.businessProfile.workEnvironment")}
                      </Text>
                    </View>

                    <Image
                      source={require("@/assets/images/vertical-line.svg")}
                      contentFit="contain"
                      style={{ height: 70, width: 0.5 }}
                    />

                    <View className="flex-1 items-center px-1">
                      <RatingProgress rating={payOnTimeRating} />
                      <Text
                        className="font-proximanova-semibold text-xs text-primary dark:text-dark-primary text-center mt-1.5"
                        style={{ maxWidth: 110 }}
                        numberOfLines={1}
                      >
                        {t("user.profile.businessProfile.payOnTime")}
                      </Text>
                    </View>

                    <Image
                      source={require("@/assets/images/vertical-line.svg")}
                      contentFit="contain"
                      style={{ height: 70, width: 0.5 }}
                    />

                    <View className="flex-1 items-center px-1">
                      <RatingProgress rating={communicationRating} />
                      <Text
                        className="font-proximanova-semibold text-xs text-primary dark:text-dark-primary text-center mt-1.5"
                        style={{ maxWidth: 110 }}
                        numberOfLines={1}
                      >
                        {t("user.profile.businessProfile.communication")}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="mx-5 mt-8 flex-row gap-2.5">
                  <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                    <SimpleLineIcons name="notebook" size={14} color="black" />
                  </View>

                  <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                    {t("user.profile.businessProfile.aboutUs")}
                  </Text>
                </View>

                <View className="mx-5 mt-4">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {businessData?.description || t("user.profile.businessProfile.noDescriptionAvailable")}
                  </Text>
                </View>

                <View className="mx-5 mt-8 flex-row gap-2.5">
                  <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                    <Ionicons name="person-outline" size={18} color="black" />
                  </View>

                  <View className="flex-1">
                    <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                      {t("user.profile.businessProfile.teamAndOverview")}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center px-4 py-3 mx-5 my-4 border border-[#eeeeee] rounded-xl">
                  <View className="flex-row gap-2">
                    <Feather name="users" size={18} color="black" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      {t("user.profile.businessProfile.totalEmployee")}
                    </Text>
                  </View>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                    {totalEmployeeCount}
                  </Text>
                </View>

                <View className="mx-5 px-4 py-3 border border-[#eeeeee] rounded-xl">
                  <View className="flex-row justify-between items-center p-2">
                    <View className="flex-row gap-2">
                      <MaterialCommunityIcons
                        name="account-check-outline"
                        size={18}
                        color="black"
                      />
                      <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        {t("user.profile.businessProfile.verifiedBusiness")}
                      </Text>
                    </View>
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                      {businessData?.isVerified ? t("common.yes") : t("common.no")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center p-2">
                    <View className="flex-row gap-2">
                      <MaterialCommunityIcons
                        name="account-search"
                        size={18}
                        color="#282930"
                      />
                      <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        {t("user.profile.businessProfile.activelyRecruiting")}
                      </Text>
                    </View>
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                      {businessData?.isRecruiting ? t("common.yes") : t("common.no")}
                    </Text>
                  </View>
                </View>

                <View className="mx-5 mt-8 flex-row gap-2.5">
                  <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                    <Ionicons name="person-outline" size={16} color="black" />
                  </View>
                  <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                    {t("user.profile.businessProfile.contactOwner")}
                  </Text>
                </View>

                <View
                  className={`mx-5 mt-4 rounded-2xl bg-[#4FB2F3] px-3 py-3 ${isCreatingChat ? "opacity-80" : ""}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <Image
                        source={
                          businessData?.owner?.avatar
                            ? { uri: businessData.owner.avatar }
                            : require("@/assets/images/placeholder.png")
                        }
                        style={{ width: 40, height: 40, borderRadius: 999 }}
                        contentFit="cover"
                      />

                      <Text className="font-proximanova-semibold text-base text-white">
                        {businessData?.owner?.name || t("user.profile.businessProfile.owner")}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={handleContactOwner}
                      disabled={isCreatingChat}
                      className="h-11 w-11 rounded-full bg-white items-center justify-center"
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
                  </View>
                </View>

                <View className="flex-row justify-between items-center mx-5 mt-8">
                  <View className="flex-row gap-2.5">
                    <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                      <Ionicons name="call-outline" size={16} color="black" />
                    </View>
                    <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                      {t("user.profile.contactUsOn")}
                    </Text>
                  </View>
                </View>



                {hasSocialLinks ? (
                  <ConnectSocials
                    className="mx-5 mb-4 mt-4"
                    value={socialLinks}
                    hideEmpty
                    canEdit={false}
                  />
                ) : null}
              </View>
            ) : (
              <View className="mx-5">
                <Text className="my-4">{t("user.profile.businessProfile.openPositions")}</Text>
                {publicRecruitments.length > 0 ? (
                  publicRecruitments.map((job: any) => (
                    <JobCard
                      key={job?.id}
                      className="bg-white border border-[#EEEEEE] mb-4"
                      job={job}
                    />
                  ))
                ) : (
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {t("common.noJobsAvailable")}
                  </Text>
                )}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PublicBusinessProfile;

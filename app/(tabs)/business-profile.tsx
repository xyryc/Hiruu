import JobCard from "@/components/ui/cards/JobCard";
import RatingBanner from '@/components/ui/cards/RatingBanner';
import RatingProgress from "@/components/ui/cards/RatingProgress";
import ConnectSocials from "@/components/ui/inputs/ConnectSocials";
import ProfileSwitchModal from "@/components/ui/modals/ProfileSwitchModal";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { useProfileStore } from "@/stores/profileStore";
import {
  EvilIcons,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  SimpleLineIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from 'sonner-native';

const styles = StyleSheet.create({
  compactEmptyState: {
    paddingVertical: 28,
  },
  compactEmptyStateTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  compactEmptyStateText: {
    fontSize: 13,
    lineHeight: 18,
  },
});

const BusinessProfile = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState("about");
  const [businessData, setBusinessData] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [socialUpdateLoading, setSocialUpdateLoading] = useState(false);
  const [isProfileSwitchOpen, setIsProfileSwitchOpen] = useState(false);
  const [businessJobs, setBusinessJobs] = useState<any[]>([]);
  const profileRequestIdRef = useRef(0);
  const getBusinessRatingSummary = useProfileStore((state) => state.getBusinessRatingSummary);
  const businessRatingSummary = useProfileStore((state) => state.businessRatingSummary);
  const getBusinessRecruitments = useJobStore((state) => state.getBusinessRecruitments);
  const deleteRecruitment = useJobStore((state) => state.deleteRecruitment);
  const {
    selectedBusinesses,
    myEmployments,
    getMyEmployments,
    getBusinessProfile,
    setSelectedBusinesses,
    updateMyBusinessProfile,
  } = useBusinessStore();
  const businessId = selectedBusinesses[0];
  const selectedEmployment = (Array.isArray(myEmployments) ? myEmployments : []).find(
    (employment: any) =>
      String(employment?.status || "").toLowerCase() === "active" &&
      (employment?.businessId === businessId || employment?.business?.id === businessId)
  );
  const roleName = String(selectedEmployment?.role?.role?.name || "");
  const rolePermissions = selectedEmployment?.role?.permissions || {};
  const isOwner = roleName === "Owner";
  const getPermissionLevel = (key: string) => {
    if (isOwner) return 3;
    const level = rolePermissions?.[key];
    return typeof level === "number" ? level : 0;
  };
  const canEditProfile = getPermissionLevel("business.overview") >= 2;
  const canReadRatings = getPermissionLevel("ratings") >= 1;
  const canReadJobs = getPermissionLevel("jobs") >= 1;
  const canEditJobs = getPermissionLevel("jobs") >= 2;
  const canDeleteJobs = getPermissionLevel("jobs") >= 3;
  const canManageJoinRequests = getPermissionLevel("people.join_requests") >= 2;

  const loadBusiness = useCallback(async () => {
    if (!businessId) {
      setBusinessData(null);
      return;
    }

    const requestId = ++profileRequestIdRef.current;

    try {
      setIsLoadingBusiness(true);
      const data = await getBusinessProfile(businessId);
      if (requestId !== profileRequestIdRef.current) return;
      setBusinessData(data);
      setSocialLinks(data?.social || {});
    } catch (error: any) {
      if (requestId !== profileRequestIdRef.current) return;
      toast.error(error?.message || t("user.profile.businessProfile.failedToLoadBusiness"));
    } finally {
      if (requestId !== profileRequestIdRef.current) return;
      setIsLoadingBusiness(false);
    }
  }, [businessId, getBusinessProfile, t]);

  const loadBusinessJobs = useCallback(async () => {
    if (!businessId) {
      setBusinessJobs([]);
      return;
    }
    if (!canReadJobs) {
      setBusinessJobs([]);
      return;
    }

    try {
      const result = await getBusinessRecruitments(businessId, {
        page: 1,
        limit: 5,
      });
      const jobs = Array.isArray(result?.data)
        ? result.data.filter((item: any) => item?.isActive !== false)
        : [];
      setBusinessJobs(jobs);
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.businessProfile.failedToLoadJobs"));
    }
  }, [businessId, canReadJobs, getBusinessRecruitments, t]);

  const loadRatingSummary = useCallback(async () => {
    if (!businessId || !canReadRatings) return;
    try {
      await getBusinessRatingSummary(businessId);
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.businessProfile.failedToLoadRatingSummary"));
    }
  }, [businessId, canReadRatings, getBusinessRatingSummary, t]);

  useEffect(() => {
    getMyEmployments(true).catch(() => undefined);
  }, [getMyEmployments]);

  useEffect(() => {
    loadBusiness();
    loadBusinessJobs();
  }, [loadBusiness, loadBusinessJobs]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      await Promise.all([
        getMyEmployments(true).catch(() => undefined),
        loadBusiness(),
        loadBusinessJobs(),
        loadRatingSummary(),
      ]);
    } catch (error: any) {
      toast.error(error?.message || t("common.failedToRefresh"));
    } finally {
      setIsRefreshing(false);
    }
  }, [
    getMyEmployments,
    isRefreshing,
    loadBusiness,
    loadBusinessJobs,
    loadRatingSummary,
    t,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadBusiness();
      loadBusinessJobs();
      loadRatingSummary();
      return () => { };
    }, [loadBusiness, loadBusinessJobs, loadRatingSummary])
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
  const activeJobPostingCount = businessJobs.length;
  const totalEmployeeCount = Number(businessData?._count?.employments ?? 0);
  const showInitialSkeleton = isLoadingBusiness && !businessData;

  const handleShare = async () => {
    try {
      await Share.share({
        message: t("user.profile.businessProfile.shareMessage", {
          businessName: businessData?.name || t("user.profile.businessProfile.thisBusiness"),
        }),
        title: businessData?.name || t("user.profile.businessProfile.businessProfileTitle"),
      });
    } catch {
      Alert.alert(t("common.error"), t("user.profile.businessProfile.couldNotShareProfile"));
    }
  };

  const handleSocialLinksChange = async (nextSocial: Record<string, string>) => {
    if (!businessId || socialUpdateLoading) return;

    const previousSocial = socialLinks || {};
    const mergedSocial = { ...previousSocial, ...nextSocial };

    setSocialLinks(mergedSocial);
    setBusinessData((prev: any) => ({
      ...(prev || {}),
      social: mergedSocial,
    }));
    setSocialUpdateLoading(true);

    try {
      const result = await updateMyBusinessProfile(businessId, { social: mergedSocial });
      if (result?.data) {
        setBusinessData(result.data);
        setSocialLinks(result.data?.social || mergedSocial);
      }
    } catch (error: any) {
      setSocialLinks(previousSocial);
      setBusinessData((prev: any) => ({
        ...(prev || {}),
        social: previousSocial,
      }));
      toast.error(error?.message || t("user.profile.businessProfile.failedToUpdateSocialLinks"));
    } finally {
      setSocialUpdateLoading(false);
    }
  };

  const handleOpenBusinessLocation = useCallback(async () => {
    const address = String(businessData?.address?.address || "").trim();
    const latitude = Number(businessData?.address?.latitude);
    const longitude = Number(businessData?.address?.longitude);

    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
    const query = hasCoordinates
      ? `${latitude},${longitude}`
      : address;

    if (!query) {
      toast.error(t("user.profile.businessProfile.locationUnavailable"));
      return;
    }

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    try {
      const canOpen = await Linking.canOpenURL(mapUrl);
      if (!canOpen) {
        toast.error(t("user.profile.businessProfile.unableToOpenMaps"));
        return;
      }
      await Linking.openURL(mapUrl);
    } catch {
      toast.error(t("user.profile.businessProfile.unableToOpenMaps"));
    }
  }, [businessData?.address?.address, businessData?.address?.latitude, businessData?.address?.longitude, t]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "top"]}
    >
      {/* Profile Header */}
      <View className="flex-row justify-between mx-5 py-3.5">
        <TouchableOpacity
          onPress={() => setIsProfileSwitchOpen(true)}
          className="flex-row items-center gap-2"
        >
          <Text className="font-proximanova-bold text-2xl text-primary dark:text-dark-primary">
            {t("user.profile.businessProfile.profile")}
          </Text>

          <Ionicons
            name={isProfileSwitchOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="black"
          />
        </TouchableOpacity>

        <View className="flex-row gap-1.5 items-center justify-center">
          {businessId && canManageJoinRequests ? (
            <TouchableOpacity
              onPress={() => router.push("/screens/home/qr/generate")}
              className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
            >
              <Ionicons name="qr-code-outline" size={18} color="black" />
            </TouchableOpacity>
          ) : null}

          {canEditProfile ? (
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/profile/business/edit-profile")
              }
              className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
            >
              <SimpleLineIcons name="pencil" size={16} color="black" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => handleShare()}
            className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
          >
            <EvilIcons name="share-apple" size={24} color="black" />
          </TouchableOpacity>

          {isOwner ? (
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/business/transfer-ownership")}
              className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
            >
              <MaterialIcons name="admin-panel-settings" size={18} color="black" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={() => router.push("/screens/profile/settings/settings")}
            className="h-10 w-10 bg-[#EEEEEE] rounded-full items-center justify-center"
          >
            <Ionicons name="settings-outline" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="bg-[#ffffff] dark:bg-dark-border rounded-b-2xl"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {showInitialSkeleton ? (
          <AutoSkeletonView isLoading={true} defaultRadius={12}>
            <View className="relative">
              <View className="w-full h-[137px] bg-[#E5E7EB]" />
              <View className="absolute -bottom-11 left-6 h-[90px] w-[90px] rounded-full bg-[#E5E7EB]" />
            </View>

            <View className="mx-6 mt-16">
              <View className="h-5 w-40 rounded-md bg-[#E5E7EB]" />
              <View className="h-4 w-60 rounded-md bg-[#E5E7EB] mt-3" />
            </View>

            <View className="mx-5 mt-4 flex-row gap-4">
              <View className="h-5 flex-1 rounded-md bg-[#E5E7EB]" />
              <View className="h-5 flex-1 rounded-md bg-[#E5E7EB]" />
            </View>

            <View className="mx-5 mt-6 border border-[#EEEEEE] rounded-2xl p-4">
              <View className="h-5 w-40 rounded-md bg-[#E5E7EB]" />
              <View className="h-4 w-full rounded-md bg-[#E5E7EB] mt-4" />
              <View className="h-4 w-[80%] rounded-md bg-[#E5E7EB] mt-2.5" />
            </View>

            <View className="mx-5 mt-6 border border-[#EEEEEE] rounded-2xl p-4">
              <View className="h-5 w-48 rounded-md bg-[#E5E7EB]" />
              <View className="h-10 w-full rounded-xl bg-[#E5E7EB] mt-4" />
              <View className="h-10 w-full rounded-xl bg-[#E5E7EB] mt-3" />
            </View>
          </AutoSkeletonView>
        ) : null}

        {!showInitialSkeleton ? (
          <>
            {/* cover and profile */}
            <View className="relative">
              {/* cover photo */}
              <Image
                source={businessData?.coverPhoto || require("@/assets/images/placeholder.png")}
                style={{ width: "100%", height: 137 }}
                contentFit="cover"
              />

              {/* profile photo */}
              {businessData?.logo ? (
                <View className="absolute -bottom-11 left-6">
                  <View className="h-[90px] w-[90px] bg-white flex-row justify-center items-center rounded-full">
                    <Image
                      source={businessData.logo || require("@/assets/images/placeholder.png")}
                      contentFit="cover"
                      style={{ height: 86, width: 86, borderRadius: 100 }}
                    />
                  </View>
                </View>
              ) : null}

              {Boolean(businessData?.isRecruiting) && (
                <View className="absolute -bottom-3 right-6">
                  <Text className="bg-[#11293A] py-1 px-4 rounded-full border font-proximanova-semibold text-sm p-1 text-[#FFFFFF] capitalize">
                    {t("user.profile.businessProfile.activelyRecruiting")}
                  </Text>
                </View>
              )}
            </View>

            {/* profile name and details */}
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

              <TouchableOpacity
                onPress={handleOpenBusinessLocation}
                className="flex-row items-center gap-1"
                activeOpacity={0.7}
              >
                <EvilIcons name="location" size={18} color="black" />

                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {businessData?.address?.address || t("user.profile.businessProfile.locationUnavailable")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tabs */}
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

            {/*  About Tabs */}
            {selectedTab === "about" && (
              <View>
                {/* rating summery */}
                <View className="flex-row justify-between items-centers mx-5 mt-4">
                  <View className="flex-row items-centers gap-2.5">
                    <View className="bg-[#E5F4FD] h-7 w-7 rounded-full flex-row items-center justify-center">
                      {/* <EvilIcons name="star" size={18} color="black" /> */}
                      <SimpleLineIcons name="star" size={14} color="black" />
                    </View>
                    <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                      {t("user.profile.businessProfile.ratingSummary")}
                    </Text>
                  </View>
                  {canReadRatings ? (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/screens/profile/rating",
                          params: { businessId },
                        })
                      }
                      className="items-center"
                    >
                      <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                        {t("user.profile.businessProfile.seeAllRatings")}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View className="mx-5 pt-4 px-2.5 pb-3 border mt-4 border-[#EEEEEE] rounded-2xl">
                  <RatingBanner
                    averageRating={averageRating}
                    totalRatings={totalRatings}
                  />

                  <View className="flex-row justify-between mt-5">
                    <View>
                      <RatingProgress rating={workEnvironmentRating} />
                      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center mt-1.5 capitalize">
                        {t("user.profile.businessProfile.workEnvironment")}
                      </Text>
                    </View>

                    <Image
                      source={require("@/assets/images/vertical-line.svg")}
                      contentFit="contain"
                      style={{ height: 70, width: 0.5 }}
                    />

                    <View>
                      <RatingProgress rating={payOnTimeRating} />
                      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center mt-1.5 capitalize">
                        {t("user.profile.businessProfile.payOnTime")}
                      </Text>
                    </View>

                    <Image
                      source={require("@/assets/images/vertical-line.svg")}
                      contentFit="contain"
                      style={{ height: 70, width: 0.5 }}
                    />

                    <View>
                      <RatingProgress rating={communicationRating} />
                      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center mt-1.5 capitalize">
                        {t("user.profile.businessProfile.communication")}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* About Us */}
                <View className="mx-5 mt-8 flex-row gap-2.5">
                  <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                    {/* <Foundation name="clipboard" size={16} color="black" /> */}
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

                {/* Team & Overview */}
                <View className="mx-5 mt-8 flex-row gap-2.5 mb-4">
                  <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                    <Ionicons name="person-outline" size={18} color="black" />
                  </View>

                  <View className='flex-1'>
                    <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                      {t("user.profile.businessProfile.teamAndOverview")}
                    </Text>
                  </View>
                </View>

                <View className="mx-5 px-4 py-3 border border-[#eeeeee] rounded-xl">
                  <View className="flex-row justify-between items-center p-2">
                    <View className="flex-row gap-2">
                      <Feather name="users" size={16} color="black" />
                      <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        {t("user.profile.businessProfile.totalEmployee")}
                      </Text>
                    </View>
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                      {String(totalEmployeeCount).padStart(2, "0")}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-center p-2">
                    <View className="flex-row gap-2">
                      <MaterialCommunityIcons
                        name="file-document-check-outline"
                        size={18}
                        color="black"
                      />
                      <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                        {t("user.profile.businessProfile.activeJobPosting")}
                      </Text>
                    </View>
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                      {String(activeJobPostingCount).padStart(2, "0")}
                    </Text>
                  </View>
                </View>

                {/* Contact Us On */}
                <View className="flex-row items-center gap-2 mx-5 mt-8">
                  <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                    <Ionicons name="call-outline" size={16} color="black" />
                  </View>

                  <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                    {t("user.profile.contactUsOn")}
                  </Text>
                </View>

                <ConnectSocials
                  className="mx-5 my-4"
                  value={socialLinks}
                  onChange={canEditProfile ? handleSocialLinksChange : () => undefined}
                  hideEmpty
                  canEdit={false}
                />
              </View>
            )}

            {/* job tabs */}
            {selectedTab === "job" && (
              <View className="mx-5">
                <Text className="my-4">{t("user.profile.businessProfile.openPositions")}</Text>

                {!canReadJobs ? (
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {t("user.profile.businessProfile.noAccessToJobData")}
                  </Text>
                ) : null}

                {canReadJobs && businessJobs.length === 0 ? (
                  <StatusStateCard
                    style={styles.compactEmptyState}
                    image={require("@/assets/images/toolbox.svg")}
                    title={t("common.noJobsAvailable")}
                    text={t("common.noJobsAvailableDescription")}
                    titleStyle={styles.compactEmptyStateTitle}
                    textStyle={styles.compactEmptyStateText}
                  />
                ) : null}

                {canReadJobs && businessJobs.map((job) => (
                  <JobCard
                    key={job?.id}
                    className="bg-white border border-[#EEEEEE] mb-4"
                    hideApplyButton
                    showOwnerMenu={canEditJobs || canDeleteJobs}
                    onPressOwnerEdit={
                      canEditJobs
                        ? () =>
                          router.push({
                            pathname: "/screens/jobs/business/edit-job",
                            params: { businessId, recruitmentId: job?.id },
                          })
                        : undefined
                    }
                    onPressOwnerDelete={async () => {
                      if (!businessId || !job?.id || !canDeleteJobs) return;

                      await deleteRecruitment(businessId, job.id);
                      setBusinessJobs((prev) =>
                        prev.filter((item) => item?.id !== job.id)
                      );
                      toast.success(t("user.profile.businessProfile.jobDeleted"));
                    }}
                    job={job}
                  />
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

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
        onSelectBusinessProfile={(nextBusinessId) => {
          setIsProfileSwitchOpen(false);
          setSelectedBusinesses([nextBusinessId]);
          requestAnimationFrame(() => {
            router.replace("/(tabs)/business-profile");
          });
        }}
      />
    </SafeAreaView>
  );
};

export default BusinessProfile;

import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
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
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
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
  const [selectedTab, setSelectedTab] = useState("about");
  const [toggleIsOn, setToggleIsOn] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [, setLoading] = useState(false);
  const [recruitingUpdateLoading, setRecruitingUpdateLoading] = useState(false);
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
  const canReadProfile = getPermissionLevel("business.overview") >= 1;
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
    if (!canReadProfile) {
      setBusinessData(null);
      return;
    }

    const requestId = ++profileRequestIdRef.current;

    try {
      setLoading(true);
      const data = await getBusinessProfile(businessId);
      if (requestId !== profileRequestIdRef.current) return;
      setBusinessData(data);
      setSocialLinks(data?.social || {});
    } catch (error: any) {
      if (requestId !== profileRequestIdRef.current) return;
      toast.error(error?.message || "Failed to load business");
    } finally {
      if (requestId !== profileRequestIdRef.current) return;
      setLoading(false);
    }
  }, [businessId, canReadProfile, getBusinessProfile]);

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
      toast.error(error?.message || "Failed to load jobs");
    }
  }, [businessId, canReadJobs, getBusinessRecruitments]);

  const loadRatingSummary = useCallback(async () => {
    if (!businessId || !canReadRatings) return;
    try {
      await getBusinessRatingSummary(businessId);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load rating summary");
    }
  }, [businessId, canReadRatings, getBusinessRatingSummary]);

  useEffect(() => {
    getMyEmployments(true).catch(() => undefined);
  }, [getMyEmployments]);

  useEffect(() => {
    loadBusiness();
    loadBusinessJobs();
  }, [loadBusiness, loadBusinessJobs]);

  useFocusEffect(
    useCallback(() => {
      loadBusiness();
      loadBusinessJobs();
      loadRatingSummary();
      return () => { };
    }, [loadBusiness, loadBusinessJobs, loadRatingSummary])
  );

  useEffect(() => {
    if (typeof businessData?.isRecruiting === "boolean") {
      setToggleIsOn(businessData.isRecruiting);
    }
  }, [businessData?.isRecruiting]);

  const workEnvironmentRating = Number(
    businessRatingSummary?.ratingBreakdown?.trustWorthy?.average ?? 0
  );
  const payOnTimeRating = Number(
    businessRatingSummary?.ratingBreakdown?.onTime?.average ?? 0
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

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          `Check out ${businessData?.name || "this business"} on Hiruu!`,
        title: businessData?.name || "Business Profile",
      });
    } catch {
      Alert.alert("Error", "Could not share profile");
    }
  };

  const handleRecruitingToggle = async (nextValue: boolean) => {
    if (!businessId || recruitingUpdateLoading) return;

    const previousValue = toggleIsOn;
    setToggleIsOn(nextValue);
    setRecruitingUpdateLoading(true);

    try {
      await updateMyBusinessProfile(businessId, { isRecruiting: nextValue });
      await loadBusiness();
    } catch (error: any) {
      setToggleIsOn(previousValue);
      toast.error(error?.message || "Failed to update recruiting status");
    } finally {
      setRecruitingUpdateLoading(false);
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
      toast.error(error?.message || "Failed to update social links");
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
      toast.error("Location unavailable");
      return;
    }

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    try {
      const canOpen = await Linking.canOpenURL(mapUrl);
      if (!canOpen) {
        toast.error("Unable to open maps");
        return;
      }
      await Linking.openURL(mapUrl);
    } catch {
      toast.error("Unable to open maps");
    }
  }, [businessData?.address?.address, businessData?.address?.latitude, businessData?.address?.longitude]);

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
            Profile
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
      >
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

          {toggleIsOn && (
            <View className="absolute -bottom-3 right-6">
              <Text className="bg-[#11293A] py-1 px-4 rounded-full border font-proximanova-semibold text-sm p-1 text-[#FFFFFF] capitalize">
                Actively Recruiting
              </Text>
            </View>
          )}
        </View>

        {/* profile name and details */}
        <View className="mx-6 mt-16">
          <View className="flex-row items-center gap-1.5">
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              {businessData?.name || "Business"}
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
                <FontAwesome6 name="crown" size={8} color="white" />
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
              {businessData?.address?.address || "Location unavailable"}
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
                  {tab}
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
                  Rating Summary
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
                    See All Ratings
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
                    Work Environment
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
                    pay on time
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
                    communication
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
                About Us
              </Text>
            </View>

            <View className="mx-5 mt-4">
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {businessData?.description || "No description available."}
              </Text>
            </View>

            {/* Team & Overview */}
            <View className="mx-5 mt-8 flex-row gap-2.5 mb-4">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <Ionicons name="person-outline" size={18} color="black" />
              </View>

              <View className='flex-1'>
                <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  Team & Overview
                </Text>
              </View>
            </View>

            <View className="mx-5 px-4 py-3 border border-[#eeeeee] rounded-xl">
              <View className="flex-row justify-between items-center p-2">
                <View className="flex-row gap-2">
                  <Feather name="users" size={16} color="black" />
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Total Employee
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
                    Active job posting:
                  </Text>
                </View>
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {String(activeJobPostingCount).padStart(2, "0")}
                </Text>
              </View>

              <View className="flex-row justify-between items-center p-2">
                {/* recruiting badge */}
                <View className="flex-row gap-2">
                  <MaterialCommunityIcons
                    name="account-search"
                    size={18}
                    color="#282930"
                  />
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Actively Recruiting
                  </Text>
                </View>

                <ToggleButton
                  isOn={toggleIsOn}
                  setIsOn={canEditProfile ? handleRecruitingToggle : () => undefined}
                  title={
                    recruitingUpdateLoading
                      ? "Saving..."
                      : `${toggleIsOn ? "YES" : "NO"}`
                  }
                />
              </View>

              <Text className="mt-2.5 font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                <Text className="font-proximanova-semibold">Note</Text> : X more hire to activate
              </Text>
            </View>

            {/* Contact Us On */}
            <View className="flex-row items-center gap-2 mx-5 mt-8">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <Ionicons name="call-outline" size={16} color="black" />
              </View>

              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Contact Us On
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
            <Text className="my-4">Open Positions</Text>

            {!canReadJobs ? (
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                No access to job data.
              </Text>
            ) : null}

            {canReadJobs && businessJobs.length === 0 ? (
              <StatusStateCard
                style={styles.compactEmptyState}
                image={require("@/assets/images/toolbox.svg")}
                title="No Jobs Available"
                text="There are no job openings at the moment."
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
                  toast.success("Job deleted");
                }}
                job={job}
              />
            ))}
          </View>
        )}
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

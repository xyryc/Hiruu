import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessJobCard from "@/components/ui/cards/BusinessJobCard";
import ChatBell from "@/components/ui/notification/ChatBell";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessPermission } from "@/hooks/useBusinessPermission";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { buildDialablePhoneNumber } from "@/utils/phone";

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
const JOB_CARD_RADIUS = 12;

const normalizeRoleIds = (value?: string[] | string) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.length > 0) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
};

const matchesPreferredRoleIds = (
  profile: any,
  preferredRoleIds?: string[] | string
) => {
  const selectedRoleIds = normalizeRoleIds(preferredRoleIds);
  if (selectedRoleIds.length === 0) return true;

  const profileRoleIds = Array.isArray(profile?.preferredRoleIds)
    ? profile.preferredRoleIds.filter(Boolean)
    : [];

  return selectedRoleIds.some((roleId) => profileRoleIds.includes(roleId));
};

const filterProfilesByFeaturedType = (
  profiles: any[],
  type: "featured" | "suggested"
) => {
  if (!Array.isArray(profiles)) return [];
  return profiles.filter((profile) =>
    type === "featured"
      ? profile?.isFeatured === true
      : profile?.isFeatured !== true
  );
};

const withDialPhoneNumber = (profiles: any[]) => {
  if (!Array.isArray(profiles)) return [];
  return profiles.map((profile) => {
    const user = profile?.user && typeof profile.user === "object" ? profile.user : null;
    const dialPhoneNumber = buildDialablePhoneNumber(user?.countryCode, user?.phoneNumber);
    return {
      ...profile,
      user: user ? { ...user, dialPhoneNumber } : profile?.user,
    };
  });
};

const BusinessJobs = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const getJobProfilesForBusiness = useJobStore((s) => s.getJobProfilesForBusiness);
  const businessCandidateFilters = useJobStore((s) => s.businessCandidateFilters);
  const { selectedBusinesses, getMyEmployments } = useBusinessStore();
  const { canEdit: canPostJobs } = useBusinessPermission("jobs");
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const featuredSkeletonItems = useMemo(
    () => Array.from({ length: 4 }, (_, index) => ({ id: `featured-skeleton-${index}` })),
    []
  );
  const suggestedSkeletonItems = useMemo(
    () => Array.from({ length: 4 }, (_, index) => ({ id: `suggested-skeleton-${index}` })),
    []
  );

  // Get current business ID
  const currentBusinessId = selectedBusinesses?.[0] || null;


  // Helper function to check if user is already employed by current business
  const isAlreadyEmployed = useCallback((profile: any) => {
    if (!currentBusinessId || !profile?.userId) return false;

    const employments = Array.isArray(profile?.user?.employments)
      ? profile.user.employments
      : [];

    return employments.some((employment: any) => {
      const isActive = employment?.status === "active" ||
        employment?.isActive === true;
      const matchesBusiness = employment?.businessId === currentBusinessId ||
        employment?.business?.id === currentBusinessId;
      return isActive && matchesBusiness;
    });
  }, [currentBusinessId]);

  // Filter out already employed users
  const filteredFeaturedProfiles = useMemo(() => {
    return featuredProfiles.filter(profile => !isAlreadyEmployed(profile));
  }, [featuredProfiles, isAlreadyEmployed]);

  const filteredSuggestedProfiles = useMemo(() => {
    return suggestedProfiles.filter(profile => !isAlreadyEmployed(profile));
  }, [suggestedProfiles, isAlreadyEmployed]);
  const loadFeaturedProfiles = useCallback(async () => {
    try {
      setIsLoadingFeatured(true);
      if (!currentBusinessId) {
        setFeaturedProfiles([]);
        toast.error("Please select a business first.");
        return;
      }
      const result = await getJobProfilesForBusiness(currentBusinessId, {
        page: 1,
        limit: 10,
        ...businessCandidateFilters,
      });
      // console.log(
      //   "[BusinessJobs] featured profiles response:",
      //   JSON.stringify(result, null, 2)
      // );
      setFeaturedProfiles(
        withDialPhoneNumber(
          filterProfilesByFeaturedType(result.data, "featured")
          .filter((profile) =>
            matchesPreferredRoleIds(profile, businessCandidateFilters.preferredRoleIds)
          )
        )
      );



    } catch (error: any) {
      console.error("[BusinessJobs] Failed to load featured profiles:", error);
      setFeaturedProfiles([]);
      toast.error(error?.message || "Failed to load featured profiles");
    } finally {
      setIsLoadingFeatured(false);
    }
  }, [businessCandidateFilters, currentBusinessId, getJobProfilesForBusiness]);

  const loadSuggestedProfiles = useCallback(async () => {
    try {
      setIsLoadingSuggested(true);
      if (!currentBusinessId) {
        setSuggestedProfiles([]);
        toast.error("Please select a business first.");
        return;
      }
      const result = await getJobProfilesForBusiness(currentBusinessId, {
        page: 1,
        limit: 10,
        ...businessCandidateFilters,
      });
      // console.log(
      //   "[BusinessJobs] suggested profiles response:",
      //   JSON.stringify(result, null, 2)
      // );
      setSuggestedProfiles(
        withDialPhoneNumber(
          filterProfilesByFeaturedType(result.data, "suggested")
          .filter((profile) =>
            matchesPreferredRoleIds(profile, businessCandidateFilters.preferredRoleIds)
          )
        )
      );
    } catch (error: any) {
      setSuggestedProfiles([]);
      toast.error(error?.message || "Failed to load suggested profiles");
    } finally {
      setIsLoadingSuggested(false);
    }
  }, [businessCandidateFilters, currentBusinessId, getJobProfilesForBusiness]);

  useFocusEffect(
    useCallback(() => {
      getMyEmployments().catch(() => undefined);
      loadFeaturedProfiles();
      loadSuggestedProfiles();
    }, [getMyEmployments, loadFeaturedProfiles, loadSuggestedProfiles])
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "top", "right"]}
    >
      <ScreenHeader
        className="my-4 mx-5"
        onPressBack={() => router.back()}
        title="Find Employee"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <View className="flex-row items-center gap-2.5">
            {/* post job */}
            {canPostJobs ? (
              <TouchableOpacity
                onPress={() => {
                  router.push("/screens/jobs/business/post-job");
                }}
                className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
              >
                <Ionicons name="add" size={18} color="black" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={() =>
                router.push("/screens/jobs/business/candidate-requests")
              }
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
            >
              <Ionicons name="document-text-outline" size={18} color="black" />
            </TouchableOpacity>

            <ChatBell
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
              iconSize={22}
            />
          </View>
        }
      />

      <ScrollView
        className="mx-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* search and filter button */}
        <View className="flex-row items-center mt-4">
          <View className="flex-1 border border-[#EEEEEE] rounded-[10px] ">
            <View className="flex-row items-center ">
              {/* Search Icon */}
              <EvilIcons
                name="search"
                size={24}
                color="black"
                className="ml-4"
              />

              {/* Input */}
              <TextInput
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base text-gray-800 dark:text-gray-200"
              />
            </View>
          </View>

          {/* Filter Icon Button */}
          <TouchableOpacity
            onPress={() => router.push("/screens/jobs/business/filter")}
            className="w-10 h-10 bg-[#0C2433] rounded-full items-center justify-center ml-2"
          >
            <Ionicons name="options-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Show no profiles available card when both categories are empty and not loading */}
        {!isLoadingFeatured &&
          !isLoadingSuggested &&
          filteredFeaturedProfiles.length === 0 &&
          filteredSuggestedProfiles.length === 0 && (
            <View className="mt-7">
              <StatusStateCard
                style={styles.compactEmptyState}
                image={require("@/assets/images/toolbox.svg")}
                title="No Candidates Available"
                text="There are no job seekers available at the moment. Check back later or post a job to attract candidates."
                titleStyle={styles.compactEmptyStateTitle}
                textStyle={styles.compactEmptyStateText}
              />
            </View>
          )}

        {/* Featured Profile - only show if there are profiles or loading */}
        {(isLoadingFeatured || filteredFeaturedProfiles.length > 0) && (
          <View className="mt-8">
            <View className="flex-row justify-between">
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Featured Profile
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/screens/jobs/business/all-profiles",
                    params: { type: "featured" },
                  })
                }
              >
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingFeatured ? (
              <AutoSkeletonView isLoading={true} defaultRadius={JOB_CARD_RADIUS}>
                <>
                  {featuredSkeletonItems.map((profile: any) => (
                    <BusinessJobCard
                      key={profile.id}
                      className="mt-4"
                      status="featured"
                      profile={profile}
                    />
                  ))}
                </>
              </AutoSkeletonView>
            ) : (
              filteredFeaturedProfiles.slice(0, 10).map((profile: any) => (
                <BusinessJobCard
                  key={profile.id}
                  className="mt-4"
                  status="featured"
                  profile={profile}
                />
              ))
            )}
          </View>
        )}

        {/* Suggested Profile - only show if there are profiles or loading */}
        {(isLoadingSuggested || filteredSuggestedProfiles.length > 0) && (
          <View className="mt-8">
            <View className="flex-row justify-between">
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Suggested Profile
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/screens/jobs/business/all-profiles",
                    params: { type: "suggested" },
                  })
                }
              >
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingSuggested ? (
              <AutoSkeletonView isLoading={true} defaultRadius={JOB_CARD_RADIUS}>
                <>
                  {suggestedSkeletonItems.map((profile: any) => (
                    <BusinessJobCard
                      key={profile.id}
                      className="mt-4"
                      profile={profile}
                    />
                  ))}
                </>
              </AutoSkeletonView>
            ) : (
              filteredSuggestedProfiles.slice(0, 4).map((profile: any) => (
                <BusinessJobCard
                  key={profile.id}
                  className="mt-4"
                  profile={profile}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessJobs;

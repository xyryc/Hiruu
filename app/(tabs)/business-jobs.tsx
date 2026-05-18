import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessJobCard from "@/components/ui/cards/BusinessJobCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import ChatBell from "@/components/ui/notification/ChatBell";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessPermission } from "@/hooks/useBusinessPermission";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { buildDialablePhoneNumber } from "@/utils/phone";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

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

const CandidateCardSkeleton = ({ className = "" }: { className?: string }) => (
  <View className={`${className} p-2.5 rounded-xl border border-[#4FB2F330]`}>
    <View className="flex-row items-center gap-2.5 p-1">
      <View className="w-10 h-10 rounded-full bg-[#E5E7EB]" />
      <View className="flex-1">
        <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />
        <View className="mt-2 h-3 w-28 bg-[#E5E7EB] rounded-md" />
      </View>
    </View>
    <View className="mt-3 h-3 w-48 bg-[#E5E7EB] rounded-md" />
    <View className="mt-2 h-3 w-36 bg-[#E5E7EB] rounded-md" />
    <View className="mt-4 h-[2px] w-full bg-[#E5E7EB] rounded-full" />
    <View className="mt-4 flex-row items-center justify-between">
      <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
      <View className="h-8 w-24 bg-[#E5E7EB] rounded-full" />
    </View>
  </View>
);

const BusinessJobs = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const getJobProfilesForBusiness = useJobStore((s) => s.getJobProfilesForBusiness);
  const businessCandidateFilters = useJobStore((s) => s.businessCandidateFilters);
  const { selectedBusinesses, getMyEmployments } = useBusinessStore();
  const { canEdit: canPostJobs } = useBusinessPermission("jobs");
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
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
  const loadFeaturedProfiles = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) setIsLoadingFeatured(true);
      if (!currentBusinessId) {
        setFeaturedProfiles([]);
        toast.error(t("user.profile.noBusinessSelected"));
        return;
      }
      const result = await getJobProfilesForBusiness(currentBusinessId, {
        page: 1,
        limit: 10,
        ...businessCandidateFilters,
      });
      // console.log(
      //   "[BusinessJobs] getJobProfilesForBusiness featured raw response",
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
      toast.error(error?.message || t("user.jobs.allProfiles.failedToFetchProfiles"));
    } finally {
      if (!options?.silent) setIsLoadingFeatured(false);
    }
  }, [businessCandidateFilters, currentBusinessId, getJobProfilesForBusiness, t]);

  const loadSuggestedProfiles = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) setIsLoadingSuggested(true);
      if (!currentBusinessId) {
        setSuggestedProfiles([]);
        toast.error(t("user.profile.noBusinessSelected"));
        return;
      }
      const result = await getJobProfilesForBusiness(currentBusinessId, {
        page: 1,
        limit: 10,
        ...businessCandidateFilters,
      });
      // console.log(
      //   "[BusinessJobs] getJobProfilesForBusiness suggested raw response",
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
      toast.error(error?.message || t("user.jobs.allProfiles.failedToFetchProfiles"));
    } finally {
      if (!options?.silent) setIsLoadingSuggested(false);
    }
  }, [businessCandidateFilters, currentBusinessId, getJobProfilesForBusiness, t]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await getMyEmployments().catch(() => undefined);
      await Promise.all([
        loadFeaturedProfiles({ silent: true }),
        loadSuggestedProfiles({ silent: true }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [getMyEmployments, isRefreshing, loadFeaturedProfiles, loadSuggestedProfiles]);

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
        title={t("user.jobsTab.findEmployee")}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? "#fff" : "#111"}
          />
        }
      >
        {/* search and filter button */}
        <View className="flex-row items-center mt-4">
          <SearchBar
            className="flex-1"
            value={searchValue}
            onSearch={setSearchValue}
          />

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
                title={t("user.jobs.allProfiles.noProfilesFound")}
                text={t("user.jobs.allProfiles.adjustFilters")}
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
                {t("user.jobs.allProfiles.featured")}
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
                  {t("common.seeAll")}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-4"
            >
              {isLoadingFeatured ? (
                <>
                  {featuredSkeletonItems.map((profile: any) => (
                    <CandidateCardSkeleton
                      key={profile.id}
                      className="mr-2.5 w-[360px]"
                    />
                  ))}
                </>
              ) : (
                filteredFeaturedProfiles.slice(0, 10).map((profile: any) => {
                  // DEBUG-INTEGRATION: temporary featured profile log
                  // console.log("[FindEmployee] BusinessJobCard featured profile", JSON.stringify(profile, null, 2));
                  return (
                    <BusinessJobCard
                      key={profile.id}
                      className="mr-2.5 w-[360px]"
                      status="featured"
                      profile={profile}
                    />
                  );
                })
              )}
            </ScrollView>
          </View>
        )}

        {/* Suggested Profile - only show if there are profiles or loading */}
        {(isLoadingSuggested || filteredSuggestedProfiles.length > 0) && (
          <View className="mt-8">
            <View className="flex-row justify-between">
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                {t("user.jobs.allProfiles.suggested")}
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
                  {t("common.seeAll")}
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingSuggested ? (
              <>
                {suggestedSkeletonItems.map((profile: any) => (
                  <CandidateCardSkeleton key={profile.id} className="mt-4" />
                ))}
              </>
            ) : (
              filteredSuggestedProfiles.slice(0, 4).map((profile: any) => {
                // DEBUG-INTEGRATION: temporary suggested profile log
                // console.log("[FindEmployee] BusinessJobCard suggested profile", profile);
                return (
                  <BusinessJobCard
                    key={profile.id}
                    className="mt-4"
                    profile={profile}
                  />
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessJobs;

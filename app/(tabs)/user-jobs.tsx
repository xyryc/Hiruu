import ScreenHeader from "@/components/header/ScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import ChatBell from "@/components/ui/notification/ChatBell";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
import { useJobStore } from "@/stores/jobStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
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

const JOBS_PAGE_LIMIT = 10;

const FeaturedJobCardSkeleton = () => (
  <View className="mr-2.5 w-[360px] rounded-2xl border border-[#EEEEEE] bg-white p-4">
    <View className="h-5 w-44 rounded-md bg-[#E5E7EB]" />
    <View className="mt-3 h-3 w-36 rounded-md bg-[#E5E7EB]" />
    <View className="mt-2 h-3 w-24 rounded-md bg-[#E5E7EB]" />
    <View className="mt-4 h-[1px] w-full rounded-full bg-[#E5E7EB]" />
    <View className="mt-4 flex-row items-center justify-between">
      <View className="h-8 w-24 rounded-full bg-[#E5E7EB]" />
      <View className="h-8 w-28 rounded-full bg-[#E5E7EB]" />
    </View>
  </View>
);

const SuggestedJobCardSkeleton = () => (
  <View className="mb-4 rounded-2xl border border-[#EEEEEE] bg-white p-4">
    <View className="flex-row items-center">
      <View className="h-10 w-10 rounded-full bg-[#E5E7EB]" />
      <View className="ml-3 flex-1">
        <View className="h-4 w-40 rounded-md bg-[#E5E7EB]" />
        <View className="mt-2 h-3 w-28 rounded-md bg-[#E5E7EB]" />
      </View>
    </View>
    <View className="mt-4 h-3 w-4/5 rounded-md bg-[#E5E7EB]" />
    <View className="mt-2 h-3 w-2/3 rounded-md bg-[#E5E7EB]" />
    <View className="mt-2 h-3 w-1/2 rounded-md bg-[#E5E7EB]" />
    <View className="mt-4 h-[1px] w-full rounded-full bg-[#E5E7EB]" />
    <View className="mt-4 flex-row items-center justify-between">
      <View className="h-3 w-28 rounded-md bg-[#E5E7EB]" />
      <View className="h-8 w-24 rounded-full bg-[#E5E7EB]" />
    </View>
  </View>
);

const UserJobs = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const getPublicRecruitments = useJobStore((s) => s.getPublicRecruitments);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingMoreFeatured, setIsLoadingMoreFeatured] = useState(false);
  const [featuredPage, setFeaturedPage] = useState(1);
  const [hasMoreFeatured, setHasMoreFeatured] = useState(true);
  const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);
  const [isLoadingMoreSuggested, setIsLoadingMoreSuggested] = useState(false);
  const [suggestedPage, setSuggestedPage] = useState(1);
  const [hasMoreSuggested, setHasMoreSuggested] = useState(true);

  const { unreadCount } = useUnreadApplications({
    autoRefresh: true,
    refreshInterval: 30000,
  });
  const featuredSkeletonItems = Array.from({ length: 3 }, (_, index) => index);
  const suggestedSkeletonItems = Array.from({ length: 4 }, (_, index) => index);

  const mergeById = (current: any[], incoming: any[]) => {
    const seen = new Set<string>();
    const merged = [...current, ...incoming].filter((item) => {
      const id = String(item?.id || "");
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    return merged;
  };

  const loadFeaturedJobs = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMoreFeatured(true);
      } else {
        setIsLoadingFeatured(true);
      }
      console.log("[UserJobs] getPublicRecruitments featured request", {
        page,
        limit: JOBS_PAGE_LIMIT,
        isFeatured: true,
        append,
      });
      const result = await getPublicRecruitments({
        page,
        limit: JOBS_PAGE_LIMIT,
        isFeatured: true,
      });
      console.log(
        "[UserJobs] getPublicRecruitments featured raw response",
        JSON.stringify(result, null, 2)
      );
      const jobs = (Array.isArray(result?.data) ? result.data : []).filter(
        (item: any) => item?.isActive === true
      );
      const totalPages = Number(result?.pagination?.totalPages || 1);
      setFeaturedPage(page);
      setHasMoreFeatured(page < totalPages);
      setFeaturedJobs((prev) => (append ? mergeById(prev, jobs) : jobs));
    } catch (error: any) {
      console.error("[UserJobs] getPublicRecruitments featured failed", error);
      if (!append) {
        setFeaturedJobs([]);
        setHasMoreFeatured(false);
      }
      toast.error(error?.message || t("user.jobsTab.failedToLoadFeaturedJobs"));
    } finally {
      if (append) {
        setIsLoadingMoreFeatured(false);
      } else {
        setIsLoadingFeatured(false);
      }
    }
  }, [getPublicRecruitments, t]);

  const loadSuggestedJobs = useCallback(async (page = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMoreSuggested(true);
      } else {
        setIsLoadingSuggested(true);
      }
      console.log("[UserJobs] getPublicRecruitments suggested request", {
        page,
        limit: JOBS_PAGE_LIMIT,
        isFeatured: false,
        append,
      });
      const result = await getPublicRecruitments({
        page,
        limit: JOBS_PAGE_LIMIT,
        isFeatured: false,
      });
      console.log(
        "[UserJobs] getPublicRecruitments suggested raw response",
        JSON.stringify(result, null, 2)
      );
      const jobs = (Array.isArray(result?.data) ? result.data : []).filter(
        (item: any) => item?.isActive === true
      );
      const totalPages = Number(result?.pagination?.totalPages || 1);
      setSuggestedPage(page);
      setHasMoreSuggested(page < totalPages);
      setSuggestedJobs((prev) => (append ? mergeById(prev, jobs) : jobs));
    } catch (error: any) {
      console.error("[UserJobs] getPublicRecruitments suggested failed", error);
      if (!append) {
        setSuggestedJobs([]);
        setHasMoreSuggested(false);
      }
      toast.error(error?.message || t("user.jobsTab.failedToLoadSuggestedJobs"));
    } finally {
      if (append) {
        setIsLoadingMoreSuggested(false);
      } else {
        setIsLoadingSuggested(false);
      }
    }
  }, [getPublicRecruitments, t]);

  const loadMoreFeaturedJobs = useCallback(() => {
    if (isLoadingFeatured || isLoadingMoreFeatured || !hasMoreFeatured) return;
    void loadFeaturedJobs(featuredPage + 1, true);
  }, [
    featuredPage,
    hasMoreFeatured,
    isLoadingFeatured,
    isLoadingMoreFeatured,
    loadFeaturedJobs,
  ]);

  const loadMoreSuggestedJobs = useCallback(() => {
    if (isLoadingSuggested || isLoadingMoreSuggested || !hasMoreSuggested) return;
    void loadSuggestedJobs(suggestedPage + 1, true);
  }, [
    hasMoreSuggested,
    isLoadingMoreSuggested,
    isLoadingSuggested,
    loadSuggestedJobs,
    suggestedPage,
  ]);

  const isNearVerticalEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - 160;
  };

  const isNearHorizontalEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    return layoutMeasurement.width + contentOffset.x >= contentSize.width - 80;
  };

  useFocusEffect(
    useCallback(() => {
      setFeaturedPage(1);
      setSuggestedPage(1);
      setHasMoreFeatured(true);
      setHasMoreSuggested(true);
      loadFeaturedJobs(1, false);
      loadSuggestedJobs(1, false);
    }, [loadFeaturedJobs, loadSuggestedJobs])
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScreenHeader
        className="px-5 pt-2.5"
        title={t("user.jobsTab.findJob")}
        components={
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/user/job-profile")}
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full border-[0.5px] border-[#b2b1b169]"
            >
              {/* <Ionicons name="add" size={18} color="black" /> */}
              <MaterialCommunityIcons name="briefcase-plus-outline" size={18} color="black" />
            </TouchableOpacity>

            {/* left */}
            <TouchableOpacity
              onPress={() => router.push("/screens/jobs/job-request")}
              className="w-10 h-10 justify-center items-center bg-[#f5f5f5] border-[0.5px] border-[#b2b1b169] rounded-full"
            >
              <Ionicons name="newspaper-outline" size={20} color="#4b5563" />
              {unreadCount > 0 && (
                <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
                  <Text className="text-[10px] text-white">
                    {unreadCount > 9 ? t("common.ninePlus") : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* right */}
            {/* messages */}
            <ChatBell
              className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
              iconSize={22}
            />
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          if (isNearVerticalEnd(event)) {
            loadMoreSuggestedJobs();
          }
        }}
        scrollEventThrottle={16}
      >
        {/* search box */}
        <View className="flex-row items-center gap-1.5 mt-3.5 px-5">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/screens/jobs/user/all-jobs",
                params: { reset: "1" },
              })
            }
          >
            <View pointerEvents="none">
              <SearchBar className="w-full" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/screens/jobs/user/filter")}
          >
            <Ionicons name="filter-circle" size={44} color="black" />
          </TouchableOpacity>
        </View>

        {/* Show no jobs available card when both categories are empty and not loading */}
        {!isLoadingFeatured &&
          !isLoadingSuggested &&
          featuredJobs.length === 0 &&
          suggestedJobs.length === 0 && (
            <View className="mt-7 px-5">
              <StatusStateCard
                style={styles.compactEmptyState}
                image={require("@/assets/images/toolbox.svg")}
                title={t("common.noJobsAvailable")}
                text={t("common.noJobsAvailableDescription")}
                titleStyle={styles.compactEmptyStateTitle}
                textStyle={styles.compactEmptyStateText}
              />
            </View>
          )}

        {/* featured job - only show if there are jobs or loading */}
        {(isLoadingFeatured || featuredJobs.length > 0) && (
          <View className="mt-7">
            <View className="flex-row justify-between items-center mb-4 px-5">
              <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
                {t("user.jobsTab.featuredJob")}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/screens/jobs/user/all-jobs",
                    params: { reset: "1", type: "featured" },
                  })
                }
              >
                <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                  {t("user.jobsTab.seeAll")}
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingFeatured ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="ml-5"
              >
                {featuredSkeletonItems.map((item) => (
                  <FeaturedJobCardSkeleton key={`featured-skeleton-${item}`} />
                ))}
              </ScrollView>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-5"
                onScroll={(event) => {
                  if (isNearHorizontalEnd(event)) {
                    loadMoreFeaturedJobs();
                  }
                }}
                scrollEventThrottle={16}
              >
                {featuredJobs.map((item: any) => (
                  <JobCard
                    key={item?.id}
                    job={item}
                    className="mr-2.5 w-[360px]"
                  />
                ))}
                {isLoadingMoreFeatured && (
                  <View className="w-14 justify-center items-center">
                    <ActivityIndicator />
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        )}

        {/* suggested job - only show if there are jobs or loading */}
        {(isLoadingSuggested || suggestedJobs.length > 0) && (
          <View className="mt-7 px-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
                {t("user.jobsTab.suggestedJob")}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/screens/jobs/user/all-jobs",
                    params: { reset: "1", type: "suggested" },
                  })
                }
              >
                <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                  {t("user.jobsTab.seeAll")}
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingSuggested ? (
              <>
                {suggestedSkeletonItems.map((item) => (
                  <SuggestedJobCardSkeleton key={`suggested-skeleton-${item}`} />
                ))}
              </>
            ) : (
              <>
                {suggestedJobs.map((item: any) => (
                  <JobCard
                    key={`suggested-${item?.id}`}
                    job={item}
                    className="bg-white border border-[#EEEEEE] mb-4"
                  />
                ))}
                {isLoadingMoreSuggested && (
                  <View className="py-2 items-center">
                    <ActivityIndicator />
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserJobs;

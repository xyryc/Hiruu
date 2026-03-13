import ScreenHeader from "@/components/header/ScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import NoJobsAvailableCard from "@/components/ui/cards/NoJobsAvailableCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import useUnreadApplications from "@/hooks/useUnreadApplications";
import { useJobStore } from "@/stores/jobStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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

const UserJobs = () => {
  const router = useRouter();
  const getPublicRecruitments = useJobStore((s) => s.getPublicRecruitments);
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<any[]>([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);

  const { unreadCount } = useUnreadApplications({
    autoRefresh: true,
    refreshInterval: 30000,
  });

  const loadFeaturedJobs = useCallback(async () => {
    try {
      setIsLoadingFeatured(true);
      const result = await getPublicRecruitments({
        page: 1,
        limit: 10,
        isFeatured: true,
      });
      const jobs = (Array.isArray(result?.data) ? result.data : []).filter(
        (item: any) => item?.isActive === true
      );
      setFeaturedJobs(jobs);
    } catch (error: any) {
      setFeaturedJobs([]);
      toast.error(error?.message || "Failed to load featured jobs");
    } finally {
      setIsLoadingFeatured(false);
    }
  }, [getPublicRecruitments]);

  const loadSuggestedJobs = useCallback(async () => {
    try {
      setIsLoadingSuggested(true);
      const result = await getPublicRecruitments({
        page: 1,
        limit: 10,
        isFeatured: false,
      });
      const jobs = (Array.isArray(result?.data) ? result.data : []).filter(
        (item: any) => item?.isActive === true
      );
      setSuggestedJobs(jobs);
    } catch (error: any) {
      setSuggestedJobs([]);
      toast.error(error?.message || "Failed to load suggested jobs");
    } finally {
      setIsLoadingSuggested(false);
    }
  }, [getPublicRecruitments]);

  useFocusEffect(
    useCallback(() => {
      loadFeaturedJobs();
      loadSuggestedJobs();
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
        title="Find Job"
        components={
          <View className="flex-row items-center gap-2.5">
            {/* left */}
            <TouchableOpacity
              onPress={() => router.push("/screens/jobs/job-request")}
              className="w-10 h-10 justify-center items-center bg-[#f5f5f5] border-[0.5px] border-[#b2b1b169] rounded-full"
            >
              <Ionicons name="newspaper-outline" size={20} color="#4b5563" />
              {unreadCount > 0 && (
                <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
                  <Text className="text-[10px] text-white">{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* right */}
            <TouchableOpacity
              onPress={() => router.push("/screens/inbox/chat-list")}
              className="w-10 h-10 justify-center items-center bg-[#f5f5f5] border-[0.5px] border-[#b2b1b169] rounded-full"
            >
              <Image
                source={require("@/assets/images/messages.svg")}
                style={{
                  width: 20,
                  height: 20,
                }}
                contentFit="contain"
              />
              <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
                <Text className="text-[10px] text-white">1</Text>
              </View>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
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
              <NoJobsAvailableCard />
            </View>
          )}

        {/* featured job - only show if there are jobs or loading */}
        {(isLoadingFeatured || featuredJobs.length > 0) && (
          <View className="mt-7">
            <View className="flex-row justify-between items-center mb-4 px-5">
              <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
                Featured Job
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/screens/jobs/user/all-jobs")}
              >
                <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingFeatured ? (
              <View className="py-10 px-5 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : featuredJobs.length === 1 ? (
              <View className="px-5">
                <JobCard
                  job={featuredJobs[0]}
                  className="bg-white border border-[#EEEEEE] mb-4"
                />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-5"
              >
                {featuredJobs.slice(0, 10).map((item: any) => (
                  <JobCard
                    key={item?.id}
                    job={item}
                    className="mr-2.5 w-[360px]"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* suggested job - only show if there are jobs or loading */}
        {(isLoadingSuggested || suggestedJobs.length > 0) && (
          <View className="mt-7 px-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
                Suggested Job
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/screens/jobs/user/all-jobs")}
              >
                <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingSuggested ? (
              <View className="py-6 items-center">
                <ActivityIndicator />
              </View>
            ) : (
              suggestedJobs.slice(0, 4).map((item: any) => (
                <JobCard
                  key={`suggested-${item?.id}`}
                  job={item}
                  className="bg-white border border-[#EEEEEE] mb-4"
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserJobs;

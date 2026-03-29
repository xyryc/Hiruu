import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessJobCard from "@/components/ui/cards/BusinessJobCard";
import NoJobsAvailableCard from "@/components/ui/cards/NoJobsAvailableCard";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

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

const BusinessJobs = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const getJobProfiles = useJobStore((s) => s.getJobProfiles);
  const businessCandidateFilters = useJobStore((s) => s.businessCandidateFilters);
  const { selectedBusinesses } = useBusinessStore();
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [isLoadingSuggested, setIsLoadingSuggested] = useState(false);

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
      const result = await getJobProfiles({
        page: 1,
        limit: 10,
        ...businessCandidateFilters,
      });
      console.log(
        "[BusinessJobs] featured profiles response:",
        JSON.stringify(result, null, 2)
      );
      setFeaturedProfiles(
        filterProfilesByFeaturedType(result.data, "featured")
          .filter((profile) =>
            matchesPreferredRoleIds(profile, businessCandidateFilters.preferredRoleIds)
          )
      );



    } catch (error: any) {
      console.error("[BusinessJobs] Failed to load featured profiles:", error);
      setFeaturedProfiles([]);
      toast.error(error?.message || "Failed to load featured profiles");
    } finally {
      setIsLoadingFeatured(false);
    }
  }, [businessCandidateFilters, getJobProfiles]);

  const loadSuggestedProfiles = useCallback(async () => {
    try {
      setIsLoadingSuggested(true);
      const result = await getJobProfiles({
        page: 1,
        limit: 10,
        ...businessCandidateFilters,
      });
      console.log(
        "[BusinessJobs] suggested profiles response:",
        JSON.stringify(result, null, 2)
      );
      setSuggestedProfiles(
        filterProfilesByFeaturedType(result.data, "suggested")
          .filter((profile) =>
            matchesPreferredRoleIds(profile, businessCandidateFilters.preferredRoleIds)
          )
      );
    } catch (error: any) {
      setSuggestedProfiles([]);
      toast.error(error?.message || "Failed to load suggested profiles");
    } finally {
      setIsLoadingSuggested(false);
    }
  }, [businessCandidateFilters, getJobProfiles]);

  useFocusEffect(
    useCallback(() => {
      loadFeaturedProfiles();
      loadSuggestedProfiles();
    }, [loadFeaturedProfiles, loadSuggestedProfiles])
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
            <TouchableOpacity
              onPress={() => router.push("/screens/jobs/business/post-job")}
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
            >
              <Ionicons name="add" size={18} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                router.push("/screens/jobs/business/candidate-requests")
              }
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
            >
              <Ionicons name="document-text-outline" size={18} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/screens/inbox/chat-list")}
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
            >
              <Image
                source={require("@/assets/images/messages.svg")}
                contentFit="contain"
                style={{ height: 22, width: 22 }}
              />
            </TouchableOpacity>
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
              <NoJobsAvailableCard
                title="No Candidates Available"
                description="There are no job seekers available at the moment. Check back later or post a job to attract candidates."
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
              <View className="py-10 items-center justify-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
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
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
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

import { useTranslation } from "react-i18next";
import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessJobCard from "@/components/ui/cards/BusinessJobCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
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

const firstParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseProfilesTypeParam = (value?: string | string[]) => {
  const normalized = firstParam(value);
  if (normalized === "featured" || normalized === "suggested") {
    return normalized;
  }
  return undefined;
};

const filterProfilesByFeaturedType = (
  profiles: any[],
  type?: "featured" | "suggested"
) => {
  if (!Array.isArray(profiles) || !type) return Array.isArray(profiles) ? profiles : [];
  return profiles.filter((profile) =>
    type === "featured"
      ? profile?.isFeatured === true
      : profile?.isFeatured !== true
  );
};

const AllProfiles = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const getJobProfilesForBusiness = useJobStore((s) => s.getJobProfilesForBusiness);
  const businessCandidateFilters = useJobStore((s) => s.businessCandidateFilters);
  const setBusinessCandidateFilters = useJobStore((s) => s.setBusinessCandidateFilters);
  const selectedBusinesses = useBusinessStore((s) => s.selectedBusinesses);
  const params = useLocalSearchParams<{ type?: string }>();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const currentBusinessId = selectedBusinesses?.[0] || null;
  const skeletonItems = useMemo(
    () => Array.from({ length: 4 }, (_, index) => ({ id: `all-profiles-skeleton-${index}` })),
    []
  );
  const showInlineSkeleton = isLoading && profiles.length > 0 && !isLoadingMore && !isRefreshing;
  const profilesType = useMemo(() => parseProfilesTypeParam(params.type), [params.type]);
  const screenTitle =
    profilesType === "featured"
      ? t("user.jobs.allProfiles.featured")
      : profilesType === "suggested"
        ? t("user.jobs.allProfiles.suggested")
        : t("user.jobs.allProfiles.all");

  const loadProfiles = useCallback(
    async (targetPage = 1, append = false, options?: { silent?: boolean }) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          if (!options?.silent) setIsLoading(true);
        }

        if (!currentBusinessId) {
          if (!append) {
            setProfiles([]);
            setPage(1);
            setTotalPages(1);
          }
          toast.error("Please select a business first.");
          return;
        }

        const result = await getJobProfilesForBusiness(currentBusinessId, {
          page: targetPage,
          limit,
          ...businessCandidateFilters,
        });

        const fetched = filterProfilesByFeaturedType(
          Array.isArray(result?.data) ? result.data : [],
          profilesType
        )
          .filter((profile) =>
            matchesPreferredRoleIds(profile, businessCandidateFilters.preferredRoleIds)
          );
        const nextPage = Number(result?.pagination?.page || targetPage);
        const nextTotalPages = Number(result?.pagination?.totalPages || 1);

        setProfiles((prev) => {
          if (!append) return fetched;
          const merged = [...prev, ...fetched];
          return Array.from(new Map(merged.map((item: any) => [item?.id, item])).values());
        });
        setPage(nextPage);
        setTotalPages(nextTotalPages);
      } catch (error: any) {
        if (!append) {
          setProfiles([]);
        }
        toast.error(error?.message || t("user.jobs.allProfiles.failedToFetchProfiles"));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      businessCandidateFilters,
      currentBusinessId,
      getJobProfilesForBusiness,
      limit,
      profilesType,
      t,
    ]
  );

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadProfiles(1, false, { silent: true });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadProfiles]);

  useEffect(() => {
    loadProfiles(1, false);
  }, [loadProfiles]);

  const handleLoadMore = async () => {
    if (isLoadingMore || isLoading || page >= totalPages) return;
    await loadProfiles(page + 1, true);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "top", "right"]}
    >
      <ScreenHeader
        className="my-4 mx-5"
        onPressBack={() => router.back()}
        title={screenTitle}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <View className="px-5">
        <View className="flex-row items-center gap-1.5">
          <SearchBar
            className="flex-1"
            value={businessCandidateFilters.search || ""}
            onSearch={(value) =>
              setBusinessCandidateFilters({
                search: value.trim().length > 0 ? value : undefined,
              })
            }
          />

          <TouchableOpacity
            onPress={() => router.push("/screens/jobs/business/filter")}
          >
            <Ionicons
              name="options-outline"
              size={22}
              color="#fff"
              style={{
                backgroundColor: "#0C2433",
                padding: 10,
                borderRadius: 999,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={showInlineSkeleton ? skeletonItems : profiles}
        keyExtractor={(item) => String(item?.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? "#fff" : "#111"}
          />
        }
        renderItem={({ item }) => (
          <View className="px-5">
            {showInlineSkeleton ? (
              <AutoSkeletonView isLoading={true} defaultRadius={12}>
                <View pointerEvents="none">
                  <BusinessJobCard
                    className="mt-4"
                    status={profilesType === "featured" ? "featured" : undefined}
                    profile={item as any}
                  />
                </View>
              </AutoSkeletonView>
            ) : (
              <BusinessJobCard
                className="mt-4"
                status={profilesType === "featured" ? "featured" : undefined}
                profile={item}
              />
            )}
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <AutoSkeletonView isLoading={true} defaultRadius={12}>
              <View className="px-5 pb-5">
                {skeletonItems.map((item) => (
                  <View key={item.id}>
                    <BusinessJobCard
                      className="mt-4"
                      status={profilesType === "featured" ? "featured" : undefined}
                      profile={item as any}
                    />
                  </View>
                ))}
              </View>
            </AutoSkeletonView>
          ) : (
            <View className="flex-1 items-center justify-center px-5 py-10">
              <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                {t("user.jobs.allProfiles.noProfilesFound")}
              </Text>
              <Text className="mt-1 text-sm text-center font-proximanova-regular text-secondary dark:text-dark-secondary">
                {t("user.jobs.allProfiles.adjustFilters")}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color={isDark ? "#fff" : "#111"} />
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.35}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          { paddingBottom: 20 },
          profiles.length === 0 ? { flexGrow: 1, justifyContent: "center" } : null,
        ]}
      />
    </SafeAreaView>
  );
};

export default AllProfiles;

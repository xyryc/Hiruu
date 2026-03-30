import ScreenHeader from "@/components/header/ScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { useJobStore } from "@/stores/jobStore";
import type { RecruitmentFilterQuery, RecruitmentSortBy } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const firstParam = (value?: string | string[]) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const parseNumberParam = (value?: string | string[]) => {
  const normalized = firstParam(value);
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseStringParam = (value?: string | string[]) => {
  const normalized = firstParam(value);
  if (!normalized) return undefined;
  const trimmed = normalized.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseJobsTypeParam = (value?: string | string[]) => {
  const normalized = parseStringParam(value);
  if (normalized === "featured" || normalized === "suggested") {
    return normalized;
  }
  return undefined;
};

const AllJobs = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const getPublicRecruitments = useJobStore((s) => s.getPublicRecruitments);
  const allJobsFilters = useJobStore((s) => s.allJobsFilters);
  const setAllJobsFilters = useJobStore((s) => s.setAllJobsFilters);
  const clearAllJobsFilters = useJobStore((s) => s.clearAllJobsFilters);
  const params = useLocalSearchParams<{
    reset?: string;
    type?: string;
    search?: string;
    page?: string;
    limit?: string;
    shiftTypes?: string;
    experienceRequirements?: string;
    jobTypes?: string;
    maxSalary?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    maxDistanceKm?: string;
    sortBy?: RecruitmentSortBy;
  }>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = allJobsFilters.limit ?? 10;
  const jobsType = useMemo(() => parseJobsTypeParam(params.type), [params.type]);
  const screenTitle = jobsType === "featured"
    ? "Featured Jobs"
    : jobsType === "suggested"
      ? "Suggested Jobs"
      : "All Jobs";

  const normalizedSearch = useMemo(() => parseStringParam(params.search) || "", [params.search]);

  useEffect(() => {
    if (params.reset === "1") {
      setAllJobsFilters({
        page: 1,
        limit: 10,
        isFeatured:
          jobsType === "featured"
            ? true
            : jobsType === "suggested"
              ? false
              : undefined,
        search: undefined,
        shiftTypes: undefined,
        experienceRequirements: undefined,
        jobTypes: undefined,
        maxSalary: undefined,
        location: undefined,
        latitude: undefined,
        longitude: undefined,
        maxDistanceKm: undefined,
        sortBy: undefined,
      });
      return;
    }

    const routeFilters: Partial<RecruitmentFilterQuery> = {
      shiftTypes: parseStringParam(params.shiftTypes),
      experienceRequirements: parseStringParam(params.experienceRequirements),
      jobTypes: parseStringParam(params.jobTypes),
      maxSalary: parseNumberParam(params.maxSalary),
      location: parseStringParam(params.location),
      latitude: parseNumberParam(params.latitude),
      longitude: parseNumberParam(params.longitude),
      maxDistanceKm: parseNumberParam(params.maxDistanceKm),
      sortBy: parseStringParam(params.sortBy) as RecruitmentSortBy | undefined,
      isFeatured:
        jobsType === "featured"
          ? true
          : jobsType === "suggested"
            ? false
            : undefined,
      page: parseNumberParam(params.page),
      limit: parseNumberParam(params.limit),
      search: normalizedSearch || undefined,
    };

    const hasAnyRouteFilter = Object.values(routeFilters).some(
      (value) => typeof value !== "undefined"
    );

    if (hasAnyRouteFilter) {
      setAllJobsFilters(routeFilters);
    }
  }, [
    params.shiftTypes,
    params.experienceRequirements,
    params.jobTypes,
    params.maxSalary,
    params.location,
    params.latitude,
    params.longitude,
    params.maxDistanceKm,
    params.sortBy,
    jobsType,
    params.page,
    params.limit,
    params.reset,
    normalizedSearch,
    setAllJobsFilters,
  ]);

  const normalizedFilters = useMemo<RecruitmentFilterQuery>(() => {
    return {
      shiftTypes: allJobsFilters.shiftTypes,
      experienceRequirements: allJobsFilters.experienceRequirements,
      jobTypes: allJobsFilters.jobTypes,
      maxSalary: allJobsFilters.maxSalary,
      location: allJobsFilters.location,
      latitude: allJobsFilters.latitude,
      longitude: allJobsFilters.longitude,
      maxDistanceKm: allJobsFilters.maxDistanceKm,
      sortBy: allJobsFilters.sortBy,
      isFeatured: allJobsFilters.isFeatured,
    };
  }, [
    allJobsFilters.shiftTypes,
    allJobsFilters.experienceRequirements,
    allJobsFilters.jobTypes,
    allJobsFilters.maxSalary,
    allJobsFilters.location,
    allJobsFilters.latitude,
    allJobsFilters.longitude,
    allJobsFilters.maxDistanceKm,
    allJobsFilters.sortBy,
    allJobsFilters.isFeatured,
  ]);

  const loadJobs = useCallback(async (targetPage = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const result = await getPublicRecruitments({
        ...normalizedFilters,
        page: targetPage,
        limit,
        search: allJobsFilters.search?.trim() || undefined,
      });
      const fetched = Array.isArray(result?.data) ? result.data : [];
      const nextPage = Number(result?.pagination?.page || targetPage);
      const nextTotalPages = Number(result?.pagination?.totalPages || 1);

      setJobs((prev) => {
        if (!append) return fetched;
        const merged = [...prev, ...fetched];
        return Array.from(new Map(merged.map((item: any) => [item?.id, item])).values());
      });
      setPage(nextPage);
      setTotalPages(nextTotalPages);
      setAllJobsFilters({ page: nextPage, limit });
    } catch (error: any) {
      setJobs([]);
      toast.error(error?.message || "Failed to fetch exclusive jobs");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [allJobsFilters.search, getPublicRecruitments, limit, normalizedFilters, setAllJobsFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJobs(1, false);
    }, 350);
    return () => clearTimeout(timer);
  }, [loadJobs]);

  const canLoadMore = page < totalPages;

  const handleLoadMore = async () => {
    if (!canLoadMore || isLoadingMore || isLoading) return;
    await loadJobs(page + 1, true);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <ScreenHeader
        className="px-5 pt-2.5"
        onPressBack={() => router.back()}
        title={screenTitle}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />
      <View className="flex-row items-center gap-1.5 mt-3.5 px-5">
        <SearchBar
          className="flex-1"
          value={allJobsFilters.search || ""}
          onSearch={(value) =>
            setAllJobsFilters({
              search: value.trim().length > 0 ? value : undefined,
              page: 1,
            })
          }
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/screens/jobs/user/filter",
              params: {
                from: "all-jobs",
                page: String(page),
                limit: String(limit),
                shiftTypes: String(normalizedFilters.shiftTypes ?? ""),
                experienceRequirements: String(
                  normalizedFilters.experienceRequirements ?? ""
                ),
                jobTypes: String(normalizedFilters.jobTypes ?? ""),
                maxSalary: String(normalizedFilters.maxSalary ?? ""),
                location: String(normalizedFilters.location ?? ""),
                latitude: String(normalizedFilters.latitude ?? ""),
                longitude: String(normalizedFilters.longitude ?? ""),
                maxDistanceKm: String(normalizedFilters.maxDistanceKm ?? ""),
                sortBy: String(normalizedFilters.sortBy ?? ""),
                type: String(jobsType ?? ""),
                search: String(allJobsFilters.search ?? ""),
              },
            })
          }
        >
          <Ionicons
            name="filter-circle"
            size={44}
            color={isDark ? "#fff" : "black"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => (
          <View className="px-5">
            <JobCard
              job={item}
              className="bg-white border border-[#EEEEEE] mb-4"
            />
          </View>
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="px-5 pb-5">
              <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
            </View>
          ) : (
            <View className="px-5 pb-5 items-center justify-center">
              <View className="w-full max-w-[320px] bg-white border border-[#EEEEEE] rounded-2xl px-5 py-6 items-center">
                <Image
                  source={require("@/assets/images/reward/finder.svg")}
                  style={{ width: 140, height: 140 }}
                  contentFit="contain"
                />
                <Text className="mt-3 text-base text-center font-proximanova-semibold text-primary">
                  No jobs found
                </Text>
                <Text className="mt-1 text-sm text-center font-proximanova-regular text-secondary">
                  Try adjusting your search or clear filters.
                </Text>

                <TouchableOpacity
                  className="mt-4 px-4 py-2 rounded-lg border border-[#DDEEFF] bg-[#F5FAFF]"
                  onPress={() => {
                    clearAllJobsFilters();
                    setPage(1);
                    setTotalPages(1);
                  }}
                >
                  <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="mt-3"
                onPress={() => router.back()}
              >
                <Text className="text-xs font-proximanova-semibold text-[#6B7280]">
                  Go back
                </Text>
              </TouchableOpacity>
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
          jobs.length === 0 ? { flexGrow: 1, justifyContent: "center" } : null,
        ]}
      />
    </SafeAreaView>
  );
};

export default AllJobs;

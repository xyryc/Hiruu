import ScreenHeader from "@/components/header/ScreenHeader";
import JobRequestCard from "@/components/ui/cards/JobRequestCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
import { useJobStore } from "@/stores/jobStore";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

const JobRequest = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const getMyApplications = useJobStore((s) => s.getMyApplications);
  const respondToMyApplication = useJobStore(
    (s) => s.respondToMyApplication
  );
  const tabs = useMemo(
    () => [
      { key: "sent", label: t("user.jobs.jobRequests.tabs.sent") },
      { key: "received", label: t("user.jobs.jobRequests.tabs.received") },
    ],
    [t]
  );
  const [isActive, setIsActive] = useState<"sent" | "received">("sent");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    id: string;
    status: "approved" | "rejected";
  } | null>(null);
  const limit = 10;

  const { markAsRead } = useUnreadApplications({
    autoRefresh: false,
  });

  const loadApplications = useCallback(
    async (targetPage = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const result = await getMyApplications({
          page: targetPage,
          limit,
        });

        const fetched = Array.isArray(result?.data) ? result.data : [];
        const nextPage = Number(result?.pagination?.page || targetPage);
        const nextTotalPages = Number(result?.pagination?.totalPages || 1);

        setItems((prev) => {
          if (!append) return fetched;
          const merged = [...prev, ...fetched];
          return Array.from(new Map(merged.map((item: any) => [item?.id, item])).values());
        });
        setPage(nextPage);
        setTotalPages(nextTotalPages);
      } catch (error: any) {
        if (!append) setItems([]);
        toast.error(error?.message || t("user.jobs.jobRequests.failedToFetch"));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [getMyApplications, t]
  );

  useFocusEffect(
    useCallback(() => {
      loadApplications(1, false);

      // Mark all as read when user opens this screen (don't update UI)
      markAsRead().catch((err) => {
        console.error("Failed to mark as read:", err);
      });
    }, [loadApplications, markAsRead])
  );

  const sourceFiltered = useMemo(() => {
    return items.filter((item: any) =>
      isActive === "sent"
        ? item?.source === "user_applied"
        : item?.source === "business_invited"
    );
  }, [isActive, items]);

  const sentCount = useMemo(
    () => items.filter((item: any) => item?.source === "user_applied").length,
    [items]
  );

  const receivedCount = useMemo(
    () => items.filter((item: any) => item?.source === "business_invited").length,
    [items]
  );

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourceFiltered;

    return sourceFiltered.filter((item: any) => {
      const recruitment = item?.recruitment || {};
      const text = [
        recruitment?.title,
        recruitment?.description,
        recruitment?.business?.name,
      ]
        .filter((v) => typeof v === "string")
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [search, sourceFiltered]);

  const canLoadMore = page < totalPages;

  const handleLoadMore = async () => {
    if (!canLoadMore || isLoadingMore || isLoading) return;
    await loadApplications(page + 1, true);
  };

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await loadApplications(1, false);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadApplications]);

  const goToPrevPage = async () => {
    if (page <= 1 || isLoading || isLoadingMore) return;
    await loadApplications(page - 1, false);
  };

  const goToNextPage = async () => {
    if (page >= totalPages || isLoading || isLoadingMore) return;
    await loadApplications(page + 1, false);
  };

  const handleReceivedAction = useCallback(
    async (item: any, status: "approved" | "rejected") => {
      const applicationId = item?.id;

      if (!applicationId) {
        toast.error(t("user.jobs.jobRequests.applicationUnavailable"));
        return;
      }

      try {
        setActionLoading({ id: String(applicationId), status });
        await respondToMyApplication(
          String(applicationId),
          status === "approved" ? "approved" : "rejected"
        );

        setItems((prev) =>
          prev.map((current) =>
            current?.id === applicationId ? { ...current, status } : current
          )
        );
        toast.success(
          status === "approved"
            ? t("user.jobs.jobRequests.approved")
            : t("user.jobs.jobRequests.rejected")
        );
      } catch (error: any) {
        toast.error(error?.message || t("user.jobs.jobRequests.failedToUpdate"));
      } finally {
        setActionLoading(null);
      }
    },
    [respondToMyApplication, t]
  );

  const toNullableNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const mapToJobCard = (item: any) => {
    const recruitment = item?.recruitment || {};
    const business = recruitment?.business || {};
    const businessRole = item?.businessRole || {};
    const businessRoleBusiness = businessRole?.business || {};
    const businessRoleRole = businessRole?.role || {};
    const roleName =
      recruitment?.role?.role?.name || businessRoleRole?.name || "Role";
    const invitationSalaryMin =
      toNullableNumber(item?.minSalary) ?? toNullableNumber(recruitment?.salaryMin);
    const invitationSalaryMax =
      toNullableNumber(item?.maxSalary) ?? toNullableNumber(recruitment?.salaryMax);
    const resolvedBusiness = recruitment?.business || businessRoleBusiness || {};
    const resolvedBusinessId =
      resolvedBusiness?.id || businessRoleBusiness?.id || business?.id || "";

    return {
      applicationId: item?.id || null,
      id: recruitment?.id || item?.recruitmentId || item?.id,
      businessId: resolvedBusinessId,
      roleId: recruitment?.roleId || businessRole?.id || item?.roleId,
      name: roleName,
      description: recruitment?.description,
      isFeatured: Boolean(recruitment?.isFeatured),
      isActive: recruitment?.isActive,
      shareCount:
        typeof recruitment?.shareCount === "number" ? recruitment.shareCount : 0,
      salaryMin: toNullableNumber(recruitment?.salaryMin) ?? 0,
      salaryMax: toNullableNumber(recruitment?.salaryMax) ?? 0,
      salaryType: recruitment?.salaryType || "monthly",
      distanceKm:
        toNullableNumber(item?.distanceKm) ??
        toNullableNumber(recruitment?.distanceKm) ??
        undefined,
      shiftType: recruitment?.shiftType || "",
      jobType: recruitment?.jobType || "",
      business: {
        id: resolvedBusinessId,
        name:
          typeof resolvedBusiness?.name === "string" ? resolvedBusiness.name : "",
        logo: resolvedBusiness?.logo,
        rating:
          typeof resolvedBusiness?.rating === "number"
            ? resolvedBusiness.rating
            : undefined,
        isVerified:
          typeof resolvedBusiness?.isVerified === "boolean"
            ? resolvedBusiness.isVerified
            : undefined,
        address:
          resolvedBusiness?.address?.address ||
          resolvedBusiness?.address?.city ||
          resolvedBusiness?.address?.area ||
          undefined,
      },
      _count: {
        recruitmentApplications:
          typeof recruitment?._count?.recruitmentApplications === "number"
            ? recruitment._count.recruitmentApplications
            : 0,
      },
      userId: item?.userId || null,
      invitedById: item?.invitedById || null,
      applicationStatus: String(item?.status || "pending").toLowerCase(),
      applicationSource: item?.source || "",
      invitationRoleName: recruitment?.role?.role?.name || roleName,
      invitationSalaryMin,
      invitationSalaryMax,
      invitationSalaryType: recruitment?.salaryType || "monthly",
      recruitment: item?.recruitment || null,
      businessRole: item?.businessRole || null,
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background" edges={["left", "right", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor="#E5F4FD" translucent={false} />

      {/* Header */}
      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          onPressBack={() => router.back()}
          className="px-5 pt-2.5 pb-4"
          title={t("user.jobs.jobRequests.title")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        <View className="flex-row justify-center mx-5">
          {tabs.map((tab) => {
            const totalCount = tab.key === "sent" ? sentCount : receivedCount;

            return (
              <TouchableOpacity
                key={tab.key}
                className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${isActive === tab.key && "border-[#11293A] border-b-2"}`}
                onPress={() => setIsActive(tab.key as "sent" | "received")}
              >
                <Text
                  className={`text-center ${isActive === tab.key ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"} `}
                >
                  {tab.label}
                </Text>

                <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
                  <Text className="font-proximanova-semibold text-sm text-white">
                    {totalCount}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="flex-1 bg-white">
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => String(item?.id)}
          renderItem={({ item }) => (
            <View className="px-5">
              <JobRequestCard
                className="bg-white border border-[#EEEEEE] mb-4"
                status={isActive === "sent" ? "send request" : "received"}
                job={mapToJobCard(item)}
                onApprove={
                  isActive === "received"
                    ? () => handleReceivedAction(item, "approved")
                    : undefined
                }
                onReject={
                  isActive === "received"
                    ? () => handleReceivedAction(item, "rejected")
                    : undefined
                }
                actionLoading={
                  actionLoading?.id === String(item?.id)
                    ? actionLoading.status
                    : null
                }
              />
            </View>
          )}
          ListHeaderComponent={
            <View className="px-5 pt-5 pb-4 bg-white">
              <SearchBar className="w-full" value={search} onSearch={setSearch} />
            </View>
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="px-5 pb-5">
                <AutoSkeletonView isLoading={true} defaultRadius={12}>
                  {Array.from({ length: 3 }, (_, index) => (
                    <View
                      key={`job-request-skeleton-${index}`}
                      className="bg-white border border-[#EEEEEE] rounded-xl mb-4 p-4"
                    >
                      <View className="flex-row items-start">
                        <View
                          className="h-12 w-12 bg-[#E5E7EB]"
                          style={{ borderRadius: 999, overflow: "hidden" }}
                        />
                        <View className="flex-1 ml-3">
                          <View className="h-4 w-40 rounded-md bg-[#E5E7EB]" />
                          <View className="h-3 w-28 rounded-md bg-[#E5E7EB] mt-2" />
                        </View>
                        <View className="h-6 w-16 rounded-full bg-[#E5E7EB]" />
                      </View>

                      <View className="h-3 w-full rounded-md bg-[#E5E7EB] mt-4" />
                      <View className="h-3 w-10/12 rounded-md bg-[#E5E7EB] mt-2" />

                      <View className="flex-row gap-3 mt-4">
                        <View className="h-9 flex-1 rounded-lg bg-[#E5E7EB]" />
                        <View className="h-9 flex-1 rounded-lg bg-[#E5E7EB]" />
                      </View>
                    </View>
                  ))}
                </AutoSkeletonView>
              </View>
            ) : (
              <View className="px-5 pb-5">
                <StatusStateCard
                  style={styles.compactEmptyState}
                  image={require("@/assets/images/toolbox.svg")}
                  title={t("user.jobs.jobRequests.emptyTitle")}
                  text={t("user.jobs.jobRequests.emptyText")}
                  titleStyle={styles.compactEmptyStateTitle}
                  textStyle={styles.compactEmptyStateText}
                />
              </View>
            )
          }
          ListFooterComponent={
            <View className="pb-5">
              {isLoadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={isDark ? "#fff" : "#111"} />
                </View>
              ) : null}

              {totalPages > 1 ? (
                <View className="px-5 pt-2 flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={goToPrevPage}
                    disabled={page <= 1 || isLoading || isLoadingMore}
                    className={`px-4 py-2 rounded-lg border ${page <= 1 || isLoading || isLoadingMore
                      ? "border-[#E5E7EB] bg-[#F9FAFB]"
                      : "border-[#D1D5DB] bg-white"
                      }`}
                  >
                    <Text
                      className={`text-sm font-proximanova-semibold ${page <= 1 || isLoading || isLoadingMore
                        ? "text-[#9CA3AF]"
                        : "text-primary"
                        }`}
                    >
                      {t("user.jobs.jobRequests.previous")}
                    </Text>
                  </TouchableOpacity>

                  <Text className="text-sm font-proximanova-semibold text-secondary">
                    {t("user.jobs.jobRequests.page", { page, totalPages })}
                  </Text>

                  <TouchableOpacity
                    onPress={goToNextPage}
                    disabled={page >= totalPages || isLoading || isLoadingMore}
                    className={`px-4 py-2 rounded-lg border ${page >= totalPages || isLoading || isLoadingMore
                      ? "border-[#E5E7EB] bg-[#F9FAFB]"
                      : "border-[#D1D5DB] bg-white"
                      }`}
                  >
                    <Text
                      className={`text-sm font-proximanova-semibold ${page >= totalPages || isLoading || isLoadingMore
                        ? "text-[#9CA3AF]"
                        : "text-primary"
                        }`}
                    >
                      {t("user.jobs.jobRequests.next")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          showsVerticalScrollIndicator={false}
          className="bg-white"
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
};

export default JobRequest;

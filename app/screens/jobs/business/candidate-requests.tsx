import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessJobCard from "@/components/ui/cards/BusinessJobCard";
import NoJobsAvailableCard from "@/components/ui/cards/NoJobsAvailableCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const CandidateRequests = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const getBusinessApplications = useJobStore((s) => s.getBusinessApplications);
  const getUnreadCount = useJobStore((s) => s.getUnreadCount);
  const updateBusinessApplicationStatus = useJobStore(
    (s) => s.updateBusinessApplicationStatus
  );
  const { selectedBusinesses } = useBusinessStore();
  const tabs = ["Send Request", "Received"];
  const [isActive, setIsActive] = useState("Send Request");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [unreadSent, setUnreadSent] = useState(0);
  const [unreadReceived, setUnreadReceived] = useState(0);
  const [actionLoading, setActionLoading] = useState<{
    applicationId: string;
    status: "approved" | "rejected";
  } | null>(null);
  const limit = 10;

  const currentBusinessId = selectedBusinesses?.[0] || null;

  const { markAsRead } = useUnreadApplications({
    autoRefresh: false,
    scope: "business",
    businessId: currentBusinessId || undefined,
  });

  const loadApplications = useCallback(
    async (targetPage = 1, append = false) => {
      if (!currentBusinessId) {
        setItems([]);
        return;
      }

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        const result = await getBusinessApplications(currentBusinessId, {
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
        console.error("[CandidateRequests] Failed to load applications:", error);
        if (!append) setItems([]);
        toast.error(error?.message || "Failed to fetch candidate requests");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [getBusinessApplications, currentBusinessId]
  );

  const loadUnreadCounts = useCallback(async () => {
    if (!currentBusinessId) return;

    try {
      const result = await getUnreadCount({
        scope: "business",
        businessId: currentBusinessId,
      });
      setUnreadSent(result.business_invited ?? 0);
      setUnreadReceived(result.user_applied ?? 0);
    } catch (err) {
      console.error("[CandidateRequests] Failed to fetch unread counts:", err);
      setUnreadSent(0);
      setUnreadReceived(0);
    }
  }, [getUnreadCount, currentBusinessId]);

  useFocusEffect(
    useCallback(() => {
      if (!currentBusinessId) {
        return;
      }

      loadApplications(1, false);
      loadUnreadCounts();

      // Mark all as read when business opens this screen
      markAsRead().catch((err) => {
        console.error("[CandidateRequests] Failed to mark as read:", err);
      });
    }, [loadApplications, loadUnreadCounts, markAsRead, currentBusinessId])
  );

  const sourceFiltered = useMemo(() => {
    return items.filter((item: any) =>
      isActive === "Send Request"
        ? item?.source === "business_invited"
        : item?.source === "user_applied"
    );
  }, [isActive, items]);

  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sourceFiltered;

    return sourceFiltered.filter((item: any) => {
      const user = item?.user || {};
      const jobProfile = item?.jobProfile || {};
      const text = [
        user?.name,
        jobProfile?.headline,
        jobProfile?.about,
        ...(Array.isArray(jobProfile?.skills) ? jobProfile.skills : []),
      ]
        .filter((v) => typeof v === "string")
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [search, sourceFiltered]);

  const canLoadMore = page < totalPages;

  const handleApplicationAction = useCallback(
    async (applicationId: string, status: "approved" | "rejected") => {
      if (!currentBusinessId) {
        toast.error("Business information is unavailable");
        return;
      }

      try {
        setActionLoading({ applicationId, status });
        await updateBusinessApplicationStatus(currentBusinessId, applicationId, status);
        setItems((prev) =>
          prev.map((item) =>
            item?.id === applicationId ? { ...item, status } : item
          )
        );
        toast.success(
          status === "approved"
            ? "Candidate request approved"
            : "Candidate request rejected"
        );
      } catch (error: any) {
        toast.error(error?.message || "Failed to update candidate request");
      } finally {
        setActionLoading(null);
      }
    },
    [currentBusinessId, updateBusinessApplicationStatus]
  );

  const handleLoadMore = async () => {
    if (!canLoadMore || isLoadingMore || isLoading) return;
    await loadApplications(page + 1, true);
  };

  const goToPrevPage = async () => {
    if (page <= 1 || isLoading || isLoadingMore) return;
    await loadApplications(page - 1, false);
  };

  const goToNextPage = async () => {
    if (page >= totalPages || isLoading || isLoadingMore) return;
    await loadApplications(page + 1, false);
  };

  const mapToProfile = (item: any) => {
    const user = item?.user || {};
    const jobProfile = user?.jobProfile || {};
    const recruitment = item?.recruitment || {};

    // Handle address - prefer from user object in the application response
    const userAddress = user?.address;

    return {
      id: jobProfile?.id || item?.id,
      userId: user?.id,
      headline: recruitment?.role?.role?.name || jobProfile?.headline || "Position",
      about: jobProfile?.about,
      isPremium: jobProfile?.isPremium || false,
      // Use recruitment salary if available, otherwise fallback to job profile
      expectedSalaryMin: recruitment?.salaryMin || jobProfile?.expectedSalaryMin,
      expectedSalaryMax: recruitment?.salaryMax || jobProfile?.expectedSalaryMax,
      preferredSalaryType: recruitment?.salaryType || jobProfile?.preferredSalaryType,
      distanceKm: jobProfile?.distanceKm,
      skills: jobProfile?.skills || [],
      isOpenToWork: jobProfile?.isOpenToWork,
      user: {
        id: user?.id,
        name: user?.name,
        avatar: user?.avatar,
        isOnline: user?.isOnline || false,
        bio: user?.bio,
        address: userAddress, // Now properly passed from recruitment application
        employments: user?.employments || [],
        jobProfile: jobProfile,
      },
      applicationId: item?.id,
      applicationStatus: item?.status,
      applicationSource: item?.source,
      recruitmentId: recruitment?.id,
    };
  };

  if (!currentBusinessId) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-dark-background" edges={["left", "right", "bottom"]}>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor="#E5F4FD" translucent={false} />

        <View
          className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
          style={{ paddingTop: insets.top }}
        >
          <ScreenHeader
            onPressBack={() => router.back()}
            className="px-5 pt-2.5 pb-4"
            title="Candidate Requests"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111111"}
          />
        </View>

        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-secondary font-proximanova-regular">
            Please select a business to view candidate requests
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          title="Candidate Requests"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        {/* tabs */}
        <View className="flex-row justify-center mx-5">
          {tabs.map((tab, index) => {
            const totalCount = tab === "Send Request" ? unreadSent : unreadReceived;

            return (
              <TouchableOpacity
                key={index}
                className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${isActive === tab && "border-[#11293A] border-b-2"}`}
                onPress={() => setIsActive(tab)}
              >
                <Text
                  className={`text-center ${isActive === tab ? "font-proximanova-semibold text-base text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"} `}
                >
                  <Text className="capitalize">{tab}</Text>
                </Text>

                {totalCount > 0 && (
                  <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
                    <Text className="font-proximanova-semibold text-sm text-white">
                      {totalCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* content */}
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => String(item?.id)}
        renderItem={({ item }) => (
          <View className="px-5">
            <BusinessJobCard
              candidate={isActive === "Send Request"}
              received={isActive === "Received"}
              disableModalOpen={isActive === "Received"}
              className="mt-4"
              profile={mapToProfile(item)}
              onAccept={
                isActive === "Received"
                  ? () => handleApplicationAction(String(item?.id), "approved")
                  : undefined
              }
              onReject={
                isActive === "Received"
                  ? () => handleApplicationAction(String(item?.id), "rejected")
                  : undefined
              }
              actionLoading={
                actionLoading?.applicationId === String(item?.id)
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
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
            </View>
          ) : (
            <View className="px-5 pb-5">
              <NoJobsAvailableCard
                title={isActive === "Send Request" ? "No Invitations Sent" : "No Applications Received"}
                description={
                  isActive === "Send Request"
                    ? "You haven't sent any job invitations yet. Browse available candidates and send invitations to potential employees."
                    : "No candidates have applied to your job postings yet. Make sure your job posts are active and visible to attract applicants."
                }
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
                    Previous
                  </Text>
                </TouchableOpacity>

                <Text className="text-sm font-proximanova-semibold text-secondary">
                  Page {page} / {totalPages}
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
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        className="bg-white"
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
};

export default CandidateRequests;

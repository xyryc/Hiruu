import ScreenHeader from "@/components/header/ScreenHeader";
import JobRequestCard from "@/components/ui/cards/JobRequestCard";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { useUnreadApplications } from "@/hooks/useUnreadApplications";
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

const JobRequest = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const getMyApplications = useJobStore((s) => s.getMyApplications);
  const tabs = ["send request", "received"];
  const [isActive, setIsActive] = useState("send request");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
        toast.error(error?.message || "Failed to fetch job requests");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [getMyApplications]
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
      isActive === "send request"
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

  const goToPrevPage = async () => {
    if (page <= 1 || isLoading || isLoadingMore) return;
    await loadApplications(page - 1, false);
  };

  const goToNextPage = async () => {
    if (page >= totalPages || isLoading || isLoadingMore) return;
    await loadApplications(page + 1, false);
  };

  const mapToJobCard = (item: any) => {
    const recruitment = item?.recruitment || {};
    const business = recruitment?.business || {};
    const roleName = recruitment?.role?.role?.name || "Role";

    return {
      id: recruitment?.id || item?.recruitmentId || item?.id,
      businessId: business?.id,
      roleId: recruitment?.roleId,
      name: roleName,
      description: recruitment?.description,
      isFeatured: Boolean(recruitment?.isFeatured),
      isActive: recruitment?.isActive,
      shareCount:
        typeof recruitment?.shareCount === "number" ? recruitment.shareCount : 0,
      salaryMin:
        typeof recruitment?.salaryMin === "number" ? recruitment.salaryMin : 0,
      salaryMax:
        typeof recruitment?.salaryMax === "number" ? recruitment.salaryMax : 0,
      salaryType: recruitment?.salaryType || "monthly",
      distanceKm:
        typeof recruitment?.distanceKm === "number" ? recruitment.distanceKm : undefined,
      shiftType: recruitment?.shiftType || "",
      jobType: recruitment?.jobType || "",
      business: {
        id: business?.id || "",
        name: business?.name || "-",
        logo: business?.logo,
        address:
          business?.address?.address ||
          business?.address?.city ||
          business?.address?.area ||
          "Unknown Location",
      },
      _count: {
        recruitmentApplications:
          typeof recruitment?._count?.recruitmentApplications === "number"
            ? recruitment._count.recruitmentApplications
            : 0,
      },
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
          title="Job Request"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        <View className="flex-row justify-center mx-5">
          {tabs.map((tab, index) => {
            const totalCount = tab === "send request" ? sentCount : receivedCount;

            return (
              <TouchableOpacity
                key={index}
                className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${isActive === tab && "border-[#11293A] border-b-2"}`}
                onPress={() => setIsActive(tab)}
              >
                <Text
                  className={`text-center capitalize ${isActive === tab ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"} `}
                >
                  {tab}
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
                status={isActive as "send request" | "received"}
                job={mapToJobCard(item)}
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
              <View className="px-5 pb-5 items-center">
                <Text className="text-sm font-proximanova-regular text-secondary">
                  No job requests found.
                </Text>
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
      </View>
    </SafeAreaView>
  );
};

export default JobRequest;

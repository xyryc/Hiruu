import ScreenHeader from "@/components/header/ScreenHeader";
import SwapRequestCard from "@/components/ui/cards/SwapRequestCard";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useShiftStore } from "@/stores/shiftStore";
import { EvilIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SwapRequestCardSkeleton = ({ showActions }: { showActions?: boolean }) => {
  return (
    <View className="mx-5 border border-[#EEEEEE] mb-3 rounded-2xl p-4 bg-white dark:bg-dark-background">
      <View className="h-5 w-40 bg-[#E5E7EB] rounded-md mb-4" />

      <View className="gap-2.5">
        <View className="flex-row justify-between">
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-32 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>
      </View>

      <View className="my-[10px] h-px w-full bg-[#E5E7EB] rounded-full" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-4 items-center">
          <View className="h-[30px] w-[30px] rounded-full bg-[#E5E7EB]" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>

        {showActions ? (
          <View className="flex-row gap-2">
            <View className="h-8 w-20 bg-[#E5E7EB] rounded-3xl" />
            <View className="h-8 w-20 bg-[#E5E7EB] rounded-3xl" />
          </View>
        ) : (
          <View className="h-6 w-20 bg-[#E5E7EB] rounded-full" />
        )}
      </View>
    </View>
  );
};

const SwapRequestAction = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const TAB_SEND = "Send Request";
  const TAB_RECEIVED = "Received";
  const [selectedTab, setSelectedTab] = useState(TAB_SEND);
  const [filter, setFilter] = useState<string>("all");
  const filterOptions = ["all", "pending", "approved", "rejected", "cancelled", "expired"];
  const [searchQuery, setSearchQuery] = useState("");
  const [sendRequests, setSendRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const getShiftRequests = useShiftStore((state) => state.getShiftRequests);
  const getPendingSwapRequests = useShiftStore((state) => state.getPendingSwapRequests);
  const approveBusinessShiftRequest = useShiftStore(
    (state) => state.approveBusinessShiftRequest
  );
  const rejectBusinessShiftRequest = useShiftStore(
    (state) => state.rejectBusinessShiftRequest
  );
  const shiftRequestsLoading = useShiftStore((state) => state.shiftRequestsLoading);

  const loadSendRequests = useCallback(async () => {
    try {
      const response = await getShiftRequests({
        type: "shift_swap",
        page: 1,
        limit: 50,
        status: filter === "all" ? undefined : filter,
        search: searchQuery.trim() || undefined,
      });
      setSendRequests(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.swapRequest.failedToLoadSent"));
      setSendRequests([]);
    }
  }, [filter, getShiftRequests, searchQuery, t]);

  const loadPendingSwaps = useCallback(async () => {
    try {
      setReceivedLoading(true);
      const response = await getPendingSwapRequests({
        page: 1,
        limit: 50,
        search: searchQuery.trim() || undefined,
      });
      setReceivedRequests(Array.isArray(response) ? response : []);
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.swapRequest.failedToLoadReceived"));
      setReceivedRequests([]);
    } finally {
      setReceivedLoading(false);
    }
  }, [getPendingSwapRequests, searchQuery, t]);

  useFocusEffect(
    useCallback(() => {
      if (selectedTab === TAB_SEND) {
        loadSendRequests();
      } else {
        loadPendingSwaps();
      }
    }, [TAB_SEND, loadPendingSwaps, loadSendRequests, selectedTab])
  );

  const handlePendingSwapAction = useCallback(
    async (item: any, type: "approve" | "reject") => {
      const requestId = String(item?.id || "");
      const businessId = String(item?.businessId || item?.business?.id || "");
      if (!requestId || !businessId) {
        toast.error(t("user.profile.swapRequest.unableToProcess"));
        return;
      }

      try {
        setActioningId(requestId);
        setActionType(type);

        if (type === "approve") {
          await approveBusinessShiftRequest(businessId, requestId);
          toast.success(t("user.profile.swapRequest.accepted"));
        } else {
          await rejectBusinessShiftRequest(businessId, requestId);
          toast.success(t("user.profile.swapRequest.rejected"));
        }

        setReceivedRequests((prev) => prev.filter((entry) => entry?.id !== requestId));
      } catch (error: any) {
        toast.error(error?.message || t("user.profile.swapRequest.failedToUpdate"));
      } finally {
        setActioningId(null);
        setActionType(null);
      }
    },
    [approveBusinessShiftRequest, rejectBusinessShiftRequest, t]
  );

  const sendCount = sendRequests.length;
  const receivedCount = receivedRequests.length;
  const activeList = selectedTab === TAB_SEND ? sendRequests : receivedRequests;
  const isLoading = (shiftRequestsLoading && selectedTab === TAB_SEND) || (receivedLoading && selectedTab === TAB_RECEIVED);

  const filterLabels = useMemo(
    () => ({
      all: t("common.all"),
      approved: t("user.profile.leaveHistory.categories.approved"),
      pending: t("user.profile.leaveHistory.categories.pending"),
      rejected: t("user.profile.leaveHistory.categories.rejected"),
      cancelled: t("user.profile.leaveHistory.categories.cancelled"),
      expired: t("user.profile.leaveHistory.categories.expired"),
    }),
    [t]
  );

  const skeletonItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: `swap-skeleton-${index}` })),
    []
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="#E5F4FD"
        translucent={false}
      />

      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
          onPressBack={() => router.back()}
          title={t("user.profile.swapRequest.screenTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        <View className="flex-row justify-center mx-5">
          {[TAB_SEND, TAB_RECEIVED].map((tab) => {
            const totalCount = tab === TAB_SEND ? sendCount : receivedCount;
            const label =
              tab === TAB_SEND
                ? t("user.profile.swapRequest.tabs.sent")
                : t("user.profile.swapRequest.tabs.received");
            return (
              <TouchableOpacity
                className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${selectedTab === tab ? "border-[#11293A] border-b-2" : ""}`}
                key={tab}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  className={`text-center ${selectedTab === tab ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"}`}
                >
                  {label}
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

      <View className="flex-1 bg-white dark:bg-dark-background">
        <View className="flex-row items-center border border-b mt-5 rounded-xl pl-3 p-1 border-[#EEEEEE] mx-5">
          <EvilIcons name="search" size={24} color="black" />
          <TextInput
            placeholder={t("common.searchHere")}
            className="flex-1 text-gray-600 p-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {selectedTab === TAB_SEND && (
          <View>
            <FlatList
              data={filterOptions}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                marginVertical: 15,
                gap: 8
              }}
              renderItem={({ item }) => {
                const status = item.toLowerCase();
                const label =
                  filterLabels[status as keyof typeof filterLabels] || item;
                return (
                  <TouchableOpacity
                    onPress={() => setFilter(status)}
                    className={`py-2 px-4 border-1 border-[#EEEEEE] rounded-full ${filter === status ? " bg-[#11293A]" : "border border-gray-200"} `}
                  >
                    <Text
                      className={`text-center text-sm font-proximanova-semibold ${filter === status ? "text-white dark:text-dark-primary" : "dark:text-dark-primary text-primary"}`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {isLoading && activeList.length === 0 ? (
          <FlatList
            data={skeletonItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: selectedTab === TAB_RECEIVED ? 12 : 0 }}
            renderItem={() => (
              <View pointerEvents="none">
                <SwapRequestCardSkeleton showActions={selectedTab === TAB_RECEIVED} />
              </View>
            )}
          />
        ) : (
          <FlatList
            data={activeList}
            renderItem={({ item }) => (
              <SwapRequestCard
                item={item}
                showActions={selectedTab === TAB_RECEIVED}
                onAccept={
                  selectedTab === TAB_RECEIVED
                    ? () => handlePendingSwapAction(item, "approve")
                    : undefined
                }
                onReject={
                  selectedTab === TAB_RECEIVED
                    ? () => handlePendingSwapAction(item, "reject")
                    : undefined
                }
                actionLoading={
                  selectedTab === TAB_RECEIVED && actioningId === item?.id
                    ? actionType
                    : null
                }
              />
            )}
            keyExtractor={(item, index) => item?.id || `swap-${index}`}
            contentContainerStyle={{ paddingBottom: 20 }}
            className={`${selectedTab === TAB_RECEIVED && "mt-3"}`}
            ListEmptyComponent={
              <View className="px-5 pt-6">
                <StatusStateCard
                  image={require("@/assets/images/leave-pending.svg")}
                  title={
                    selectedTab === TAB_SEND
                      ? t("user.profile.swapRequest.empty.sentTitle")
                      : t("user.profile.swapRequest.empty.receivedTitle")
                  }
                  text={
                    selectedTab === TAB_SEND
                      ? t("user.profile.swapRequest.empty.sentText")
                      : t("user.profile.swapRequest.empty.receivedText")
                  }
                />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default SwapRequestAction;

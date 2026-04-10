import ScreenHeader from "@/components/header/ScreenHeader";
import SwapRequestCard from "@/components/ui/cards/SwapRequestCard";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useShiftStore } from "@/stores/shiftStore";
import { EvilIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SwapRequestAction = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState("Send Request");
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
      toast.error(error?.message || "Failed to load swap requests");
      setSendRequests([]);
    }
  }, [filter, getShiftRequests, searchQuery]);

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
      toast.error(error?.message || "Failed to load pending swaps");
      setReceivedRequests([]);
    } finally {
      setReceivedLoading(false);
    }
  }, [getPendingSwapRequests, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (selectedTab === "Send Request") {
        loadSendRequests();
      } else {
        loadPendingSwaps();
      }
    }, [loadPendingSwaps, loadSendRequests, selectedTab])
  );

  const handlePendingSwapAction = useCallback(
    async (item: any, type: "approve" | "reject") => {
      const requestId = String(item?.id || "");
      const businessId = String(item?.businessId || item?.business?.id || "");
      if (!requestId || !businessId) {
        toast.error("Unable to process this swap request");
        return;
      }

      try {
        setActioningId(requestId);
        setActionType(type);

        if (type === "approve") {
          await approveBusinessShiftRequest(businessId, requestId);
          toast.success("Swap request accepted");
        } else {
          await rejectBusinessShiftRequest(businessId, requestId);
          toast.success("Swap request rejected");
        }

        setReceivedRequests((prev) => prev.filter((entry) => entry?.id !== requestId));
      } catch (error: any) {
        toast.error(error?.message || "Failed to update swap request");
      } finally {
        setActioningId(null);
        setActionType(null);
      }
    },
    [approveBusinessShiftRequest, rejectBusinessShiftRequest]
  );

  const sendCount = sendRequests.length;
  const receivedCount = receivedRequests.length;

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
          title="Swap Requests"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        <View className="flex-row justify-center mx-5">
          {["Send Request", "Received"].map((tab) => {
            const totalCount = tab === "Send Request" ? sendCount : receivedCount;
            return (
              <TouchableOpacity
                className={`w-1/2 flex-row items-center justify-center gap-2 border-b pb-3 ${selectedTab === tab ? "border-[#11293A] border-b-2" : ""}`}
                key={tab}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  className={`text-center ${selectedTab === tab ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"}`}
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

      <View className="flex-1 bg-white dark:bg-dark-background">
        <View className="flex-row items-center border border-b mt-5 rounded-xl pl-3 p-1 border-[#EEEEEE] mx-5">
          <EvilIcons name="search" size={24} color="black" />
          <TextInput
            placeholder="Search here..."
            className="flex-1 text-gray-600 p-2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {selectedTab === "Send Request" && (
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setFilter(item.toLowerCase())}
                  className={`py-2 px-4 border-1 border-[#EEEEEE] rounded-full ${filter === item.toLowerCase() ? " bg-[#11293A]" : "border border-gray-200"} `}
                >
                  <Text
                    className={`text-center capitalize text-sm font-proximanova-semibold ${filter === item.toLowerCase() ? "text-white dark:text-dark-primary" : "dark:text-dark-primary text-primary"}`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {(shiftRequestsLoading && selectedTab === "Send Request") ||
        (receivedLoading && selectedTab === "Received") ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
          </View>
        ) : (
          <FlatList
            data={selectedTab === "Send Request" ? sendRequests : receivedRequests}
            renderItem={({ item }) => (
              <SwapRequestCard
                item={item}
                showActions={selectedTab === "Received"}
                onAccept={
                  selectedTab === "Received"
                    ? () => handlePendingSwapAction(item, "approve")
                    : undefined
                }
                onReject={
                  selectedTab === "Received"
                    ? () => handlePendingSwapAction(item, "reject")
                    : undefined
                }
                actionLoading={
                  selectedTab === "Received" && actioningId === item?.id
                    ? actionType
                    : null
                }
              />
            )}
            keyExtractor={(item, index) => item?.id || `swap-${index}`}
            contentContainerStyle={{ paddingBottom: 20 }}
            className={`${selectedTab === "Received" && "mt-3"}`}
            ListEmptyComponent={
              <View className="px-5 pt-6">
                <StatusStateCard
                  image={require("@/assets/images/leave-pending.svg")}
                  title={selectedTab === "Send Request" ? "No Swap Requests" : "No Received Requests"}
                  text={
                    selectedTab === "Send Request"
                      ? "There are no swap requests to show right now."
                      : "No received swap request available yet."
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

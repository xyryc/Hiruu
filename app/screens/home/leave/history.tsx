import ScreenHeader from "@/components/header/ScreenHeader";
import SickLeaveCard from "@/components/ui/cards/SickLeaveCard";
import UserCalendarScheduleModal from "@/components/ui/modals/UserCalendarScheduleModal";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export type LeaveItem = {
  id: string;
  img?: string;
  userId?: string;
  name: string;
  status: "approved" | "pending" | "rejected" | "cancelled" | "expired";
  date: string;
  coses: string;
  details: string;
  category?: string;
  duration?: string;
};

const CATEGORIES = [
  "all",
  "approved",
  "pending",
  "rejected",
  "cancelled",
  "expired",
] as const;
const DEFAULT_START_DATE = "2026-03-13";

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

const LeaveHistory = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("all");
  const [onCalendar, setOnCalendar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const shiftRequests = useShiftStore((state) => state.shiftRequests);
  const shiftRequestsLoading = useShiftStore((state) => state.shiftRequestsLoading);
  const getShiftRequests = useShiftStore((state) => state.getShiftRequests);

  const fetchLeaveHistory = useCallback(async () => {
    try {
      await getShiftRequests({ startDate: DEFAULT_START_DATE, type: "leave_request" });
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "Failed to fetch shift requests")
      );
    }
  }, [getShiftRequests]);

  useFocusEffect(
    useCallback(() => {
      fetchLeaveHistory();
    }, [fetchLeaveHistory])
  );

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchLeaveHistory();
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "Failed to fetch shift requests")
      );
    } finally {
      setRefreshing(false);
    }
  };

  const leaveItems = useMemo<LeaveItem[]>(() => {
    const toDisplayDate = (start?: string, end?: string) => {
      if (!start) return "N/A";
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : null;
      const startLabel = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      if (!endDate || endDate.toDateString() === startDate.toDateString()) {
        return startLabel;
      }

      const endLabel = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return `${startLabel} - ${endLabel}`;
    };

    const toLeaveTypeTitle = (leaveType?: string) => {
      if (!leaveType) return "Leave";
      return leaveType
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (Array.isArray(shiftRequests) ? shiftRequests : [])
      .filter((item: any) => item?.type === "leave_request")
      .map((item: any) => {
        const apiStatus = String(item?.status || "pending").toLowerCase();
        const status = ([
          "pending",
          "approved",
          "rejected",
          "cancelled",
          "expired",
        ].includes(apiStatus)
          ? apiStatus
          : "pending") as LeaveItem["status"];

        return {
          id: item?.id || Math.random().toString(),
          img:
            item?.business?.logo ||
            require("@/assets/images/location.png"),
          userId:
            item?.business?.ownerId ||
            item?.business?.owner?.id ||
            item?.employment?.addedByEmploymentId ||
            item?.employment?.user?.id ||
            undefined,
          name: item?.business?.name || "Business",
          status,
          date: toDisplayDate(item?.startDate, item?.endDate),
          coses: toLeaveTypeTitle(item?.leaveType),
          details: item?.reason || "-",
          duration: item?.isHalfDay ? "Half Day" : undefined,
        };
      });
  }, [shiftRequests]);

  const filteredData =
    selectedCategory === "all"
      ? leaveItems
      : leaveItems.filter((item) => item.status === selectedCategory);

  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] =
        cat === "all"
          ? leaveItems.length
          : leaveItems.filter((item) => item.status === cat).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <ScreenHeader
        className="mx-5 pt-4"
        onPressBack={() => router.back()}
        title="Leave"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setOnCalendar(true)}
              className="bg-[#F5F5F5] rounded-full p-2"
            >
              <Ionicons name="calendar-outline" size={22} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/screens/schedule/shift/request-leave")}
              className="bg-[#F5F5F5] rounded-full p-2"
            >
              <Image
                source={require("@/assets/images/card-send.svg")}
                style={{
                  width: 24,
                  height: 24,
                }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        }
      />

      <View className="flex-row items-center mt-4 mx-5">
        <Text className="text-xl font-proximanova-bold text-primary dark:text-dark-primary">
          Leave History
        </Text>
      </View>

      <View>
        <FlatList
          data={CATEGORIES as unknown as string[]}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => {
            const selected = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() =>
                  setSelectedCategory(item as (typeof CATEGORIES)[number])
                }
              >
                <View
                  className={`px-4 py-2 border rounded-[30px] mr-2 my-4 ${selected ? "bg-[#11293A] " : "bg-white border-[#d8d7d7]"}`}
                >
                  <Text
                    className={`font-proximanova-semibold text-sm ${selected ? "text-white" : "text-[#111]"}`}
                  >
                    <Text className="capitalize">{item}</Text>
                    {` (${categoryCounts[item] || 0})`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Text className="font-semibold text-xl mx-5 text-[#111] mb-3">
        Leave Request List
      </Text>

      {shiftRequestsLoading && leaveItems.length === 0 ? (
        <View className="flex-1 items-center justify-center py-10">
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
        </View>
      ) : (
        <FlatList
          ListEmptyComponent={
            <View className="px-5 pt-6">
              <StatusStateCard
                style={styles.compactEmptyState}
                image={require("@/assets/images/leave-pending.svg")}
                title="No Leave Requests"
                text="There are no leave requests to show right now."
                titleStyle={styles.compactEmptyStateTitle}
                textStyle={styles.compactEmptyStateText}
              />
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          data={filteredData}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <SickLeaveCard item={item} selectedCategory={selectedCategory} />
          )}
        />
      )}

      <UserCalendarScheduleModal
        visible={onCalendar}
        onClose={() => setOnCalendar(false)}
      />
    </SafeAreaView>
  );
};

export default LeaveHistory;

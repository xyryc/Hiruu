import ScreenHeader from "@/components/header/ScreenHeader";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { formatDate } from "@/utils/date";
import { EvilIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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

const formatApiTime = (time?: string | null) => {
  if (!time) return "-";
  const [h = "0", m = "0"] = time.split(":");
  const hours = Number(h);
  const minutes = Number(m);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const suffix = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelveHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const OvertimeRequestCardSkeleton = ({
  showActions,
}: {
  showActions?: boolean;
}) => {
  return (
    <View className="mx-5 border border-[#EEEEEE] mb-3 rounded-[14px] p-4 bg-white dark:bg-dark-background">
      <View className="flex-row items-center justify-between mb-3">
        <View className="h-5 w-48 bg-[#E5E7EB] rounded-md" />
        <View className="h-5 w-16 bg-[#E5E7EB] rounded-full" />
      </View>

      <View className="gap-2.5">
        <View className="flex-row justify-between">
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-32 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-16 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-40 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between">
          <View className="h-3 w-14 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-36 bg-[#E5E7EB] rounded-md" />
        </View>
      </View>

      <View className="my-4 h-px w-full bg-[#E5E7EB] rounded-full" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <View className="h-[30px] w-[30px] rounded-full bg-[#E5E7EB]" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>

        {showActions ? (
          <View className="flex-row gap-2">
            <View className="h-8 w-20 bg-[#E5E7EB] rounded-3xl" />
            <View className="h-8 w-20 bg-[#E5E7EB] rounded-3xl" />
          </View>
        ) : (
          <View className="h-6 w-24 bg-[#E5E7EB] rounded-full" />
        )}
      </View>
    </View>
  );
};

const OvertimeHistory = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const isBusinessProfile = (selectedBusinesses?.length || 0) > 0;
  const selectedBusinessId = selectedBusinesses?.[0] || "";

  const getMyShiftRequests = useShiftStore((state) => state.getMyShiftRequests);
  const getBusinessShiftRequests = useShiftStore((state) => state.getBusinessShiftRequests);
  const approveBusinessShiftRequest = useShiftStore(
    (state) => state.approveBusinessShiftRequest
  );
  const rejectBusinessShiftRequest = useShiftStore(
    (state) => state.rejectBusinessShiftRequest
  );
  const shiftRequestsLoading = useShiftStore((state) => state.shiftRequestsLoading);
  const businessShiftRequestsLoading = useShiftStore(
    (state) => state.businessShiftRequestsLoading
  );

  const [requests, setRequests] = useState<any[]>([]);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const filterOptions = ["all", "pending", "approved", "rejected", "cancelled", "expired"];
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = isBusinessProfile
    ? businessShiftRequestsLoading
    : shiftRequestsLoading;

  const loadRequests = useCallback(async () => {
    const params = { page: 1, limit: 50, type: "overtime_request" };
    if (isBusinessProfile) {
      if (!selectedBusinessId) {
        setRequests([]);
        return;
      }
      const response = await getBusinessShiftRequests(selectedBusinessId, params);
      setRequests(Array.isArray(response) ? response : []);
      return;
    }

    const response = await getMyShiftRequests(params);
    setRequests(Array.isArray(response) ? response : []);
  }, [
    getBusinessShiftRequests,
    getMyShiftRequests,
    isBusinessProfile,
    selectedBusinessId,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
    }, [loadRequests])
  );

  const filteredRequests = useMemo(() => {
    return requests
      .filter((request) => filter === "all" || request?.status === filter)
      .filter((request) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;

        const employeeName = request?.employment?.user?.name || "";
        const businessName = request?.business?.name || "";
        const reason = request?.reason || "";
        const roleName = request?.employment?.role?.role?.name || "";
        const haystack = `${employeeName} ${businessName} ${reason} ${roleName}`.toLowerCase();
        return haystack.includes(q);
      });
  }, [filter, requests, searchQuery]);

  const skeletonRequests = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: `overtime-skeleton-${index}` })),
    []
  );

  const getFilterCount = useCallback(
    (status: string) => {
      if (status === "all") return requests.length;
      return requests.filter((request) => request?.status === status).length;
    },
    [requests]
  );

  const renderItem = ({ item }: any) => {
    const employeeName = item?.employment?.user?.name || "-";
    const roleName = item?.employment?.role?.role?.name || "";
    const requestedDate = item?.requestedDate || item?.createdAt || null;
    const businessName = item?.business?.name || "-";
    const businessLogo = item?.business?.logo || undefined;

    const isPending = item?.status === "pending";
    const isActioning = actioningId === item?.id;

    const handleApprove = async () => {
      if (!selectedBusinessId || !item?.id) return;
      try {
        setActioningId(item.id);
        setActionType("approve");
        await approveBusinessShiftRequest(selectedBusinessId, item.id);
        setRequests((prev) =>
          prev.map((req) =>
            req?.id === item.id ? { ...req, status: "approved" } : req
          )
        );
      } catch (error: any) {
        toast.error(error?.message || "Failed to approve request");
      } finally {
        setActioningId(null);
        setActionType(null);
      }
    };

    const handleReject = async () => {
      if (!selectedBusinessId || !item?.id) return;
      try {
        setActioningId(item.id);
        setActionType("reject");
        await rejectBusinessShiftRequest(selectedBusinessId, item.id);
        setRequests((prev) =>
          prev.map((req) =>
            req?.id === item.id ? { ...req, status: "rejected" } : req
          )
        );
      } catch (error: any) {
        toast.error(error?.message || "Failed to reject request");
      } finally {
        setActioningId(null);
        setActionType(null);
      }
    };

    return (
      <View
        key={item?.id}
        className="mx-5 border border-[#EEEEEE] mb-3 rounded-[14px] p-4"
      >
        <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary mb-2">
          {employeeName}
          {roleName ? ` (${roleName})` : ""}
        </Text>

        <View className="flex-row justify-between">
          <Text className="text-secondary dark:text-dark-secondary font-proximanova-regular text-sm">
            Date:
          </Text>
          <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
            {formatDate(requestedDate)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary dark:text-dark-secondary font-proximanova-regular text-sm">
            Overtime Start:
          </Text>
          <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
            {formatApiTime(item?.startTime)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary dark:text-dark-secondary font-proximanova-regular text-sm">
            Overtime End:
          </Text>
          <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
            {formatApiTime(item?.endTime)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary dark:text-dark-secondary font-proximanova-regular text-sm">
            Reason:
          </Text>
          <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
            {item?.reason || "-"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-secondary dark:text-dark-secondary font-proximanova-regular text-sm">
            Hotel:
          </Text>
          <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
            {businessName}
          </Text>
        </View>

        <View className="my-4">
          <Image
            source={require("@/assets/images/dotted-line.svg")}
            style={{ height: 1, width: "100%" }}
            contentFit="contain"
          />
        </View>

        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-2 items-center">
            <Image
              source={
                businessLogo ||
                "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg"
              }
              style={{ height: 30, width: 30, borderRadius: 999 }}
              contentFit="cover"
            />
            <Text className="text-sm font-proximanova-regular text-placeholder dark:text-dark-placeholder">
              {businessName}
            </Text>
          </View>
          {isBusinessProfile && isPending ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                disabled={isActioning}
                onPress={handleReject}
                className="bg-[#F34F4F] px-3 py-2 rounded-3xl"
              >
                <Text className="text-white font-proximanova-semibold text-sm">
                  {isActioning && actionType === "reject" ? "Rejecting..." : "Reject"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isActioning}
                onPress={handleApprove}
                className="bg-[#11293A] px-3 py-2 rounded-3xl"
              >
                <Text className="text-white font-proximanova-semibold text-sm">
                  {isActioning && actionType === "approve" ? "Accepting..." : "Accept"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <StatusBadge status={item?.status} />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right", "bottom"]}>
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
          onPressBack={() => router.back()}
          title={`Overtime Request (${isBusinessProfile ? "Received" : "Sent"})`}
          className="px-5 pt-2.5 pb-4"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
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

        <View>
          <FlatList
            data={filterOptions}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, marginVertical: 15 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setFilter(item)}
                className={`mr-2 px-4 py-2 border border-[#EEEEEE] rounded-full ${filter === item ? "bg-[#11293A]" : ""
                  }`}
              >
                <Text
                  className={`text-center text-sm ${filter === item
                    ? "font-proximanova-semibold text-white"
                    : "font-proximanova-regular text-primary"
                    }`}
                >
                  <Text className="capitalize">{item}</Text> ({getFilterCount(item)})
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {isLoading && requests.length === 0 ? (
          <FlatList
            data={skeletonRequests}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 6 }}
            renderItem={() => (
              <View pointerEvents="none">
                <OvertimeRequestCardSkeleton showActions={isBusinessProfile} />
              </View>
            )}
          />
        ) : (
          <FlatList
            data={filteredRequests}
            renderItem={renderItem}
            keyExtractor={(item, index) => item?.id || `overtime-${index}`}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View className="px-5 pt-6">
                <StatusStateCard
                  style={styles.compactEmptyState}
                  image={require("@/assets/images/leave-pending.svg")}
                  title="No Overtime Requests"
                  text="There are no overtime requests to show right now."
                  titleStyle={styles.compactEmptyStateTitle}
                  textStyle={styles.compactEmptyStateText}
                />
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default OvertimeHistory;

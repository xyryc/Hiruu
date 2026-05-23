import ScreenHeader from "@/components/header/ScreenHeader";
import TeamShiftRequestCard from "@/components/ui/cards/TeamShiftRequestCard";
import RequestLogModal from "@/components/ui/modals/RequestLogModal";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

type AttendanceMode = "automatic" | "manual";

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

const ShiftRequestCardSkeleton = ({ showActions }: { showActions?: boolean }) => {
  return (
    <View className="border border-[#EEEEEE] dark:border-[#222] rounded-3xl p-4 mb-3 bg-white dark:bg-dark-background">
      <View className="flex-row items-center justify-between mb-3">
        <View className="h-4 w-24 bg-[#E5E7EB] rounded-md" />
        <View className="h-6 w-20 bg-[#E5E7EB] rounded-full" />
      </View>

      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-11 h-11 rounded-full bg-[#E5E7EB]" />
          <View className="flex-1">
            <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />
            <View className="mt-2 h-3 w-28 bg-[#E5E7EB] rounded-md" />
          </View>
        </View>
        <View className="h-4 w-16 bg-[#E5E7EB] rounded-md ml-2" />
      </View>

      <View className="mt-4">
        <View className="flex-row justify-between">
          <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-32 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between mt-2.5">
          <View className="h-3 w-16 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-40 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="flex-row justify-between mt-2.5">
          <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
        </View>
      </View>

      <View className="my-4 h-[2px] w-full bg-[#E5E7EB] rounded-full" />

      {showActions ? (
        <View className="flex-row gap-3">
          <View className="h-10 flex-1 bg-[#E5E7EB] rounded-full" />
          <View className="h-10 flex-1 bg-[#E5E7EB] rounded-full" />
        </View>
      ) : (
        <View className="items-end">
          <View className="h-8 w-24 bg-[#E5E7EB] rounded-full" />
        </View>
      )}
    </View>
  );
};

const ShiftRequest = () => {
  const params = useLocalSearchParams<{
    startDate?: string;
    endDate?: string;
    sort?: string;
    status?: string;
    type?: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTab, setSelectedTab] = useState("Pending Requests");
  const insets = useSafeAreaInsets();
  const [isModalSettings, setIsModalSettings] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState<AttendanceMode>("automatic");
  const attendanceModeRequestIdRef = useRef(0);
  const [isSavingAttendanceMode, setIsSavingAttendanceMode] = useState(false);
  const {
    selectedBusinesses,
    getBusinessProfile,
    updateMyBusinessProfile,
  } = useBusinessStore();
  const {
    getBusinessShiftRequests,
    approveBusinessShiftRequest,
    rejectBusinessShiftRequest,
    businessShiftRequests,
    businessShiftRequestsLoading,
  } = useShiftStore();
  const selectedBusinessId = selectedBusinesses?.[0];
  const filterParams = useMemo(
    () => ({
      startDate: typeof params.startDate === "string" ? params.startDate : undefined,
      endDate: typeof params.endDate === "string" ? params.endDate : undefined,
      sort: typeof params.sort === "string" ? params.sort : undefined,
      status: typeof params.status === "string" ? params.status : undefined,
      type: typeof params.type === "string" ? params.type : undefined,
    }),
    [params.endDate, params.sort, params.startDate, params.status, params.type]
  );

  const loadBusinessAttendanceMode = useCallback(async () => {
    if (!selectedBusinessId) return;
    const requestId = ++attendanceModeRequestIdRef.current;
    try {
      const business = await getBusinessProfile(selectedBusinessId);
      if (requestId !== attendanceModeRequestIdRef.current) return;
      const mode = String(business?.attendanceMode || "").toLowerCase();
      setAttendanceMode(mode === "manual" ? "manual" : "automatic");
    } catch {
      if (requestId !== attendanceModeRequestIdRef.current) return;
      setAttendanceMode("automatic");
    }
  }, [getBusinessProfile, selectedBusinessId]);

  useEffect(() => {
    loadBusinessAttendanceMode();
  }, [loadBusinessAttendanceMode]);

  useEffect(() => {
    if (!isModalSettings) return;
    loadBusinessAttendanceMode();
  }, [isModalSettings, loadBusinessAttendanceMode]);

  const loadShiftRequests = useCallback(async () => {
    if (!selectedBusinessId) return;
    try {
      await getBusinessShiftRequests(selectedBusinessId, {
        page: 1,
        limit: 50,
        startDate: filterParams.startDate,
        endDate: filterParams.endDate,
        sort: filterParams.sort,
        status: filterParams.status,
        type: filterParams.type,
      } as any);
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.message || "Failed to load shift requests"
        )
      );
    }
  }, [filterParams.endDate, filterParams.sort, filterParams.startDate, filterParams.status, filterParams.type, getBusinessShiftRequests, selectedBusinessId]);

  useFocusEffect(
    useCallback(() => {
      loadShiftRequests();
    }, [loadShiftRequests])
  );

  const pendingRequests = useMemo(
    () =>
      (Array.isArray(businessShiftRequests) ? businessShiftRequests : []).filter(
        (item: any) => String(item?.status || "").toLowerCase() === "pending"
      ),
    [businessShiftRequests]
  );

  const requestHistory = useMemo(
    () =>
      (Array.isArray(businessShiftRequests) ? businessShiftRequests : []).filter(
        (item: any) => String(item?.status || "").toLowerCase() !== "pending"
      ),
    [businessShiftRequests]
  );

  const skeletonRequests = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: `shift-requests-skeleton-${index}` })),
    []
  );

  const handleSaveAttendanceMode = async (mode: AttendanceMode) => {
    if (!selectedBusinessId) {
      toast.error("No business selected");
      return;
    }

    try {
      setIsSavingAttendanceMode(true);
      await updateMyBusinessProfile(selectedBusinessId, { attendanceMode: mode });
      setAttendanceMode(mode);
      toast.success(translateApiMessage("business_updated_successfully"));
      setIsModalSettings(false);
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update request log settings"
        )
      );
    } finally {
      setIsSavingAttendanceMode(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl   px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <ScreenHeader
          className="mb-5"
          onPressBack={() => router.back()}
          title="Shift Requests"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setIsModalSettings(true)}
                className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center"
              >
                <Ionicons name="settings-outline" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/screens/home/shift/shift-filter",
                    params: {
                      ...(filterParams.startDate ? { startDate: filterParams.startDate } : {}),
                      ...(filterParams.endDate ? { endDate: filterParams.endDate } : {}),
                      ...(filterParams.sort ? { sort: filterParams.sort } : {}),
                      ...(filterParams.status ? { status: filterParams.status } : {}),
                      ...(filterParams.type ? { type: filterParams.type } : {}),
                    },
                  })
                }
                className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center"
              >
                <Ionicons name="filter" size={20} color="black" />
              </TouchableOpacity>
            </View>
          }
        />

        <RequestLogModal
          visible={isModalSettings}
          onClose={() => setIsModalSettings(false)}
          value={attendanceMode}
          loading={isSavingAttendanceMode}
          onSave={handleSaveAttendanceMode}
        />

        {/* tabs  */}
        <View className="flex-row mx-5 mt-2 dark:bg-dark-background">
          {["Pending Requests", "Request History"].map((tab) => (
            <TouchableOpacity
              className={`w-1/2 ${selectedTab === tab ? "border-b-2 border-[#11293A] pb-2" : ""}`}
              key={tab}
              onPress={() => setSelectedTab(tab)}
            >
              <View className="flex-row justify-center gap-2">
                <Text
                  className={`text-center dark:text-dark-primary ${selectedTab === tab ? "font-proximanova-semibold" : "font-proximanova-regular"}`}
                >
                  {tab}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
        {businessShiftRequestsLoading ? (
          <View pointerEvents="none" className="pt-4 pb-10">
            {skeletonRequests.map((item) => (
              <ShiftRequestCardSkeleton
                key={item.id}
                showActions={selectedTab === "Pending Requests"}
              />
            ))}
          </View>
        ) : (
          <>
            {/* pending screen */}
            {selectedTab === "Pending Requests" && (
              <View>
                {pendingRequests.map((item: any, index: number) => (
                  <TeamShiftRequestCard
                    key={item?.id || `pending-${index}`}
                    title={index === 0 ? "Pending" : undefined}
                    request={item}
                    showActions
                    hideAddRequest
                    onApprove={async () => {
                      if (!selectedBusinessId || !item?.id) {
                        toast.error("Unable to approve this request");
                        return;
                      }
                      try {
                        await approveBusinessShiftRequest(selectedBusinessId, item.id);
                        toast.success(translateApiMessage("shift_request_approved"));
                        loadShiftRequests();
                      } catch (error: any) {
                        toast.error(
                          translateApiMessage(
                            error?.message || "Failed to approve shift request"
                          )
                        );
                      }
                    }}
                    onReject={async () => {
                      if (!selectedBusinessId || !item?.id) {
                        toast.error("Unable to reject this request");
                        return;
                      }
                      try {
                        await rejectBusinessShiftRequest(selectedBusinessId, item.id);
                        toast.success(translateApiMessage("shift_request_declined"));
                        loadShiftRequests();
                      } catch (error: any) {
                        toast.error(
                          translateApiMessage(
                            error?.message || "Failed to reject shift request"
                          )
                        );
                      }
                    }}
                  />
                ))}

                {pendingRequests.length === 0 ? (
                  <View className="pt-6">
                    <StatusStateCard
                      style={styles.compactEmptyState}
                      image={require("@/assets/images/leave-pending.svg")}
                      title="No Pending Requests"
                      text="There are no pending shift requests to show right now."
                      titleStyle={styles.compactEmptyStateTitle}
                      textStyle={styles.compactEmptyStateText}
                    />
                  </View>
                ) : null}
              </View>
            )}

            {/* Request History */}
            {selectedTab === "Request History" && (
              <View>
                {requestHistory.map((item: any, index: number) => (
                  <TeamShiftRequestCard
                    key={item?.id || `history-${index}`}
                    title={index === 0 ? "History" : undefined}
                    request={item}
                    hideAddRequest
                    footerStatus={item?.status}
                  />
                ))}

                {requestHistory.length === 0 ? (
                  <View className="pt-6">
                    <StatusStateCard
                      style={styles.compactEmptyState}
                      image={require("@/assets/images/leave-pending.svg")}
                      title="No Request History"
                      text="There are no shift request history items to show right now."
                      titleStyle={styles.compactEmptyStateTitle}
                      textStyle={styles.compactEmptyStateText}
                    />
                  </View>
                ) : null}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftRequest;

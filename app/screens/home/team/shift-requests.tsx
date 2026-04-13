import ScreenHeader from "@/components/header/ScreenHeader";
import TeamShiftRequestCard from "@/components/ui/cards/TeamShiftRequestCard";
import RequestLogModal from "@/components/ui/modals/RequestLogModal";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
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

const ShiftRequest = () => {
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
      await getBusinessShiftRequests(selectedBusinessId, { page: 1, limit: 50 });
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.message || "Failed to load shift requests"
        )
      );
    }
  }, [getBusinessShiftRequests, selectedBusinessId]);

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
                  router.push("/screens/home/shift/shift-filter")
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
        {/* pending screen */}
        {selectedTab === "Pending Requests" && (
          <View>
            {businessShiftRequestsLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
            ) : null}
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
            {!businessShiftRequestsLoading && pendingRequests.length === 0 ? (
              <Text className="text-center text-sm text-secondary mt-6">
                No pending requests found.
              </Text>
            ) : null}
          </View>
        )}

        {/* Request History */}
        {selectedTab === "Request History" && (
          <View>
            {businessShiftRequestsLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
            ) : null}
            {requestHistory.map((item: any, index: number) => (
              <TeamShiftRequestCard
                key={item?.id || `history-${index}`}
                title={index === 0 ? "History" : undefined}
                request={item}
                hideAddRequest
                footerStatus={item?.status}
              />
            ))}
            {!businessShiftRequestsLoading && requestHistory.length === 0 ? (
              <Text className="text-center text-sm text-secondary mt-6">
                No request history found.
              </Text>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftRequest;

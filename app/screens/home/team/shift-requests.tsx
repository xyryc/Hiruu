import ScreenHeader from "@/components/header/ScreenHeader";
import TeamShiftRequestCard from "@/components/ui/cards/TeamShiftRequestCard";
import RequestLogModal from "@/components/ui/modals/RequestLogModal";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
            <TeamShiftRequestCard status="Missed Clock-out" title="Pending" />
            <TeamShiftRequestCard status="Late Clock-in" />
            <TeamShiftRequestCard status="Missed Clock-out" />
            <TeamShiftRequestCard status="Network Issues" />
            <TeamShiftRequestCard status="Missed Clock-out" title="Pending" />
          </View>
        )}

        {/* Request History */}
        {selectedTab === "Request History" && (
          <View>
            <TeamShiftRequestCard isHistory status="Missed Clock-out" />
            <TeamShiftRequestCard isHistory status="Late Clock-in" />
            <TeamShiftRequestCard isHistory status="Missed Clock-out" />
            <TeamShiftRequestCard isHistory status="Network Issues" />
            <TeamShiftRequestCard isHistory status="Missed Clock-out" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftRequest;

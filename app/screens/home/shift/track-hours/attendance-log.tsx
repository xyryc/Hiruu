import ScreenHeader from "@/components/header/ScreenHeader";
import AttendanceLogCard from "@/components/ui/cards/AttendanceLogCard";
import TrackHoursFilter, {
  TrackHoursTimeframe,
} from "@/components/ui/modals/TrackHoursFilter";
import { useShiftStore } from "@/stores/shiftStore";
import { StatusBadgeProps } from "@/types";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const formatDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateRangeByTimeframe = (
  timeframe: TrackHoursTimeframe
): { dateFrom?: string; dateTo?: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (timeframe === "all_time") return {};

  if (timeframe === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { dateFrom: formatDateParam(start), dateTo: formatDateParam(end) };
  }

  if (timeframe === "this_week") {
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { dateFrom: formatDateParam(start), dateTo: formatDateParam(end) };
  }

  if (timeframe === "last_six_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { dateFrom: formatDateParam(start), dateTo: formatDateParam(end) };
  }

  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);
  return { dateFrom: formatDateParam(start), dateTo: formatDateParam(end) };
};

type AttendanceLogItem = {
  id: string;
  date?: string;
  clockInTime?: string | null;
  clockOutTime?: string | null;
  workingTime?: string | null;
  statusSummary?: string | null;
  business?: {
    id?: string;
    name?: string | null;
    logo?: string | null;
  } | null;
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDisplayTime = (value?: string | null) => {
  if (!value) return "--:--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--:--";
  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const mapStatusSummaryToBadge = (
  statusSummary?: string | null
): { status: StatusBadgeProps["status"]; label: string; workTimeColor?: string } => {
  const normalized = String(statusSummary || "").toLowerCase();

  switch (normalized) {
    case "completed":
      return { status: "completed", label: "Completed", workTimeColor: "#3EBF5A" };
    case "missed":
      return { status: "missed", label: "Missed", workTimeColor: "#F34F4F" };
    case "pending":
      return { status: "pending", label: "Pending", workTimeColor: "#F3934F" };
    case "ongoing":
      return { status: "ongoing", label: "Ongoing", workTimeColor: "#F3934F" };
    case "early_leave":
      return { status: "early_leave", label: "Early Leave", workTimeColor: "#F3934F" };
    default:
      return { status: "pending", label: statusSummary || "Pending" };
  }
};

const AttendanceLog = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isModal, setIsModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TrackHoursTimeframe>("all_time");
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogItem[]>([]);
  const getAttendanceLog = useShiftStore((s) => s.getAttendanceLog);

  const loadAttendanceLogs = useCallback(
    async (timeframe: TrackHoursTimeframe) => {
      try {
        const logs = await getAttendanceLog(getDateRangeByTimeframe(timeframe));
        setAttendanceLogs(Array.isArray(logs) ? logs : []);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load attendance log");
      }
    },
    [getAttendanceLog]
  );

  useEffect(() => {
    void loadAttendanceLogs(selectedTimeframe);
  }, [loadAttendanceLogs, selectedTimeframe]);

  const groupedAttendanceLogs = useMemo(() => {
    return attendanceLogs.reduce<Record<string, AttendanceLogItem[]>>((acc, item) => {
      const key = String(item?.date || "-");
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [attendanceLogs]);

  const groupedDates = useMemo(
    () =>
      Object.keys(groupedAttendanceLogs).sort((a, b) => {
        const aTime = new Date(a).getTime();
        const bTime = new Date(b).getTime();
        if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
        return bTime - aTime;
      }),
    [groupedAttendanceLogs]
  );

  const handleSelectTimeframe = (timeframe: TrackHoursTimeframe) => {
    setSelectedTimeframe(timeframe);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5 my-2.5"
        onPressBack={() => router.back()}
        title="Attendance Log"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <TouchableOpacity
            className="w-10 h-10 justify-center items-center bg-[#F5F5F5] rounded-full"
            onPress={() => setIsModal(true)}
          >
            <Feather name="filter" size={16} color="#292D32" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
          paddingHorizontal: 20,
        }}
      >
        {groupedDates.length === 0 ? (
          <View className="pt-8">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              No attendance log found.
            </Text>
          </View>
        ) : (
          groupedDates.map((dateKey, groupIndex) => (
            <View key={dateKey} className={groupIndex === 0 ? "" : "mt-8"}>
              <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                {formatDisplayDate(dateKey)}
              </Text>

              {groupedAttendanceLogs[dateKey].map((item) => {
                const badge = mapStatusSummaryToBadge(item?.statusSummary);
                return (
                  <AttendanceLogCard
                    key={item.id}
                    startTime={formatDisplayTime(item?.clockInTime || null)}
                    endTime={formatDisplayTime(item?.clockOutTime || null)}
                    totalWorkTime={String(item?.workingTime || "00:00")}
                    status={badge.status}
                    statusLabel={badge.label}
                    workTimeColor={badge.workTimeColor}
                    businessLogo={item?.business?.logo || null}
                    businessName={item?.business?.name || "Business"}
                  />
                );
              })}
            </View>
          ))
        )}
      </ScrollView>

      <TrackHoursFilter
        visible={isModal}
        onClose={() => setIsModal(false)}
        selectedTimeframe={selectedTimeframe}
        onSelectTimeframe={handleSelectTimeframe}
      />
    </SafeAreaView>
  );
};

export default AttendanceLog;

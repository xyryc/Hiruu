import ScreenHeader from "@/components/header/ScreenHeader";
import AttendanceLogCard from "@/components/ui/cards/AttendanceLogCard";
import TrackHoursFilter, {
  TrackHoursTimeframe,
} from "@/components/ui/modals/TrackHoursFilter";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useShiftStore } from "@/stores/shiftStore";
import { StatusBadgeProps } from "@/types";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { useTranslation } from "react-i18next";
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
  statusSummary: string | null | undefined,
  t: (key: string, options?: any) => string
): { status: StatusBadgeProps["status"]; label: string; workTimeColor?: string } => {
  const normalized = String(statusSummary || "").toLowerCase();

  switch (normalized) {
    case "completed":
      return {
        status: "completed",
        label: t("user.profile.trackHours.attendanceLog.status.completed"),
        workTimeColor: "#3EBF5A",
      };
    case "missed":
      return {
        status: "missed",
        label: t("user.profile.trackHours.attendanceLog.status.missed"),
        workTimeColor: "#F34F4F",
      };
    case "pending":
      return {
        status: "pending",
        label: t("user.profile.trackHours.attendanceLog.status.pending"),
        workTimeColor: "#F3934F",
      };
    case "ongoing":
      return {
        status: "ongoing",
        label: t("user.profile.trackHours.attendanceLog.status.ongoing"),
        workTimeColor: "#F3934F",
      };
    case "early_leave":
      return {
        status: "early_leave",
        label: t("user.profile.trackHours.attendanceLog.status.earlyLeave"),
        workTimeColor: "#F3934F",
      };
    default:
      return {
        status: "pending",
        label:
          (typeof statusSummary === "string" && statusSummary.trim()) ||
          t("user.profile.trackHours.attendanceLog.status.pending"),
      };
  }
};

const AttendanceLogCardSkeleton = () => {
  return (
    <View className="mt-3 p-4 border-hairline border-secondary dark:border-dark-secondary rounded-xl bg-white dark:bg-dark-background">
      <View className="flex-row justify-between">
        <View className="flex-row justify-between gap-5">
          <View>
            <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
            <View className="mt-2 h-4 w-16 bg-[#E5E7EB] rounded-md" />
          </View>
          <View className="border-r-hairline border-secondary dark:border-dark-secondary" />
          <View>
            <View className="h-3 w-20 bg-[#E5E7EB] rounded-md" />
            <View className="mt-2 h-4 w-16 bg-[#E5E7EB] rounded-md" />
          </View>
        </View>

        <View>
          <View className="h-3 w-24 bg-[#E5E7EB] rounded-md" />
          <View className="mt-2 h-4 w-14 bg-[#E5E7EB] rounded-md" />
        </View>
      </View>

      <View className="border-b-hairline border-secondary dark:border-dark-secondary mt-3" />

      <View className="mt-3 flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <View className="h-[30px] w-[30px] rounded-full bg-[#E5E7EB]" />
          <View className="h-3 w-28 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="h-6 w-20 bg-[#E5E7EB] rounded-full" />
      </View>
    </View>
  );
};

const AttendanceLog = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const [isModal, setIsModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TrackHoursTimeframe>("all_time");
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogItem[]>([]);
  const [attendanceLogsLoading, setAttendanceLogsLoading] = useState(false);
  const getAttendanceLog = useShiftStore((s) => s.getAttendanceLog);

  const loadAttendanceLogs = useCallback(
    async (timeframe: TrackHoursTimeframe) => {
      setAttendanceLogsLoading(true);
      try {
        const logs = await getAttendanceLog(getDateRangeByTimeframe(timeframe));
        setAttendanceLogs(Array.isArray(logs) ? logs : []);
      } catch (error: any) {
        toast.error(
          error?.message || t("user.profile.trackHours.attendanceLog.failedToLoad")
        );
      } finally {
        setAttendanceLogsLoading(false);
      }
    },
    [getAttendanceLog, t]
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

  const skeletonGroups = useMemo(
    () =>
      Array.from({ length: 2 }, (_, groupIndex) => ({
        id: `attendance-log-skeleton-group-${groupIndex}`,
        cards: Array.from({ length: 2 }, (_, cardIndex) => ({
          id: `attendance-log-skeleton-card-${groupIndex}-${cardIndex}`,
        })),
      })),
    []
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5 my-2.5"
        onPressBack={() => router.back()}
        title={t("user.profile.trackHours.attendanceLog.title")}
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
        {attendanceLogsLoading ? (
          <View pointerEvents="none" className="pt-2">
            {skeletonGroups.map((group, groupIndex) => (
              <View key={group.id} className={groupIndex === 0 ? "" : "mt-8"}>
                <AutoSkeletonView isLoading={true} defaultRadius={8}>
                  <View className="h-4 w-36 bg-[#E5E7EB] rounded-md" />
                </AutoSkeletonView>

                {group.cards.map((card) => (
                  <AutoSkeletonView
                    key={card.id}
                    isLoading={true}
                    defaultRadius={12}
                  >
                    <AttendanceLogCardSkeleton />
                  </AutoSkeletonView>
                ))}
              </View>
            ))}
          </View>
        ) : groupedDates.length === 0 ? (
          <View className="pt-6">
            <StatusStateCard
              image={require("@/assets/images/leave-pending.svg")}
              title={t("user.profile.trackHours.attendanceLog.emptyTitle")}
              text={t("user.profile.trackHours.attendanceLog.emptyText")}
            />
          </View>
        ) : (
          groupedDates.map((dateKey, groupIndex) => (
            <View key={dateKey} className={groupIndex === 0 ? "" : "mt-8"}>
              <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                {formatDisplayDate(dateKey)}
              </Text>

              {groupedAttendanceLogs[dateKey].map((item) => {
                const badge = mapStatusSummaryToBadge(item?.statusSummary, t);
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
                    businessName={
                      item?.business?.name ||
                      t("user.profile.businessSummary.businessFallback")
                    }
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

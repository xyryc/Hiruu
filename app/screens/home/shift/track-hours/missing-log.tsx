import ScreenHeader from "@/components/header/ScreenHeader";
import TaskCard from "@/components/ui/cards/TaskCard";
import TrackHoursFilter, {
  TrackHoursTimeframe,
} from "@/components/ui/modals/TrackHoursFilter";
import { useShiftStore } from "@/stores/shiftStore";
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
): { startDate?: string; endDate?: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (timeframe === "all_time") return {};

  if (timeframe === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: formatDateParam(start), endDate: formatDateParam(end) };
  }

  if (timeframe === "this_week") {
    const day = today.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { startDate: formatDateParam(start), endDate: formatDateParam(end) };
  }

  if (timeframe === "last_six_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: formatDateParam(start), endDate: formatDateParam(end) };
  }

  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);
  return { startDate: formatDateParam(start), endDate: formatDateParam(end) };
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const base = parsed.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const now = new Date();
  const isToday =
    parsed.getDate() === now.getDate() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getFullYear() === now.getFullYear();

  return isToday ? `${base} Today` : base;
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

type IncompleteAttendanceItem = {
  id: string;
  shiftAssignmentId?: string;
  status?: string;
  createdAt?: string;
  shiftAssignment?: {
    startsAt?: string;
    endsAt?: string;
    shiftTemplate?: {
      name?: string;
      business?: {
        logo?: string | null;
        city?: string;
        address?: {
          city?: string;
        } | null;
      } | null;
    } | null;
  } | null;
  shiftAttendanceSummary?: {
    assignedUsersCount?: number;
    presentUsersCount?: number;
    presentColleagueAvatarPreview?: string[];
  } | null;
};

const buildPresentTeamMembers = (
  preview: string[],
  presentCount: number
): string[] => {
  const cleanPreview = Array.isArray(preview)
    ? preview.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];

  if (!Number.isFinite(presentCount) || presentCount <= 0) return [];

  if (cleanPreview.length >= presentCount) {
    return cleanPreview.slice(0, presentCount);
  }

  return [
    ...cleanPreview,
    ...Array.from({ length: presentCount - cleanPreview.length }, (_, index) => `U${index + 1}`),
  ];
};

const toTaskCardStatus = (status?: string) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "ongoing") return "ongoing" as const;
  if (normalized === "upcoming") return "upcoming" as const;
  if (normalized === "completed") return "completed" as const;
  if (normalized === "early_leave") return "early_leave" as const;
  if (normalized === "pending") return "pending" as const;
  if (normalized === "approved") return "approved" as const;
  if (normalized === "rejected") return "rejected" as const;
  if (normalized === "accepted") return "accepted" as const;
  return "missed" as const;
};

const MissingLog = () => {
  const handleLogin = () => {
    router.push("./correction-request");
  };
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isModal, setIsModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TrackHoursTimeframe>("all_time");
  const [items, setItems] = useState<IncompleteAttendanceItem[]>([]);
  const getMyLatestIncompleteAttendance = useShiftStore(
    (s) => s.getMyLatestIncompleteAttendance
  );

  const loadLatestIncomplete = useCallback(
    async (timeframe: TrackHoursTimeframe) => {
      try {
        const data = await getMyLatestIncompleteAttendance(
          getDateRangeByTimeframe(timeframe)
        );
        setItems(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load missing log activities");
      }
    },
    [getMyLatestIncompleteAttendance]
  );

  useEffect(() => {
    void loadLatestIncomplete(selectedTimeframe);
  }, [loadLatestIncomplete, selectedTimeframe]);

  const groupedByDate = useMemo(() => {
    return items.reduce<Record<string, IncompleteAttendanceItem[]>>((acc, item) => {
      const keySource = item?.createdAt || item?.shiftAssignment?.startsAt || "";
      const parsed = new Date(keySource);
      const key = Number.isNaN(parsed.getTime())
        ? "unknown"
        : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [items]);

  const groupedDateKeys = useMemo(
    () =>
      Object.keys(groupedByDate).sort((a, b) => {
        const aTime = new Date(a).getTime();
        const bTime = new Date(b).getTime();
        if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
        return bTime - aTime;
      }),
    [groupedByDate]
  );

  const handleSelectTimeframe = (timeframe: TrackHoursTimeframe) => {
    setSelectedTimeframe(timeframe);
  };


  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF]  dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5 my-4 rounded-3xl"
        onPressBack={() => router.back()}
        title="Missing Log Activities"
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

      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        {groupedDateKeys.length === 0 ? (
          <View className="pt-6">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              No missing log activities found.
            </Text>
          </View>
        ) : (
          groupedDateKeys.map((dateKey, dateIndex) => (
            <View key={dateKey} className={dateIndex > 0 ? "mt-7" : ""}>
              <View className="flex-row justify-between">
                <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-sectext-secondary">
                  {formatDisplayDate(dateKey)}
                </Text>
              </View>

              {groupedByDate[dateKey].map((item) => {
                const startsAt = item?.shiftAssignment?.startsAt || null;
                const endsAt = item?.shiftAssignment?.endsAt || null;
                const presentCount =
                  typeof item?.shiftAttendanceSummary?.presentUsersCount === "number"
                    ? item.shiftAttendanceSummary.presentUsersCount
                    : 0;
                const assignedCount =
                  typeof item?.shiftAttendanceSummary?.assignedUsersCount === "number"
                    ? item.shiftAttendanceSummary.assignedUsersCount
                    : 0;
                const preview =
                  item?.shiftAttendanceSummary?.presentColleagueAvatarPreview || [];
                const teamMembers = buildPresentTeamMembers(preview, presentCount);
                const business =
                  item?.shiftAssignment?.shiftTemplate?.business || null;
                const city =
                  business?.city ||
                  business?.address?.city ||
                  "City unavailable";

                return (
                  <View key={item.id} className="mb-4 mt-3">
                    <TaskCard
                      shiftId={item?.shiftAssignmentId}
                      shiftTitle={
                        item?.shiftAssignment?.shiftTemplate?.name || "Untitled Shift"
                      }
                      startTime={formatDisplayTime(startsAt)}
                      endTime={formatDisplayTime(endsAt)}
                      startsAt={startsAt || undefined}
                      endsAt={endsAt || undefined}
                      shiftImage={
                        business?.logo || require("@/assets/images/placeholder.png")
                      }
                      teamMembers={teamMembers}
                      totalMembers={assignedCount}
                      address={city}
                      city={city}
                      onLoginPress={handleLogin}
                      status={toTaskCardStatus(item?.status)}
                      requestLog={true}
                      fullWidth
                    />
                  </View>
                );
              })}
            </View>
          ))
        )}

        <TrackHoursFilter
          visible={isModal}
          onClose={() => setIsModal(false)}
          selectedTimeframe={selectedTimeframe}
          onSelectTimeframe={handleSelectTimeframe}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MissingLog;

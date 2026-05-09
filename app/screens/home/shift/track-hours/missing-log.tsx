import ScreenHeader from "@/components/header/ScreenHeader";
import TaskCard from "@/components/ui/cards/TaskCard";
import TrackHoursFilter, {
  TrackHoursTimeframe,
} from "@/components/ui/modals/TrackHoursFilter";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useShiftStore } from "@/stores/shiftStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const formatDisplayDate = (
  value: string | null | undefined,
  t: (key: string, options?: any) => string
) => {
  if (!value) return "-";
  if (value === "unknown") return t("common.unknown");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return t("common.unknown");
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

  return isToday ? t("common.dateWithToday", { date: base }) : base;
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
  employmentId?: string;
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

const MissingLogActivityCardSkeleton = () => {
  return (
    <View className="w-full rounded-[14px] px-4 pb-4 pt-4 bg-[#e5f4fd83] border border-[#4fb1f359]">
      <View className="flex-row items-center gap-3">
        <View className="w-20 h-20 rounded-[10px] bg-[#E5E7EB]" />
        <View className="flex-1">
          <View className="h-4 w-44 bg-[#E5E7EB] rounded-md mb-3" />
          <View className="h-3 w-36 bg-[#E5E7EB] rounded-md" />

          <View className="mt-4 flex-row items-center justify-between">
            <View className="flex-row">
              <View className="w-8 h-8 rounded-full bg-[#E5E7EB]" />
              <View className="w-8 h-8 rounded-full bg-[#E5E7EB] -ml-2" />
              <View className="w-8 h-8 rounded-full bg-[#E5E7EB] -ml-2" />
            </View>
            <View className="h-3 w-16 bg-[#E5E7EB] rounded-md" />
          </View>
        </View>
      </View>

      <View className="items-center my-4">
        <View className="h-px w-full bg-[#E5E7EB] rounded-full" />
      </View>

      <View className="flex-row justify-between items-center gap-4">
        <View className="flex-row items-center flex-1">
          <View className="mr-2 h-[34px] w-[34px] bg-[#E5E7EB] rounded-md" />
          <View className="h-3 w-32 bg-[#E5E7EB] rounded-md" />
        </View>
        <View className="h-9 w-24 bg-[#E5E7EB] rounded-full" />
      </View>
    </View>
  );
};

const MissingLog = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const [isModal, setIsModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TrackHoursTimeframe>("all_time");
  const [items, setItems] = useState<IncompleteAttendanceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const getMyLatestIncompleteAttendance = useShiftStore(
    (s) => s.getMyLatestIncompleteAttendance
  );

  const loadLatestIncomplete = useCallback(
    async (timeframe: TrackHoursTimeframe) => {
      setLoading(true);
      try {
        const data = await getMyLatestIncompleteAttendance(
          getDateRangeByTimeframe(timeframe)
        );
        setItems(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(
          error?.message || t("user.profile.trackHours.failedToLoadMissingLogs")
        );
      } finally {
        setLoading(false);
      }
    },
    [getMyLatestIncompleteAttendance, t]
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

  const skeletonGroups = useMemo(
    () =>
      Array.from({ length: 2 }, (_, groupIndex) => ({
        id: `missing-log-skeleton-group-${groupIndex}`,
        cards: Array.from({ length: 2 }, (_, cardIndex) => ({
          id: `missing-log-skeleton-card-${groupIndex}-${cardIndex}`,
        })),
      })),
    []
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF]  dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5 my-4 rounded-3xl"
        onPressBack={() => router.back()}
        title={t("user.profile.trackHours.missingLogActivitiesTitle")}
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
        {loading ? (
          <View pointerEvents="none" className="pt-4 pb-10">
            {skeletonGroups.map((group, groupIndex) => (
              <View key={group.id} className={groupIndex > 0 ? "mt-7" : ""}>
                <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />

                {group.cards.map((card) => (
                  <View key={card.id}>
                    <View className="mt-3">
                      <MissingLogActivityCardSkeleton />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : groupedDateKeys.length === 0 ? (
          <View className="pt-6">
            <StatusStateCard
              image={require("@/assets/images/leave-pending.svg")}
              title={t("user.profile.trackHours.noMissingLogsTitle")}
              text={t("user.profile.trackHours.noMissingLogsText")}
            />
          </View>
        ) : (
          groupedDateKeys.map((dateKey, dateIndex) => (
            <View key={dateKey} className={dateIndex > 0 ? "mt-7" : ""}>
              <View className="flex-row justify-between">
                <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-sectext-secondary">
                  {formatDisplayDate(dateKey, t)}
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
                  t("common.cityUnavailable");

                return (
                  <View key={item.id} className="mb-4 mt-3">
                    <TaskCard
                      shiftId={item?.shiftAssignmentId}
                      shiftTitle={
                        item?.shiftAssignment?.shiftTemplate?.name ||
                        t("user.profile.trackHours.untitledShift")
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
                      onLoginPress={() =>
                        router.push({
                          pathname: "/screens/home/shift/track-hours/correction-request",
                          params: {
                            attendanceId: item?.id,
                            employmentId: item?.employmentId,
                            shiftAssignmentId: item?.shiftAssignmentId,
                          },
                        })
                      }
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

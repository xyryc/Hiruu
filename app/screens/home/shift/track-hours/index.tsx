import ScreenHeader from "@/components/header/ScreenHeader";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ActionCard from "@/components/ui/cards/ActionCard";
import ShiftLogCard from "@/components/ui/cards/ShiftLogCard";
import TaskCard from "@/components/ui/cards/TaskCard";
import WorkHoursChart from "@/components/ui/cards/WorkHourChart";
import TrackHoursFilter, {
  TrackHoursTimeframe,
} from "@/components/ui/modals/TrackHoursFilter";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useShiftStore } from "@/stores/shiftStore";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
): { startDate?: string; endDate?: string } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (timeframe === "all_time") return {};

  if (timeframe === "this_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      startDate: formatDateParam(start),
      endDate: formatDateParam(end),
    };
  }

  if (timeframe === "this_week") {
    const day = today.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(today);
    start.setDate(today.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      startDate: formatDateParam(start),
      endDate: formatDateParam(end),
    };
  }

  if (timeframe === "last_six_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      startDate: formatDateParam(start),
      endDate: formatDateParam(end),
    };
  }

  // this_year
  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);
  return {
    startDate: formatDateParam(start),
    endDate: formatDateParam(end),
  };
};

const formatDisplayDate = (
  value: string | null | undefined,
  t: (key: string, options?: any) => string
) => {
  if (!value) return t("common.today");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return t("common.today");

  const now = new Date();
  const isToday =
    parsed.getDate() === now.getDate() &&
    parsed.getMonth() === now.getMonth() &&
    parsed.getFullYear() === now.getFullYear();

  const base = parsed.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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

type TodaysShiftLog = {
  date?: string | null;
  workingHour?: {
    start?: string | null;
    end?: string | null;
  } | null;
  startTime?: string | null;
  endTime?: string | null;
} | null;

type IncompleteAttendanceItem = {
  id: string;
  employmentId?: string;
  shiftAssignmentId?: string;
  status?: string;
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
    <View className="w-[320px] shrink-0 mr-4 rounded-[14px] px-4 pb-4 pt-4 bg-[#e5f4fd83] border border-[#4fb1f359]">
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

const TrackHours = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const [isModal, setIsModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TrackHoursTimeframe>("all_time");
  const getTrackHoursAnalytics = useShiftStore((s) => s.getTrackHoursAnalytics);
  const getMyLatestIncompleteAttendance = useShiftStore(
    (s) => s.getMyLatestIncompleteAttendance
  );
  const [summary, setSummary] = useState<{
    totalHours: number;
    completedShifts: number;
    overHours: number;
  }>({
    totalHours: 0,
    completedShifts: 0,
    overHours: 0,
  });
  const [workPattern, setWorkPattern] = useState<
    { date: string; workedHours: number; completedShifts: number }[]
  >([]);
  const [missingLogItems, setMissingLogItems] = useState<IncompleteAttendanceItem[]>([]);
  const [missingLogsLoading, setMissingLogsLoading] = useState(false);
  const [todaysShiftLog, setTodaysShiftLog] = useState<TodaysShiftLog>(null);

  const loadTrackHours = useCallback(
    async (timeframe: TrackHoursTimeframe) => {
      try {
        const analytics = await getTrackHoursAnalytics(
          getDateRangeByTimeframe(timeframe)
        );

        if (!analytics) return;

        setSummary({
          totalHours:
            typeof analytics?.summary?.totalHours === "number"
              ? analytics.summary.totalHours
              : 0,
          completedShifts:
            typeof analytics?.summary?.completedShifts === "number"
              ? analytics.summary.completedShifts
              : 0,
          overHours:
            typeof analytics?.summary?.overHours === "number"
              ? analytics.summary.overHours
              : 0,
        });

        setWorkPattern(
          Array.isArray(analytics?.workPattern)
            ? analytics.workPattern.map((item: any) => ({
              date: String(item?.date || ""),
              workedHours:
                typeof item?.workedHours === "number" ? item.workedHours : 0,
              completedShifts:
                typeof item?.completedShifts === "number"
                  ? item.completedShifts
                  : 0,
            }))
            : []
        );

        setTodaysShiftLog(analytics?.todaysShiftLog ?? null);
      } catch (error: any) {
        toast.error(error?.message || t("user.profile.trackHours.failedToLoad"));
      }
    },
    [getTrackHoursAnalytics, t]
  );

  useEffect(() => {
    void loadTrackHours(selectedTimeframe);
  }, [loadTrackHours, selectedTimeframe]);

  const loadMissingLogs = useCallback(
    async (timeframe: TrackHoursTimeframe) => {
      setMissingLogsLoading(true);
      try {
        const data = await getMyLatestIncompleteAttendance(
          getDateRangeByTimeframe(timeframe)
        );
        setMissingLogItems(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(
          error?.message || t("user.profile.trackHours.failedToLoadMissingLogs")
        );
      } finally {
        setMissingLogsLoading(false);
      }
    },
    [getMyLatestIncompleteAttendance, t]
  );

  useEffect(() => {
    void loadMissingLogs(selectedTimeframe);
  }, [loadMissingLogs, selectedTimeframe]);

  const handleSelectTimeframe = (timeframe: TrackHoursTimeframe) => {
    setSelectedTimeframe(timeframe);
  };

  const totalHoursLabel = useMemo(
    () => `${Number(summary.totalHours || 0).toFixed(0)}h`,
    [summary.totalHours]
  );

  const overHoursLabel = useMemo(
    () => `${Number(summary.overHours || 0).toFixed(0)}h`,
    [summary.overHours]
  );

  const shiftLogDateLabel = useMemo(
    () => formatDisplayDate(todaysShiftLog?.date || null, t),
    [t, todaysShiftLog?.date]
  );

  const shiftLogWorkingStart = useMemo(
    () => formatDisplayTime(todaysShiftLog?.workingHour?.start || null),
    [todaysShiftLog?.workingHour?.start]
  );

  const shiftLogWorkingEnd = useMemo(
    () => formatDisplayTime(todaysShiftLog?.workingHour?.end || null),
    [todaysShiftLog?.workingHour?.end]
  );

  const shiftLogStart = useMemo(
    () => formatDisplayTime(todaysShiftLog?.startTime || null),
    [todaysShiftLog?.startTime]
  );

  const shiftLogEnd = useMemo(
    () => formatDisplayTime(todaysShiftLog?.endTime || null),
    [todaysShiftLog?.endTime]
  );

  const workingHoursLabel = useMemo(
    () =>
      t("user.profile.trackHours.workingHoursRange", {
        start: shiftLogWorkingStart,
        end: shiftLogWorkingEnd,
      }),
    [shiftLogWorkingEnd, shiftLogWorkingStart, t]
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
        title={t("user.jobs.quickActions.trackHours")}
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
          paddingBottom: 40,
        }}
      >
        <View className="mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            {t("user.profile.trackHours.monthOverviewTitle")}
          </Text>

          <View className="mt-2 bg-[#E5F4FD] dark:bg-dark-background rounded-2xl  border-hairline border-[#4FB2F3]">
            {/* top */}
            <View className="flex-row justify-between border-b-hairline border-[#4FB2F3]">
              <View className="pl-2.5 pt-3.5 border-r-hairline pb-3 border-[#4FB2F3] w-1/3">
                {/* Icon Circle */}
                <View className="p-1.5 bg-white mr-auto rounded-full border-hairline border-[#4FB2F3]">
                  <MaterialCommunityIcons
                    name="clock"
                    size={16}
                    color="#4FB2F3"
                  />
                </View>

                {/* Text Labels */}
                <Text className="mt-1.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {t("user.profile.trackHours.totalHoursLabel")}
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  {totalHoursLabel}
                </Text>
              </View>

              <View className="pl-2.5 pt-3.5 border-r-hairline pb-3 border-[#4FB2F3] w-1/3">
                {/* Icon Circle */}
                <View className="p-1.5 bg-white mr-auto rounded-full border-hairline border-[#4FB2F3]">
                  <Ionicons name="checkmark-circle" size={16} color="#4FB2F3" />
                </View>

                {/* Text Labels */}
                <Text className="mt-1.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {t("user.profile.trackHours.completedShiftLabel")}
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  {summary.completedShifts}
                </Text>
              </View>

              <View className="pl-2.5 pt-3.5 pb-3 w-1/3">
                {/* Icon Circle */}
                <View className="p-1.5 bg-white mr-auto rounded-full border-hairline border-[#4FB2F3]">
                  <Entypo name="circle-with-plus" size={16} color="#4FB2F3" />
                </View>

                {/* Text Labels */}
                <Text className="mt-1.5 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  {t("user.profile.trackHours.overHoursLabel")}
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  {overHoursLabel}
                </Text>
              </View>
            </View>

            {/* bottom */}
            <View className="flex-row gap-2 items-center mx-4 my-6">
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {t("user.profile.trackHours.statusLabel")}
              </Text>
              <StatusBadge status="accepted" label={t("user.profile.trackHours.onTrackLabel")} />
              <StatusBadge status="upcoming" label={t("user.profile.trackHours.belowTargetLabel")} />
            </View>
          </View>
        </View>

        <View className="mt-8 mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            {t("user.profile.trackHours.dailyShiftLogTitle")}
          </Text>
          <ShiftLogCard
            dateLabel={shiftLogDateLabel}
            workingHoursLabel={workingHoursLabel}
            startTimeLabel={shiftLogStart}
            endTimeLabel={shiftLogEnd}
            isEmpty={!todaysShiftLog}
          />

          <PrimaryButton
            onPress={() =>
              router.push("/screens/home/shift/track-hours/attendance-log")
            }
            title={t("user.profile.trackHours.viewAttendanceLog")}
            className="mt-4"
          />

          {/* missing log activity */}
          <View className="flex-row justify-between mt-8">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              {t("user.profile.trackHours.missingLogActivitiesTitle")}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/screens/home/shift/track-hours/missing-log")}
            >
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                {t("common.seeAll")}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="mt-4"
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {missingLogsLoading ? (
              <View pointerEvents="none" className="flex-row py-1">
                {Array.from({ length: 3 }, (_, index) => (
                  <AutoSkeletonView
                    key={`missing-log-skeleton-${index}`}
                    isLoading={true}
                    defaultRadius={14}
                  >
                    <MissingLogActivityCardSkeleton />
                  </AutoSkeletonView>
                ))}
              </View>
            ) : missingLogItems.length === 0 ? (
              <View className="w-[320px] mr-4">
                <StatusStateCard
                  image={require("@/assets/images/leave-pending.svg")}
                  title={t("user.profile.trackHours.noMissingLogsTitle")}
                  text={t("user.profile.trackHours.noMissingLogsText")}
                />
              </View>
            ) : (
              missingLogItems.map((item) => {
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
                const business = item?.shiftAssignment?.shiftTemplate?.business || null;
                const city =
                  business?.city || business?.address?.city || t("common.cityUnavailable");

                return (
                  <TaskCard
                    key={item.id}
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
                  />
                );
              })
            )}
          </ScrollView>

          {/* work pattern */}
          <View className="mt-7">
            <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary mb-6">
              {t("user.profile.trackHours.workPatternTitle")}
            </Text>

            <WorkHoursChart workPattern={workPattern} />
          </View>

          {/* token */}
          <View className="mt-8">
            <ActionCard
              title={t("user.profile.trackHours.earnedTokensThisWeekTitle")}
              buttonTitle={t("common.view")}
              rightImage={require("@/assets/images/engagement.svg")}
              imageClass="right-4.5 -bottom-5"
              imageWidth={131}
              imageHeight={117}
              background={require("@/assets/images/engagement-bg.svg")}
              backgroundClass="right-9"
              backgroundWidth={103}
              backgroundHeight={80}
            />
          </View>
        </View>

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

export default TrackHours;

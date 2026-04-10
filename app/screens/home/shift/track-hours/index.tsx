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

const formatDisplayDate = (value?: string | null) => {
  if (!value) return "Today";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Today";

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

  return isToday ? `${base} (Today)` : base;
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

const TrackHours = () => {
  const handleLogin = () => {
    router.push("./correction-request");
  };
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isModal, setIsModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TrackHoursTimeframe>("all_time");
  const getTrackHoursAnalytics = useShiftStore((s) => s.getTrackHoursAnalytics);
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
        toast.error(error?.message || "Failed to load track hours");
      }
    },
    [getTrackHoursAnalytics]
  );

  useEffect(() => {
    void loadTrackHours(selectedTimeframe);
  }, [loadTrackHours, selectedTimeframe]);

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
    () => formatDisplayDate(todaysShiftLog?.date || null),
    [todaysShiftLog?.date]
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
    () => `Working Hours (${shiftLogWorkingStart} - ${shiftLogWorkingEnd})`,
    [shiftLogWorkingEnd, shiftLogWorkingStart]
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
        title="Track Hours"
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
            This Month’s Overview
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
                  Total Hours
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
                  Completed Shift
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
                  Over Hours
                </Text>
                <Text className="mt-2.5 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                  {overHoursLabel}
                </Text>
              </View>
            </View>

            {/* bottom */}
            <View className="flex-row gap-2 items-center mx-4 my-6">
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                Status:
              </Text>
              <StatusBadge status="accepted" label="On Track " />
              <StatusBadge status="upcoming" label="Below Target" />
            </View>
          </View>
        </View>

        <View className="mt-8 mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Daily Shift Log
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
            title="View Attendance log"
            className="mt-4"
          />

          {/* missing log activity */}
          <View className="flex-row justify-between mt-8">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Missing log Activities
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/screens/home/shift/track-hours/missing-log")}
            >
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            className="mt-4"
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <TaskCard
              shiftTitle="Hotel & Bar Management"
              startTime="10:00 AM"
              endTime="6:00 PM"
              shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
              teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
              totalMembers={30}
              address="230 Aaron Bushnell St"
              city="Palestine, PL"
              onLoginPress={handleLogin}
              status="completed"
              requestLog={true}
            />

            <TaskCard
              shiftTitle="Hotel & Bar Management"
              startTime="10:00 AM"
              endTime="6:00 PM"
              shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
              teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
              totalMembers={30}
              address="230 Aaron Bushnell St"
              city="Palestine, PL"
              onLoginPress={handleLogin}
              status="completed"
              requestLog={true}
            />

            <TaskCard
              shiftTitle="Hotel & Bar Management"
              startTime="10:00 AM"
              endTime="6:00 PM"
              shiftImage="https://media.architecturaldigest.com/photos/66c8923688f5dc5cc31e1e35/1:1/w_3283,h_3283,c_limit/CH_BAD_ROMAN_NYC_ROUND_1_020323952A.jpg" // Replace with your image
              teamMembers={["John", "Jane", "Mike", "Sarah", "Tom"]}
              totalMembers={30}
              address="230 Aaron Bushnell St"
              city="Palestine, PL"
              onLoginPress={handleLogin}
              status="completed"
              requestLog={true}
            />
          </ScrollView>

          {/* work pattern */}
          <View className="mt-7">
            <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary mb-6">
              Your Work Pattern
            </Text>

            <WorkHoursChart workPattern={workPattern} />
          </View>

          {/* token */}
          <View className="mt-8">
            <ActionCard
              title="Shows Earned Tokens This Week"
              buttonTitle="View"
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

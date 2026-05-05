import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useBusinessStore } from "@/stores/businessStore";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type MarkedDates = Record<
  string,
  {
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
  }
>;

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const addDays = (date: Date, days: number) => {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
};

const WeeklyScheduleApply = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    selectedBusinesses,
    getWeeklyScheduleBlocks,
  } = useBusinessStore();
  const [isApplying, setIsApplying] = useState(false);
  const params = useLocalSearchParams<{
    mode?: string;
    blockId?: string;
    startDate?: string;
    endDate?: string;
    name?: string;
  }>();
  const isEditMode = params.mode === "edit";
  const [existingBlocks, setExistingBlocks] = useState<
    { id: string; startDate: string; endDate: string; name?: string }[]
  >([]);

  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");

  const businessId = selectedBusinesses[0];
  const todayYmd = formatDate(new Date());

  const isoToYmd = (value?: string) => {
    if (!value) return "";
    return value.slice(0, 10);
  };

  useEffect(() => {
    if (!isEditMode) return;
    if (typeof params.startDate === "string") {
      setSelectedStartDate(params.startDate);
    }
    if (typeof params.endDate === "string") {
      setSelectedEndDate(params.endDate);
    }
  }, [isEditMode, params.endDate, params.startDate]);

  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};

    existingBlocks.forEach((block) => {
      const start = toDate(isoToYmd(block.startDate));
      const end = toDate(isoToYmd(block.endDate));
      const totalDays = Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      );

      for (let index = 0; index <= totalDays; index += 1) {
        const dateKey = formatDate(addDays(start, index));
        marks[dateKey] = {
          color: "#D1D5DB",
          textColor: "#111111",
          startingDay: index === 0,
          endingDay: index === totalDays,
        };
      }
    });

    if (!selectedStartDate) return marks as MarkedDates;

    if (!selectedEndDate || selectedStartDate === selectedEndDate) {
      return {
        ...marks,
        [selectedStartDate]: {
          selected: true,
          selectedColor: "#4FB2F3",
          selectedTextColor: "#FFFFFF",
        },
      } as MarkedDates;
    }

    const start = toDate(selectedStartDate);
    const end = toDate(selectedEndDate);
    const totalDays = Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    );
    for (let index = 0; index <= totalDays; index += 1) {
      const dateKey = formatDate(addDays(start, index));
      marks[dateKey] = {
        color: "#4FB2F3",
        textColor: "#FFFFFF",
        startingDay: index === 0,
        endingDay: index === totalDays,
      };
    }

    return marks;
  }, [existingBlocks, selectedEndDate, selectedStartDate]);

  const selectedRangeLabel = useMemo(() => {
    if (!selectedStartDate) return t("user.jobs.schedule.noDateSelected");
    if (!selectedEndDate) return selectedStartDate;
    return t("user.jobs.schedule.dateRange", {
      start: selectedStartDate,
      end: selectedEndDate,
    });
  }, [selectedEndDate, selectedStartDate, t]);

  const selectedDaysCount = useMemo(() => {
    if (!selectedStartDate || !selectedEndDate) return 0;
    return (
      Math.floor(
        (toDate(selectedEndDate).getTime() - toDate(selectedStartDate).getTime()) /
          (24 * 60 * 60 * 1000)
      ) + 1
    );
  }, [selectedEndDate, selectedStartDate]);

  const doesRangeOverlapExistingBlocks = useCallback(
    (startYmd: string, endYmd: string, skipBlockId?: string) => {
      const start = toDate(startYmd).getTime();
      const end = toDate(endYmd).getTime();
      return existingBlocks.some((block) => {
        if (skipBlockId && block.id === skipBlockId) return false;
        const blockStart = toDate(isoToYmd(block.startDate)).getTime();
        const blockEnd = toDate(isoToYmd(block.endDate)).getTime();
        return start <= blockEnd && end >= blockStart;
      });
    },
    [existingBlocks]
  );

  useEffect(() => {
    const loadExistingBlocks = async () => {
      if (!businessId) {
        setExistingBlocks([]);
        return;
      }
      try {
        const blocks = await getWeeklyScheduleBlocks(businessId);
        setExistingBlocks(
          blocks.map((item: any) => ({
            id: item.id,
            startDate: item.startDate,
            endDate: item.endDate,
            name: item.name,
          }))
        );
      } catch {
        setExistingBlocks([]);
      }
    };

    loadExistingBlocks();
  }, [businessId, getWeeklyScheduleBlocks]);

  const handleDayPress = (day: DateData) => {
    if (day.dateString < todayYmd) {
      toast.error(t("user.jobs.schedule.cannotApplyPastWeek"));
      return;
    }

    const block = findBlockByDate(day.dateString);
    if (block) {
      toast.info(t("api.weekly_block_manage_from_manage_screen"));
      return;
    }

    if (isEditMode) {
      toast.info(t("user.jobs.schedule.dateRangeLockedEditMode"));
      return;
    }

    const startDate = toDate(day.dateString);
    const endDate = addDays(startDate, 6);
    const nextStart = formatDate(startDate);
    const nextEnd = formatDate(endDate);

    if (doesRangeOverlapExistingBlocks(nextStart, nextEnd)) {
      toast.error(t("user.jobs.schedule.weeklyScheduleExistsInRange"));
      return;
    }

    setSelectedStartDate(nextStart);
    setSelectedEndDate(nextEnd);
  };

  const findBlockByDate = useCallback(
    (dateString: string) => {
      const target = toDate(dateString).getTime();
      return (
        existingBlocks.find((block) => {
          const blockStart = toDate(isoToYmd(block.startDate)).getTime();
          const blockEnd = toDate(isoToYmd(block.endDate)).getTime();
          return target >= blockStart && target <= blockEnd;
        }) || null
      );
    },
    [existingBlocks]
  );

  const handleApply = async () => {
    if (!businessId) {
      toast.error(t("common.selectBusinessFirst"));
      return;
    }
    if (!selectedStartDate || !selectedEndDate) {
      toast.error(t("user.jobs.schedule.selectWeekStartDate"));
      return;
    }
    if (selectedStartDate < todayYmd) {
      toast.error(
        t(
          isEditMode
            ? "user.jobs.schedule.cannotEditPastWeek"
            : "user.jobs.schedule.cannotApplyPastWeek"
        )
      );
      return;
    }
    const selectedDays =
      Math.floor(
        (toDate(selectedEndDate).getTime() - toDate(selectedStartDate).getTime()) /
        (24 * 60 * 60 * 1000)
      ) + 1;
    if (selectedDays !== 7) {
      toast.error(t("user.jobs.schedule.onlyOneWeek"));
      return;
    }
    if (
      doesRangeOverlapExistingBlocks(
        selectedStartDate,
        selectedEndDate,
        isEditMode && typeof params.blockId === "string" ? params.blockId : undefined
      )
    ) {
      toast.error(t("user.jobs.schedule.weeklyScheduleExistsInRange"));
      return;
    }

    try {
      setIsApplying(true);
      router.push({
        pathname: "/screens/schedule/business/weekly-schedule",
        params: {
          ...(isEditMode ? { mode: "edit", blockId: params.blockId } : {}),
          startDate: selectedStartDate,
          endDate: selectedEndDate,
          name:
            typeof params.name === "string" && params.name.trim().length > 0
              ? params.name
              : `Week ${selectedStartDate}`,
        },
      });
    } catch (error: any) {
      const apiMessageKey =
        error?.response?.data?.message || error?.message || "UNKNOWN_ERROR";
      toast.error(
        t(`api.${apiMessageKey}`, {
          defaultValue:
            apiMessageKey || t("user.jobs.schedule.failedToApplyWeeklySchedule"),
        })
      );
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        className="capitalize bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
        onPressBack={() => router.back()}
        title={
          isEditMode
            ? t("user.jobs.schedule.updateWeeklySchedule")
            : t("user.jobs.schedule.applyWeeklySchedule")
        }
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView className="mx-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="border border-[#EEEEEE] dark:border-dark-border rounded-2xl p-4">
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
            {t("user.jobs.schedule.selectDateRange")}
          </Text>
          <Text className="mt-1 font-proximanova-regular text-secondary dark:text-dark-secondary text-xs">
            {t("user.jobs.schedule.selectDateRangeHint")}
          </Text>
          <Text className="mt-3 font-proximanova-semibold text-[#4FB2F3]">
            {selectedRangeLabel}
          </Text>
        </View>

	        <View className="mt-4 border border-[#EEEEEE] dark:border-dark-border rounded-2xl p-2">
	          <Calendar
	            markingType="period"
	            markedDates={markedDates}
	            onDayPress={handleDayPress}
	            minDate={isEditMode ? undefined : todayYmd}
	            enableSwipeMonths={true}
	            theme={{
	              backgroundColor: "transparent",
	              calendarBackground: "transparent",
	              textSectionTitleColor: isDark ? "#9CA3AF" : "#64748B",
              selectedDayBackgroundColor: "#4FB2F3",
              selectedDayTextColor: "#FFFFFF",
              todayTextColor: "#4FB2F3",
              dayTextColor: isDark ? "#F9FAFB" : "#111111",
              textDisabledColor: "#C7CDD3",
              monthTextColor: isDark ? "#F9FAFB" : "#111111",
              indicatorColor: "#4FB2F3",
              arrowColor: "#4FB2F3",
            }}
          />
        </View>

        <View className="mt-4 border border-[#EEEEEE] dark:border-dark-border rounded-2xl p-4">
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
            {t("common.summary")}
          </Text>
          <View className="flex-row items-center justify-between mt-3">
            <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
              {t("user.jobs.schedule.summary.weekLengthLabel", {
                defaultValue: "Week length",
              })}
            </Text>
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              {selectedDaysCount > 0
                ? t("user.jobs.schedule.summary.daysCount", {
                    count: selectedDaysCount,
                    defaultValue:
                      selectedDaysCount === 1
                        ? `${selectedDaysCount} day`
                        : `${selectedDaysCount} days`,
                  })
                : "--"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
              {t("user.jobs.schedule.summary.applyRangeLabel")}
            </Text>
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              {selectedRangeLabel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="mt-4 self-start"
          onPress={() => {
            setSelectedStartDate("");
            setSelectedEndDate("");
          }}
        >
          <Text className="font-proximanova-semibold text-[#4FB2F3]">
            {t("common.clearSelection")}
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          title={
            isApplying
              ? t("common.loading")
              : t("common.next")
          }
          className="mt-6 mb-5"
          onPress={handleApply}
          loading={isApplying}
          disabled={!selectedStartDate || !selectedEndDate || isApplying}
        />
      </ScrollView>

    </SafeAreaView>
  );
};

export default WeeklyScheduleApply;

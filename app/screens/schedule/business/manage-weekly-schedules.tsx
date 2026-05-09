import ScreenHeader from "@/components/header/ScreenHeader";
import WeeklyBlockActionsModal from "@/components/ui/modals/WeeklyBlockActionsModal";
import { useBusinessStore } from "@/stores/businessStore";
import { CalendarMarkedDates, WeeklyScheduleBlockItem } from "@/types";
import { formatDate as formatDisplayDate } from "@/utils/date";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const formatYmdDate = (date: Date) => {
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

const ManageWeeklySchedules = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    myEmployments,
    getMyEmployments,
    selectedBusinesses,
    getWeeklyScheduleBlocks,
    deleteWeeklyScheduleBlock,
  } = useBusinessStore();

  const [showBlockActions, setShowBlockActions] = useState(false);
  const [isDeletingBlock, setIsDeletingBlock] = useState(false);
  const [existingBlocks, setExistingBlocks] = useState<WeeklyScheduleBlockItem[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<WeeklyScheduleBlockItem | null>(
    null
  );

  const businessId = selectedBusinesses[0];

  useEffect(() => {
    getMyEmployments().catch(() => undefined);
  }, [getMyEmployments]);

  const isoToYmd = (value?: string) => {
    if (!value) return "";
    return value.slice(0, 10);
  };

  useEffect(() => {
    const loadBlocks = async () => {
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
      } catch (error: any) {
        setExistingBlocks([]);
        toast.error(error?.message || t("user.jobs.schedule.failedToLoadWeeklySchedules"));
      }
    };

    loadBlocks();
  }, [businessId, getWeeklyScheduleBlocks, t]);

  const markedDates = useMemo(() => {
    const marks: CalendarMarkedDates = {};

    existingBlocks.forEach((block) => {
      const start = toDate(isoToYmd(block.startDate));
      const end = toDate(isoToYmd(block.endDate));
      const totalDays = Math.max(
        0,
        Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      );

      for (let index = 0; index <= totalDays; index += 1) {
        const dateKey = formatYmdDate(addDays(start, index));
        marks[dateKey] = {
          color: "#D1D5DB",
          textColor: "#111111",
          startingDay: index === 0,
          endingDay: index === totalDays,
        };
      }
    });

    return marks;
  }, [existingBlocks]);

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

  const handleDayPress = (day: DateData) => {
    const block = findBlockByDate(day.dateString);
    if (!block) return;
    setSelectedBlock(block);
    setShowBlockActions(true);
  };

  const handleUpdate = () => {
    if (!selectedBlock || isDeletingBlock) return;
    setShowBlockActions(false);
    router.push({
      pathname: "/screens/schedule/business/weekly-schedule",
      params: {
        mode: "edit",
        blockId: selectedBlock.id,
        startDate: isoToYmd(selectedBlock.startDate),
        endDate: isoToYmd(selectedBlock.endDate),
        name: selectedBlock.name || "",
      },
    });
  };

  const handleDelete = async () => {
    if (!businessId || !selectedBlock || isDeletingBlock) return;

    try {
      setIsDeletingBlock(true);
      await deleteWeeklyScheduleBlock(businessId, selectedBlock.id);
      setExistingBlocks((prev) => prev.filter((block) => block.id !== selectedBlock.id));
      setShowBlockActions(false);
      setSelectedBlock(null);
      toast.success(t("api.weekly_block_deleted_successfully"));
    } catch (error: any) {
      const apiMessageKey =
        error?.response?.data?.message || error?.message || "UNKNOWN_ERROR";
      toast.error(
        t(`api.${apiMessageKey}`, {
          defaultValue:
            apiMessageKey || t("user.jobs.schedule.failedToDeleteWeeklySchedule"),
        })
      );
    } finally {
      setIsDeletingBlock(false);
    }
  };

  const activeBusinesses = useMemo(() => {
    const activeEmployments = (Array.isArray(myEmployments) ? myEmployments : []).filter(
      (employment: any) => String(employment?.status || "").toLowerCase() === "active"
    );
    const uniqueByBusinessId = new Map<string, any>();

    activeEmployments.forEach((employment: any) => {
      const business = employment?.business;
      const businessId = business?.id || employment?.businessId;
      if (!businessId || uniqueByBusinessId.has(businessId)) return;

      uniqueByBusinessId.set(businessId, {
        id: businessId,
        name: business?.name || t("user.profile.businessSummary.businessFallback"),
        logo: business?.logo,
      });
    });

    return Array.from(uniqueByBusinessId.values());
  }, [myEmployments, t]);

  const selectedBusiness = activeBusinesses.find(
    (business) => business.id === selectedBusinesses[0]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        className="capitalize bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 20 }}
        onPressBack={() => router.back()}
        title={t("user.jobs.schedule.manageWeeklySchedules")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView
        className="mx-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="border border-[#EEEEEE] dark:border-dark-border rounded-2xl p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 rounded-full overflow-hidden bg-[#E5F4FD] dark:bg-dark-border items-center justify-center">
              {selectedBusiness?.logo ? (
                <Image
                  source={selectedBusiness.logo}
                  contentFit="cover"
                  style={{ width: 40, height: 40 }}
                />
              ) : (
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {(selectedBusiness?.name || t("user.profile.businessSummary.businessFallback"))
                    .slice(0, 1)
                    .toUpperCase()}
                </Text>
              )}
            </View>
            <Text className="flex-1 font-proximanova-semibold text-primary dark:text-dark-primary">
              {selectedBusiness?.name || t("user.profile.noBusinessSelected")}
            </Text>
          </View>
          <Text className="mt-3 font-proximanova-regular text-secondary dark:text-dark-secondary text-xs">
            {t("user.jobs.schedule.manageHint")}
          </Text>
        </View>

        <View className="mt-4 border border-[#EEEEEE] dark:border-dark-border rounded-2xl p-2 mb-6">
          <Calendar
            markingType="period"
            markedDates={markedDates}
            onDayPress={handleDayPress}
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
      </ScrollView>

      <WeeklyBlockActionsModal
        visible={showBlockActions}
        onClose={() => {
          if (isDeletingBlock) return;
          setShowBlockActions(false);
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        title={t("user.jobs.schedule.weeklyBlockActionsTitle")}
        subtitle={
          selectedBlock
            ? t("user.jobs.schedule.blockRange", {
                start: formatDisplayDate(selectedBlock.startDate),
                end: formatDisplayDate(selectedBlock.endDate),
              })
            : t("user.jobs.schedule.selectedBlockFallback")
        }
      />
    </SafeAreaView>
  );
};

export default ManageWeeklySchedules;

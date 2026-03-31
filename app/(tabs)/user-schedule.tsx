import ShiftHeader from "@/components/header/ShiftHeader";
import ShiftItem from "@/components/layout/ShiftItem";
import HolidayCard from "@/components/ui/cards/HolidayCard";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import { useJobStore } from "@/stores/jobStore";
import { useShiftStore } from "@/stores/shiftStore";
import { UserScheduleApiShift, UserScheduleUiShift } from "@/types";
import { formatCountdownFromSeconds } from "@/utils/date";
import { formatUTCToLocalTime } from "@/utils/timezone";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ShiftSchedule = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const value = new Date();
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    const day = `${value.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [refreshing, setRefreshing] = useState(false);
  const {
    myEmployments,
    getMyEmployments,
    selectedEmploymentBusinessIds,
    setSelectedEmploymentBusinessIds,
  } = useJobStore();
  const { myShifts, myShiftsLoading, fetchMyShifts } = useShiftStore();

  const to12Hour = useCallback((value?: string) => {
    if (!value) return "--:--";
    const [rawHour = "0", rawMinute = "0"] = value.split(":");
    const hour = Number(rawHour);
    const minute = Number(rawMinute);
    if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
  }, []);

  const timeToMinutes = useCallback((value?: string) => {
    if (!value) return 0;
    const [h = "0", m = "0"] = value.split(":");
    return Number(h) * 60 + Number(m);
  }, []);

  const toUiShift = useCallback(
    (shift: UserScheduleApiShift): UserScheduleUiShift => {
      const business = shift?.business;

      if (shift?.itemType === "empty_day") {
        const hasNextShift = Boolean(shift?.hasNextShift);
        const nextShiftDate = shift?.nextShiftStartDate
          ? new Date(shift.nextShiftStartDate)
          : null;
        const nextShiftText =
          hasNextShift && nextShiftDate && !Number.isNaN(nextShiftDate.getTime())
            ? `Next shift: ${nextShiftDate.toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "long",
            })} - ${formatUTCToLocalTime(shift.nextShiftStartDate!)}`
            : "No upcoming shifts";

        return {
          id: `empty-${business?.id || "unknown"}-${shift?.date || Date.now()}`,
          businessId: business?.id || "",
          type: "empty_day",
          time: "Off",
          title: "Today is a Holiday",
          subtitle: "No shifts for today",
          nextShiftText,
          workTime: "--",
          company: business?.name || "Business",
          companyLogo: business?.logo,
          location: business?.address?.address,
          status: "no_shift",
        };
      }

      const startAt = shift?.startsAt ? new Date(shift.startsAt) : null;
      const endAt = shift?.endsAt ? new Date(shift.endsAt) : null;
      const start = shift?.shiftTemplate?.startTime || "00:00";
      const end = shift?.shiftTemplate?.endTime || "00:00";
      const shiftDate = new Date(shift?.date || Date.now());
      const now = new Date();

      const shiftStart = new Date(shiftDate);
      if (startAt && !Number.isNaN(startAt.getTime())) {
        shiftStart.setTime(startAt.getTime());
      } else {
        shiftStart.setHours(
          Math.floor(timeToMinutes(start) / 60),
          timeToMinutes(start) % 60,
          0,
          0
        );
      }

      const shiftEnd = new Date(shiftDate);
      if (endAt && !Number.isNaN(endAt.getTime())) {
        shiftEnd.setTime(endAt.getTime());
      } else {
        shiftEnd.setHours(Math.floor(timeToMinutes(end) / 60), timeToMinutes(end) % 60, 0, 0);
      }
      if (shiftEnd <= shiftStart) {
        shiftEnd.setDate(shiftEnd.getDate() + 1);
      }

      const displayStartTime =
        startAt && !Number.isNaN(startAt.getTime())
          ? startAt.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          : to12Hour(start);
      const displayEndTime =
        endAt && !Number.isNaN(endAt.getTime())
          ? endAt.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          : to12Hour(end);

      let type: UserScheduleUiShift["type"] = "upcoming";
      let status: UserScheduleUiShift["status"] = "upcoming";
      let countdown: string | undefined;
      let countdownTargetAt: number | undefined;
      let message: string | undefined;
      const apiStatus = (shift?.status || "").toLowerCase();

      if (apiStatus === "missed") {
        type = "missed";
        status = "missed";
        message = "You missed this shift.";
      } else if (apiStatus === "early_leave") {
        type = "early_leave";
        status = "early_leave";
        message = "You left this shift early.";
      } else if (now >= shiftStart && now <= shiftEnd) {
        type = "ongoing";
        status = "ongoing";
        countdownTargetAt = shiftEnd.getTime();
        countdown = formatCountdownFromSeconds((countdownTargetAt - now.getTime()) / 1000);
      } else if (now < shiftStart) {
        type = "upcoming";
        status = "upcoming";
        countdownTargetAt = shiftStart.getTime();
        countdown = formatCountdownFromSeconds((countdownTargetAt - now.getTime()) / 1000);
      } else {
        type = "completed";
        status = "completed";
        message = `You finished your ${displayStartTime} shift.`;
      }

      const breakDuration = Array.isArray(shift?.shiftTemplate?.breakDuration)
        ? shift.shiftTemplate.breakDuration
        : [];
      const breakTime =
        breakDuration.length > 0
          ? breakDuration
            .map((item) => `${to12Hour(item?.startTime)} - ${to12Hour(item?.endTime)}`)
            .join(", ")
          : undefined;

      return {
        id: shift.id || `${business?.id || "unknown"}-${shift?.date || Date.now()}`,
        businessId: business?.id || "",
        type,
        time: displayStartTime,
        title: shift?.shiftTemplate?.name || "Shift",
        workTime: `${displayStartTime} - ${displayEndTime}`,
        breakTime,
        company: business?.name || "Business",
        companyLogo: business?.logo,
        location: business?.address?.address,
        status,
        countdown,
        countdownTargetAt,
        message,
      };
    },
    [timeToMinutes, to12Hour]
  );

  const loadShifts = useCallback(async () => {
    try {
      await fetchMyShifts(selectedDate);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load shifts");
    }
  }, [fetchMyShifts, selectedDate]);

  useEffect(() => {
    getMyEmployments().catch(() => undefined);
  }, [getMyEmployments]);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  useEffect(() => {
    const currentDate = new Date();
    const today = `${currentDate.getFullYear()}-${`${currentDate.getMonth() + 1}`.padStart(2, "0")}-${`${currentDate.getDate()}`.padStart(2, "0")}`;
    if (selectedDate !== today) return;

    const shifts = Array.isArray(myShifts) ? myShifts : [];
    const now = currentDate.getTime();
    const nextShiftStartAt = shifts.reduce<number | null>((closest, shift: UserScheduleApiShift) => {
      if (shift?.itemType !== "assigned_shift" || !shift?.startsAt) return closest;

      const startAt = new Date(shift.startsAt).getTime();
      if (!Number.isFinite(startAt) || startAt <= now) return closest;

      if (closest === null) return startAt;
      return Math.min(closest, startAt);
    }, null);

    if (!nextShiftStartAt) return;

    const timeout = setTimeout(() => {
      loadShifts();
    }, Math.max(nextShiftStartAt - now + 1000, 1000));

    return () => clearTimeout(timeout);
  }, [loadShifts, myShifts, selectedDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadShifts();
    setRefreshing(false);
  }, [loadShifts]);

  const uiShifts = useMemo(
    () => (Array.isArray(myShifts) ? myShifts : []).map(toUiShift),
    [myShifts, toUiShift]
  );

  const filteredShifts = useMemo(() => {
    if (selectedEmploymentBusinessIds.length === 0) return uiShifts;
    return uiShifts.filter((shift) =>
      selectedEmploymentBusinessIds.includes(shift.businessId)
    );
  }, [selectedEmploymentBusinessIds, uiShifts]);

  const modalBusinesses = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; imageUrl: string; logo?: string }
    >();
    (Array.isArray(myEmployments) ? myEmployments : []).forEach((employment) => {
      const business = employment?.business;
      if (!business?.id) return;
      if (map.has(business.id)) return;
      map.set(business.id, {
        id: business.id,
        name: business.name || "Business",
        imageUrl: business.logo || "",
        logo: business.logo,
      });
    });
    return Array.from(map.values());
  }, [myEmployments]);
  const selectedBusinessForFallback = useMemo(() => {
    if (selectedEmploymentBusinessIds.length === 1) {
      return modalBusinesses.find((b) => b.id === selectedEmploymentBusinessIds[0]);
    }
    return modalBusinesses[0];
  }, [modalBusinesses, selectedEmploymentBusinessIds]);

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedEmploymentBusinessIds.length === 0 || modalBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedEmploymentBusinessIds.length === 1) {
      const selectedBusiness = modalBusinesses.find(
        (b) => b.id === selectedEmploymentBusinessIds[0]
      );
      return { type: "single", content: selectedBusiness };
    }
    return { type: "all", content: "All" };
  };

  const displayContent = getDisplayContent();

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ShiftHeader
        setShowModal={setShowModal}
        displayContent={displayContent}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4FB2F3" />
        }
      >
        {myShiftsLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : filteredShifts.length > 0 ? (
          filteredShifts.map((shift, index) => (
            <ShiftItem
              key={shift.id}
              shift={shift}
              index={index}
              shiftsLength={filteredShifts.length}
            />
          ))
        ) : (
          <View className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <HolidayCard
              shift={{
                subtitle: "No shifts scheduled for this day.",
                companyLogo: selectedBusinessForFallback?.logo,
                workTime: "--:--",
              }}
            />
          </View>
        )}
      </ScrollView>

      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={modalBusinesses}
        disableStoreFallback
        selectedBusinesses={selectedEmploymentBusinessIds}
        onSelectionChange={setSelectedEmploymentBusinessIds}
      />
    </SafeAreaView>
  );
};

export default ShiftSchedule;

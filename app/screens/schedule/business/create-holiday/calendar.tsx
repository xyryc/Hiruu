import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessScheduleMonthYearsPickerModal from "@/components/ui/modals/BusinessScheduleMonthYearsPickerModal";
import ImportHolidayModal from "@/components/ui/modals/ImportHolidayModal";
import LogoutDeleteModal from "@/components/ui/modals/LogoutDeleteModal";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { DateData, Calendar as RNCalendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type HolidayItem = {
  id: string;
  title: string;
  date: string;
  type: "public" | "religious" | "company" | string;
};

const Calendar = () => {
  const delImg = require("@/assets/images/holiday-modal.svg");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { selectedBusinesses, getBusinessHolidays, deleteHoliday } = useBusinessStore();
  const selectedBusinessId = selectedBusinesses?.[0];

  const [currentViewDate, setCurrentViewDate] = useState(new Date()); // Currently viewing month/year
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"month" | "year">("month");
  const [selected, setSelected] = useState<number[]>([]);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [holidaysLoading, setHolidaysLoading] = useState(false);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(null);
  const [isModal, setIsModal] = useState(false);
  const [isHolidayModal, setIsHolidayModal] = useState(false);

  const data = {
    title: "Do You Want to Delete This Holiday?",
    subtitle: "Once deleted, this day will be marked as aworking day.",
    img: delImg,
    color: "#F34F4F26",
    border: "#F34F4F",
    buttonName: "Delete",
    buttonColor: "#F34F4F",
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthsFull = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = currentViewDate.getFullYear();
  const currentMonth = currentViewDate.getMonth();
  const deviceToday = new Date();

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return {
      dateFrom: toDateKey(start),
      dateTo: toDateKey(end),
    };
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentViewDate(new Date(currentYear, monthIndex, 1));
    setShowPicker(false);
    setPickerMode("month");
  };

  const handleYearSelect = (year: number) => {
    setCurrentViewDate(new Date(year, currentMonth, 1));
    setPickerMode("month");
  };

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i);

  const monthDatePrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const todayDateKey = toDateKey(deviceToday);
  const currentDateKey = `${monthDatePrefix}-01`;

  const holidayDaySet = useMemo(() => {
    const set = new Set<number>();
    holidays.forEach((item) => {
      const d = new Date(item.date);
      if (Number.isNaN(d.getTime())) return;
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [holidays, currentMonth, currentYear]);

  const visibleHolidays = useMemo(() => {
    return holidays.filter((item) => {
      const d = new Date(item.date);
      if (Number.isNaN(d.getTime())) return false;
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [holidays, currentMonth, currentYear]);

  console.log(
    "[BusinessHolidayCalendar] visibleHolidays:",
    JSON.stringify(
      {
        currentYear,
        currentMonth,
        totalHolidays: holidays.length,
        visibleCount: visibleHolidays.length,
        visibleIds: visibleHolidays.map((item) => item.id),
        visibleTypes: visibleHolidays.map((item) => item.type),
      },
      null,
      2
    )
  );

  const markedDates = Array.from(holidayDaySet).reduce<Record<string, any>>(
    (acc, day) => {
      const dateKey = `${monthDatePrefix}-${String(day).padStart(2, "0")}`;
      acc[dateKey] = {
        ...(acc[dateKey] || {}),
        customStyles: {
          ...(acc[dateKey]?.customStyles || {}),
          text: {
            ...(acc[dateKey]?.customStyles?.text || {}),
            color: "#F34F4F",
          },
        },
      };
      return acc;
    },
    {}
  );

  selected.forEach((day) => {
    const dateKey = `${monthDatePrefix}-${String(day).padStart(2, "0")}`;
    const isHoliday = holidayDaySet.has(day);
    markedDates[dateKey] = {
      ...(markedDates[dateKey] || {}),
      customStyles: {
        ...(markedDates[dateKey]?.customStyles || {}),
        container: {
          ...(markedDates[dateKey]?.customStyles?.container || {}),
          backgroundColor: "#E5F4FD",
          borderRadius: 999,
        },
        text: {
          ...(markedDates[dateKey]?.customStyles?.text || {}),
          color: isHoliday ? "#F34F4F" : "#111111",
        },
      },
    };
  });

  if (todayDateKey.startsWith(monthDatePrefix)) {
    const todayDay = Number(todayDateKey.split("-")[2] || "0");
    const isHolidayToday = holidayDaySet.has(todayDay);
    markedDates[todayDateKey] = {
      ...(markedDates[todayDateKey] || {}),
      customStyles: {
        ...(markedDates[todayDateKey]?.customStyles || {}),
        container: {
          ...(markedDates[todayDateKey]?.customStyles?.container || {}),
          backgroundColor: "#4FB2F3",
          borderRadius: 999,
        },
        text: {
          ...(markedDates[todayDateKey]?.customStyles?.text || {}),
          color: isHolidayToday ? "#F34F4F" : "#FFFFFF",
        },
      },
    };
  }

  const handleDayPress = (day: DateData) => {
    const selectedDate = new Date(day.dateString);
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const selectedDay = selectedDate.getDate();

    if (selectedYear !== currentYear || selectedMonth !== currentMonth) return;

    setSelected((prev) =>
      prev.includes(selectedDay)
        ? prev.filter((item) => item !== selectedDay)
        : [...prev, selectedDay]
    );
  };

  const formatHolidayType = (type?: string) => {
    if (!type) return "Public";
    return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
  };

  const fetchHolidays = useCallback(async () => {
    if (!selectedBusinessId) {
      setHolidays([]);
      return;
    }

    try {
      setHolidaysLoading(true);
      const { dateFrom, dateTo } = getMonthRange(currentViewDate);
      const data = await getBusinessHolidays(selectedBusinessId, {
        dateFrom,
        dateTo,
      });
      setHolidays(Array.isArray(data) ? data : []);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message;
      toast.error(translateApiMessage(message || "Failed to load holidays"));
      setHolidays([]);
    } finally {
      setHolidaysLoading(false);
    }
  }, [currentViewDate, getBusinessHolidays, selectedBusinessId]);

  useFocusEffect(
    useCallback(() => {
      fetchHolidays();
    }, [fetchHolidays])
  );

  const handleDeleteHoliday = useCallback(async () => {
    if (!selectedBusinessId) {
      toast.error("Please select a business first.");
      return;
    }
    if (!deletingHolidayId) {
      toast.error("Holiday not found.");
      return;
    }

    try {
      const result = await deleteHoliday(selectedBusinessId, deletingHolidayId);

      setHolidays((prev) => prev.filter((item) => item.id !== deletingHolidayId));
      setIsModal(false);
      setDeletingHolidayId(null);
      toast.success(translateApiMessage(result?.message || "holiday_deleted_successfully"));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to delete holiday";
      toast.error(translateApiMessage(message));
    }
  }, [deleteHoliday, deletingHolidayId, selectedBusinessId]);

  const renderHolidaysCard = (item: HolidayItem) => {
    const holidayDate = new Date(item.date);
    const year = holidayDate.getFullYear();
    const day = holidayDate.getDate();
    const monthLabel = months[new Date(item.date).getMonth()] || "";

    return (
      <View
        key={item.id}
        className="mt-4 border border-[#EEEEEE] p-4 rounded-2xl flex-row justify-between items-center"
      >
        <View className="flex-row gap-3">
          {/* calender card */}
          <View className="border border-[#E5F4FD] rounded-[10px] ">
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary text-center py-1 px-3 bg-[#E5F4FD] rounded-t-[10px]">
              {year}
            </Text>
            <Text className="font-proximanova-semibold text-[#4FB2F3] mx-5 text-center">
              {day}
            </Text>
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary text-center  mb-1">
              {monthLabel}
            </Text>
          </View>
          {/* details */}
          <View className="">
            <Text className="font-proximanova-bold text-primary dark:text-dark-primary mt-2">
              {item.title}
            </Text>
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary mt-3 capitalize">
              Holiday Type :{" "}
              <Text className="text-primary dark:text-dark-primary">
                {formatHolidayType(item.type)}
              </Text>
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => {
              setDeletingHolidayId(item.id);
              setIsModal(true);
            }}
          >
            <Ionicons name="trash-outline" size={25} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom", "top"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScreenHeader
          className="mx-5 mt-3"
          onPressBack={() => router.back()}
          title="Calendar"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => {
                  setPickerMode("month");
                  setShowPicker(true);
                }}
                className="flex-row gap-1 items-center bg-[#E5F4FD] px-4 py-2 rounded-full"
              >
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {monthsFull[currentMonth]} {currentYear}
                </Text>
                <Ionicons name="chevron-down" size={16} color="black" />
              </TouchableOpacity>
            </View>
          }
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* calendar */}
          <View className="my-4 w-full">
            <RNCalendar
              key={currentDateKey}
              markingType="custom"
              current={currentDateKey}
              hideArrows={true}
              hideExtraDays={true}
              disableMonthChange={false}
              renderHeader={() => null}
              onDayPress={handleDayPress}
              onMonthChange={(month) => {
                setCurrentViewDate(new Date(month.year, month.month - 1, 1));
              }}
              markedDates={markedDates}
              theme={{
                calendarBackground: "transparent",
                textSectionTitleColor: "#4FB2F3",
                dayTextColor: isDark ? "#FFFFFF" : "#111111",
                monthTextColor: "transparent",
                textMonthFontSize: 1,
                textMonthFontFamily: "System",
                textMonthFontWeight: "400",
                textDayFontFamily: "System",
                textDayHeaderFontFamily: "System",
                textDayHeaderFontWeight: "600",
                todayTextColor: "#4FB2F3",
              }}
            />

            <BusinessScheduleMonthYearsPickerModal
              showPicker={showPicker}
              setShowPicker={setShowPicker}
              pickerMode={pickerMode}
              setPickerMode={setPickerMode}
              months={months}
              currentMonth={currentMonth}
              currentYear={currentYear}
              handleMonthSelect={handleMonthSelect}
              years={years}
              handleYearSelect={handleYearSelect}
              monthsFull={monthsFull}
            />
          </View>

          {/*  Create Holiday button */}
          <View className="flex-row justify-around gap-2 mx-5">
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/screens/schedule/business/create-holiday/create-holiday"
                )
              }
              className="flex-1 py-3 px-8 border border-[#11111120] rounded-full bg-[#11293A]"
            >
              <Text className="text-center font-proximanova-semibold text-white">
                Create Holiday
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsHolidayModal(true)}
              className="flex-1 py-3 px-8 border border-[#11111120] rounded-full"
            >
              <Text className="text-center font-proximanova-semibold ">
                Import Holidays
              </Text>
            </TouchableOpacity>
          </View>

          {/* border */}
          <View className="border-b-4 border-[#F5F5F5] mt-5" />

          {/* All Holidays section */}
          <View className="mx-5 mt-5">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              All Holidays
            </Text>

            {holidaysLoading ? (
              <View className="py-6 items-center">
                <ActivityIndicator size="small" color="#4FB2F3" />
              </View>
            ) : visibleHolidays.length > 0 ? (
              visibleHolidays.map((item) => renderHolidaysCard(item))
            ) : (
              <Text className="mt-4 text-secondary dark:text-dark-secondary">
                No holidays found.
              </Text>
            )}
          </View>

          <LogoutDeleteModal
            visible={isModal}
            onClose={() => {
              setIsModal(false);
              setDeletingHolidayId(null);
            }}
            data={data}
            onConfirm={handleDeleteHoliday}
          />
          <ImportHolidayModal
            visible={isHolidayModal}
            onClose={() => setIsHolidayModal(false)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Calendar;

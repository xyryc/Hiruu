import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessScheduleMonthYearsPickerModal from "@/components/ui/modals/BusinessScheduleMonthYearsPickerModal";
import ImportHolidayModal from "@/components/ui/modals/ImportHolidayModal";
import LogoutDeletModal from "@/components/ui/modals/LogoutDeletModal";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const holidayTypes = [
  "Federal Holiday",
  "State Holiday",
  "Company Holiday",
  "Religious Holiday",
  "Custom Holiday",
];

const appliesToOptions = [
  "All Employees",
  "Full-Time Only",
  "Part-Time Only",
  "Specific Departments",
  "Management Only",
];

const Calendar = () => {
  const delImg = require("@/assets/images/holiday-modal.svg");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [currentViewDate, setCurrentViewDate] = useState(new Date()); // Currently viewing month/year
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"month" | "year">("month");
  const [selected, setSelected] = useState<number[]>([2, 16, 27]);
  const [holiday, setHolidays] = useState<number[]>([1, 15, 26]);
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

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  const currentYear = currentViewDate.getFullYear();
  const currentMonth = currentViewDate.getMonth();
  const today = new Date();

  const getDaysInMonth = (year: number, month: number) => {
    return new Array(new Date(year, month + 1, 0).getDate())
      .fill(null)
      .map((_, i) => i + 1);
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
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

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return selected.includes(day);
  };
  const isHoliday = (day: number) => {
    return holiday.includes(day);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const emptyDays = Array(firstDay).fill(null);

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i);

  const renderHolidaysCard = () => {
    return (
      <View className="mt-4 border border-[#EEEEEE] p-4 rounded-2xl flex-row justify-between items-center">
        <View className="flex-row gap-3">
          {/* calender card */}
          <View className="border border-[#E5F4FD] rounded-[10px] ">
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary text-center py-1 px-3 bg-[#E5F4FD] rounded-t-[10px]">
              2024
            </Text>
            <Text className="font-proximanova-semibold text-[#4FB2F3] mx-5 text-center">
              3
            </Text>
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary text-center  mb-1">
              Mar
            </Text>
          </View>
          {/* details */}
          <View className="">
            <Text className="font-proximanova-bold text-primary dark:text-dark-primary mt-2">
              Clean Monday
            </Text>
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary mt-3 capitalize">
              Holiday Type :{" "}
              <Text className="text-primary dark:text-dark-primary">
                national
              </Text>
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity onPress={() => setIsModal(true)}>
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
          <View className="my-4 w-[353px] mx-auto">
            {/* Header */}
            <View>
              {/* Days of Week */}
              <View className="flex-row justify-around">
                {daysOfWeek.map((day, index) => (
                  <Text
                    key={index}
                    className="font-proximanova-semibold text-[#4FB2F3] w-12 text-center"
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View className="flex-row flex-wrap mt-4">
                {/* Empty Days */}
                {emptyDays.map((_, index) => (
                  <View
                    key={`empty-${index}`}
                    className="w-9 h-9 mx-2.5 my-2.5 items-center justify-center rounded-full"
                  />
                ))}

                {/* Days in Month */}
                {daysInMonth.map((day) => (
                  <TouchableOpacity
                    key={day}
                    className={`w-9 h-9 mx-2.5 my-2.5 items-center justify-center rounded-full ${
                      isToday(day)
                        ? "bg-blue-500"
                        : isSelected(day)
                          ? "bg-[#E5F4FD]"
                          : ""
                    }`}
                  >
                    <Text
                      className={`${isToday(day) ? "text-white font-proximanova-semibold" : isHoliday(day) ? "text-red-500" : ""}`}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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

            {/* card */}
            {renderHolidaysCard()}
            {renderHolidaysCard()}
            {renderHolidaysCard()}
            {renderHolidaysCard()}
          </View>

          <LogoutDeletModal
            visible={isModal}
            onClose={() => setIsModal(false)}
            data={data}
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

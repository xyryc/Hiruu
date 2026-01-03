import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const UserCalenderShidulModal = ({ visible, onClose }: any) => {
  const handleDone = () => {
    onClose();
  };

  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"date" | "month" | "year">("date");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentViewDate.getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentViewDate.getFullYear()
  );
  const [holiday, setHolidays] = useState<number[]>([1, 15, 26]);

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
    setSelectedMonth(monthIndex);
    setCurrentViewDate(new Date(currentYear, monthIndex, 1));
    setViewMode("date");
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentViewDate(new Date(year, selectedMonth, 1));
    setViewMode("month");
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return selectedDate === day;
  };

  const isHoliday = (day: number) => {
    return holiday.includes(day);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const emptyDays = Array(firstDay).fill(null);

  const years = Array.from({ length: 12 }, (_, i) => 2015 + i);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView className="px-5 py-5">
            {/* Navigation Header */}
            <View className="flex-row justify-between items-center mb-5">
              <TouchableOpacity
                onPress={() => {
                  if (viewMode === "month") setViewMode("date");
                  else if (viewMode === "year") setViewMode("month");
                }}
                className="p-2"
              >
                {viewMode !== "date" && (
                  <Ionicons name="chevron-back" size={24} color="#000" />
                )}
              </TouchableOpacity>

              <View className="flex-row items-center gap-2 justify-center flex-1">
                <TouchableOpacity
                  onPress={() => setViewMode("month")}
                  className="items-center bg-[#E5F4FD] rounded-full py-2 px-4"
                >
                  <Text className="font-proximanova-regular text-lg text-primary">
                    {monthsFull[selectedMonth]}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setViewMode("year")}
                  className="flex-row items-center gap-1 bg-[#E5F4FD] rounded-full py-2 px-4"
                >
                  <Text className="font-proximanova-regular text-lg text-primary">
                    {selectedYear}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="black" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* DATE VIEW */}
              {viewMode === "date" && (
                <View className="px-2">
                  {/* Days of Week Header */}
                  <View className="flex-row">
                    {daysOfWeek.map((day, index) => (
                      <View key={index} className="flex-1 items-center py-2">
                        <Text className="font-proximanova-semibold text-[#4FB2F3]">
                          {day}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Grid */}
                  <View className="flex-row flex-wrap">
                    {/* Empty Days - same width as date cells */}
                    {emptyDays.map((_, index) => (
                      <View
                        key={`empty-${index}`}
                        style={{ width: "14.28%" }}
                        className="aspect-square items-center justify-center p-1"
                      />
                    ))}

                    {/* Days in Month */}
                    {daysInMonth.map((day) => (
                      <View
                        key={day}
                        style={{ width: "14.28%" }}
                        className="aspect-square items-center justify-center p-1"
                      >
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedDate(day);
                            onClose();
                          }}
                          className={`w-10 h-10 items-center justify-center rounded-full ${
                            isToday(day)
                              ? "bg-blue-500"
                              : isSelected(day)
                                ? "bg-[#E5F4FD]"
                                : ""
                          }`}
                        >
                          <Text
                            className={`font-proximanova-regular ${
                              isToday(day)
                                ? "text-white font-proximanova-semibold"
                                : isHoliday(day)
                                  ? "text-red-500"
                                  : "text-gray-800"
                            }`}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* MONTH VIEW */}
              {viewMode === "month" && (
                <View className="flex-row flex-wrap justify-between pb-5">
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={month}
                      onPress={() => handleMonthSelect(index)}
                      className={`w-[23%] mb-3 rounded-xl items-center ${
                        index === selectedMonth
                          ? "bg-blue-500"
                          : "border border-[#EEEEEE]"
                      }`}
                    >
                      <Text
                        className={`font-proximanova-semibold px-2 py-6 ${
                          index === selectedMonth
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* YEAR VIEW */}
              {viewMode === "year" && (
                <View className="flex-row flex-wrap justify-between pb-5">
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => handleYearSelect(year)}
                      className={`w-[23%] mb-3 rounded-xl items-center ${
                        year === selectedYear
                          ? "bg-blue-500"
                          : "border border-[#EEEEEE]"
                      }`}
                    >
                      <Text
                        className={`font-proximanova-semibold px-2 py-6 ${
                          year === selectedYear ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default UserCalenderShidulModal;

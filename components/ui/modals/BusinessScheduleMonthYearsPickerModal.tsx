import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessScheduleMonthYearsPickerModal = ({
  showPicker,
  setShowPicker,
  pickerMode,
  setPickerMode,
  months,
  currentMonth,
  currentYear,
  handleMonthSelect,
  years,
  handleYearSelect,
  monthsFull,
}: any) => {
  return (
    <Modal
      visible={showPicker}
      animationType="fade"
      transparent
      onRequestClose={() => {
        setShowPicker(false);
        setPickerMode("month");
      }}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center">
            <TouchableOpacity
              onPress={() => {
                setShowPicker(false);
                setPickerMode("month");
              }}
            >
              <View className="bg-black rounded-full p-2.5">
                <Ionicons name="close" size={33} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView className="px-5 py-5">
            <View className="flex-row justify-between items-center mb-5">
              {pickerMode === "year" && (
                <TouchableOpacity
                  onPress={() => setPickerMode("month")}
                  className="p-2"
                >
                  <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
              )}

              <View className="flex-row items-center gap-2 justify-center flex-1">
                <View className="items-center bg-[#E5F4FD] rounded-full py-2 px-4">
                  <Text className="font-proximanova-regular text-lg text-primary dark:text-dark-primary">
                    {pickerMode === "month"
                      ? monthsFull[currentMonth]
                      : "2015 - 2026"}{" "}
                  </Text>
                </View>

                {pickerMode === "month" && (
                  <TouchableOpacity
                    onPress={() => setPickerMode("year")}
                    className="flex-row items-center gap-1 bg-[#E5F4FD] rounded-full py-2 px-4"
                  >
                    <Text className="font-proximanova-regular text-lg text-primary dark:text-dark-primary">
                      {currentYear}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="black" />
                  </TouchableOpacity>
                )}
              </View>

              {pickerMode === "year" && <View className="w-8" />}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {pickerMode === "month" ? (
                <View className="flex-row flex-wrap justify-between pb-5">
                  {months.map((month: any, index: any) => (
                    <TouchableOpacity
                      key={month}
                      onPress={() => handleMonthSelect(index)}
                      className={`w-[23%]  mb-3 rounded-xl items-center ${
                        index === currentMonth
                          ? "bg-blue-500"
                          : "border border-[#EEEEEE]"
                      }`}
                    >
                      <Text
                        className={`font-proximanova-semibold text-primary dark:text-dark-primary px-2 py-6 ${
                          index === currentMonth
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="flex-row flex-wrap justify-between pb-5">
                  {years.map((year: any) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => handleYearSelect(year)}
                      className={`w-[23%]  mb-3 rounded-xl items-center ${
                        year === currentYear
                          ? "bg-blue-500"
                          : "border border-[#EEEEEE]"
                      }`}
                    >
                      <Text
                        className={`font-proximanova-semibold text-primary dark:text-dark-primary px-2 py-6 ${
                          year === currentYear ? "text-white" : "text-gray-700"
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

export default BusinessScheduleMonthYearsPickerModal;

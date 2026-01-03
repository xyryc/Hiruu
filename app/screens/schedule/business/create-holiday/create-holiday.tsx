import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import DatePicker from "@/components/ui/inputs/DatePicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

const CreateHoliday = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [holidayType, setHolidayType] = useState("Federal Holiday");
  const [appliesTo, setAppliesTo] = useState("All Employees");
  const [showHolidayDropdown, setShowHolidayDropdown] = useState(false);
  const [showAppliesToDropdown, setShowAppliesToDropdown] = useState(false);
  const hello = () => {
    console.log("hello");
  };
  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5">
          <ScreenHeader
            style={{ paddingTop: insets.top + 15, paddingBottom: 20 }}
            className=""
            onPressBack={() => router.back()}
            title="Create Holiday"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
          />
        </View>

        <ScrollView className="mt-6 mx-5 flex-1">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Report a Shift-related Issue
          </Text>
          <View className="mt-8">
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary text-sm">
              Holiday Title
            </Text>
            <TextInput
              className="border border-[#EEEEEE] p-3.5 rounded-[10px] mr-0.5 "
              placeholder="Holiday Title"
            />
          </View>
          <View className="mt-4">
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary text-sm">
              Select Dates
            </Text>
            <DatePicker className="mt-2.5" />
          </View>

          {/* select holly day */}

          <View className="py-5">
            {/* Holiday Type Section */}
            <View className="mb-6">
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary text-sm">
                Holiday Type
              </Text>

              <TouchableOpacity
                className="bg-white rounded-xl py-3 px-4 mt-4 flex-row justify-between items-center border border-gray-200 shadow-sm"
                onPress={() => {
                  setShowHolidayDropdown(!showHolidayDropdown);
                  setShowAppliesToDropdown(false);
                }}
              >
                <Text className="text-base text-gray-400" numberOfLines={1}>
                  {holidayType}
                </Text>
                <Ionicons
                  name={showHolidayDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>

              {showHolidayDropdown && (
                <View className="bg-white rounded-xl mt-2 border border-[#eeeeee] shadow-md overflow-hidden">
                  {holidayTypes.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`p-4 flex-row justify-between items-center ${
                        index !== holidayTypes.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                      onPress={() => {
                        setHolidayType(type);
                        setShowHolidayDropdown(false);
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        className={`text-base ${
                          holidayType === type
                            ? "text-blue-500 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {type}
                      </Text>
                      {holidayType === type && (
                        <Ionicons name="checkmark" size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Applies To Section */}
            <View className="mb-6">
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary text-sm">
                Applies To
              </Text>

              <TouchableOpacity
                className="bg-white rounded-xl px-4 py-3 mt-4 flex-row justify-between items-center border border-[#eeeeee] shadow-sm"
                onPress={() => {
                  setShowAppliesToDropdown(!showAppliesToDropdown);
                  setShowHolidayDropdown(false);
                }}
              >
                <Text className="text-base text-gray-400">{appliesTo}</Text>
                <Ionicons
                  name={showAppliesToDropdown ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>

              {showAppliesToDropdown && (
                <View className="bg-white rounded-xl mt-2 border border-gray-200 shadow-md overflow-hidden">
                  {appliesToOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`p-4 flex-row justify-between items-center ${
                        index !== appliesToOptions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                      onPress={() => {
                        setAppliesTo(option);
                        setShowAppliesToDropdown(false);
                      }}
                    >
                      <Text
                        className={`text-base ${
                          appliesTo === option
                            ? "text-blue-500 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </Text>
                      {appliesTo === option && (
                        <Ionicons name="checkmark" size={20} color="#007AFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        <PrimaryButton className="mx-5 my-10" title="Create Holiday" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateHoliday;

import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Dropdown from "@/components/ui/dropdown/DropDown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FilterShift = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const sortOptions = [
    { id: "employeeType", label: "Employee Type" },
    { id: "date", label: "Date" },
    { id: "requestType", label: "Request Type" },
  ];

  const requesrType = [
    { label: "Late Clock-In" },
    { label: "Late Entry" },
    { label: "Missed Clock-Out" },
    { label: "Overtime" },
    { label: "Auto Detected" },
  ];
  const status = [
    { label: "Approved" },
    { label: "Pending" },
    { label: "Declined" },
  ];

  const [selectedIssue, setSelectedIssue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const issues = [
    { label: "Missed Punch", value: "Missed Punch" },
    { label: "Late arrival", value: "Late arrival" },
    { label: "Early Departure", value: "Early Departure" },
    { label: "Forget to Tap", value: "Forget to Tap" },
    { label: "Network Issues", value: "Network Issues" },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "top", "bottom"]}
    >
      <ScreenHeader
        className="mt-2.5 mx-5"
        onPressBack={() => router.back()}
        title="Filter Request"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />
      <ScrollView showsVerticalScrollIndicator={false} className="mx-5 mt-8">
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
          Date From
        </Text>
        <DatePicker className="mt-2.5" />
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5">
          Date To
        </Text>
        <DatePicker className="mt-2.5" />
        <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
          Sort by
        </Text>

        {/* Sort Options with Radio Buttons */}
        <View className="flex-row justify-start gap-4 mt-4">
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedSort(option.id)}
              className={`flex-row mt-3 rounded-2xl`}
            >
              <View className="flex-row gap-2">
                <View
                  className={`h-5 w-5 border border-secondary rounded-full flex-row justify-center items-center ${selectedSort === option.id && "bg-[#11293A]"}`}
                >
                  {selectedSort === option.id && (
                    <MaterialIcons name="check" size={14} color="white" />
                  )}
                </View>
                <Text className="font-proximanova-regular  text-sm text-primary dark:text-dark-primary">
                  {option.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Request Type */}
        <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
          Request Type
        </Text>
        <View className="flex-row flex-wrap gap-x-2 gap-y-4 mt-4">
          {requesrType.map((request) => (
            <TouchableOpacity
              onPress={() => setSelectedType(request.label)}
              key={request.label}
              className={`px-4 py-3  rounded-full ${selectedType === request.label ? "bg-[#11293A]" : "border"} `}
            >
              <Text
                className={`font-proximanova-semibold text-sm ${selectedType === request.label ? "text-white" : "text-primary"}`}
              >
                {request.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reason Type */}

        <Dropdown
          label="Reason Type"
          placeholder="Select an issue"
          className="mt-8"
          fontSize={15}
          options={issues}
          value={selectedIssue}
          onSelect={setSelectedIssue}
        />

        {/* status Button */}
        <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
          Status
        </Text>
        <View className="flex-row flex-wrap gap-x-2 gap-y-4 mt-4">
          {status.map((request) => (
            <TouchableOpacity
              onPress={() => setSelectedStatus(request.label)}
              key={request.label}
              className={`px-4 py-3  rounded-full ${selectedStatus === request.label ? "bg-[#11293A]" : "border"} `}
            >
              <Text
                className={`font-proximanova-semibold text-sm ${selectedStatus === request.label ? "text-white" : "text-primary"}`}
              >
                {request.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton title="Apply Filters" className="mt-10" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FilterShift;

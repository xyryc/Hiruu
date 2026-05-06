import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import DatePicker from "@/components/ui/inputs/DatePicker";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FilterShift = () => {
  const params = useLocalSearchParams<{
    startDate?: string;
    endDate?: string;
    sort?: string;
    status?: string;
    type?: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const parseDate = (value?: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const [dateFrom, setDateFrom] = useState<Date | null>(
    parseDate(typeof params.startDate === "string" ? params.startDate : undefined)
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    parseDate(typeof params.endDate === "string" ? params.endDate : undefined)
  );
  const [selectedSort, setSelectedSort] = useState<string>(
    typeof params.sort === "string" ? params.sort : ""
  );
  const [selectedType, setSelectedType] = useState<string>(
    typeof params.type === "string" ? params.type : ""
  );
  const sortOptions = [
    { id: "createdAt:desc", label: "Newest First" },
    { id: "createdAt:asc", label: "Oldest First" },
    { id: "type:asc", label: "Request Type" },
  ];

  const requestTypeOptions = [
    { label: "Leave Request", value: "leave_request" },
    { label: "Overtime Request", value: "overtime_request" },
    { label: "Manual Attendance", value: "manual_attendance" },
    { label: "Schedule Change", value: "schedule_change" },
    { label: "Early Leave", value: "early_leave" },
    { label: "Late Arrival", value: "late_arrival" },
  ];
  const statusOptions = [
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Declined", value: "rejected" },
  ];

  const [selectedStatus, setSelectedStatus] = useState<string>(
    typeof params.status === "string" ? params.status : ""
  );
  const [isApplying, setIsApplying] = useState(false);
  const toIso = (date?: Date | null) => (date ? date.toISOString() : undefined);
  const hasAnyFilter = useMemo(
    () => Boolean(selectedSort || selectedType || selectedStatus || dateFrom || dateTo),
    [dateFrom, dateTo, selectedSort, selectedStatus, selectedType]
  );

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
        <DatePicker className="mt-2.5" value={dateFrom || undefined} onChange={setDateFrom} />
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5">
          Date To
        </Text>
        <DatePicker className="mt-2.5" value={dateTo || undefined} onChange={setDateTo} />
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
          {requestTypeOptions.map((request) => (
            <TouchableOpacity
              onPress={() => setSelectedType(request.value)}
              key={request.value}
              className={`px-4 py-3  rounded-full ${selectedType === request.value ? "bg-[#11293A]" : "border"} `}
            >
              <Text
                className={`font-proximanova-semibold text-sm ${selectedType === request.value ? "text-white" : "text-primary"}`}
              >
                {request.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* status Button */}
        <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary mt-8">
          Status
        </Text>
        <View className="flex-row flex-wrap gap-x-2 gap-y-4 mt-4">
          {statusOptions.map((request) => (
            <TouchableOpacity
              onPress={() => setSelectedStatus(request.value)}
              key={request.value}
              className={`px-4 py-3  rounded-full ${selectedStatus === request.value ? "bg-[#11293A]" : "border"} `}
            >
              <Text
                className={`font-proximanova-semibold text-sm ${selectedStatus === request.value ? "text-white" : "text-primary"}`}
              >
                {request.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          title="Apply Filters"
          className="mt-10"
          disabled={!hasAnyFilter || isApplying}
          loading={isApplying}
          onPress={() => {
            const nextParams = {
              ...(toIso(dateFrom) ? { startDate: toIso(dateFrom) } : {}),
              ...(toIso(dateTo) ? { endDate: toIso(dateTo) } : {}),
              ...(selectedSort ? { sort: selectedSort } : {}),
              ...(selectedStatus ? { status: selectedStatus } : {}),
              ...(selectedType ? { type: selectedType } : {}),
            };
            console.log("[ShiftFilter] apply payload", nextParams);
            setIsApplying(true);
            router.replace({
              pathname: "/screens/home/team/shift-requests",
              params: nextParams,
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FilterShift;

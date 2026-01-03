import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import ExperienceLevel from "@/components/ui/inputs/ExperienceLevel";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FindJobFilters = () => {
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [postCode, setPostCode] = useState("885522");
  const [distance, setDistance] = useState(25);
  const [shiftType, setShiftType] = useState("day");
  const [salaryRange, setSalaryRange] = useState(5000);
  const [experiences, setExperiences] = useState({
    cashier: 5,
    receptionist: 5,
  });
  const router = useRouter();

  //   sorty by
  const sortOptions = [
    "Newest",
    "Most Experienced",
    "Highest Rating",
    "Best Fit",
  ];
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionPress = (option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  };
  const isSelected = (option: string) => {
    return selectedOption === option;
  };

  // shift type
  const shiftOptions = ["Day Shift", "Night Shift", "Weekend"];
  const [selectedShiftOption, setSelectedShiftOption] = useState<string | null>(
    null
  );

  const handleShiftOptionPress = (option: string) => {
    setSelectedShiftOption((prev) => (prev === option ? null : option));
  };

  const isSelectedShift = (option: string) => {
    return selectedShiftOption === option;
  };

  //   job type
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const badgeOptions = [
    "Full Time",
    "Part Time",
    "Hourly",
    "Contract",
    "Freelance",
    "Internship",
    "On-site",
    "Remote",
    "Hybrid",
  ];
  const handleBadgePress = (badgeTitle: string) => {
    setSelectedBadges((prev) => {
      if (prev.includes(badgeTitle)) {
        // Deselect if already selected
        return prev.filter((title) => title !== badgeTitle);
      } else {
        // Select new badge
        return [...prev, badgeTitle];
      }
    });
  };
  const isBadgeSelected = (badgeTitle: string) => {
    return selectedBadges.includes(badgeTitle);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader title="Hiring Filter" className="mx-5" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Verified Candidates Only */}
        <View className="mt-7 flex-row justify-between items-center py-5 border border-[#EEEEEE] p-4 rounded-xl">
          <Text className="text-[#4FB2F3] font-proximanova-semibold">
            Verified Candidates only
          </Text>
          <TouchableOpacity
            onPress={() => setVerifiedOnly(!verifiedOnly)}
            className={`w-12 h-7 rounded-full p-1 ${
              verifiedOnly ? "bg-[#34C759]" : "bg-gray-300"
            }`}
            style={{ justifyContent: "center" }}
          >
            <View
              className={`w-5 h-5 rounded-full bg-white ${
                verifiedOnly ? "self-end" : "self-start"
              }`}
            />
          </TouchableOpacity>
        </View>

        {/* Sort by */}
        <View className="mt-5">
          <Text className="text-base font-proximanova-semibold text-primary mb-4">
            Sort by
          </Text>

          <View className="flex-row flex-wrap gap-2.5">
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="flex-row items-center justify-between gap-1.5"
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                {isSelected(option) ? (
                  <Ionicons name="checkmark-circle" size={24} color="#11293A" />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color="#7A7A7A" />
                )}

                <Text className="text-sm font-proximanova-regular">
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View className="mt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-4">
            Location
          </Text>

          <View className="flex-row items-center bg-white border border-[#EEEEEE] rounded-lg px-4 py-3">
            <TextInput
              value={postCode}
              onChangeText={setPostCode}
              placeholder="Post Code"
              className="flex-1 font-proximanova-semibold text-sm"
            />
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color="#666"
            />
          </View>
          <Slider
            value={distance}
            onValueChange={setDistance}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#4FB2F3"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#EEEEEE"
            className="mt-1"
          />
          <Text className="text-sm font-proximanova-regular text-secondary mt-1">
            5km From Post Code
          </Text>
        </View>

        {/* Job Role */}
        <View className="pt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-4">
            Job Role
          </Text>

          <TextInput
            placeholder="Bartender"
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-proximanova-regular"
          />
        </View>

        {/* Shift Type */}
        <View className="py-5 border-b border-gray-100">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            Shift Type
          </Text>

          <View className="flex-row gap-2.5">
            {shiftOptions.map((option) => (
              <TouchableOpacity
                key={option}
                className="flex-row items-center justify-between gap-1.5"
                onPress={() => handleShiftOptionPress(option)}
                activeOpacity={0.7}
              >
                {isSelectedShift(option) ? (
                  <Ionicons name="checkmark-circle" size={24} color="#11293A" />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color="#7A7A7A" />
                )}

                <Text className="text-sm font-proximanova-regular">
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Availability*/}
        <View className="mt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            Availability
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {badgeOptions.map((badgeTitle) => (
              <SimpleStatusBadge
                key={badgeTitle}
                title={badgeTitle}
                className={`border ${
                  isBadgeSelected(badgeTitle) ? "" : "border-[#EEEEEE]"
                }`}
                bgColor={isBadgeSelected(badgeTitle) ? "#11293A" : "#FFFFFF"}
                textColor={isBadgeSelected(badgeTitle) ? "#FFFFFF" : "#111111"}
                onPress={() => handleBadgePress(badgeTitle)}
              />
            ))}
          </View>
        </View>

        {/* Salary Range */}
        <View className="py-5 border-b border-gray-100">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            Salary Range
          </Text>
          <Slider
            value={salaryRange}
            onValueChange={setSalaryRange}
            minimumValue={0}
            maximumValue={10000}
            minimumTrackTintColor="#4FB2F3"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#EEEEEE"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs font-proximanova-regular text-gray-500">
              $0
            </Text>
            <Text className="text-xs font-proximanova-regular text-gray-500">
              ${salaryRange.toFixed(0)}
            </Text>
            <Text className="text-xs font-proximanova-regular text-gray-500">
              $10000
            </Text>
          </View>
        </View>

        {/* Experience Level */}
        <View className="py-5">
          <ExperienceLevel />
        </View>
        {/* <View className="flex-row justify-between border border-[#eeeeee] items-center p-4 rounded-xl">
          <Text>Available Working Days</Text>
          <SimpleLineIcons name="arrow-down" size={16} color="black" />
        </View> */}
        <WeeklySchedule business={true} />
      </ScrollView>

      {/* button */}
      <View className="mx-5 pt-5">
        <PrimaryButton title="Apply Filters" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
};

export default FindJobFilters;

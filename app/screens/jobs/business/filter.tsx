import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import RoleSlotsInput from "@/components/ui/inputs/RoleSlotsInput";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WeeklyAvailabilityItem = {
  day: string;
  isOpen: boolean;
  startTime?: string;
  endTime?: string;
};

const SHIFT_OPTIONS = [
  { label: "Day Shift", value: "day_shift" },
  { label: "Night Shift", value: "night_shift" },
  { label: "Weekend", value: "weekend" },
] as const;

const AVAILABILITY_BADGE_OPTIONS = [
  { label: "Full Time", value: "full_time" },
  { label: "Part Time", value: "part_time" },
  { label: "Hourly", value: "hourly" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
  { label: "On-site", value: "onsite" },
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
] as const;

const normalizeRoleIds = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }

  if (typeof value === "string" && value.length > 0) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const FindJobFilters = () => {
  const getRoles = useBusinessStore((state) => state.getRoles);
  const businessCandidateFilters = useJobStore((state) => state.businessCandidateFilters);
  const setBusinessCandidateFilters = useJobStore((state) => state.setBusinessCandidateFilters);
  const storedPreferredRoleIds = normalizeRoleIds(businessCandidateFilters.preferredRoleIds);
  const [verifiedOnly, setVerifiedOnly] = useState(Boolean(businessCandidateFilters.verifiedOnly));
  const [locationText, setLocationText] = useState(businessCandidateFilters.location || "");
  const [salaryRange, setSalaryRange] = useState(
    Number.isFinite(Number(businessCandidateFilters.salaryMax))
      ? Number(businessCandidateFilters.salaryMax)
      : 5000
  );
  const [isSalaryRangeTouched, setIsSalaryRangeTouched] = useState(
    Number.isFinite(Number(businessCandidateFilters.salaryMax)) &&
      Number(businessCandidateFilters.salaryMax) !== 5000
  );
  const [roleOptions, setRoleOptions] = useState<{ id: string; name: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [addRoleTrigger, setAddRoleTrigger] = useState(0);
  const [experienceSlots, setExperienceSlots] = useState<
    { roleId: string; roleName: string; count: number }[]
  >(
    Array.isArray(businessCandidateFilters.experienceRequirements)
      ? businessCandidateFilters.experienceRequirements.map((item, index) => ({
          roleId: storedPreferredRoleIds[index] || "",
          roleName: item.role,
          count: item.minYears,
        }))
      : []
  );
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityItem[]>(
    Array.isArray(businessCandidateFilters.workingDaySlots) &&
    businessCandidateFilters.workingDaySlots.length > 0
      ? businessCandidateFilters.workingDaySlots.map((slot) => ({
          day: slot.day,
          isOpen: true,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
      : Array.isArray(businessCandidateFilters.availableDays)
        ? businessCandidateFilters.availableDays.map((day) => ({
            day: String(day),
            isOpen: true,
            startTime: "09:00",
            endTime: "17:00",
          }))
        : []
  );
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        if (isMounted) {
          setRolesLoading(true);
        }
        const data = await getRoles();
        if (!isMounted) return;

        const normalized = (Array.isArray(data) ? data : [])
          .map((item: any) => ({
            id: item?.id || item?.roleId || item?.role?.id || "",
            name: item?.name || item?.role?.name || "",
          }))
          .filter((item: any) => item.id && item.name);

        setRoleOptions(normalized);
      } catch {
        if (isMounted) {
          setRoleOptions([]);
        }
      } finally {
        if (isMounted) {
          setRolesLoading(false);
        }
      }
    };

    loadRoles();
    return () => {
      isMounted = false;
    };
  }, [getRoles]);

  useEffect(() => {
    if (!selectedRoleToAdd?.id) return;

    const alreadyExists = experienceSlots.some(
      (slot) =>
        slot.roleId === selectedRoleToAdd.id ||
        slot.roleName.trim().toLowerCase() ===
          selectedRoleToAdd.name.trim().toLowerCase()
    );

    if (!alreadyExists) {
      setAddRoleTrigger((prev) => prev + 1);
    }
  }, [experienceSlots, selectedRoleToAdd]);

  useEffect(() => {
    if (roleOptions.length === 0) return;

    setExperienceSlots((prev) => {
      const next = prev.map((slot) => {
        const matchedRole = roleOptions.find(
          (role) => role.name.trim().toLowerCase() === slot.roleName.trim().toLowerCase()
        );

        if (!matchedRole) {
          return slot;
        }

        if (slot.roleId === matchedRole.id) {
          return slot;
        }

        return {
          ...slot,
          roleId: matchedRole.id,
        };
      });

      const isSame = prev.every(
        (slot, index) =>
          slot.roleId === next[index]?.roleId &&
          slot.roleName === next[index]?.roleName &&
          slot.count === next[index]?.count
      );

      return isSame ? prev : next;
    });
  }, [roleOptions]);

  //   sorty by
  const sortOptions = [
    "Newest",
    "Most Experienced",
    "Highest Rating",
    "Best Fit",
  ];
  const sortValueToLabel: Record<string, string> = {
    newest: "Newest",
    most_experience: "Most Experienced",
    highest_rating: "Highest Rating",
    best_fit: "Best Fit",
  };
  const sortLabelToValue: Record<string, "newest" | "most_experience" | "highest_rating" | "best_fit"> = {
    Newest: "newest",
    "Most Experienced": "most_experience",
    "Highest Rating": "highest_rating",
    "Best Fit": "best_fit",
  };
  const [selectedOption, setSelectedOption] = useState<string | null>(
    businessCandidateFilters.sortBy
      ? sortValueToLabel[businessCandidateFilters.sortBy]
      : null
  );

  const handleOptionPress = (option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  };
  const isSelected = (option: string) => {
    return selectedOption === option;
  };

  const [selectedShiftTypes, setSelectedShiftTypes] = useState<string[]>(
    Array.isArray(businessCandidateFilters.shiftTypes)
      ? businessCandidateFilters.shiftTypes
      : typeof businessCandidateFilters.shiftTypes === "string" &&
          businessCandidateFilters.shiftTypes.length > 0
        ? businessCandidateFilters.shiftTypes.split(",")
        : []
  );

  const handleShiftOptionPress = (value: string) => {
    setSelectedShiftTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const isSelectedShift = (value: string) => {
    return selectedShiftTypes.includes(value);
  };

  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [showWorkingDays, setShowWorkingDays] = useState(false);
  const handleBadgePress = (badgeValue: string) => {
    setSelectedBadges((prev) => {
      if (prev.includes(badgeValue)) {
        return prev.filter((value) => value !== badgeValue);
      } else {
        return [...prev, badgeValue];
      }
    });
  };
  const isBadgeSelected = (badgeValue: string) => {
    return selectedBadges.includes(badgeValue);
  };

  useEffect(() => {
    const initialBadges = Array.isArray(businessCandidateFilters.availabilityTypes)
      ? businessCandidateFilters.availabilityTypes
      : typeof businessCandidateFilters.availabilityTypes === "string" &&
          businessCandidateFilters.availabilityTypes.length > 0
        ? businessCandidateFilters.availabilityTypes.split(",")
        : [];

    setSelectedBadges(
      initialBadges.filter((item): item is string =>
        AVAILABILITY_BADGE_OPTIONS.some((badge) => badge.value === item)
      )
    );
  }, [businessCandidateFilters.availabilityTypes]);

  const handleApplyFilters = () => {
    const availabilityTypes = selectedBadges.filter(Boolean);

    const availableDays = weeklyAvailability
      .filter((item) => item.isOpen)
      .map((item) => item.day.toLowerCase());

    const workingDaySlots = weeklyAvailability
      .filter((item) => item.isOpen && item.startTime && item.endTime)
      .map((item) => ({
        day: item.day.toLowerCase(),
        startTime: String(item.startTime),
        endTime: String(item.endTime),
      }));
    const preferredRoleIds = experienceSlots
      .map((slot) => slot.roleId)
      .filter((roleId) => roleOptions.some((role) => role.id === roleId));

    setBusinessCandidateFilters({
      verifiedOnly: verifiedOnly ? true : undefined,
      preferredRoleIds:
        preferredRoleIds.length > 0 ? preferredRoleIds : undefined,
      location: locationText.trim() || undefined,
      salaryMax:
        isSalaryRangeTouched &&
        Math.round(salaryRange) > 0 &&
        Math.round(salaryRange) !== 5000
          ? Math.round(salaryRange)
          : undefined,
      sortBy: selectedOption ? sortLabelToValue[selectedOption] : undefined,
      availabilityTypes: availabilityTypes.length > 0 ? availabilityTypes : undefined,
      shiftTypes: selectedShiftTypes.length > 0 ? selectedShiftTypes : undefined,
      availableDays: availableDays.length > 0 ? availableDays : undefined,
      workingDaySlots: workingDaySlots.length > 0 ? workingDaySlots : undefined,
      experienceRequirements:
        experienceSlots.length > 0
          ? experienceSlots.map((slot) => ({
              role: slot.roleName,
              minYears: slot.count,
            }))
          : undefined,
    });

    console.log(
      "[HiringFilter] applied filters:",
      JSON.stringify(
        {
          verifiedOnly: verifiedOnly ? true : undefined,
          preferredRoleIds:
            preferredRoleIds.length > 0 ? preferredRoleIds : undefined,
          location: locationText.trim() || undefined,
          salaryMax:
            isSalaryRangeTouched &&
            Math.round(salaryRange) > 0 &&
            Math.round(salaryRange) !== 5000
              ? Math.round(salaryRange)
              : undefined,
          sortBy: selectedOption ? sortLabelToValue[selectedOption] : undefined,
          availabilityTypes: availabilityTypes.length > 0 ? availabilityTypes : undefined,
          shiftTypes: selectedShiftTypes.length > 0 ? selectedShiftTypes : undefined,
          availableDays: availableDays.length > 0 ? availableDays : undefined,
          workingDaySlots: workingDaySlots.length > 0 ? workingDaySlots : undefined,
          experienceRequirements:
            experienceSlots.length > 0
              ? experienceSlots.map((slot) => ({
                  role: slot.roleName,
                  minYears: slot.count,
                }))
              : undefined,
        },
        null,
        2
      )
    );

    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title="Hiring Filter"
        className="mx-5"
        onPressBack={() => router.back()}
      />

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
              value={locationText}
              onChangeText={setLocationText}
              placeholder="Location"
              className="flex-1 font-proximanova-semibold text-sm"
            />
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={24}
              color="#666"
            />
          </View>
        </View>

        {/* Shift Type */}
        <View className="py-5 border-b border-gray-100">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            Shift Preference
          </Text>

          <View className="flex-row flex-wrap gap-2.5">
            {SHIFT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                className="flex-row items-center justify-between gap-1.5"
                onPress={() => handleShiftOptionPress(option.value)}
                activeOpacity={0.7}
              >
                {isSelectedShift(option.value) ? (
                  <Ionicons name="checkmark-circle" size={24} color="#11293A" />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color="#7A7A7A" />
                )}

                <Text className="text-sm font-proximanova-regular">
                  {option.label}
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
            {AVAILABILITY_BADGE_OPTIONS.map((badge) => (
              <SimpleStatusBadge
                key={badge.value}
                title={badge.label}
                className={`border ${
                  isBadgeSelected(badge.value) ? "" : "border-[#EEEEEE]"
                }`}
                bgColor={isBadgeSelected(badge.value) ? "#11293A" : "#FFFFFF"}
                textColor={isBadgeSelected(badge.value) ? "#FFFFFF" : "#111111"}
                onPress={() => handleBadgePress(badge.value)}
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
            onValueChange={(value) => {
              setSalaryRange(value);
              setIsSalaryRangeTouched(true);
            }}
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
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            Experience Level
          </Text>
          <Text className="text-sm font-proximanova-regular text-secondary mb-2">
            Select a role first, then set the minimum years of experience.
          </Text>
          <View className="border border-[#EEEEEE] rounded-xl px-3 pt-1 pb-3 bg-white">
            <Text className="mt-3 text-sm font-proximanova-semibold text-primary">
              Select Role
            </Text>
            <RoleSelector
              className="mt-1"
              roles={roleOptions}
              loading={rolesLoading}
              selectedRole={selectedRoleToAdd}
              placeholder="Choose a role"
              onSelectRole={(role) => setSelectedRoleToAdd(role)}
            />
            {selectedRoleToAdd?.name ? (
              <Text className="text-xs font-proximanova-regular text-[#4FB2F3] mt-1">
                Selected: {selectedRoleToAdd.name}
              </Text>
            ) : null}
          </View>
          <RoleSlotsInput
            titleHeight
            selectedRoleToAdd={selectedRoleToAdd}
            addRoleTrigger={addRoleTrigger}
            initialRoleSlots={experienceSlots}
            onRoleSlotsChange={setExperienceSlots}
            onPressAddRole={() => {
              if (selectedRoleToAdd?.id) {
                setAddRoleTrigger((prev) => prev + 1);
              }
            }}
          />
        </View>
        <View className="pb-5">
          {!showWorkingDays ? (
            <View className="flex-row justify-between border border-[#EEEEEE] items-center p-4 rounded-xl">
              <Text className="text-base font-proximanova-semibold text-primary">
                Available Working Days
              </Text>
              <TouchableOpacity
                className="h-9 w-9 items-center justify-center"
                activeOpacity={0.8}
                onPress={() => setShowWorkingDays(true)}
              >
                <Entypo name="chevron-thin-down" size={16} color="black" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="border border-[#EEEEEE] rounded-xl bg-white p-4">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-xl font-proximanova-semibold text-primary">
                  Available Working Days
                </Text>
                <TouchableOpacity
                  className="h-9 w-9 items-center justify-center"
                  activeOpacity={0.8}
                  onPress={() => setShowWorkingDays(false)}
                >
                  <Entypo name="chevron-thin-up" size={16} color="black" />
                </TouchableOpacity>
              </View>

              <WeeklySchedule
                business={true}
                showBusinessHeader={false}
                borderless
                availability={weeklyAvailability}
                onChange={setWeeklyAvailability}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* button */}
      <View className="mx-5 pt-5">
        <PrimaryButton title="Apply Filters" onPress={handleApplyFilters} />
      </View>
    </SafeAreaView>
  );
};

export default FindJobFilters;

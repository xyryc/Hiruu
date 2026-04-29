import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import RoleSlotsInput from "@/components/ui/inputs/RoleSlotsInput";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { Entypo, Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type WeeklyAvailabilityItem = {
  day: string;
  isOpen: boolean;
  startTime?: string;
  endTime?: string;
};

type LocationOption = {
  label: string;
  value: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  city?: string;
  state?: string;
  country?: string;
};

const CLOSED_WEEKLY_AVAILABILITY: WeeklyAvailabilityItem[] = [
  { day: "monday", isOpen: false },
  { day: "tuesday", isOpen: false },
  { day: "wednesday", isOpen: false },
  { day: "thursday", isOpen: false },
  { day: "friday", isOpen: false },
  { day: "saturday", isOpen: false },
  { day: "sunday", isOpen: false },
];

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const ADDRESS_MAX_LENGTH = 200;

const AVAILABILITY_BADGE_OPTIONS = [
  { labelKey: "user.jobs.postJob.options.fullTime", value: "full_time" },
  { labelKey: "user.jobs.postJob.options.partTime", value: "part_time" },
  { labelKey: "user.jobs.postJob.options.hourly", value: "hourly" },
  { labelKey: "user.jobs.postJob.options.contract", value: "contract" },
  { labelKey: "user.jobs.postJob.options.internship", value: "internship" },
  { labelKey: "user.jobs.postJob.options.onsite", value: "onsite" },
  { labelKey: "user.jobs.postJob.options.remote", value: "remote" },
  { labelKey: "user.jobs.postJob.options.hybrid", value: "hybrid" },
] as const;

const FindJobFilters = () => {
  const { t } = useTranslation();
  const getRoles = useBusinessStore((state) => state.getRoles);
  const businessCandidateFilters = useJobStore((state) => state.businessCandidateFilters);
  const setBusinessCandidateFilters = useJobStore((state) => state.setBusinessCandidateFilters);
  const [verifiedOnly, setVerifiedOnly] = useState(Boolean(businessCandidateFilters.verifiedOnly));
  const [locationSearch, setLocationSearch] = useState(
    businessCandidateFilters.location || ""
  );
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocationOption, setSelectedLocationOption] = useState<LocationOption | null>(
    typeof businessCandidateFilters.location === "string" &&
      typeof businessCandidateFilters.latitude === "number" &&
      typeof businessCandidateFilters.longitude === "number"
      ? {
        label: businessCandidateFilters.location,
        value: businessCandidateFilters.location,
        latitude: businessCandidateFilters.latitude,
        longitude: businessCandidateFilters.longitude,
      }
      : null
  );
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    typeof businessCandidateFilters.latitude === "number" &&
      typeof businessCandidateFilters.longitude === "number"
      ? {
        latitude: businessCandidateFilters.latitude,
        longitude: businessCandidateFilters.longitude,
      }
      : null
  );
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const hasShownGeoapifyMissingKey = useRef(false);
  const [distance, setDistance] = useState(
    Number.isFinite(Number(businessCandidateFilters.maxDistanceKm))
      ? Number(businessCandidateFilters.maxDistanceKm)
      : 25
  );
  const [isDistanceTouched, setIsDistanceTouched] = useState(
    Number.isFinite(Number(businessCandidateFilters.maxDistanceKm))
  );
  const [salaryMinRange, setSalaryMinRange] = useState(
    Number.isFinite(Number(businessCandidateFilters.salaryMin))
      ? Number(businessCandidateFilters.salaryMin)
      : 0
  );
  const [salaryMaxRange, setSalaryMaxRange] = useState(
    Number.isFinite(Number(businessCandidateFilters.salaryMax))
      ? Number(businessCandidateFilters.salaryMax)
      : 100
  );
  const [isSalaryRangeTouched, setIsSalaryRangeTouched] = useState(
    Number.isFinite(Number(businessCandidateFilters.salaryMin)) ||
    Number.isFinite(Number(businessCandidateFilters.salaryMax)) &&
    Number(businessCandidateFilters.salaryMax) !== 100
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
      ? businessCandidateFilters.experienceRequirements.map((item) => ({
        roleId: item.roleId || "",
        roleName: item.role || "",
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
      : CLOSED_WEEKLY_AVAILABILITY
  );
  const router = useRouter();
  const handleSelectLocation = (item: LocationOption) => {
    const trimmedLabel = item.label.slice(0, ADDRESS_MAX_LENGTH);
    setLocationSearch(trimmedLabel);
    setSelectedLocationOption(item);
    setSelectedCoords({
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setLocationOptions([item]);
    setIsLocationFocused(false);
  };

  const handleClearLocation = () => {
    setLocationSearch("");
    setSelectedLocationOption(null);
    setSelectedCoords(null);
    setLocationOptions([]);
    setIsLocationFocused(false);
  };

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
    if (!locationSearch || locationSearch.trim().length < 3) {
      setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
      setIsSearchingLocation(false);
      return;
    }

    if (!GEOAPIFY_API_KEY) {
      setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
      setIsSearchingLocation(false);
      if (!hasShownGeoapifyMissingKey.current) {
        hasShownGeoapifyMissingKey.current = true;
        toast.error(t("user.jobs.filters.geoapifyKeyMissing"));
      }
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const query = encodeURIComponent(locationSearch.trim());
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&limit=8&apiKey=${GEOAPIFY_API_KEY}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Geoapify request failed: ${response.status}`);
        }

        const result = await response.json();
        const features = Array.isArray(result?.features) ? result.features : [];
        const nextOptions: LocationOption[] = features
          .map((item: any) => {
            const props = item?.properties || {};
            const coordinates = Array.isArray(item?.geometry?.coordinates)
              ? item.geometry.coordinates
              : [];
            const longitude = Number(coordinates[0]);
            const latitude = Number(coordinates[1]);
            const label =
              props.formatted ||
              [props.address_line1, props.address_line2].filter(Boolean).join(", ");

            if (!label || Number.isNaN(latitude) || Number.isNaN(longitude)) {
              return null;
            }

            return {
              label,
              value: label,
              latitude,
              longitude,
              placeId:
                props.place_id ||
                props.datasource?.raw?.place_id ||
                props.datasource?.raw?.osm_id?.toString?.(),
              city: props.city || props.county || props.suburb,
              state: props.state || props.state_code,
              country: props.country,
            };
          })
          .filter(Boolean) as LocationOption[];

        const uniqueByLabel = Array.from(
          new Map(nextOptions.map((item) => [item.label, item])).values()
        );

        if (selectedLocationOption) {
          setLocationOptions(
            Array.from(
              new Map(
                [selectedLocationOption, ...uniqueByLabel].map((item) => [
                  item.label,
                  item,
                ])
              ).values()
            )
          );
        } else {
          setLocationOptions(uniqueByLabel);
        }
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          setLocationOptions(selectedLocationOption ? [selectedLocationOption] : []);
          toast.error(t("user.jobs.filters.failedToFetchLocationSuggestions"));
        }
      } finally {
        setIsSearchingLocation(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [locationSearch, selectedLocationOption, t]);

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

  const [selectedShiftTypes] = useState<string[]>(
    Array.isArray(businessCandidateFilters.shiftTypes)
      ? businessCandidateFilters.shiftTypes
      : typeof businessCandidateFilters.shiftTypes === "string" &&
        businessCandidateFilters.shiftTypes.length > 0
        ? businessCandidateFilters.shiftTypes.split(",")
        : []
  );

  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [showWorkingDays, setShowWorkingDays] = useState(false);

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
    const normalizedLocation = locationSearch.trim() || undefined;
    const hasSelectedCoords =
      typeof selectedCoords?.latitude === "number" &&
      typeof selectedCoords?.longitude === "number";
    const normalizedRole = experienceSlots[0]?.roleName?.trim() || undefined;

    const workingDaySlots = weeklyAvailability
      .filter((item) => item.isOpen && item.startTime && item.endTime)
      .map((item) => ({
        day: item.day.toLowerCase(),
        startTime: String(item.startTime),
        endTime: String(item.endTime),
      }));
    const nextFilters = {
      verifiedOnly: verifiedOnly ? true : undefined,
      preferredRoleIds: undefined,
      role: normalizedRole,
      maxDistanceKm:
        hasSelectedCoords && isDistanceTouched ? Math.round(distance) : undefined,
      location: normalizedLocation,
      latitude: hasSelectedCoords ? selectedCoords.latitude : undefined,
      longitude: hasSelectedCoords ? selectedCoords.longitude : undefined,
      salaryMin:
        isSalaryRangeTouched && Math.round(salaryMinRange) > 0
          ? Math.round(salaryMinRange)
          : undefined,
      salaryMax:
        isSalaryRangeTouched &&
          Math.round(salaryMaxRange) > 0 &&
          Math.round(salaryMaxRange) !== 100
          ? Math.round(salaryMaxRange)
          : undefined,
      sortBy: selectedOption ? sortLabelToValue[selectedOption] : undefined,
      availabilityTypes: availabilityTypes.length > 0 ? availabilityTypes : undefined,
      shiftTypes: selectedShiftTypes.length > 0 ? selectedShiftTypes : undefined,
      availableDays: undefined,
      workingDaySlots: workingDaySlots.length > 0 ? workingDaySlots : undefined,
      experienceRequirements:
        experienceSlots.length > 0
          ? experienceSlots.map((slot) => ({
            roleId: slot.roleId || undefined,
            role: slot.roleName,
            minYears: slot.count,
          }))
          : undefined,
    };

    setBusinessCandidateFilters(nextFilters);

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
        title={t("user.jobs.filters.hiringFilter")}
        className="mx-5"
        onPressBack={() => router.back()}
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Verified Candidates Only */}
        <View className="mt-7 flex-row justify-between items-center py-5 border border-[#EEEEEE] p-4 rounded-xl">
          <Text className="text-[#4FB2F3] font-proximanova-semibold">
            {t("user.jobs.filters.verifiedCandidatesOnly")}
          </Text>
          <TouchableOpacity
            onPress={() => setVerifiedOnly(!verifiedOnly)}
            className={`w-12 h-7 rounded-full p-1 ${verifiedOnly ? "bg-[#34C759]" : "bg-gray-300"
              }`}
            style={{ justifyContent: "center" }}
          >
            <View
              className={`w-5 h-5 rounded-full bg-white ${verifiedOnly ? "self-end" : "self-start"
                }`}
            />
          </TouchableOpacity>
        </View>

        {/* Sort by */}
        <View className="mt-5">
          <Text className="text-base font-proximanova-semibold text-primary mb-4">
            {t("user.jobs.filters.sortBy")}
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
                  {t(`user.jobs.filters.sortOptions.${option.toLowerCase().replace(" ", "_")}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location */}
        <View className="mt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-4">
            {t("user.jobs.filters.location")}
          </Text>

          <View className="flex-row items-center bg-white border border-[#EEEEEE] rounded-[10px]">
            <TextInput
              value={locationSearch}
              onFocus={() => {
                if (!selectedLocationOption) {
                  setIsLocationFocused(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setIsLocationFocused(false), 250);
              }}
              onChangeText={(text) => {
                if (selectedLocationOption) {
                  return;
                }

                const nextText = text.slice(0, ADDRESS_MAX_LENGTH);
                setLocationSearch(nextText);
                if (!nextText.trim()) {
                  setSelectedLocationOption(null);
                  setSelectedCoords(null);
                  setLocationOptions([]);
                }
              }}
              placeholder={t("user.jobs.filters.searchLocation")}
              className="flex-1 px-4 py-3 text-placeholder text-sm"
              autoCapitalize="none"
              maxLength={ADDRESS_MAX_LENGTH}
              editable={!selectedLocationOption}
            />

            {selectedLocationOption ? (
              <TouchableOpacity
                onPress={handleClearLocation}
                className="px-4 py-3"
                accessibilityRole="button"
                accessibilityLabel={t("common.clear")}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            ) : null}
          </View>

          {isLocationFocused &&
            locationSearch.trim().length >= 3 &&
            locationOptions.length > 0 ? (
            <View className="mt-2 border border-[#EEEEEE] bg-white rounded-[10px] overflow-hidden">
              {locationOptions.map((item, index) => (
                <TouchableOpacity
                  key={`${item.value}-${index}`}
                  onPressIn={() => handleSelectLocation(item)}
                  onPress={() => handleSelectLocation(item)}
                  className="px-4 py-3 border-b border-[#F5F5F5]"
                >
                  <Text className="text-sm text-[#111111]">{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {isSearchingLocation ? (
            <Text className="mt-2 text-xs font-proximanova-regular text-secondary">
              {t("user.jobs.filters.searchingLocations")}
            </Text>
          ) : null}

          {isLocationFocused &&
            locationSearch.trim().length >= 3 &&
            !isSearchingLocation &&
            locationOptions.length === 0 ? (
            <Text className="mt-2 text-xs font-proximanova-regular text-secondary">
              {t("user.jobs.filters.noLocationsFound")}
            </Text>
          ) : null}


          <Slider
            value={distance}
            onValueChange={(value) => {
              setDistance(value);
              setIsDistanceTouched(true);
            }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#4FB2F3"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#EEEEEE"
            className="mt-1"
          />
          <Text className="text-sm font-proximanova-regular text-secondary mt-1">
            {t("user.jobs.filters.withinSelectedArea", { distance: Math.round(distance) })}
          </Text>
        </View>

        {/* Shift Type */}

        {/* The job profile does not include shift preferences, which is causing difficulty in applying filters. Therefore, it has been recommended to address this issue. */}

        {/* <View className="py-5 border-b border-gray-100">
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
        </View> */}

        {/* Availability*/}

        {/* The job profile does not include shift preferences, which is causing difficulty in applying filters. Therefore, it has been recommended to address this issue. */}


        {/* <View className="mt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            Availability
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {AVAILABILITY_BADGE_OPTIONS.map((badge) => (
              <SimpleStatusBadge
                key={badge.value}
                title={badge.label}
                className={`border ${isBadgeSelected(badge.value) ? "" : "border-[#EEEEEE]"
                  }`}
                bgColor={isBadgeSelected(badge.value) ? "#11293A" : "#FFFFFF"}
                textColor={isBadgeSelected(badge.value) ? "#FFFFFF" : "#111111"}
                onPress={() => handleBadgePress(badge.value)}
              />
            ))}
          </View>
        </View> */}

        {/* Salary Range */}
        <View className="py-5 border-b border-gray-100">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            {t("user.jobs.filters.salaryRange")}
          </Text>
          <Text className="text-xs font-proximanova-regular text-gray-500 mb-2">
            Min: ${salaryMinRange.toFixed(0)}
          </Text>
          <Slider
            value={salaryMinRange}
            onValueChange={(value) => {
              const nextValue = Math.min(value, salaryMaxRange);
              setSalaryMinRange(nextValue);
              setIsSalaryRangeTouched(true);
            }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#4FB2F3"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#EEEEEE"
          />
          <Text className="text-xs font-proximanova-regular text-gray-500 mt-4 mb-2">
            Max: ${salaryMaxRange.toFixed(0)}
          </Text>
          <Slider
            value={salaryMaxRange}
            onValueChange={(value) => {
              const nextValue = Math.max(value, salaryMinRange);
              setSalaryMaxRange(nextValue);
              setIsSalaryRangeTouched(true);
            }}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#4FB2F3"
            maximumTrackTintColor="#E5E5E5"
            thumbTintColor="#EEEEEE"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs font-proximanova-regular text-gray-500">
              $0
            </Text>
            <Text className="text-xs font-proximanova-regular text-gray-500">
              ${salaryMinRange.toFixed(0)} - ${salaryMaxRange.toFixed(0)}
            </Text>
            <Text className="text-xs font-proximanova-regular text-gray-500">
              $100
            </Text>
          </View>
        </View>

        {/* Experience Level */}
        <View className="py-5">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            {t("user.jobs.filters.experienceLevel")}
          </Text>
          {/* <Text className="text-sm font-proximanova-regular text-secondary mb-2">
            {t("user.jobs.filters.selectRoleFirst")}
          </Text> */}
          <View className="bg-white">
            {/* <Text className="text-sm font-proximanova-semibold text-primary">
              {t("user.jobs.filters.selectRole")}
            </Text> */}
            <RoleSelector
              className="mt-1"
              roles={roleOptions}
              loading={rolesLoading}
              selectedRole={selectedRoleToAdd}
              placeholder={t("user.jobs.postJob.selectRole")}
              onSelectRole={(role) => setSelectedRoleToAdd(role)}
              showSaveBadge={false}
            />
            {selectedRoleToAdd?.name ? (
              <Text className="text-xs font-proximanova-regular text-[#4FB2F3] mt-1">
                {t("user.jobs.filters.selected", { name: selectedRoleToAdd.name })}
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
                {t("user.jobs.filters.availableWorkingDays")}
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
                  {t("user.jobs.filters.availableWorkingDays")}
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

        {/* button */}
        <PrimaryButton title={t("user.jobs.filters.applyFilters")} onPress={handleApplyFilters} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FindJobFilters;

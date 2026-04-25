import ScreenHeader from "@/components/header/ScreenHeader";
import SimpleStatusBadge from "@/components/ui/badges/SimpleStatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RoleSlotsInput from "@/components/ui/inputs/RoleSlotsInput";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import type { RecruitmentSortBy } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
const ADDRESS_MAX_LENGTH = 200;

const parseOptionalNumber = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseExperienceRequirements = (value?: string) => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item: any) => ({
        roleId: typeof item?.roleId === "string" ? item.roleId : "",
        roleName: typeof item?.role === "string" ? item.role : "",
        count: Number.isFinite(Number(item?.minYears)) ? Number(item.minYears) : 1,
      }))
      .filter((item) => item.roleId || item.roleName);
  } catch {
    return [];
  }
};

const FindJobFilters = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    from?: string;
    page?: string;
    limit?: string;
    shiftTypes?: string;
    experienceRequirements?: string;
    jobTypes?: string;
    maxSalary?: string;
    location?: string;
    latitude?: string;
    longitude?: string;
    maxDistanceKm?: string;
    sortBy?: RecruitmentSortBy;
    search?: string;
  }>();
  const router = useRouter();
  const getRoles = useBusinessStore((state) => state.getRoles);
  const setAllJobsFilters = useJobStore((s) => s.setAllJobsFilters);
  const currentLimit = Number(params.limit ?? 10);
  const initialMaxSalary = parseOptionalNumber(params.maxSalary);
  const initialDistance = parseOptionalNumber(params.maxDistanceKm);
  const initialLatitude = parseOptionalNumber(params.latitude);
  const initialLongitude = parseOptionalNumber(params.longitude);

  const [locationSearch, setLocationSearch] = useState(params.location ?? "");
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [selectedLocationOption, setSelectedLocationOption] =
    useState<LocationOption | null>(
      params.location &&
        typeof initialLatitude === "number" &&
        typeof initialLongitude === "number"
        ? {
          label: params.location,
          value: params.location,
          latitude: initialLatitude,
          longitude: initialLongitude,
        }
        : null
    );
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    typeof initialLatitude === "number" && typeof initialLongitude === "number"
      ? {
        latitude: initialLatitude,
        longitude: initialLongitude,
      }
      : null
  );
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocationFocused, setIsLocationFocused] = useState(false);
  const hasShownGeoapifyMissingKey = useRef(false);
  const [distance, setDistance] = useState(
    typeof initialDistance === "number" ? initialDistance : 25
  );
  const [isDistanceTouched, setIsDistanceTouched] = useState(
    typeof initialDistance === "number"
  );
  const [salaryRange, setSalaryRange] = useState(
    typeof initialMaxSalary === "number" ? initialMaxSalary : 10000
  );
  const [isSalaryRangeTouched, setIsSalaryRangeTouched] = useState(
    typeof initialMaxSalary === "number"
  );
  const [jobCategory, setJobCategory] = useState(params.search ?? "");
  const [roleOptions, setRoleOptions] = useState<{ id: string; name: string }[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [addRoleTrigger, setAddRoleTrigger] = useState(0);
  const [experienceSlots, setExperienceSlots] = useState<
    { roleId: string; roleName: string; count: number }[]
  >(parseExperienceRequirements(params.experienceRequirements));

  const toLabelCase = (value: string) => {
    return value
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const sortLabelToValue: Record<string, RecruitmentSortBy> = {
    Newest: "newest",
    "Highest Rating": "highest_rating",
    "Most Experienced": "most_experience",
    "Best Fit": "best_fit",
  };
  const sortValueToLabel: Record<RecruitmentSortBy, string> = {
    newest: "Newest",
    highest_rating: "Highest Rating",
    most_experience: "Most Experienced",
    best_fit: "Best Fit",
  };
  const sortOptions = Object.keys(sortLabelToValue);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    params.sortBy ? sortValueToLabel[params.sortBy] : null
  );

  const handleOptionPress = (option: string) => {
    setSelectedOption((prev) => (prev === option ? null : option));
  };
  const isSelected = (option: string) => {
    return selectedOption === option;
  };

  const shiftOptions = ["Onsite", "Remote", "Hybrid"];
  const [selectedShiftOption, setSelectedShiftOption] = useState<string | null>(
    params.shiftTypes ? toLabelCase(params.shiftTypes) : null
  );

  const handleShiftOptionPress = (option: string) => {
    setSelectedShiftOption((prev) => (prev === option ? null : option));
  };

  const isSelectedShift = (option: string) => {
    return selectedShiftOption === option;
  };

  const initialSelectedBadges = (params.jobTypes || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const badgeOptions = [
    "full_time",
    "part_time",
    "hourly",
    "contract",
    "freelance",
    "internship",
  ];

  React.useEffect(() => {
    if (initialSelectedBadges.length > 0) {
      setSelectedBadges(initialSelectedBadges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBadgePress = (badgeValue: string) => {
    setSelectedBadges((prev) => {
      if (prev.includes(badgeValue)) {
        // Deselect if already selected
        return prev.filter((title) => title !== badgeValue);
      } else {
        // Select new badge
        return [...prev, badgeValue];
      }
    });
  };
  const isBadgeSelected = (badgeValue: string) => {
    return selectedBadges.includes(badgeValue);
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
        setExperienceSlots((prev) =>
          prev.map((slot) => {
            const matchedRole = normalized.find((role) => role.id === slot.roleId);
            return matchedRole
              ? { ...slot, roleName: matchedRole.name }
              : slot;
          })
        );
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

  const handleApplyFilters = () => {
    const sortBy = selectedOption ? sortLabelToValue[selectedOption] : undefined;
    const shiftTypes = selectedShiftOption?.toLowerCase();
    const jobTypes = selectedBadges.filter(Boolean).join(",");
    const nextSearch = jobCategory.trim();
    const hasSelectedCoords =
      typeof selectedCoords?.latitude === "number" &&
      typeof selectedCoords?.longitude === "number";
    const experienceRequirements = experienceSlots
      .filter((slot) => slot.roleId && slot.count > 0)
      .map((slot) => ({
        roleId: slot.roleId,
        minYears: slot.count,
      }));
    const nextFilters = {
      page: 1,
      limit: Number.isFinite(currentLimit) ? currentLimit : 10,
      shiftTypes: shiftTypes || undefined,
      experienceRequirements:
        experienceRequirements.length > 0
          ? JSON.stringify(experienceRequirements)
          : undefined,
      jobTypes: jobTypes || undefined,
      maxSalary:
        isSalaryRangeTouched &&
          Math.round(salaryRange) > 0 &&
          Math.round(salaryRange) < 10000
          ? Math.round(salaryRange)
          : undefined,
      location: undefined,
      latitude: hasSelectedCoords ? selectedCoords.latitude : undefined,
      longitude: hasSelectedCoords ? selectedCoords.longitude : undefined,
      maxDistanceKm:
        hasSelectedCoords && isDistanceTouched ? Math.round(distance) : undefined,
      sortBy: sortBy || undefined,
      search: nextSearch || undefined,
    };

    console.log(
      "[User Job Filters] payload to backend:\n" +
      JSON.stringify(nextFilters, null, 2)
    );
    setAllJobsFilters(nextFilters);

    if (params.from === "all-jobs") {
      router.back();
      return;
    }

    router.navigate("/screens/jobs/user/all-jobs");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <ScreenHeader
        title={t("user.jobs.filters.title")}
        className="mx-5"
        onPressBack={() => router.back()}
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Search */}
        <View className="pt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-4">
            {t("user.jobs.filters.searchTitle")}
          </Text>

          <TextInput
            value={jobCategory}
            onChangeText={setJobCategory}
            placeholder={t("user.jobs.filters.searchPlaceholder")}
            className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-proximanova-regular"
          />
        </View>

        {/* Sort by */}
        <View className="mt-7">
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
                  {t(`user.jobs.filters.sortOptions.${option.toLowerCase().replace(/ /g, "_")}`)}
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
        <View className="py-5 border-b border-gray-100">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            {t("user.jobs.postJob.shiftType")}
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
                  {t(`user.jobs.postJob.options.${option.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Job Type */}
        <View className="mt-7">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            {t("user.jobs.postJob.jobType")}
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {badgeOptions.map((badgeValue) => (
              <SimpleStatusBadge
                key={badgeValue}
                title={
                  badgeValue === "freelance"
                    ? t("user.jobs.postJob.options.freelance")
                    : t(
                      `user.jobs.postJob.options.${badgeValue
                        .split("_")
                        .map((part, index) =>
                          index === 0
                            ? part
                            : part.charAt(0).toUpperCase() + part.slice(1)
                        )
                        .join("")}`
                    )
                }
                className={`border ${isBadgeSelected(badgeValue) ? "" : "border-[#EEEEEE]"
                  }`}
                bgColor={isBadgeSelected(badgeValue) ? "#11293A" : "#FFFFFF"}
                textColor={isBadgeSelected(badgeValue) ? "#FFFFFF" : "#111111"}
                onPress={() => handleBadgePress(badgeValue)}
              />
            ))}
          </View>
        </View>

        {/* Salary Range */}
        <View className="py-5 border-b border-gray-100">
          <Text className="text-base font-proximanova-semibold text-primary mb-3">
            {t("user.jobs.filters.salaryRange")}
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
            {t("user.jobs.filters.experienceLevel")}
          </Text>
          <Text className="text-sm font-proximanova-regular text-secondary mb-2">
            {t("user.jobs.filters.selectRoleFirst")}
          </Text>
          <View className="border border-[#EEEEEE] rounded-xl px-3 pt-1 pb-3 bg-white">
            <Text className="mt-3 text-sm font-proximanova-semibold text-primary">
              {t("user.jobs.filters.selectRole")}
            </Text>
            <RoleSelector
              className="mt-1"
              roles={roleOptions}
              loading={rolesLoading}
              selectedRole={selectedRoleToAdd}
              placeholder={t("user.jobs.postJob.selectRole")}
              onSelectRole={(role) => setSelectedRoleToAdd(role)}
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

        {/* button */}
        <PrimaryButton title={t("user.jobs.filters.applyFilters")} onPress={handleApplyFilters} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default FindJobFilters;

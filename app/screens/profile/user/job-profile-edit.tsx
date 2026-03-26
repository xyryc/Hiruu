import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import MultiRoleSelector, {
  MultiRoleSelectorItem,
} from "@/components/ui/inputs/MultiRoleSelector";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import { useBusinessStore } from "@/stores/businessStore";
import {
  JobProfileData,
  useJobStore,
  WeeklyAvailabilityItem,
} from "@/stores/jobStore";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const isValidWeeklyAvailability = (availability: WeeklyAvailabilityItem[]) =>
  availability.every((item) => {
    if (!item.isOpen) return true;
    if (!item.startTime || !item.endTime) return false;
    return item.startTime < item.endTime;
  });

const buildFormState = (profile: JobProfileData | null) => ({
  isOpenToWork: Boolean(profile?.isOpenToWork),
  jobType:
    typeof profile?.preferredSalaryType === "string"
      ? profile.preferredSalaryType.trim()
      : "",
  expectedSalaryMin:
    typeof profile?.expectedSalaryMin === "number" ||
    typeof profile?.expectedSalaryMin === "string"
      ? `${profile.expectedSalaryMin}`
      : "",
  expectedSalaryMax:
    typeof profile?.expectedSalaryMax === "number" ||
    typeof profile?.expectedSalaryMax === "string"
      ? `${profile.expectedSalaryMax}`
      : "",
  preferredRoleIds: Array.isArray(profile?.preferredRoleIds)
    ? profile.preferredRoleIds.filter((item): item is string => typeof item === "string")
    : [],
  weeklyAvailability: profile?.weeklyAvailability || [],
});

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <View className="flex-row justify-between items-center mx-5 mt-8">
    <View className="flex-row gap-2.5 items-center">
      <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
        {icon}
      </View>
      <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
        {title}
      </Text>
    </View>
  </View>
);

const Field = ({
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor="#7A7A7A"
    keyboardType={keyboardType || "default"}
    className="w-full text-sm text-primary border border-[#0000000D] rounded-xl p-3"
  />
);

const JobProfileEdit = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const getMyJobProfile = useJobStore((state) => state.getMyJobProfile);
  const updateMyJobProfile = useJobStore((state) => state.updateMyJobProfile);
  const jobProfile = useJobStore((state) => state.jobProfile);
  const isLoadingJobProfile = useJobStore((state) => state.isLoadingJobProfile);
  const getRoles = useBusinessStore((state) => state.getRoles);

  const [jobType, setJobType] = useState("");
  const [isOpenToWork, setIsOpenToWork] = useState(false);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState("");
  const [expectedSalaryMax, setExpectedSalaryMax] = useState("");
  const [preferredRoleIds, setPreferredRoleIds] = useState<string[]>([]);
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityItem[]>([]);
  const [availabilityTouched, setAvailabilityTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [roleOptions, setRoleOptions] = useState<MultiRoleSelectorItem[]>([]);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jobTypeOptions = useMemo(
    () => [
      { label: "Hourly", value: "hourly" },
      { label: "Monthly", value: "monthly" },
    ],
    []
  );

  const applyProfileState = useCallback((profile: JobProfileData | null) => {
    const nextState = buildFormState(profile);
    setIsOpenToWork(nextState.isOpenToWork);
    setJobType(nextState.jobType);
    setExpectedSalaryMin(nextState.expectedSalaryMin);
    setExpectedSalaryMax(nextState.expectedSalaryMax);
    setPreferredRoleIds(nextState.preferredRoleIds);
    setWeeklyAvailability(nextState.weeklyAvailability);
    setAvailabilityTouched(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const data = await getRoles();
        if (!isMounted) return;

        const normalized = (Array.isArray(data) ? data : [])
          .filter(
            (item: any) =>
              typeof item?.id === "string" && typeof item?.name === "string"
          )
          .map((item: any) => ({
            id: item.id,
            name: item.name,
          }));

        setRoleOptions(normalized);
      } catch (error: any) {
        if (isMounted) {
          toast.error(error?.message || "Failed to load roles");
        }
      } finally {
        if (isMounted) {
          setIsLoadingRoles(false);
        }
      }
    };

    loadRoles();
    return () => {
      isMounted = false;
    };
  }, [getRoles]);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const data = await getMyJobProfile();
          applyProfileState(data);
        } catch (error: any) {
          toast.error(error?.message || "Failed to load job profile");
        }
      };

      loadProfile();
      return () => {};
    }, [applyProfileState, getMyJobProfile])
  );

  useEffect(() => {
    if (!jobProfile) return;
    applyProfileState(jobProfile);
  }, [applyProfileState, jobProfile]);

  useEffect(() => {
    if (!availabilityTouched) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (!isValidWeeklyAvailability(weeklyAvailability)) {
          console.log(
            "job profile weekly availability autosave skipped:",
            weeklyAvailability
          );
          return;
        }

        await updateMyJobProfile({ weeklyAvailability });
        console.log("job profile weekly availability autosaved:", weeklyAvailability);
      } catch (error) {
        console.log("job profile weekly availability autosave error:", error);
      }
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [availabilityTouched, updateMyJobProfile, weeklyAvailability]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await updateMyJobProfile({
        isOpenToWork,
        preferredSalaryType: jobType.trim() || null,
        preferredRoleIds,
        expectedSalaryMin: expectedSalaryMin.trim()
          ? Number(expectedSalaryMin)
          : null,
        expectedSalaryMax: expectedSalaryMax.trim()
          ? Number(expectedSalaryMax)
          : null,
      });

      toast.success("Job profile updated");
      router.replace("/screens/profile/user/job-profile");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update job profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{
          paddingTop: insets.top + 10,
        }}
        className="bg-[#E5F4FD] rounded-b-2xl px-4 pb-6 mb-6"
        onPressBack={() => router.back()}
        title="Edit Job Profile"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mx-5 rounded-2xl border border-[#0000000D] bg-[#F9FBFC] p-4">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Job Preferences
          </Text>
          <Text className="mt-2 font-proximanova-regular text-sm leading-6 text-secondary dark:text-dark-secondary">
            Update your job type, preferred roles, expected salary range, and working days.
          </Text>
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="account-check-outline" size={16} color="black" />}
          title="Open to Work"
        />
        <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] px-4 py-3">
          <ToggleButton
            title="Available for new opportunities"
            isOn={isOpenToWork}
            setIsOn={setIsOpenToWork}
            className="mb-0 justify-between"
          />
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="briefcase-outline" size={16} color="black" />}
          title="Job Type"
        />
        <View className="mx-5 mt-4">
          <SelectDropdown
            placeholder="Select job type"
            options={jobTypeOptions}
            value={jobType}
            listMaxHeight={220}
            onSelect={(value: string) => setJobType(value)}
          />
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="shape-outline" size={16} color="black" />}
          title="Preferred Roles"
        />
        <View className="mx-5 mt-4">
          <MultiRoleSelector
            roles={roleOptions}
            loading={isLoadingRoles}
            selectedRoleIds={preferredRoleIds}
            placeholder="Select preferred roles"
            helperText="You can select up to 4 preferred roles."
            maxSelection={4}
            onChange={setPreferredRoleIds}
            onLimitReached={() =>
              toast.error("You can select up to 4 preferred roles")
            }
          />
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="cash-multiple" size={16} color="black" />}
          title="Expected Salary"
        />
        <View className="mx-5 mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              Minimum
            </Text>
            <Field
              value={expectedSalaryMin}
              onChangeText={setExpectedSalaryMin}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Text className="mb-2 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              Maximum
            </Text>
            <Field
              value={expectedSalaryMax}
              onChangeText={setExpectedSalaryMax}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="calendar-multiselect-outline" size={16} color="black" />}
          title="Weekly Availability"
        />
        <View className="mx-5 mt-4">
          <WeeklySchedule
            availability={weeklyAvailability}
            onChange={(nextAvailability) => {
              setWeeklyAvailability(nextAvailability);
              setAvailabilityTouched(true);
            }}
          />
        </View>

        <PrimaryButton
          title="Save Changes"
          onPress={handleSave}
          loading={isSaving || isLoadingJobProfile}
          className="mx-5 my-10"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobProfileEdit;

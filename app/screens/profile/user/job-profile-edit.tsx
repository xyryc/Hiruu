import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import MultiRoleSelector, {
  MultiRoleSelectorItem,
} from "@/components/ui/inputs/MultiRoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import {
  JobProfileData,
  useJobStore,
  WeeklyAvailabilityItem,
} from "@/stores/jobStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const getMyJobProfile = useJobStore((state) => state.getMyJobProfile);
  const updateMyJobProfile = useJobStore((state) => state.updateMyJobProfile);
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
      { label: t("user.profile.jobProfileEdit.hourly"), value: "hourly" },
      { label: t("user.profile.jobProfileEdit.monthly"), value: "monthly" },
    ],
    [t]
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
          toast.error(error?.message || t("user.profile.jobProfileScreen.failedToLoadRoles"));
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
  }, [getRoles, t]);

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const data = await getMyJobProfile();
          applyProfileState(data);
        } catch (error: any) {
          toast.error(error?.message || t("user.profile.jobProfileScreen.failedToLoadJobProfile"));
        }
      };

      loadProfile();
      return () => { };
    }, [applyProfileState, getMyJobProfile, t])
  );

  useEffect(() => {
    if (!availabilityTouched) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (!isValidWeeklyAvailability(weeklyAvailability)) {
          return;
        }

        await updateMyJobProfile({ weeklyAvailability });
      } catch (error) {
        console.error("job profile weekly availability autosave error:", error);
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

      toast.success(t("user.profile.jobProfileEdit.jobProfileUpdated"));
      router.back();
    } catch (error: any) {
      toast.error(error?.message || t("user.profile.jobProfileEdit.failedToUpdateJobProfile"));
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
        title={t("user.profile.jobProfileEdit.title")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mx-5 rounded-2xl border border-[#0000000D] bg-[#F9FBFC] p-4">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            {t("user.profile.jobProfileScreen.jobPreferences")}
          </Text>
          <Text className="mt-2 font-proximanova-regular text-sm leading-6 text-secondary dark:text-dark-secondary">
            {t("user.profile.jobProfileEdit.updateDescription")}
          </Text>
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="account-check-outline" size={16} color="black" />}
          title={t("user.profile.jobProfileScreen.openToWork")}
        />
        <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] px-4 py-3">
          <ToggleButton
            title={t("user.profile.jobProfileEdit.availableForNewOpportunities")}
            isOn={isOpenToWork}
            setIsOn={setIsOpenToWork}
            className="mb-0 justify-between"
          />
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="briefcase-outline" size={16} color="black" />}
          title={t("user.profile.jobProfileScreen.jobType")}
        />
        <View className="mx-5 mt-4">
          <SelectDropdown
            placeholder={t("user.profile.jobProfileEdit.selectJobType")}
            options={jobTypeOptions}
            value={jobType}
            listMaxHeight={220}
            onSelect={(value: string) => setJobType(value)}
          />
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="shape-outline" size={16} color="black" />}
          title={t("user.profile.jobProfileScreen.preferredRoles")}
        />
        <View className="mx-5 mt-4">
          <MultiRoleSelector
            roles={roleOptions}
            loading={isLoadingRoles}
            selectedRoleIds={preferredRoleIds}
            placeholder={t("user.profile.jobProfileEdit.selectPreferredRoles")}
            helperText={t("user.profile.jobProfileEdit.maxPreferredRolesHelper")}
            maxSelection={4}
            onChange={setPreferredRoleIds}
            onLimitReached={() =>
              toast.error(t("user.profile.jobProfileEdit.maxPreferredRolesError"))
            }
          />
        </View>

        <SectionHeader
          icon={<MaterialCommunityIcons name="cash-multiple" size={16} color="black" />}
          title={t("user.profile.jobProfileScreen.expectedSalary")}
        />
        <View className="mx-5 mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              {t("user.profile.jobProfileScreen.minimum")}
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
              {t("user.profile.jobProfileScreen.maximum")}
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
          title={t("user.profile.jobProfileScreen.weeklyAvailability")}
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
          title={t("user.profile.editUserProfile.saveChanges")}
          onPress={handleSave}
          loading={isSaving || isLoadingJobProfile}
          className="mx-5 my-10"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobProfileEdit;

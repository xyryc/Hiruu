import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import type { RecruitmentShiftType } from "@/types";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const PostJob = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const selectedBusinesses = useBusinessStore((s) => s.selectedBusinesses);
  const myBusinesses = useBusinessStore((s) => s.myBusinesses);
  const getMyBusinesses = useBusinessStore((s) => s.getMyBusinesses);
  const getMyBusinessRoles = useBusinessStore((s) => s.getMyBusinessRoles);
  const createRecruitment = useJobStore((s) => s.createRecruitment);
  const isSubmitting = useJobStore((s) => s.isLoading);

  const [selectedRole, setSelectedRole] = useState<{ id: string; name: string } | null>(null);
  const [roleOptions, setRoleOptions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [rolesLoading, setRolesLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [gender, setGender] = useState("");
  const [shiftType, setShiftType] = useState<RecruitmentShiftType | "">("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [openings, setOpenings] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const selectedBusinessId = selectedBusinesses[0] || "";

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      if (!selectedBusinessId) {
        if (isMounted) {
          setRoleOptions([]);
          setSelectedRole(null);
          setRolesLoading(false);
        }
        return;
      }

      try {
        setRolesLoading(true);
        const data = await getMyBusinessRoles(selectedBusinessId);
        if (isMounted) {
          const normalized = (Array.isArray(data) ? data : [])
            .map((item: any) => ({
              id: item?.id || item?.roleId || "",
              name: item?.role?.name || item?.name || "",
            }))
            .filter((item: any) => item?.id && item?.name);
          setRoleOptions(normalized);
          setSelectedRole((prev) =>
            prev && normalized.some((item: any) => item.id === prev.id) ? prev : null
          );
        }
      } catch {
        if (isMounted) {
          setRoleOptions([]);
          setSelectedRole(null);
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
  }, [getMyBusinessRoles, selectedBusinessId]);

  useEffect(() => {
    if (!myBusinesses.length) {
      getMyBusinesses().catch(() => undefined);
    }
  }, [getMyBusinesses, myBusinesses.length]);

  const selectedBusiness = useMemo(() => {
    const businessId = selectedBusinesses[0];
    if (!businessId) return null;
    return (myBusinesses || []).find((business: any) => business?.id === businessId) || null;
  }, [myBusinesses, selectedBusinesses]);

  const isFeaturedBusiness = Boolean(selectedBusiness?.isFeatured);

  useEffect(() => {
    if (!isFeaturedBusiness && isFeatured) {
      setIsFeatured(false);
    }
  }, [isFeatured, isFeaturedBusiness]);

  const genderOptions = useMemo(
    () => [
      { label: t("user.jobs.postJob.options.any"), value: "Any" },
      { label: t("user.jobs.postJob.options.male"), value: "Male" },
      { label: t("user.jobs.postJob.options.female"), value: "Female" },
      { label: t("user.jobs.postJob.options.other"), value: "Other" },
    ],
    [t]
  );
  const shiftTypeOptions = useMemo(
    () => [
      { label: t("user.jobs.postJob.options.onsite"), value: "onsite" },
      { label: t("user.jobs.postJob.options.remote"), value: "remote" },
      { label: t("user.jobs.postJob.options.hybrid"), value: "hybrid" },
    ],
    [t]
  );
  const jobTypeOptions = useMemo(
    () => [
      { label: t("user.jobs.postJob.options.fullTime"), value: "full_time" },
      { label: t("user.jobs.postJob.options.partTime"), value: "part_time" },
      { label: t("user.jobs.postJob.options.hourly"), value: "hourly" },
      { label: t("user.jobs.postJob.options.contract"), value: "contract" },
      { label: t("user.jobs.postJob.options.internship"), value: "internship" },
    ],
    [t]
  );

  const handlePostJob = async () => {
    const businessId = selectedBusinesses[0];
    if (!businessId) {
      toast.error(t("user.jobs.postJob.errors.selectBusinessFirst"));
      return;
    }

    if (!selectedRole?.name?.trim()) {
      toast.error(t("user.jobs.postJob.errors.roleRequired"));
      return;
    }

    if (!jobDescription.trim()) {
      toast.error(t("user.jobs.postJob.errors.descriptionRequired"));
      return;
    }

    if (!gender) {
      toast.error(t("user.jobs.postJob.errors.genderRequired"));
      return;
    }
    if (!shiftType) {
      toast.error(t("user.jobs.postJob.errors.shiftTypeRequired"));
      return;
    }
    if (!jobType) {
      toast.error(t("user.jobs.postJob.errors.jobTypeRequired"));
      return;
    }

    const parsedAgeMin = Number(ageMin);
    const parsedAgeMax = Number(ageMax);
    const parsedSalaryMin = Number(salaryMin);
    const parsedSalaryMax = Number(salaryMax);
    const parsedOpenings = Number(openings);

    if (!parsedAgeMin || !parsedAgeMax || parsedAgeMin > parsedAgeMax) {
      toast.error(t("user.jobs.postJob.errors.invalidAgeRange"));
      return;
    }

    if (
      !parsedSalaryMin ||
      !parsedSalaryMax ||
      parsedSalaryMin > parsedSalaryMax
    ) {
      toast.error(t("user.jobs.postJob.errors.invalidSalaryRange"));
      return;
    }

    if (!parsedOpenings || parsedOpenings < 1) {
      toast.error(t("user.jobs.postJob.errors.minimumOpenings"));
      return;
    }

    const payload = {
      roleId: selectedRole.id,
      description: jobDescription.trim(),
      gender,
      experience: experience.trim(),
      shiftType,
      jobType,
      ageMin: parsedAgeMin,
      ageMax: parsedAgeMax,
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      requiredSkills: [],
      salaryType: "hourly" as const,
      numberOfOpenings: parsedOpenings,
      isFeatured: isFeaturedBusiness ? isFeatured : false,
    };

    try {
      await createRecruitment(businessId, payload);
      toast.success(t("user.jobs.postJob.jobPostedSuccessfully"));
      router.back();
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.postJob.failedToPostJob"));
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <SafeAreaView
        className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
        edges={["left", "right", "bottom"]}
      >
        <ScreenHeader
          className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
          style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
          onPressBack={() => router.back()}
          title={t("user.jobs.postJob.postJob")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        <ScrollView
          className="mx-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.role")}
          </Text>
          <RoleSelector
            className=""
            roles={roleOptions}
            loading={rolesLoading}
            selectedRole={selectedRole}
            placeholder={t("user.jobs.postJob.selectRole")}
            onSelectRole={(role) => setSelectedRole(role)}
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.jobDescription")}
          </Text>
          <TextInput
            value={jobDescription}
            onChangeText={setJobDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] mt-2.5 rounded-[10px] min-h-[110px]"
            placeholder={t("user.jobs.postJob.writeResponsibilities")}
            placeholderTextColor="#7D7D7D"
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.gender")}
          </Text>
          <SelectDropdown
            className="mt-2.5"
            placeholder={t("user.jobs.postJob.selectGender")}
            listMaxHeight={320}
            options={genderOptions}
            value={gender}
            onSelect={(value: string) => setGender(value)}
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.shiftType")}
          </Text>
          <SelectDropdown
            className="mt-2.5"
            placeholder={t("user.jobs.postJob.selectShiftType")}
            listMaxHeight={320}
            options={shiftTypeOptions}
            value={shiftType}
            onSelect={(value: string) =>
              setShiftType(value as RecruitmentShiftType)
            }
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.jobType")}
          </Text>
          <SelectDropdown
            className="mt-2.5"
            placeholder={t("user.jobs.postJob.selectJobType")}
            options={jobTypeOptions}
            value={jobType}
            listMaxHeight={320}
            onSelect={(value: string) => setJobType(value)}
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.experienceYears")}
          </Text>
          <TextInput
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] mt-2.5 rounded-[10px]"
            placeholder="2"
            placeholderTextColor="#7D7D7D"
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.ageRangeYears")}
          </Text>
          <View className="flex-row items-center gap-3 mt-2.5">
            <TextInput
              value={ageMin}
              onChangeText={setAgeMin}
              keyboardType="numeric"
              className="flex-1 px-4 py-3 pr-10 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] rounded-[10px]"
              placeholder={t("user.jobs.postJob.min")}
              placeholderTextColor="#7D7D7D"
            />

            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
              {t("user.profile.weeklySchedule.to")}
            </Text>

            <TextInput
              value={ageMax}
              onChangeText={setAgeMax}
              keyboardType="numeric"
              className="flex-1 px-4 py-3 pr-10 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] rounded-[10px]"
              placeholder={t("user.jobs.postJob.max")}
              placeholderTextColor="#7D7D7D"
            />
          </View>

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-8">
            {t("user.jobs.postJob.salaryRange")}
          </Text>
          <View className="flex-row items-center gap-3 mt-2.5">
            <View className="flex-1 relative">
              <Text className="absolute left-3 top-3.5 text-sm text-secondary dark:text-dark-secondary">
                $
              </Text>
              <TextInput
                value={salaryMin}
                onChangeText={setSalaryMin}
                keyboardType="numeric"
                className="px-7 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] rounded-[10px]"
                placeholder={t("user.jobs.postJob.min")}
                placeholderTextColor="#7D7D7D"
              />
            </View>
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
              {t("user.profile.weeklySchedule.to")}
            </Text>
            <View className="flex-1 relative">
              <Text className="absolute left-3 top-3.5 text-sm text-secondary dark:text-dark-secondary">
                $
              </Text>
              <TextInput
                value={salaryMax}
                onChangeText={setSalaryMax}
                keyboardType="numeric"
                className="px-7 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] rounded-[10px]"
                placeholder={t("user.jobs.postJob.max")}
                placeholderTextColor="#7D7D7D"
              />
            </View>
          </View>

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            {t("user.jobs.postJob.numberOfOpenings")}
          </Text>
          <TextInput
            value={openings}
            onChangeText={setOpenings}
            keyboardType="numeric"
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] mt-2.5 rounded-[10px]"
            placeholder={t("user.jobs.postJob.openingsPlaceholder")}
            placeholderTextColor="#7D7D7D"
          />

          {isFeaturedBusiness && (
            <View className="mt-7 flex-row items-center justify-between border border-[#EEEEEE] rounded-[10px] px-4 py-3">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {t("user.jobs.postJob.featured")}
              </Text>
              <ToggleButton isOn={isFeatured} setIsOn={setIsFeatured} />
            </View>
          )}

          <View className="mt-8 mb-5">
            <PrimaryButton
              onPress={handlePostJob}
              loading={isSubmitting}
              disabled={isSubmitting}
              title={t("user.jobs.postJob.postJob")}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default PostJob;

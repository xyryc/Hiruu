import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import TimePicker from "@/components/ui/inputs/TimePicker";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import type { RecruitmentShiftType } from "@/types";
import { localDateToUTCTime } from "@/utils/timezone";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
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
  const [shiftStartTime, setShiftStartTime] = useState<Date>(new Date());
  const [shiftEndTime, setShiftEndTime] = useState<Date>(new Date());
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

  const isPremiumBusiness = Boolean(selectedBusiness?.isPremium);

  useEffect(() => {
    if (!isPremiumBusiness && isFeatured) {
      setIsFeatured(false);
    }
  }, [isFeatured, isPremiumBusiness]);

  const genderOptions = useMemo(
    () => [
      { label: "Any", value: "Any" },
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
      { label: "Other", value: "Other" },
    ],
    []
  );
  const shiftTypeOptions = useMemo(
    () => [
      { label: "Onsite", value: "onsite" },
      { label: "Remote", value: "remote" },
      { label: "Hybrid", value: "hybrid" },
    ],
    []
  );
  const jobTypeOptions = useMemo(
    () => [
      { label: "Full-time", value: "full_time" },
      { label: "Part-time", value: "part_time" },
      { label: "Hourly", value: "hourly" },
      { label: "Contract", value: "contract" },
      { label: "Internship", value: "internship" },
    ],
    []
  );

  const formatTime24 = (date: Date) => {
    // Convert local time to UTC before sending to backend
    return localDateToUTCTime(date);
  };

  const handlePostJob = async () => {
    const businessId = selectedBusinesses[0];
    if (!businessId) {
      toast.error("Please select a business profile first.");
      return;
    }

    if (!selectedRole?.name?.trim()) {
      toast.error("Role is required.");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error("Job description is required.");
      return;
    }

    if (!gender) {
      toast.error("Gender is required.");
      return;
    }
    if (!shiftType) {
      toast.error("Shift type is required.");
      return;
    }
    if (!jobType) {
      toast.error("Job type is required.");
      return;
    }

    const parsedAgeMin = Number(ageMin);
    const parsedAgeMax = Number(ageMax);
    const parsedSalaryMin = Number(salaryMin);
    const parsedSalaryMax = Number(salaryMax);
    const parsedOpenings = Number(openings);

    if (!parsedAgeMin || !parsedAgeMax || parsedAgeMin > parsedAgeMax) {
      toast.error("Please provide a valid age range.");
      return;
    }

    if (
      !parsedSalaryMin ||
      !parsedSalaryMax ||
      parsedSalaryMin > parsedSalaryMax
    ) {
      toast.error("Please provide a valid salary range.");
      return;
    }

    if (!parsedOpenings || parsedOpenings < 1) {
      toast.error("Number of openings must be at least 1.");
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
      shiftStartTime: formatTime24(shiftStartTime),
      shiftEndTime: formatTime24(shiftEndTime),
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      requiredSkills: [],
      salaryType: "hourly" as const,
      numberOfOpenings: parsedOpenings,
      isFeatured: isPremiumBusiness ? isFeatured : false,
    };

    try {
      await createRecruitment(businessId, payload);
      toast.success("Job posted successfully.");
      router.back();
    } catch (error: any) {
      toast.error(error?.message || "Failed to post job");
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
          title="Post Job"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />

        <ScrollView
          className="mx-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Role
          </Text>
          <RoleSelector
            className=""
            roles={roleOptions}
            loading={rolesLoading}
            selectedRole={selectedRole}
            placeholder="Select role"
            onSelectRole={(role) => setSelectedRole(role)}
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Job Description
          </Text>
          <TextInput
            value={jobDescription}
            onChangeText={setJobDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] mt-2.5 rounded-[10px] min-h-[110px]"
            placeholder="Write job responsibilities..."
            placeholderTextColor="#7D7D7D"
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Gender
          </Text>
          <SelectDropdown
            className="mt-2.5"
            placeholder="Select gender"
            listMaxHeight={320}
            options={genderOptions}
            value={gender}
            onSelect={(value: string) => setGender(value)}
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Shift Type
          </Text>
          <SelectDropdown
            className="mt-2.5"
            placeholder="Select shift type"
            listMaxHeight={320}
            options={shiftTypeOptions}
            value={shiftType}
            onSelect={(value: string) =>
              setShiftType(value as RecruitmentShiftType)
            }
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Job Type
          </Text>
          <SelectDropdown
            className="mt-2.5"
            placeholder="Select job type"
            options={jobTypeOptions}
            value={jobType}
            listMaxHeight={320}
            onSelect={(value: string) => setJobType(value)}
          />

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Experience (Years)
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
            Age Range (Years)
          </Text>
          <View className="flex-row items-center gap-3 mt-2.5">
            <TextInput
              value={ageMin}
              onChangeText={setAgeMin}
              keyboardType="numeric"
              className="flex-1 px-4 py-3 pr-10 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] rounded-[10px]"
              placeholder="Min"
              placeholderTextColor="#7D7D7D"
            />

            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
              To
            </Text>

            <TextInput
              value={ageMax}
              onChangeText={setAgeMax}
              keyboardType="numeric"
              className="flex-1 px-4 py-3 pr-10 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] rounded-[10px]"
              placeholder="Max"
              placeholderTextColor="#7D7D7D"
            />
          </View>

          <View className="mt-8">
            <View className="flex-row gap-4 items-center">
              <TimePicker
                title="Shift Start Time"
                value={shiftStartTime}
                onChangeTime={setShiftStartTime}
              />
              <Text className="mt-7 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                To
              </Text>
              <TimePicker
                title="Shift End Time"
                value={shiftEndTime}
                onChangeTime={setShiftEndTime}
              />
            </View>
          </View>

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-8">
            Salary Range
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
                placeholder="Min"
                placeholderTextColor="#7D7D7D"
              />
            </View>
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
              To
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
                placeholder="Max"
                placeholderTextColor="#7D7D7D"
              />
            </View>
          </View>

          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Number of Openings
          </Text>
          <TextInput
            value={openings}
            onChangeText={setOpenings}
            keyboardType="numeric"
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary border border-[#EEEEEE] mt-2.5 rounded-[10px]"
            placeholder="1"
            placeholderTextColor="#7D7D7D"
          />

          {isPremiumBusiness && (
            <View className="mt-7 flex-row items-center justify-between border border-[#EEEEEE] rounded-[10px] px-4 py-3">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Exclusive
              </Text>
              <Switch value={isFeatured} onValueChange={setIsFeatured} />
            </View>
          )}

          <View className="mt-8 mb-5">
            <PrimaryButton
              onPress={handlePostJob}
              loading={isSubmitting}
              disabled={isSubmitting}
              title="Post Job"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default PostJob;

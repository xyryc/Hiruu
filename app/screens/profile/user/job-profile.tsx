import ScreenHeader from "@/components/header/ScreenHeader";
import { useBusinessStore } from "@/stores/businessStore";
import { JobProfileData, useJobStore } from "@/stores/jobStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const dayOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const dayLabelMap: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const formatTimeToDisplay = (value?: string) => {
  if (!value) return "";
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) return value;

  const hour24 = Number(match[1]);
  const minute = match[2];
  const meridiem = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${meridiem}`;
};

const formatSalaryValue = (value?: number | string | null) =>
  typeof value === "number" || typeof value === "string"
    ? `${value}`.trim() || "Not added yet"
    : "Not added yet";

const getJobType = (profile: JobProfileData | null) => {
  const value = profile?.preferredSalaryType;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim().charAt(0).toUpperCase() + value.trim().slice(1)
    : "Not added yet";
};

const getOpenToWorkLabel = (profile: JobProfileData | null) =>
  profile?.isOpenToWork ? "Yes" : "No";

const buildAvailabilityRows = (profile: JobProfileData | null) => {
  const byDay = new Map(
    (profile?.weeklyAvailability || []).flatMap((item: any) => {
      if (typeof item === "string" && item.trim()) {
        return [[item.toLowerCase(), { day: item, isOpen: true }]];
      }

      if (
        item &&
        typeof item === "object" &&
        typeof item.day === "string" &&
        item.day.trim()
      ) {
        return [[item.day.toLowerCase(), item]];
      }

      return [];
    })
  );

  return dayOrder.map((day) => {
    const item = byDay.get(day);
    if (!item || !item.isOpen) {
      return { day, value: "Closed" };
    }

    const start = formatTimeToDisplay(item.startTime);
    const end = formatTimeToDisplay(item.endTime);
    return {
      day,
      value: start && end ? `${start} - ${end}` : "Available",
    };
  });
};

const SectionTitle = ({
  title,
  icon,
  action,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <View className="mx-5 mt-8 flex-row items-center justify-between">
    <View className="flex-row items-center gap-2.5">
      <View className="h-8 w-8 rounded-full bg-[#E5F4FD] items-center justify-center">
        {icon}
      </View>
      <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
        {title}
      </Text>
    </View>
    {action}
  </View>
);

const ValueCard = ({ value }: { value: string }) => (
  <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] p-4">
    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
      {value}
    </Text>
  </View>
);

type RoleItem = {
  id: string;
  name: string;
};

const JobProfile = () => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const getMyJobProfile = useJobStore((state) => state.getMyJobProfile);
  const jobProfile = useJobStore((state) => state.jobProfile);
  const getRoles = useBusinessStore((state) => state.getRoles);
  const [roleOptions, setRoleOptions] = useState<RoleItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      try {
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
          console.log(
            "[JobProfile] profile response:",
            JSON.stringify(data, null, 2)
          );
        } catch (error: any) {
          toast.error(error?.message || "Failed to load job profile");
        }
      };

      loadProfile();
      return () => { };
    }, [getMyJobProfile])
  );

  const availabilityRows = buildAvailabilityRows(jobProfile);
  const preferredRoles = useMemo(() => {
    const preferredRoleIds = Array.isArray(jobProfile?.preferredRoleIds)
      ? jobProfile.preferredRoleIds
      : [];

    return preferredRoleIds
      .map((roleId) => roleOptions.find((role) => role.id === roleId)?.name)
      .filter((name): name is string => typeof name === "string" && name.trim().length > 0);
  }, [jobProfile?.preferredRoleIds, roleOptions]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["left", "right", "bottom"]}>
      <ScreenHeader
        style={{ paddingTop: insets.top + 10 }}
        className="bg-[#E5F4FD] rounded-b-2xl px-4 pb-6 mb-6"
        onPressBack={() => router.back()}
        onPress={() => router.push("/screens/profile/user/job-profile-edit")}
        buttonTitle="Edit"
        title="Job Profile"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mx-5 rounded-2xl border border-[#0000000D] bg-[#F9FBFC] p-4">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            Job Preferences
          </Text>
          <Text className="mt-2 font-proximanova-regular text-sm leading-6 text-secondary dark:text-dark-secondary">
            Manage your preferred job type, expected salary range, and weekly availability.
          </Text>
        </View>

        <SectionTitle
          title="Open to Work"
          icon={<MaterialCommunityIcons name="account-check-outline" size={16} color="black" />}
        />
        <ValueCard value={getOpenToWorkLabel(jobProfile)} />

        <SectionTitle
          title="Job Type"
          icon={<MaterialCommunityIcons name="briefcase-outline" size={16} color="black" />}
        // action={
        //   <TouchableOpacity onPress={() => router.push("/screens/profile/user/job-profile-edit")}>
        //     <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline">
        //       Edit
        //     </Text>
        //   </TouchableOpacity>
        // }
        />
        <ValueCard value={getJobType(jobProfile)} />

        <SectionTitle
          title="Preferred Roles"
          icon={<MaterialCommunityIcons name="shape-outline" size={16} color="black" />}
        />
        <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] p-4">
          {preferredRoles.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {preferredRoles.map((roleName) => (
                <View
                  key={roleName}
                  className="rounded-full bg-[#E5F4FD] px-3 py-2"
                >
                  <Text className="font-proximanova-semibold text-sm text-[#11293A]">
                    {roleName}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              Not added yet
            </Text>
          )}
        </View>

        <SectionTitle
          title="Expected Salary"
          icon={<MaterialCommunityIcons name="cash-multiple" size={16} color="black" />}
        />
        <View className="mx-5 mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-[#0000000D] p-4">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              Minimum
            </Text>
            <Text className="mt-2 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {formatSalaryValue(jobProfile?.expectedSalaryMin)}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-[#0000000D] p-4">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              Maximum
            </Text>
            <Text className="mt-2 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {formatSalaryValue(jobProfile?.expectedSalaryMax)}
            </Text>
          </View>
        </View>

        <SectionTitle
          title="Weekly Availability"
          icon={<MaterialCommunityIcons name="calendar-multiselect-outline" size={16} color="black" />}
        />
        <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] p-4">
          {availabilityRows.map((item) => (
            <View
              key={item.day}
              className="flex-row items-center justify-between border-b border-[#0000000D] py-3 last:border-b-0"
            >
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {dayLabelMap[item.day]}
              </Text>
              <Text
                className={`font-proximanova-regular text-sm ${item.value === "Closed"
                    ? "text-[#F34F4F]"
                    : "text-secondary dark:text-dark-secondary"
                  }`}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobProfile;

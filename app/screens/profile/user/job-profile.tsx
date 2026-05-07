import ScreenHeader from "@/components/header/ScreenHeader";
import { useBusinessStore } from "@/stores/businessStore";
import { JobProfileData, useJobStore } from "@/stores/jobStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

const formatSalaryValue = (
  value?: number | string | null,
  fallback = ""
) =>
  typeof value === "number" || typeof value === "string"
    ? `${value}`.trim() || fallback
    : fallback;

const getSalaryType = (profile: JobProfileData | null, fallback = "") => {
  const value = profile?.preferredSalaryType;
  if (typeof value !== "string" || value.trim().length === 0) return fallback;

  return value
    .trim()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getJobType = (profile: JobProfileData | null, fallback = "") => {
  const metadata =
    profile?.metadata && typeof profile.metadata === "object"
      ? (profile.metadata as Record<string, unknown>)
      : null;
  const value =
    (typeof metadata?.preferredJobType === "string" &&
      metadata.preferredJobType.trim()) ||
    (typeof metadata?.jobTypePreference === "string" &&
      metadata.jobTypePreference.trim());

  if (!value) return fallback;

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getShiftType = (profile: JobProfileData | null, fallback = "") => {
  const metadata =
    profile?.metadata && typeof profile.metadata === "object"
      ? (profile.metadata as Record<string, unknown>)
      : null;
  const value =
    (typeof metadata?.preferredShiftType === "string" &&
      metadata.preferredShiftType.trim()) ||
    (metadata?.remoteOnly ? "remote" : "");

  if (!value) return fallback;

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getOpenToWorkLabel = (
  profile: JobProfileData | null,
  yesLabel = "",
  noLabel = ""
) => (profile?.isOpenToWork ? yesLabel : noLabel);

const buildAvailabilityRows = (
  profile: JobProfileData | null,
  closedLabel = "",
  availableLabel = ""
) => {
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
      return { day, value: closedLabel };
    }

    const start = formatTimeToDisplay(item.startTime);
    const end = formatTimeToDisplay(item.endTime);
    return {
      day,
      value: start && end ? `${start} - ${end}` : availableLabel,
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
  const { t } = useTranslation();
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
          toast.error(error?.message || t("user.profile.jobProfileScreen.failedToLoadRoles"));
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
          await getMyJobProfile();

        } catch (error: any) {
          toast.error(error?.message || t("user.profile.jobProfileScreen.failedToLoadJobProfile"));
        }
      };

      loadProfile();
      return () => { };
    }, [getMyJobProfile, t])
  );

  const availabilityRows = buildAvailabilityRows(
    jobProfile,
    t("user.profile.weeklySchedule.closed"),
    t("user.profile.jobProfileScreen.available")
  );
  const closedLabel = t("user.profile.weeklySchedule.closed");
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
        buttonTitle={t("user.profile.edit")}
        title={t("user.profile.userProfile.jobProfile")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mx-5 rounded-2xl border border-[#0000000D] bg-[#F9FBFC] p-4">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            {t("user.profile.jobProfileScreen.jobPreferences")}
          </Text>
          <Text className="mt-2 font-proximanova-regular text-sm leading-6 text-secondary dark:text-dark-secondary">
            {t("user.profile.jobProfileScreen.manageDescription")}
          </Text>
        </View>

        <SectionTitle
          title={t("user.profile.jobProfileScreen.openToWork")}
          icon={<MaterialCommunityIcons name="account-check-outline" size={16} color="black" />}
        />
        <ValueCard
          value={getOpenToWorkLabel(jobProfile, t("common.yes"), t("common.no"))}
        />

        <SectionTitle
          title={t("user.profile.jobProfileScreen.jobType")}
          icon={<MaterialCommunityIcons name="briefcase-outline" size={16} color="black" />}
        // action={
        //   <TouchableOpacity onPress={() => router.push("/screens/profile/user/job-profile-edit")}>
        //     <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline">
        //       Edit
        //     </Text>
        //   </TouchableOpacity>
        // }
        />
        <ValueCard
          value={getJobType(jobProfile, t("user.profile.jobProfileScreen.notAddedYet"))}
        />

        <SectionTitle
          title={t("user.jobs.postJob.shiftType")}
          icon={<MaterialCommunityIcons name="map-marker-path" size={16} color="black" />}
        />
        <ValueCard
          value={getShiftType(jobProfile, t("user.profile.jobProfileScreen.notAddedYet"))}
        />

        <SectionTitle
          title={t("user.profile.jobProfileScreen.preferredRoles")}
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
              {t("user.profile.jobProfileScreen.notAddedYet")}
            </Text>
          )}
        </View>

        <SectionTitle
          title={t("user.profile.jobProfileScreen.expectedSalary")}
          icon={<MaterialCommunityIcons name="cash-multiple" size={16} color="black" />}
        />
        <View className="mx-5 mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-[#0000000D] p-4">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              {t("user.profile.jobProfileScreen.minimum")}
            </Text>
            <Text className="mt-2 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {formatSalaryValue(
                jobProfile?.expectedSalaryMin,
                t("user.profile.jobProfileScreen.notAddedYet")
              )}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-[#0000000D] p-4">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              {t("user.profile.jobProfileScreen.maximum")}
            </Text>
            <Text className="mt-2 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {formatSalaryValue(
                jobProfile?.expectedSalaryMax,
                t("user.profile.jobProfileScreen.notAddedYet")
              )}
            </Text>
          </View>
        </View>
        <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] p-4">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            Salary Type
          </Text>
          <Text className="mt-2 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {getSalaryType(jobProfile, t("user.profile.jobProfileScreen.notAddedYet"))}
          </Text>
        </View>

        <SectionTitle
          title={t("user.profile.jobProfileScreen.weeklyAvailability")}
          icon={<MaterialCommunityIcons name="calendar-multiselect-outline" size={16} color="black" />}
        />
        <View className="mx-5 mt-4 rounded-xl border border-[#0000000D] p-4">
          {availabilityRows.map((item) => (
            <View
              key={item.day}
              className="flex-row items-center justify-between border-b border-[#0000000D] py-3 last:border-b-0"
            >
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {t(`user.profile.weeklyDays.${item.day}`)}
              </Text>
              <Text
                className={`font-proximanova-regular text-sm ${item.value === closedLabel
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

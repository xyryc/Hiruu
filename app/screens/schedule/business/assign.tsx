import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Assign = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ day?: string; templateId?: string; date?: string }>();
  const day = typeof params.day === "string" ? params.day : "";
  const templateId = typeof params.templateId === "string" ? params.templateId : "";
  const selectedDate = typeof params.date === "string" ? params.date : "";
  const assignmentKey = `${day}::${templateId}`;
  const {
    selectedBusinesses,
    weeklyShiftSelections,
    weeklyRoleAssignments,
    setWeeklyRoleAssignment,
    getShiftAssignmentAvailability,
  } = useBusinessStore();
  const businessId = selectedBusinesses[0];

  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedEmployeesByRole, setSelectedEmployeesByRole] = useState<
    Record<string, string[]>
  >({});
  const [availabilityCandidates, setAvailabilityCandidates] = useState<any[]>([]);
  const skeletonRows = useMemo(
    () => Array.from({ length: 7 }, (_, index) => ({ id: `assign-skeleton-${index}` })),
    []
  );

  const selectedTemplate = useMemo(() => {
    const dayTemplates = Array.isArray(weeklyShiftSelections[day])
      ? weeklyShiftSelections[day]
      : [];
    return dayTemplates.find((item: any) => item?.id === templateId) || null;
  }, [day, templateId, weeklyShiftSelections]);

  const requiredRoles = useMemo(
    () =>
      Array.isArray(selectedTemplate?.roleRequirements)
        ? selectedTemplate.roleRequirements
        : [],
    [selectedTemplate]
  );

  const loadDetailedRoles = useCallback(async () => {
    if (!businessId || !templateId || !selectedDate) {
      setAvailabilityCandidates([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getShiftAssignmentAvailability(businessId, {
        date: selectedDate,
        shiftTemplateId: templateId,
      });
      const normalized = Array.isArray(data?.candidates) ? data.candidates : [];
      setAvailabilityCandidates(normalized);
      setSelectedRoleId(null);
      setSelectedEmployeesByRole(weeklyRoleAssignments[assignmentKey] || {});
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToLoadRoleData"));
    } finally {
      setIsLoading(false);
    }
  }, [
    assignmentKey,
    businessId,
    getShiftAssignmentAvailability,
    selectedDate,
    t,
    templateId,
    weeklyRoleAssignments,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadDetailedRoles();
    }, [loadDetailedRoles])
  );

  const tabs = useMemo(() => {
    return requiredRoles.map((required: any) => {
      const roleId = String(required?.roleId || "");
      return {
        id: roleId,
        label:
          required?.businessRoleName ||
          required?.roleName ||
          availabilityCandidates.find((item: any) => item?.roleId === roleId)?.roleName ||
          t("user.jobs.postJob.role"),
        requiredCount: Number(required?.count || 0),
        selectedCount: selectedEmployeesByRole[roleId]?.length || 0,
      };
    });
  }, [availabilityCandidates, requiredRoles, selectedEmployeesByRole, t]);
  const requiredCountByRole = useMemo(() => {
    const map: Record<string, number> = {};
    tabs.forEach((item) => {
      map[item.id] = Math.max(Number(item.requiredCount || 0), 0);
    });
    return map;
  }, [tabs]);

  useEffect(() => {
    if (!selectedRoleId && tabs.length > 0) {
      setSelectedRoleId(tabs[0].id);
    }
  }, [selectedRoleId, tabs]);

  const members = useMemo(() => {
    if (!selectedRoleId) return [];
    const source = Array.isArray(availabilityCandidates)
      ? availabilityCandidates.filter((item: any) => item?.roleId === selectedRoleId)
      : [];
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter((item: any) => {
      const name = item?.name?.toLowerCase?.() || "";
      const email = item?.email?.toLowerCase?.() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [availabilityCandidates, search, selectedRoleId]);

  const isAssignEnabled = useMemo(() => {
    if (tabs.length === 0) return false;
    return tabs.every(
      (item) =>
        item.requiredCount <= 0 ||
        (selectedEmployeesByRole[item.id]?.length || 0) === item.requiredCount
    );
  }, [selectedEmployeesByRole, tabs]);

  const handleToggleEmployee = (roleId: string, employmentId: string) => {
    setSelectedEmployeesByRole((prev) => {
      const current = prev[roleId] || [];
      const isAlreadySelected = current.includes(employmentId);
      const requiredCount = Math.max(Number(requiredCountByRole[roleId] || 0), 0);

      if (!isAlreadySelected && requiredCount > 0 && current.length >= requiredCount) {
        toast.error(
          t("user.jobs.schedule.assignment.limitReached", {
            defaultValue: "Required headcount already reached for this role.",
          })
        );
        return prev;
      }

      const next = isAlreadySelected
        ? current.filter((id) => id !== employmentId)
        : [...current, employmentId];
      return { ...prev, [roleId]: next };
    });
  };

  const handleAssign = () => {
    if (!isAssignEnabled) {
      toast.error(t("user.jobs.schedule.requiredRoleCountNotMet"));
      return;
    }
    setWeeklyRoleAssignment(assignmentKey, selectedEmployeesByRole);
    // toast.success("Assignments saved.");
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const selectedRoleMemberIds = selectedRoleId
    ? selectedEmployeesByRole[selectedRoleId] || []
    : [];
  const selectedRoleRequiredCount = selectedRoleId
    ? Math.max(Number(requiredCountByRole[selectedRoleId] || 0), 0)
    : 0;
  const selectedRoleIsFull =
    selectedRoleRequiredCount > 0 &&
    selectedRoleMemberIds.length >= selectedRoleRequiredCount;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <SafeAreaView
        className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
        edges={["left", "right", "bottom"]}
      >
        <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl">
          <ScreenHeader
            className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
            style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
            onPressBack={() => router.back()}
            title={t("user.jobs.schedule.assignTitle")}
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
          />

          <View className="mx-4">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 12 }}
            >
              {tabs.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedRoleId(item.id)}
                  className="mx-1.5"
                >
                  <Text
                    className={`${selectedRoleId === item.id ? "border-b-2 border-primary dark:border-dark-primary" : ""} font-proximanova-semibold text-primary dark:text-dark-primary pb-3`}
                  >
                    {`${item.label} (${item.selectedCount}/${item.requiredCount})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <SearchBar className="mt-9 mx-5" value={search} onSearch={setSearch} />

        <ScrollView
          className="mx-5 flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {isLoading ? (
            skeletonRows.map((row) => (
              <View
                key={row.id}
                className="flex-row items-center p-4 mt-4 rounded-xl border border-[#eeeeee]"
              >
                <View className="w-12 h-12 rounded-full mr-3 bg-[#ECECEC]" />
                <View className="flex-1">
                  <View className="h-4 w-1/2 rounded bg-[#ECECEC]" />
                  <View className="h-3 w-2/3 rounded bg-[#ECECEC] mt-2" />
                  <View className="h-3 w-1/3 rounded bg-[#ECECEC] mt-2" />
                </View>
                <View className="w-14 h-4 rounded bg-[#ECECEC] mr-3" />
                <View className="w-6 h-6 rounded-full bg-[#ECECEC]" />
              </View>
            ))
          ) : !selectedRoleId ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                {t("user.jobs.schedule.selectRoleToAssign")}
              </Text>
            </View>
          ) : members.length === 0 ? (
            <StatusStateCard
              image={require("@/assets/images/profile.svg")}
              title={t("user.jobs.schedule.noEmployeesFound")}
              text={t("user.jobs.schedule.tryDifferentSearch", {
                defaultValue: "Try changing role or search query",
              })}
            />
          ) : (
            members.map((item: any) => (
              <TouchableOpacity
                key={item?.employmentId}
                onPress={() =>
                  item?.isAvailable !== false &&
                  selectedRoleId &&
                  (selectedRoleMemberIds.includes(item?.employmentId) || !selectedRoleIsFull)
                    ? handleToggleEmployee(selectedRoleId, item?.employmentId)
                    : undefined
                }
                className={`flex-row items-center p-4 mt-4 rounded-xl border ${
                  item?.isAvailable === false
                    ? "border-[#eeeeee] opacity-60"
                    : !selectedRoleMemberIds.includes(item?.employmentId) && selectedRoleIsFull
                      ? "border-[#eeeeee] opacity-60"
                    : "border-[#eeeeee]"
                }`}
              >
                <Image
                  source={
                    item?.avatar
                      ? {
                        uri: item.avatar.startsWith("http")
                          ? item.avatar
                          : `${process.env.EXPO_PUBLIC_API_URL}${item.avatar}`,
                      }
                      : require("@/assets/images/placeholder.png")
                  }
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                    {item?.name || t("common.unknown")}
                  </Text>
                  <Text className="text-sm text-secondary dark:text-dark-secondary font-proximanova-regular">
                    {item?.email || t("common.noEmail")}
                  </Text>
                  <Text
                    className={`mt-1 text-xs font-proximanova-semibold ${
                      item?.isAvailable === false ? "text-[#F34F4F]" : "text-[#22C55E]"
                    }`}
                  >
                    {item?.isAvailable === false ? "Not available" : "Available"}
                  </Text>
                </View>
                <Ionicons
                  name={
                    selectedRoleMemberIds.includes(item?.employmentId)
                      ? "checkmark-circle"
                      : "radio-button-off"
                  }
                  size={24}
                  color={
                    selectedRoleMemberIds.includes(item?.employmentId)
                      ? "#11293A"
                      : item?.isAvailable === false
                        ? "#D1D5DB"
                        : "#7A7A7A"
                  }
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View className="absolute bottom-10 w-full">
          <PrimaryButton
            className="mx-5"
            title={t("user.jobs.schedule.assignAction")}
            onPress={handleAssign}
            disabled={!isAssignEnabled}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Assign;

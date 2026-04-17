import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useBusinessStore } from "@/stores/businessStore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Assign = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ day?: string; templateId?: string }>();
  const day = typeof params.day === "string" ? params.day : "";
  const templateId = typeof params.templateId === "string" ? params.templateId : "";
  const assignmentKey = `${day}::${templateId}`;
  const {
    selectedBusinesses,
    weeklyShiftSelections,
    weeklyRoleAssignments,
    setWeeklyRoleAssignment,
    getBusinessRolesDetailed,
  } = useBusinessStore();
  const businessId = selectedBusinesses[0];

  const [search, setSearch] = useState("");
  const [rolesDetailed, setRolesDetailed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedEmployeesByRole, setSelectedEmployeesByRole] = useState<
    Record<string, string[]>
  >({});

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
    if (!businessId) {
      setRolesDetailed([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getBusinessRolesDetailed(businessId);
      const normalized = Array.isArray(data) ? data : [];
      setRolesDetailed(normalized);
      setSelectedRoleId(null);
      setSelectedEmployeesByRole(weeklyRoleAssignments[assignmentKey] || {});
    } catch (error: any) {
      toast.error(error?.message || "Failed to load role data");
    } finally {
      setIsLoading(false);
    }
  }, [assignmentKey, businessId, getBusinessRolesDetailed, weeklyRoleAssignments]);

  useFocusEffect(
    useCallback(() => {
      loadDetailedRoles();
    }, [loadDetailedRoles])
  );

  const tabs = useMemo(() => {
    if (requiredRoles.length === 0) {
      return rolesDetailed.map((role: any) => ({
        id: role?.id,
        label: role?.role || "Role",
        requiredCount: 0,
        selectedCount: selectedEmployeesByRole[role?.id]?.length || 0,
      }));
    }

    return requiredRoles.map((required: any) => {
      return {
        id: required?.roleId,
        label:
          required?.businessRoleName ||
          required?.roleName ||
          rolesDetailed.find((role) => role?.id === required?.roleId)?.role ||
          "Role",
        requiredCount: Number(required?.count || 0),
        selectedCount: selectedEmployeesByRole[required?.roleId]?.length || 0,
      };
    });
  }, [requiredRoles, rolesDetailed, selectedEmployeesByRole]);

  useEffect(() => {
    if (!selectedRoleId && tabs.length > 0) {
      setSelectedRoleId(tabs[0].id);
    }
  }, [selectedRoleId, tabs]);

  const selectedRoleDetail = useMemo(() => {
    if (!selectedRoleId) return null;
    return rolesDetailed.find((role) => role?.id === selectedRoleId) || null;
  }, [rolesDetailed, selectedRoleId]);

  const members = useMemo(() => {
    if (!selectedRoleId) return [];
    const source = Array.isArray(selectedRoleDetail?.assignedEmployees)
      ? selectedRoleDetail.assignedEmployees
      : [];
    const q = search.trim().toLowerCase();
    if (!q) return source;
    return source.filter((item: any) => {
      const name = item?.user?.name?.toLowerCase?.() || "";
      const email = item?.user?.email?.toLowerCase?.() || "";
      return name.includes(q) || email.includes(q);
    });
  }, [search, selectedRoleDetail, selectedRoleId]);

  const isAssignEnabled = useMemo(() => {
    if (tabs.length === 0) return false;
    return tabs.every(
      (item) =>
        item.requiredCount <= 0 ||
        (selectedEmployeesByRole[item.id]?.length || 0) >= item.requiredCount
    );
  }, [selectedEmployeesByRole, tabs]);

  const handleToggleEmployee = (roleId: string, employmentId: string) => {
    setSelectedEmployeesByRole((prev) => {
      const current = prev[roleId] || [];
      const next = current.includes(employmentId)
        ? current.filter((id) => id !== employmentId)
        : [...current, employmentId];
      return { ...prev, [roleId]: next };
    });
  };

  const handleAssign = () => {
    if (!isAssignEnabled) {
      toast.error("Required role count not met.");
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
            title="Assign"
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

        <View className="border mt-9 border-[#eeeeee] rounded-[10px] px-4 flex-row items-center mx-5">
          <Ionicons
            name="search"
            size={16}
            color={isDark ? "#fff" : "#7A7A7A"}
            style={{ marginRight: 10 }}
          />
          <TextInput
            placeholder="Search here..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={isDark ? "#fff" : "#7A7A7A"}
            style={{
              flex: 1,
              color: isDark ? "#fff" : "#111",
              backgroundColor: isDark ? "#111" : "#fff",
            }}
          />
        </View>

        <ScrollView
          className="mx-5 flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
            </View>
          ) : !selectedRoleId ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                Select a role to assign employees.
              </Text>
            </View>
          ) : members.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                No employees found.
              </Text>
            </View>
          ) : (
            members.map((item: any) => (
              <TouchableOpacity
                key={item?.employmentId}
                onPress={() =>
                  selectedRoleId
                    ? handleToggleEmployee(selectedRoleId, item?.employmentId)
                    : undefined
                }
                className="flex-row items-center p-4 mt-4 rounded-xl border border-[#eeeeee]"
              >
                <Image
                  source={
                    item?.user?.avatar
                      ? {
                        uri: item.user.avatar.startsWith("http")
                          ? item.user.avatar
                          : `${process.env.EXPO_PUBLIC_API_URL}${item.user.avatar}`,
                      }
                      : require("@/assets/images/placeholder.png")
                  }
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                    {item?.user?.name || "Unknown"}
                  </Text>
                  <Text className="text-sm text-secondary dark:text-dark-secondary font-proximanova-regular">
                    {item?.user?.email || "No email"}
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
            title="Assign"
            onPress={handleAssign}
            disabled={!isAssignEnabled}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Assign;

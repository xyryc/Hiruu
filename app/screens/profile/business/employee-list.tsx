import ScreenHeader from "@/components/header/ScreenHeader";
import AssignRoleModal from "@/components/ui/modals/AssignRoleModal";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type EmployeeItem = {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  roleName: string | null;
};

const EmployeeListScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ businessId?: string }>();
  const {
    selectedBusinesses,
    getBusinessEmployees,
    getMyBusinessRoles,
    assignBusinessRoleToEmployment,
  } = useBusinessStore();
  const resolvedBusinessId = params.businessId || selectedBusinesses[0];
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedAssignRole, setSelectedAssignRole] = useState<string | null>(null);
  const [selectedEmploymentId, setSelectedEmploymentId] = useState<string | null>(
    null
  );
  const [assigningRole, setAssigningRole] = useState(false);

  const openEmployeeProfile = (userId: string) => {
    if (!userId || !resolvedBusinessId) {
      toast.error("Employee information is unavailable");
      return;
    }

    router.push({
      pathname: "/screens/jobs/business/user-profile-preview",
      params: {
        userId,
        businessId: resolvedBusinessId,
        canRate: "true",
      },
    });
  };

  useEffect(() => {
    if (!resolvedBusinessId) return;

    let isMounted = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        const source = await getBusinessEmployees(resolvedBusinessId);

        const mapped = source
          .map((item: any) => {
            const user = item?.user;
            if (!item?.id || !user?.id) return null;
            return {
              id: item?.id,
              userId: user.id,
              name: user.name || "N/A",
              email: user.email || "N/A",
              avatar: user.avatar || null,
              roleName: item?.role?.role?.name || item?.role?.name || null,
            } as EmployeeItem;
          })
          .filter(Boolean) as EmployeeItem[];

        if (isMounted) {
          setEmployees(mapped);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load employees");
        if (isMounted) {
          setEmployees([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      isMounted = false;
    };
  }, [resolvedBusinessId, getBusinessEmployees]);

  const emptyLabel = useMemo(() => {
    if (!resolvedBusinessId) return "No business selected.";
    if (loading) return "";
    return "No employees found.";
  }, [loading, resolvedBusinessId]);

  const openRoleModal = async (employmentId: string) => {
    setSelectedEmploymentId(employmentId);
    setRoleModalVisible(true);
    setSelectedAssignRole(null);

    if (!resolvedBusinessId) return;

    try {
      setRolesLoading(true);
      const roleList = await getMyBusinessRoles(resolvedBusinessId);
      const mappedRoles = (Array.isArray(roleList) ? roleList : [])
        .filter((role: any) => role?.id && role?.role?.name && !role?.isDeleted)
        .map((role: any) => ({
          id: role.id,
          name: role.role.name,
        }));
      setRoles(mappedRoles);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load role list");
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleApplyRole = async () => {
    if (!resolvedBusinessId || !selectedEmploymentId || !selectedAssignRole) {
      toast.error("Please select a role.");
      return;
    }

    const selectedRole = roles.find((role) => role.id === selectedAssignRole);
    const nextRoleName = selectedRole?.name || "Not assigned";
    const previousEmployees = employees;

    // Optimistic UI update for role assignment on the list card.
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === selectedEmploymentId
          ? { ...employee, roleName: nextRoleName }
          : employee
      )
    );

    try {
      setAssigningRole(true);
      const result = await assignBusinessRoleToEmployment(
        resolvedBusinessId,
        selectedEmploymentId,
        selectedAssignRole
      );
      toast.success(translateApiMessage(result?.message || "business_role_assigned"));
      setRoleModalVisible(false);
    } catch (error: any) {
      setEmployees(previousEmployees);
      toast.error(translateApiMessage(error?.message || "Failed to assign role"));
    } finally {
      setAssigningRole(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background" edges={["left", "right", "bottom"]}>
      <ScreenHeader
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
        onPressBack={() => router.back()}
        title="Employee List"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-secondary dark:text-dark-secondary">{emptyLabel}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 border border-[#EEEEEE] dark:border-gray-800 rounded-xl px-4 py-3 mb-3">
              <TouchableOpacity
                onPress={() => openEmployeeProfile(item.userId)}
                activeOpacity={0.7}
                className="flex-1 flex-row items-center gap-3"
              >
                <Image
                  source={item?.avatar || require("@/assets/images/placeholder.png")}
                  style={{ width: 42, height: 42, borderRadius: 999 }}
                  contentFit="cover"
                />
                <View className="flex-1">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                    {item.name}
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    {item.email}
                  </Text>
                  <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary mt-0.5">
                    Role: {item.roleName || "Not assigned"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openRoleModal(item.id)}
                className="h-8 w-8 rounded-full bg-[#F5F5F5] items-center justify-center"
              >
                <Ionicons name="ellipsis-vertical" size={16} color={isDark ? "#fff" : "#111"} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <AssignRoleModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        assignRole={roles}
        loading={rolesLoading}
        onApply={handleApplyRole}
        applying={assigningRole}
        selectedAssignRole={selectedAssignRole}
        setSelectedAssignRole={setSelectedAssignRole}
      />
    </SafeAreaView>
  );
};

export default EmployeeListScreen;

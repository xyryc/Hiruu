import ScreenHeader from "@/components/header/ScreenHeader";
import DeleteConfirmModal from "@/components/ui/modals/DeleteConfirmModal";
import { useBusinessStore } from "@/stores/businessStore";
import { Entypo, Feather } from "@expo/vector-icons";
import { useIsFocused } from "expo-router";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const AllCreatedRole = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { selectedBusinesses, getMyBusinessRoles, deleteBusinessRole } =
    useBusinessStore();
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuRoleId, setMenuRoleId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isFocused = useIsFocused();
  const roleSkeletonRows = useState(
    Array.from({ length: 5 }, (_, index) => `role-skeleton-${index}`)
  )[0];

  const businessId = selectedBusinesses[0];

  const loadRoles = useCallback(async () => {
    if (!businessId) {
      setRoles([]);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getMyBusinessRoles(businessId);
      setRoles(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToLoadRoles"));
    } finally {
      setIsLoading(false);
    }
  }, [businessId, getMyBusinessRoles, t]);

  useEffect(() => {
    if (isFocused) {
      loadRoles();
    }
  }, [isFocused, loadRoles]);

  const handleDeleteRole = useCallback(async (roleId: string) => {
    if (!businessId) return;
    try {
      setDeleting(true);
      await deleteBusinessRole(businessId, roleId);
      setRoles((prev) => prev.filter((role) => role.id !== roleId));
      setMenuRoleId(null);
      toast.success(t("user.jobs.schedule.roleDeleted"));
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToDeleteRole"));
    } finally {
      setDeleting(false);
    }
  }, [businessId, deleteBusinessRole, t]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >

      <ScreenHeader
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
        onPressBack={() => router.back()}
        title={t("user.jobs.schedule.allCreatedRoleTitle")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <TouchableOpacity
            onPress={() =>
              router.push("/screens/schedule/business/create-role")
            }
            className="h-10 w-10 rounded-full bg-[#FFFFFF] flex-row justify-center items-center "
          >
            <Feather name="plus" size={18} color="black" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="mx-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mt-4">
          {isLoading ? (
            <View pointerEvents="none">
              {roleSkeletonRows.map((key) => (
                <View
                  key={key}
                  className="flex-row justify-between items-center border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
                >
                  <View className="h-4 w-36 bg-[#E5E7EB] rounded-md" />
                  <View className="h-4 w-4 bg-[#E5E7EB] rounded-full" />
                </View>
              ))}
            </View>
          ) : roles.length > 0 ? (
            roles.map((role, index) => {
              const roleName = String(role?.role?.name || "").trim().toLowerCase();
              const isOwnerRole =
                roleName === "owner" ||
                Boolean(role?.isSystemLocked) ||
                Boolean(role?.role?.isSystemLocked);
              return (
                <TouchableOpacity
                  onPress={() => {
                    if (isOwnerRole) return;
                    router.push({
                      pathname: "/screens/schedule/business/update-role",
                      params: {
                        businessRoleId: role?.id,
                        roleId: role?.roleId,
                      },
                    });
                  }}
                  disabled={isOwnerRole}
                  className="flex-row justify-between items-center border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
                  key={role?.id || index}
                >
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary capitalize">
                    {role?.role?.name || t("user.jobs.schedule.roleFallback")}
                  </Text>

                  {/* three dot dropdown */}
                  {!isOwnerRole ? (
                    <TouchableOpacity
                      onPress={() => setMenuRoleId(role.id)}
                      className="p-2 rounded-full"
                    >
                      <Entypo name="dots-three-vertical" size={16} color="black" />
                    </TouchableOpacity>
                  ) : <View className='w-6 h-6' />}
                </TouchableOpacity>
              );
            })
          ) : (
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                {t("user.jobs.schedule.noRolesFound")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <DeleteConfirmModal
        visible={Boolean(menuRoleId)}
        deleting={deleting}
        onClose={() => setMenuRoleId(null)}
        onConfirm={() => menuRoleId && handleDeleteRole(menuRoleId)}
      />
    </SafeAreaView>
  );
};

export default AllCreatedRole;

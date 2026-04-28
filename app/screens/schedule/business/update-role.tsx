import ScreenHeader from "@/components/header/ScreenHeader";
import CheckButton from "@/components/ui/buttons/CheckButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

type RoleItem = {
  id: string;
  name: string;
};

type PermissionItem = {
  key: string;
  title: string;
};

type PermissionGroup = {
  id: string;
  label: string;
  permissions: PermissionItem[];
};

const toLocaleKey = (value?: string) => String(value || "").trim().toLowerCase();
const toFallbackLabel = (value?: string) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const stripped = raw
    .replace(/^permissions[_\s]*/i, "")
    .replace(/_/g, " ")
    .trim();

  return stripped.replace(/\b\w/g, (char) => char.toUpperCase());
};

const UpdateRole = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const {
    selectedBusinesses,
    getPermissions,
    getBusinessRoleById,
    updateBusinessRole,
  } = useBusinessStore();
  const params = useLocalSearchParams<{
    businessRoleId?: string;
    roleId?: string;
  }>();
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );
  const [permissionValues, setPermissionValues] = useState<
    Record<string, number>
  >({});
  const [roleSelectorKey, setRoleSelectorKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [roleDetailsLoading, setRoleDetailsLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const businessId = selectedBusinesses[0];
  const businessRoleId = Array.isArray(params.businessRoleId)
    ? params.businessRoleId[0]
    : params.businessRoleId;
  const roleIdParam = Array.isArray(params.roleId)
    ? params.roleId[0]
    : params.roleId;
  const targetRoleId = businessRoleId || roleIdParam;
  const getPermissionText = useCallback((value?: string) => {
    const key = toLocaleKey(value);
    const translated = t(key);
    if (translated && translated !== key) return translated;
    return toFallbackLabel(value);
  }, [t]);

  useEffect(() => {
    let isMounted = true;

    const loadPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const data = await getPermissions();

        const groups: PermissionGroup[] = Object.entries(data || {}).map(
          ([id, value]: [string, any]) => ({
            id,
            label: value?.label || id,
            permissions: Array.isArray(value?.permissions)
              ? value.permissions
                  .filter(
                    (item: any) =>
                      typeof item?.key === "string" &&
                      typeof item?.title === "string"
                  )
                  .map((item: any) => ({ key: item.key, title: item.title }))
              : [],
          })
        );

        if (isMounted) {
          setPermissionGroups(groups);
          setExpandedGroups(
            groups.reduce(
              (acc, group) => ({ ...acc, [group.id]: false }),
              {} as Record<string, boolean>
            )
          );
        }
      } catch (error: any) {
        toast.error(error?.message || t("user.jobs.schedule.failedToLoadPermissions"));
      } finally {
        if (isMounted) {
          setPermissionsLoading(false);
        }
      }
    };

    loadPermissions();
    return () => {
      isMounted = false;
    };
  }, [getPermissions, t]);

  useEffect(() => {
    let isMounted = true;

    const loadRoleDetails = async () => {
      if (!businessId || !targetRoleId) return;

      try {
        setRoleDetailsLoading(true);
        const data = await getBusinessRoleById(businessId, targetRoleId);
        if (!isMounted || !data) return;

        setDescription(data?.description || "");

        if (data?.role?.id && data?.role?.name) {
          setSelectedRole({
            id: data.role.id,
            name: data.role.name,
          });
        }

        if (Array.isArray(data?.permissions)) {
          const mapped = data.permissions.reduce(
            (acc: Record<string, number>, permissionKey: string) => {
              if (typeof permissionKey === "string") {
                acc[permissionKey] = 1;
              }
              return acc;
            },
            {}
          );
          setPermissionValues(mapped);
        } else if (data?.permissions && typeof data.permissions === "object") {
          const mapped = Object.entries(data.permissions).reduce(
            (acc: Record<string, number>, [key, value]) => {
              const numeric = Number(value);
              if (Number.isFinite(numeric) && numeric > 0) {
                acc[key] = Math.max(1, Math.min(3, Math.trunc(numeric)));
              }
              return acc;
            },
            {}
          );
          setPermissionValues(mapped);
        } else {
          setPermissionValues({});
        }
      } catch (error: any) {
        toast.error(error?.message || t("user.jobs.schedule.failedToLoadRoleDetails"));
      } finally {
        if (isMounted) {
          setRoleDetailsLoading(false);
        }
      }
    };

    loadRoleDetails();
    return () => {
      isMounted = false;
    };
  }, [businessId, getBusinessRoleById, t, targetRoleId]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return permissionGroups;

    return permissionGroups.map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) =>
        getPermissionText(permission.title).toLowerCase().includes(query)
      ),
    })).filter((group) => group.permissions.length > 0);
  }, [getPermissionText, permissionGroups, search]);

  useEffect(() => {
    if (permissionGroups.length === 0) return;

    setExpandedGroups((prev) =>
      permissionGroups.reduce(
        (acc, group) => {
          const hasSelectedPermission = group.permissions.some(
            (permission) => (permissionValues[permission.key] || 0) > 0
          );
          acc[group.id] = Boolean(prev[group.id]) || hasSelectedPermission;
          return acc;
        },
        {} as Record<string, boolean>
      )
    );
  }, [permissionGroups, permissionValues]);

  const handleGroupToggle = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const togglePermission = (key: string, bit: 1 | 2) => {
    setPermissionValues((prev) => {
      const current = prev[key] || 0;
      const updated = current & bit ? current & ~bit : current | bit;

      if (updated === 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }

      return { ...prev, [key]: updated };
    });
  };

  const handleReset = () => {
    setSearch("");
    setDescription("");
    setSelectedRole(null);
    setPermissionValues({});
    setRoleSelectorKey((prev) => prev + 1);
    setExpandedGroups(
      permissionGroups.reduce(
        (acc, group) => ({ ...acc, [group.id]: false }),
        {} as Record<string, boolean>
      )
    );
    Keyboard?.dismiss?.();
  };

  const handleUpdateRole = async () => {
    if (!businessId) {
      toast.error(t("user.jobs.schedule.selectBusinessFirst"));
      return;
    }

    if (!targetRoleId) {
      toast.error(t("user.jobs.schedule.roleIdMissing"));
      return;
    }

    if (!selectedRole?.id) {
      toast.error(t("user.jobs.schedule.selectPredefinedRole"));
      return;
    }

    if (Object.keys(permissionValues).length === 0) {
      toast.error(t("user.jobs.schedule.selectAtLeastOnePermission"));
      return;
    }

    const payload = {
      roleId: selectedRole.id,
      description: description.trim() || null,
      permissions: permissionValues,
    };

    try {
      setIsSubmitting(true);
      await updateBusinessRole(businessId, targetRoleId, payload);
      toast.success(t("user.jobs.schedule.roleUpdatedSuccessfully"));
      router.back();
    } catch (error: any) {
      toast.error(error?.message || t("user.jobs.schedule.failedToUpdateRole"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5">
          <ScreenHeader
            style={{ paddingTop: insets.top + 15, paddingBottom: 20 }}
            className=""
            onPressBack={() => router.back()}
            title={t("user.jobs.schedule.updateRole")}
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
            components={
              <TouchableOpacity onPress={handleReset} className="">
                <Text className="font-proximanova-semibold text-[#4FB2F3]">
                  {t("user.jobs.schedule.reset")}
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} className="mx-5">
          {/* predefine role */}
          <View className="mt-4">
            <RoleSelector
              key={roleSelectorKey}
              selectedRole={selectedRole}
              onSelectRole={(role) => setSelectedRole(role)}
            />
          </View>

          <View className="mt-6">
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              {t("user.jobs.schedule.description")}
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t("user.jobs.schedule.addRoleDescription")}
              placeholderTextColor="#7A7A7A"
              multiline
              className="mt-3 min-h-[100px] border border-[#EEEEEE] rounded-[10px] px-4 py-3 font-proximanova-regular text-primary dark:text-dark-primary"
              textAlignVertical="top"
            />
          </View>

          {/* Permissions Section */}
          <View className="mt-8">
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              {t("user.jobs.schedule.permissionsSection")}
            </Text>
            <SearchBar onSearch={(text) => setSearch(text)} className="mt-4" />
            <View className="flex-row justify-between items-center px-4 py-3 border border-[#EEEEEE] rounded-[10px] mt-4">
              <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                {t("user.jobs.schedule.actions")}
              </Text>
              <View className="flex-row items-center gap-7 ">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {t("user.jobs.schedule.view")}
                </Text>
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  {t("user.jobs.schedule.edit")}
                </Text>
              </View>
            </View>
          </View>

          {/* toggle button */}
          <View>
            {(permissionsLoading || roleDetailsLoading) && (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" />
              </View>
            )}
            {filteredGroups.map((group) => (
              <View
                key={group.id}
                className="border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
              >
                <View className="flex-row justify-between items-center ">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary capitalize">
                    {getPermissionText(group.label)}
                  </Text>
                  <ToggleButton
                    isOn={Boolean(expandedGroups[group.id])}
                    setIsOn={() => handleGroupToggle(group.id)}
                  />
                </View>
                {expandedGroups[group.id] && (
                  <View className="border-b border-[#EEEEEE] mt-3" />
                )}
                {expandedGroups[group.id] &&
                  group.permissions.map((permission) => {
                    const value = permissionValues[permission.key] || 0;
                    return (
                      <CheckButton
                        key={permission.key}
                        title={getPermissionText(permission.title)}
                        viewChecked={Boolean(value & 1)}
                        editChecked={Boolean(value & 2)}
                        onToggleView={() => togglePermission(permission.key, 1)}
                        onToggleEdit={() => togglePermission(permission.key, 2)}
                      />
                    );
                  })}
              </View>
            ))}
            {!permissionsLoading &&
              !roleDetailsLoading &&
              permissionGroups.length > 0 &&
              filteredGroups.length === 0 && (
              <View className="py-8 items-center">
                <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
                  {t("user.jobs.schedule.noPermissionsFound")}
                </Text>
              </View>
            )}
            {!permissionsLoading &&
              !roleDetailsLoading &&
              permissionGroups.length === 0 && (
              <View className="py-8 items-center">
                <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
                  {t("user.jobs.schedule.noPermissionsAvailable")}
                </Text>
              </View>
            )}
          </View>

          <PrimaryButton
            title={t("user.jobs.schedule.updateRole")}
            className="my-10"
            onPress={handleUpdateRole}
            loading={isSubmitting}
            disabled={isSubmitting || permissionsLoading || roleDetailsLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdateRole;

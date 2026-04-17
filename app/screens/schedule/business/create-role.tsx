import ScreenHeader from "@/components/header/ScreenHeader";
import CheckButton from "@/components/ui/buttons/CheckButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { AutoSkeletonView } from "react-native-auto-skeleton";
import { useTranslation } from "react-i18next";
import {
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

const CreateRole = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { selectedBusinesses, createBusinessRole, getPermissions, getRoles } =
    useBusinessStore();
  const [search, setSearch] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );
  const [roleOptions, setRoleOptions] = useState<RoleItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [permissionValues, setPermissionValues] = useState<
    Record<string, number>
  >({});
  const [roleSelectorKey, setRoleSelectorKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const businessId = selectedBusinesses[0];

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
        toast.error(
          error?.message || t("user.jobs.schedule.failedToLoadPermissions")
        );
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

    const loadRoles = async () => {
      try {
        setRolesLoading(true);
        const data = await getRoles();
        if (isMounted) {
          const normalized = (Array.isArray(data) ? data : [])
            .filter((item: any) => item?.id && item?.name)
            .map((item: any) => ({ id: item.id, name: item.name }));
          setRoleOptions(normalized);
        }
      } catch (error: any) {
        toast.error(error?.message || t("user.jobs.schedule.failedToLoadRoles"));
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
  }, [getRoles, t]);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return permissionGroups;

    return permissionGroups.map((group) => ({
      ...group,
      permissions: group.permissions.filter((permission) =>
        permission.title.toLowerCase().includes(query)
      ),
    })).filter((group) => group.permissions.length > 0);
  }, [permissionGroups, search]);

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
    Keyboard.dismiss();
  };

  const handleSaveRole = async () => {
    if (!businessId) {
      toast.error(t("user.jobs.schedule.selectBusinessFirst"));
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
      await createBusinessRole(businessId, payload);
      toast.success(t("user.jobs.schedule.roleCreatedSuccessfully"));
      router.back();
    } catch (error: any) {
      const messageKey =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      if (typeof messageKey === "string" && messageKey.length > 0) {
        toast.error(translateApiMessage(messageKey));
      } else {
        toast.error(t("user.jobs.schedule.failedToCreateRole"));
      }
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
        <ScreenHeader
          className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
          style={{ paddingTop: insets.top + 10, paddingBottom: 16 }}
          onPressBack={() => router.back()}
          title={t("user.jobs.schedule.createRole")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity onPress={handleReset} className='p-2'>
              <Text className="font-proximanova-semibold text-[#4FB2F3]">
                {t("user.jobs.schedule.reset")}
              </Text>
            </TouchableOpacity>
          }
        />

        <ScrollView showsVerticalScrollIndicator={false} className="mx-5">
          {/* predefine role */}
          <View className="mt-4">
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              {t("user.jobs.schedule.predefinedRole")}
            </Text>

            <RoleSelector
              key={roleSelectorKey}
              roles={roleOptions}
              loading={rolesLoading}
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
            {permissionsLoading && (
              <AutoSkeletonView isLoading={true} defaultRadius={10}>
                {Array.from({ length: 3 }, (_, index) => (
                  <View
                    key={`permission-skeleton-${index}`}
                    className="border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="h-4 w-40 bg-[#E5E7EB] rounded-md" />
                      <View className="h-6 w-10 bg-[#E5E7EB] rounded-full" />
                    </View>
                  </View>
                ))}
              </AutoSkeletonView>
            )}
            {filteredGroups.map((group) => (
              <View
                key={group.id}
                className="border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
              >
                <View className="flex-row justify-between items-center ">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary capitalize">
                    {group.label}
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
                        title={permission.title}
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
              permissionGroups.length > 0 &&
              filteredGroups.length === 0 && (
                <View className="py-8 items-center">
                  <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
                    {t("user.jobs.schedule.noPermissionsFound")}
                  </Text>
                </View>
              )}
            {!permissionsLoading && permissionGroups.length === 0 && (
              <View className="py-8 items-center">
                <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary">
                  {t("user.jobs.schedule.noPermissionsAvailable")}
                </Text>
              </View>
            )}
          </View>

          <PrimaryButton
            title={t("user.jobs.schedule.saveRole")}
            className="my-10"
            onPress={handleSaveRole}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateRole;

import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type RoleItem = {
  id: string;
  name: string;
};

type RoleSelectorProps = {
  className?: string;
  roles?: RoleItem[];
  loading?: boolean;
  placeholder?: string;
  onSelectRole?: (role: RoleItem | null) => void;
  selectedRole?: RoleItem | null;
  showSaveBadge?: boolean;
};

const RoleSelector = ({
  className,
  roles = [],
  loading = false,
  placeholder,
  onSelectRole,
  selectedRole,
  showSaveBadge = true,
}: RoleSelectorProps) => {
  const { t } = useTranslation();
  const [localSelectedRole, setLocalSelectedRole] = useState<RoleItem | null>(
    selectedRole || null
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLocalSelectedRole(selectedRole || null);
  }, [selectedRole]);

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [roles, searchQuery]
  );

  const handleRoleSelect = (role: RoleItem) => {
    setLocalSelectedRole(role);
    onSelectRole?.(role);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setSearchQuery("");
  };
  const resolvedPlaceholder = placeholder || t("user.jobs.schedule.selectRole");

  return (
    <View className={`${className}`}>
      {/* Role Selector Button */}
      <TouchableOpacity
        onPress={handleDropdownToggle}
        className="flex-row items-center border border-[#EEEEEE] py-2.5 px-3 mt-4 rounded-lg bg-white mb-3"
      >
        <Text
          className={`flex-1 font-proximanova-semibold text-sm text-primary dark:text-dark-primary capitalize`}
        >
          {localSelectedRole ? localSelectedRole.name : resolvedPlaceholder}
        </Text>
        <View className="flex-row items-center gap-1.5">
          {showSaveBadge ? (
            <View className="py-1 px-5 bg-[#11293A] rounded-full">
              <Text className="font-proximanova-semibold text-sm text-[#FFFFFF]">
                {t("user.jobs.schedule.save")}
              </Text>
            </View>
          ) : null}
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown Content */}
      {isDropdownOpen && (
        <View className="border border-[#EEEEEE] rounded-lg bg-white overflow-hidden">
          {/* Search Bar */}
          <View className="mx-4 mt-4 ">
            <View className="flex-row items-center border border-[#EEEEEE] rounded-lg px-3 ">
              <Ionicons name="search" size={20} color="#666" className="mr-2" />
              <TextInput
                placeholder={t("common.searchHere")}
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 py-3 text-base font-proximanova-regular text-secondary dark:text-dark-secondary"
                autoFocus={true}
                placeholderTextColor="#666"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialIcons name="clear" size={20} color="#7A7A7A" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Roles List using ScrollView */}
          <ScrollView
            style={{ maxHeight: 260 }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {loading && (
              <View className="px-4 pb-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <View
                    key={`role-option-skeleton-${index}`}
                    className="h-10 bg-[#E5E7EB] rounded-md mt-3"
                  />
                ))}
              </View>
            )}
            {!loading &&
              filteredRoles.map((item, index) => (
                <TouchableOpacity
                  style={{
                    marginBottom: index === filteredRoles.length - 1 ? 15 : 0,
                  }}
                  key={item.id}
                  onPress={() => handleRoleSelect(item)}
                  className={`px-4 py-3 ${localSelectedRole?.id === item.id ? "bg-blue-50" : "bg-white"
                    } `}
                >
                  <Text
                    className={`text-sm font-proximanova-regular text-primary dark:text-dark-primary capitalize `}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            {!loading && filteredRoles.length === 0 && (
              <View className="p-4 items-center">
                <Text className="text-base text-gray-600">
                  {t("user.jobs.schedule.noRolesFound")}
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default RoleSelector;

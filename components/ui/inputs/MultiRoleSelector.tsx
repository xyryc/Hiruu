import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type MultiRoleSelectorItem = {
  id: string;
  name: string;
};

type MultiRoleSelectorProps = {
  className?: string;
  roles?: MultiRoleSelectorItem[];
  selectedRoleIds?: string[];
  loading?: boolean;
  placeholder?: string;
  helperText?: string;
  maxSelection?: number;
  onChange?: (roleIds: string[]) => void;
  onLimitReached?: (maxSelection: number) => void;
};

const MultiRoleSelector = ({
  className,
  roles = [],
  selectedRoleIds = [],
  loading = false,
  placeholder = "Select preferred roles",
  helperText,
  maxSelection = 4,
  onChange,
  onLimitReached,
}: MultiRoleSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return roles;
    return roles.filter((role) => role.name.toLowerCase().includes(query));
  }, [roles, searchQuery]);

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds]
  );

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setSearchQuery("");
  };

  const handleToggleRole = (roleId: string) => {
    const isSelected = selectedRoleIds.includes(roleId);

    if (isSelected) {
      onChange?.(selectedRoleIds.filter((id) => id !== roleId));
      return;
    }

    if (selectedRoleIds.length >= maxSelection) {
      onLimitReached?.(maxSelection);
      return;
    }

    onChange?.([...selectedRoleIds, roleId]);
  };

  const handleRemoveRole = (roleId: string) => {
    onChange?.(selectedRoleIds.filter((id) => id !== roleId));
  };

  const triggerLabel =
    selectedRoles.length > 0
      ? `${selectedRoles.length} role${selectedRoles.length > 1 ? "s" : ""} selected`
      : placeholder;

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={handleToggleDropdown}
        className="flex-row items-center border border-[#EEEEEE] rounded-xl bg-white px-4 py-3"
      >
        <Text className="flex-1 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
          {triggerLabel}
        </Text>
        <Ionicons
          name={isDropdownOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color="#7A7A7A"
        />
      </TouchableOpacity>

      {helperText ? (
        <Text className="mt-2 font-proximanova-regular text-xs text-secondary dark:text-dark-secondary">
          {helperText}
        </Text>
      ) : null}

      {selectedRoles.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {selectedRoles.map((role) => (
            <View
              key={role.id}
              className="flex-row items-center gap-1 rounded-full bg-[#E5F4FD] px-3 py-2"
            >
              <Text className="font-proximanova-semibold text-sm text-[#11293A]">
                {role.name}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveRole(role.id)}>
                <MaterialIcons name="close" size={16} color="#11293A" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : null}

      {isDropdownOpen ? (
        <View className="mt-3 overflow-hidden rounded-xl border border-[#EEEEEE] bg-white">
          <View className="mx-4 mt-4 flex-row items-center rounded-lg border border-[#EEEEEE] px-3">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search role..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 py-3 pl-2 text-base font-proximanova-regular text-secondary dark:text-dark-secondary"
              placeholderTextColor="#666"
              autoFocus
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialIcons name="clear" size={20} color="#7A7A7A" />
              </TouchableOpacity>
            ) : null}
          </View>

          <ScrollView
            style={{ maxHeight: 260 }}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {loading ? (
              <View className="items-center p-4">
                <ActivityIndicator size="small" />
              </View>
            ) : null}

            {!loading
              ? filteredRoles.map((role, index) => {
                  const isSelected = selectedRoleIds.includes(role.id);
                  return (
                    <TouchableOpacity
                      key={role.id}
                      onPress={() => handleToggleRole(role.id)}
                      style={{
                        marginBottom: index === filteredRoles.length - 1 ? 12 : 0,
                      }}
                      className={`flex-row items-center justify-between px-4 py-3 ${
                        isSelected ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                        {role.name}
                      </Text>
                      {isSelected ? (
                        <MaterialIcons name="check-circle" size={18} color="#4FB2F3" />
                      ) : (
                        <View className="h-[18px] w-[18px] rounded-full border border-[#D9D9D9]" />
                      )}
                    </TouchableOpacity>
                  );
                })
              : null}

            {!loading && filteredRoles.length === 0 ? (
              <View className="items-center p-4">
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  No roles found
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
};

export default MultiRoleSelector;

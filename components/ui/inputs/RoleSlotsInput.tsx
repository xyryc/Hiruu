import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

type RoleSlot = {
  id: number;
  roleName: string;
  roleId?: string;
  requiredCount: number;
};

const areRoleSlotsEqual = (a: RoleSlot[], b: RoleSlot[]) => {
  if (a.length !== b.length) return false;

  return a.every((slot, index) => {
    const next = b[index];
    return (
      slot.roleId === next?.roleId &&
      slot.roleName === next?.roleName &&
      slot.requiredCount === next?.requiredCount
    );
  });
};

type RoleSlotsInputProps = {
  titleHeight?: boolean;
  selectedRoleToAdd?: { id: string; name: string } | null;
  addRoleTrigger?: number;
  resetTrigger?: number;
  initialRoleSlots?: { roleId: string; roleName: string; count: number }[];
  onTotalRequiredChange?: (total: number) => void;
  onRoleSlotsChange?: (
    slots: { roleId: string; roleName: string; count: number }[]
  ) => void;
  onPressAddRole?: () => void;
};

const RoleSlotsInput = ({
  titleHeight,
  selectedRoleToAdd,
  addRoleTrigger = 0,
  resetTrigger = 0,
  initialRoleSlots = [],
  onTotalRequiredChange,
  onRoleSlotsChange,
  onPressAddRole,
}: RoleSlotsInputProps) => {
  const [roleSlots, setRoleSlots] = useState<RoleSlot[]>([]);

  const getNextSlotId = (slots: RoleSlot[]) =>
    slots.length > 0 ? Math.max(...slots.map((slot) => slot.id)) + 1 : 1;

  useEffect(() => {
    if (!selectedRoleToAdd?.name) return;

    setRoleSlots((prev) => {
      const exists = prev.some(
        (slot) =>
          (slot.roleId && slot.roleId === selectedRoleToAdd.id) ||
          slot.roleName.trim().toLowerCase() ===
            selectedRoleToAdd.name.trim().toLowerCase()
      );
      if (exists) return prev;

      return [
        ...prev,
        {
          id: getNextSlotId(prev),
          roleName: selectedRoleToAdd.name,
          roleId: selectedRoleToAdd.id,
          requiredCount: 1,
        },
      ];
    });
  }, [addRoleTrigger, selectedRoleToAdd]);

  useEffect(() => {
    setRoleSlots([]);
  }, [resetTrigger]);

  useEffect(() => {
    if (!Array.isArray(initialRoleSlots) || initialRoleSlots.length === 0) {
      return;
    }

    const mappedSlots: RoleSlot[] = initialRoleSlots.map((slot, index) => ({
      id: index + 1,
      roleName: slot.roleName,
      roleId: slot.roleId,
      requiredCount: Number(slot.count || 0),
    }));
    setRoleSlots((prev) =>
      areRoleSlotsEqual(prev, mappedSlots) ? prev : mappedSlots
    );
  }, [initialRoleSlots]);

  useEffect(() => {
    const total = roleSlots.reduce(
      (sum, slot) => sum + Math.max(0, slot.requiredCount),
      0
    );
    onTotalRequiredChange?.(total);
  }, [onTotalRequiredChange, roleSlots]);

  useEffect(() => {
    const normalized = roleSlots
      .filter((slot) => slot.roleId && slot.requiredCount > 0)
      .map((slot) => ({
        roleId: slot.roleId as string,
        roleName: slot.roleName,
        count: slot.requiredCount,
      }));
    onRoleSlotsChange?.(normalized);
  }, [onRoleSlotsChange, roleSlots]);

  const updateRequiredCount = (slotId: number, increment: boolean) => {
    setRoleSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              requiredCount: increment
                ? slot.requiredCount + 1
                : Math.max(0, slot.requiredCount - 1),
            }
          : slot
      )
    );
  };

  const removeRoleSlot = (slotId: number) => {
    setRoleSlots((prev) => prev.filter((slot) => slot.id !== slotId));
  };

  const updateRoleName = (slotId: number, roleName: string) => {
    setRoleSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, roleName } : slot))
    );
  };

  return (
    <View className="py-5">
      {titleHeight || (
        <Text className="text-base font-proximanova-semibold text-primary mb-4">
          Role Slots
        </Text>
      )}

      {roleSlots.length === 0 ? (
        <View className="border border-dashed border-[#D1D5DB] rounded-[10px] py-4 px-3">
          <Text className="text-sm text-secondary font-proximanova-regular text-center">
            Select a role to create a role slot
          </Text>
        </View>
      ) : (
        roleSlots.map((slot) => (
          <View key={slot.id} className="flex-row items-center mb-3 gap-3">
            {/* Role Input */}
            <View className="flex-1">
              <TextInput
                placeholder="Role name"
                value={slot.roleName}
                onChangeText={(text) => updateRoleName(slot.id, text)}
                className="border border-[#EEEEEE] px-2.5 py-2.5 rounded-lg font-proximanova-regular text-sm"
                autoCapitalize="words"
              />
            </View>

            {/* Value Display */}
            <View className="border border-[#EEEEEE] flex-row justify-between items-center gap-6 px-2 py-3 rounded-xl">
              <View>
                <Text className="font-proximanova-semibold text-primary">
                  {slot.requiredCount.toString().padStart(2, "0")}
                </Text>
              </View>

              <View className="flex-row justify-center items-center">
                {/* Plus Button */}
                <TouchableOpacity
                  onPress={() => updateRequiredCount(slot.id, true)}
                >
                  <Feather name="plus" size={16} color="#7A7A7A" />
                </TouchableOpacity>

                {/* Minus Button */}
                <TouchableOpacity
                  onPress={() => updateRequiredCount(slot.id, false)}
                >
                  <Feather name="minus" size={16} color="#7A7A7A" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Add/Remove Circle Button */}
            <TouchableOpacity
              onPress={() =>
                slot.id === roleSlots[roleSlots.length - 1].id
                  ? onPressAddRole?.()
                  : removeRoleSlot(slot.id)
              }
              className="items-center justify-center"
            >
              <Feather
                name={
                  slot.id === roleSlots[roleSlots.length - 1].id
                    ? "plus-circle"
                    : "minus-circle"
                }
                size={24}
                color={
                  slot.id === roleSlots[roleSlots.length - 1].id
                    ? "#4FB2F3"
                    : "#F87171"
                }
              />
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

export default RoleSlotsInput;

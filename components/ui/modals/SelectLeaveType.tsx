import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type LeaveTypeValue =
  | "sick"
  | "personal"
  | "workFromHome"
  | "emergency"
  | "casual"
  | "unpaid"
  | "other";

export const LEAVE_TYPE_OPTIONS: { label: string; value: LeaveTypeValue }[] = [
  { label: "Sick", value: "sick" },
  { label: "Personal", value: "personal" },
  { label: "Work From Home", value: "workFromHome" },
  { label: "Emergency", value: "emergency" },
  { label: "Casual", value: "casual" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Other", value: "other" },
];

interface SelectLeaveTypeProps {
  value?: LeaveTypeValue;
  onChange?: (value: LeaveTypeValue) => void;
}

const SelectLeaveType = ({ value, onChange }: SelectLeaveTypeProps) => {
  const [internalSelected, setInternalSelected] = useState<LeaveTypeValue>(
    LEAVE_TYPE_OPTIONS[0]?.value
  );
  const selected = value ?? internalSelected;

  const handleSelect = (nextValue: LeaveTypeValue) => {
    if (value === undefined) {
      setInternalSelected(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <View className="">
      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary  mb-2.5">
        Select Leave Type
      </Text>

      <View className="flex-wrap flex-row gap-2.5">
        {LEAVE_TYPE_OPTIONS.map((item) => {
          const isSelected = selected === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => handleSelect(item.value)}
              className={`px-2.5 py-1 rounded-3xl ${isSelected ? "bg-[#4FB2F3]" : "bg-[#F5F5F5]"
                }`}
            >
              <Text
                className={`text-center font-proximanova-regular text-sm ${isSelected ? "text-white" : "text-gray-800"}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default SelectLeaveType;

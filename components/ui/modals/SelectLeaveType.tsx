import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const LeaveData = [
  { label: "Sick", value: "sick" },
  { label: "Vacation", value: "vacation" },
  { label: "Personal", value: "personal" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Other", value: "other" },
];

const SelectLeaveType = () => {
  const [selected, setSelected] = useState<string>(LeaveData[0]?.value);

  return (
    <View className="">
      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary  mb-2.5">
        Select Leave Type
      </Text>

      <View className="flex-wrap flex-row gap-2.5">
        {LeaveData.map((item) => {
          const isSelected = selected === item.value;
          return (
            <TouchableOpacity
              key={item.value}
              onPress={() => setSelected(item.value)}
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

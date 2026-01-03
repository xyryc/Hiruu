import { ActionIconCardProps } from "@/types";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ActionIconCard = ({
  icon,
  title,
  count,
  onPress,
}: ActionIconCardProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex items-center justify-center mr-1"
    >
      <View>
        {count !== undefined && count !== null && count > 0 && (
          <Text className="absolute top-1.5 right-7 z-10 w-[14px] h-[14px] text-[10px] text-center text-white bg-[#F34F4F] rounded-full">
            {count}
          </Text>
        )}
        <View className="p-3 bg-[#F5F5F5] rounded-full mx-5">{icon}</View>
      </View>

      <Text className="mt-2.5 text-primary dark:text-dark-primary text-sm font-proximanova-semibold">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default ActionIconCard;

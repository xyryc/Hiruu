import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";

type TShiftsSummaryCardProps = {
  icon?: ReactNode;
  title?: string;
  className?: string;
  endItem?: any;
};
const ShiftsSummaryCard = ({
  icon,
  title,
  endItem,
  className,
}: TShiftsSummaryCardProps) => {
  return (
    <View className={`flex-row items-center gap-2.5 ${className} `}>
      <View className="h-9 w-9 bg-white flex-row justify-center items-center rounded-full">
        {icon}
      </View>

      <View className="flex-1 ">
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
            {title}
          </Text>

          {typeof endItem === "string" || typeof endItem === "number" ? (
            <Text className="font-proximanova-semibold rounded-[30px]">
              {endItem}
            </Text>
          ) : (
            endItem
          )}
        </View>
      </View>
    </View>
  );
};

export default ShiftsSummaryCard;

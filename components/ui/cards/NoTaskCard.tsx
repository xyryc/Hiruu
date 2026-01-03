import { NoTaskCardProps } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const NoTaskCard = ({ className }: NoTaskCardProps) => {
  return (
    <View
      className={`${className} p-4 flex-row items-center justify-between border border-[#4FB2F3] rounded-[14px] bg-[#E5F4FD]`}
    >
      <View className="w-1/2">
        <Text className="font-proximanova-semibold text-lg mb-1">
          No Shift – It’s a Holiday!
        </Text>
        <Text className="font-proximanova-regular text-sm text-secondary mb-2.5">
          No shifts are scheduled today. Take time to relax and recharge.
        </Text>

        <View className="flex-row items-center gap-1">
          <Ionicons
            className="bg-white border border-[#4FB2F3] p-1.5 rounded-full z-20"
            name="calendar-outline"
            size={16}
            color="#4FB2F3"
          />

          <View className="flex-row gap-1">
            <Text className="text-xs font-proximanova-regular">
              Next shift:
            </Text>
            <Text className="text-xs font-proximanova-semibold">
              Thu, 10:00 AM
            </Text>
          </View>

          <View className="absolute top-0.5 left-4 z-0">
            <Image
              source={require("@/assets/images/gradient-time-bg.svg")}
              style={{
                width: 160,
                height: 25,
              }}
            />
          </View>
        </View>
      </View>

      <View>
        <Image
          source={require("@/assets/images/holiday.svg")}
          style={{
            width: 120,
            height: 108,
          }}
        />
      </View>
    </View>
  );
};

export default NoTaskCard;

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

type ShiftLogCardProps = {
  dateLabel?: string;
  workingHoursLabel?: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  isEmpty?: boolean;
};

const ShiftLogCard = ({
  dateLabel = "Today",
  workingHoursLabel = "Working Hours (--:-- - --:--)",
  startTimeLabel = "--:--",
  endTimeLabel = "--:--",
  isEmpty = false,
}: ShiftLogCardProps) => {
  return (
    <View className="mt-4 border border-[#EEEEEE] p-4 rounded-xl">
      <View className="flex-row gap-4">
        <Ionicons name="calendar" size={22} color="#4FB2F3" />
        <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
          {dateLabel}
        </Text>
      </View>
      <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5">
        {isEmpty ? "No shift log available for today" : workingHoursLabel}
      </Text>

      <View>
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ width: 360, height: 2, marginTop: 10 }}
        />
      </View>

      <View className="flex-row justify-around items-center mt-2.5">
        <View>
          <Text className="text-center text-sm font-proximanova-semibold text-secondary dark:text-dark-secondary mb-1">
            Start Time
          </Text>
          <Text className="text-center text-lg font-proximanova-semibold text-primary dark:text-dark-primary">
            {startTimeLabel}
          </Text>
        </View>

        <View className="border-b border-secondary w-32 relative">
          <View className="absolute -top-[1.5px] left-0 h-1 w-1 bg-secondary rounded-full" />
          <View className="absolute -top-[1.5px] right-0 h-1 w-1 bg-secondary rounded-full" />
        </View>

        <View>
          <Text className="text-center text-sm font-proximanova-semibold text-secondary dark:text-dark-secondary mb-1">
            End Time
          </Text>
          <Text className="text-center text-lg font-proximanova-semibold text-primary dark:text-dark-primary">
            {endTimeLabel}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ShiftLogCard;

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const HolidayCard = ({ shift }) => {
  return (
    <View>
      <View className="flex-row items-center justify-center gap-5">
        <Image
          source={require("@/assets/images/holiday2.svg")}
          style={{
            width: 128,
            height: 110,
          }}
          contentFit="contain"
        />

        <Text className="font-proximanova-semibold text-primary dark:text-dark-primary w-1/2">
          {shift.subtitle}
        </Text>
      </View>

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{
          paddingVertical: 12,
          width: "100%",
          height: 1,
        }}
        contentFit="contain"
      />

      <View className="flex-row items-center gap-2">
        <Image
          source="https://cdn.textstudio.com/output/studio/template/preview/stamped/g/4/c/7/z7a7c4g.webp"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
          }}
        />

        <View className="flex-row items-center gap-1">
          <Ionicons
            className="bg-white border border-[#4FB2F3] p-1.5 rounded-full z-20"
            name="calendar-outline"
            size={16}
            color="#4FB2F3"
          />

          <View className="flex-row gap-1">
            <Text className="text-xs font-proximanova-regular text-primary dark:text-dark-primary">
              Next shift:
            </Text>
            <Text className="text-xs font-proximanova-semibold text-primary dark:text-dark-primary">
              {shift.workTime}
            </Text>
          </View>

          <View className="absolute top-0.5 left-4 z-0">
            <Image
              source={require("@/assets/images/gradient-time-bg.svg")}
              style={{
                width: 212,
                height: 25,
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default HolidayCard;

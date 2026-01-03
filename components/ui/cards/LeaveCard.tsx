import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const LeaveCard = ({ shift }) => (
  <View>
    <View className="flex-row gap-9 items-center justify-center py-4">
      {shift.status === "pending" ? (
        <Image
          source={require("@/assets/images/leave-pending.svg")}
          style={{
            width: 95,
            height: 83,
          }}
          contentFit="contain"
        />
      ) : (
        <Image
          source={require("@/assets/images/leave-approved.svg")}
          style={{
            width: 95,
            height: 88,
          }}
          contentFit="contain"
        />
      )}

      <Text className="font-proximanova-semibold w-1/2 text-primary dark:text-dark-primary">
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

    <View className="flex-row items-center justify-between gap-2">
      <View className="flex-row gap-1.5 items-center">
        <Image
          source="https://cdn.textstudio.com/output/studio/template/preview/stamped/g/4/c/7/z7a7c4g.webp"
          style={{
            width: 30,
            height: 30,
            borderRadius: 999,
          }}
        />
        <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
          {shift.company}
        </Text>
      </View>

      <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary">
        {shift.workTime}
      </Text>
    </View>
  </View>
);

export default LeaveCard;

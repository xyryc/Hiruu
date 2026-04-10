import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { StatusBadgeProps } from "@/types";
import StatusBadge from "../badges/StatusBadge";

type AttendanceLogCardProps = {
  startTime: string;
  endTime: string;
  totalWorkTime: string;
  workTimeColor?: string;
  status?: StatusBadgeProps["status"];
  statusLabel?: string;
  businessLogo?: string | null;
  businessName?: string;
};

const AttendanceLogCard = ({
  startTime,
  endTime,
  totalWorkTime,
  workTimeColor,
  status,
  statusLabel,
  businessLogo,
  businessName,
}: AttendanceLogCardProps) => {
  const businessLogoSource =
    typeof businessLogo === "string" && businessLogo.trim().length > 0
      ? { uri: businessLogo }
      : require("@/assets/images/placeholder.png");

  return (
    <View className="mt-3 p-4 border-hairline border-secondary dark:border-dark-secondary rounded-xl">
      <View className="flex-row justify-between">
        <View className="flex-row justify-between gap-5">
          <View>
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              Start Time
            </Text>
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              {startTime}
            </Text>
          </View>
          <View className="border-r-hairline border-secondary dark:border-dark-secondary" />
          <View>
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              End Time
            </Text>
            <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
              {endTime}
            </Text>
          </View>
        </View>

        <View>
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            Working Time
          </Text>
          <Text
            className="font-proximanova-semibold text-base"
            style={{ color: workTimeColor || "#111111" }}
          >
            {totalWorkTime}
          </Text>
        </View>
      </View>
      <View className="border-b-hairline border-secondary dark:border-dark-secondary mt-2" />
      <View className="mt-2 flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <Image
            source={businessLogoSource}
            contentFit="contain"
            style={{ height: 30, width: 30, borderRadius: 15 }}
          />
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {businessName || "Business"}
          </Text>
        </View>

        {status && <StatusBadge status={status} label={statusLabel} />}
      </View>
    </View>
  );
};

export default AttendanceLogCard;

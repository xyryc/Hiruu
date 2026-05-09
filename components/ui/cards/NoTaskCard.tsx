import { NoTaskCardProps } from "@/types";
import { formatUTCToLocalDateTime } from "@/utils/timezone";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

const NoTaskCard = ({ className, nextShiftAt }: NoTaskCardProps) => {
  const { t } = useTranslation();
  const nextShiftDate = nextShiftAt ? new Date(nextShiftAt) : null;
  const hasNextShift =
    nextShiftDate instanceof Date && !Number.isNaN(nextShiftDate.getTime());
  const formattedNextShift = hasNextShift
    ? formatUTCToLocalDateTime(String(nextShiftAt))
    : "";

  return (
    <View
      className={`${className} p-4 flex-row items-center justify-between border border-[#4FB2F3] rounded-[14px] bg-[#E5F4FD]`}
    >
      <View className="w-1/2">
        <Text className="font-proximanova-semibold text-lg mb-1">
          {t("user.profile.noTaskCard.title")}
        </Text>
        <Text className="font-proximanova-regular text-sm text-secondary mb-2.5">
          {t("user.profile.noTaskCard.subtitle")}
        </Text>

        {hasNextShift ? (
          <View className="flex-row items-center gap-1">
            <Ionicons
              className="bg-white border border-[#4FB2F3] p-1.5 rounded-full z-20"
              name="calendar-outline"
              size={16}
              color="#4FB2F3"
            />

            <View className="flex-row gap-1">
              <Text className="text-xs font-proximanova-regular">
                {t("user.profile.noTaskCard.nextShiftLabel")}
              </Text>
              <Text className="text-xs font-proximanova-semibold">
                {formattedNextShift}
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
        ) : null}
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

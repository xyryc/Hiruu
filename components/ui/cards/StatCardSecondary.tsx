import { StatCardSecondaryProps } from "@/types";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import SimpleStatusBadge from "../badges/SimpleStatusBadge";

const StatCardSecondary = ({
  background,
  mode = "user",
  point,
  averageRating = 4.9,
}: StatCardSecondaryProps) => {
  const { t } = useTranslation();
  const pointValue = (() => {
    if (typeof point === "number" && Number.isFinite(point)) return point;
    if (typeof point === "string") {
      const parsed = Number(point.replace("%", "").trim());
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  })();

  const showTrendIcon = pointValue !== 0;
  const isTrendPositive = pointValue > 0;
  const isUserMode = mode === "user";

  return (
    <View className="flex-row justify-between border border-[#EEEEEE] rounded-xl overflow-hidden">
      <View className="px-4 py-5">
        <Text className="text-sm font-proximanova-regular text-secondary">
          {isUserMode ? t("user.profile.workInsights.performanceStatus") : t("user.jobs.workInsights.totalNewRatingsThisWeek")}
        </Text>

        <View className="flex-row gap-2">
          <Text
            className={`font-proximanova-bold text-2xl ${isUserMode ? "text-[#4FB2F3]" : "text-[#4FB2F3]"}`}
          >
            {isUserMode ? point : `${pointValue} ${t("user.jobs.workInsights.newRatings")}`}
          </Text>

          {isUserMode && showTrendIcon ? (
            <Ionicons
              className="mt-1.5"
              name={isTrendPositive ? "arrow-up-circle-sharp" : "arrow-down-circle-sharp"}
              size={18}
              color={isTrendPositive ? "#3EBF5A" : "#E74C69"}
            />
          ) : null}
        </View>
      </View>

      {isUserMode ? (
        <View className="justify-end">
          <SimpleStatusBadge
            className="absolute top-4 right-24 -rotate-12"
            title={t("user.profile.workInsights.onTime")}
            textColor="#6998EF"
            bgColor="#E9F0FD"
          />

          <SimpleStatusBadge
            className="absolute top-2 right-2 rotate-6"
            title={t("user.profile.workInsights.reliable")}
            textColor="#3EBF5A"
            bgColor="#3EBF5A1F"
          />

          <SimpleStatusBadge
            className="absolute bottom-2 right-2.5"
            title={t("user.profile.workInsights.fiveStarFeedback")}
            textColor="#EAC324"
            bgColor="#EAC3241F"
          />
        </View>
      ) : (
        <View className="p-4">
          <View className="flex-row gap-1">
            <AntDesign name="star" size={24} color="#F1C400" />
            <Text className="font-proximanova-bold text-2xl text-[#F1C400]">
              {averageRating}
            </Text>
          </View>
          <Text className="capitalize font-proximanova-semibold text-sm text-center">
            {t("common.average")}
          </Text>
        </View>
      )}

      {/* background */}
      <View className="absolute top-8 left-24 items-center">
        <Image
          source={background}
          style={{
            width: 100,
            height: 120,
          }}
          contentFit="contain"
        />
      </View>
    </View >
  );
};

export default StatCardSecondary;

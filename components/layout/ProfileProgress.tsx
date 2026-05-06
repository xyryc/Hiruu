import { ProfileProgressProps } from "@/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import ProgressCard from "../ui/cards/ProgressCard";

const ProfileProgress = ({ className, onboarding }: ProfileProgressProps) => {
  const { t } = useTranslation();

  return (
    <View className={`${className} px-4 mt-5`}>
      <View className="flex-row items-center gap-1.5 mb-4">
        <Text className="text-xl font-proximanova-semibold">{t("common.welcomeTo")}</Text>
        <Text className="text-xl font-proximanova-semibold text-[#4FB2F3]">
          Hiruu
        </Text>
      </View>

      {/* progress card */}
      <ProgressCard onboarding={onboarding} />
    </View>
  );
};

export default ProfileProgress;

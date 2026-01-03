import { ProfileProgressProps } from "@/types";
import React from "react";
import { Text, View } from "react-native";
import ProgressCard from "../ui/cards/ProgressCard";

const ProfileProgress = ({ className }: ProfileProgressProps) => {
  return (
    <View className={`${className} px-4`}>
      <View className="flex-row items-center gap-1.5 mb-4">
        <Text className="text-xl font-proximanova-semibold">Welcome to</Text>
        <Text className="text-xl font-proximanova-semibold text-[#4FB2F3]">
          hiruu
        </Text>
      </View>

      {/* progress card */}
      <ProgressCard />
    </View>
  );
};

export default ProfileProgress;

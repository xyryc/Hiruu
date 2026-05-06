import { JoinColleagueProps } from "@/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const JoinColleague = ({ className }: JoinColleagueProps) => {
  return (
    <View className={`${className} px-4 mt-5`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        Join Your Colleagues
      </Text>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.push("/screens/home/qr/scan")}
          className="flex-row flex-1 max-w-56 justify-between items-center border border-[#EEEEEE] rounded-xl p-4"
        >
          <Text className="text-sm font-proximanova-semibold">Scan QR</Text>

          <Image
            source={require("@/assets/images/qr.svg")}
            style={{
              width: 48,
              height: 48,
            }}
            contentFit="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/screens/home/qr/enter-code")}
          className="flex-row flex-1 max-w-56 justify-between items-center border border-[#EEEEEE] rounded-xl p-4"
        >
          <Text className="text-sm font-proximanova-semibold">Enter Code</Text>

          <Image
            source={require("@/assets/images/code-locked.svg")}
            style={{
              width: 48,
              height: 48,
            }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default JoinColleague;


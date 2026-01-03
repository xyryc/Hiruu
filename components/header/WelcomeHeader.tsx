import userData from "@/assets/data/user.json";
import { WelcomeHeaderProps } from "@/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const WelcomeHeader = ({ className }: WelcomeHeaderProps) => {
  const router = useRouter();
  const user = userData.user;

  return (
    <View className={`${className} px-4 flex-row justify-between`}>
      {/* profile */}
      <View className="flex-row items-center gap-2.5">
        <TouchableOpacity
          onPress={() =>
            user.role === "user"
              ? router.push("/(tabs)/user-profile")
              : router.push("/(tabs)/business-profile")
          }
        >
          <Image
            source="https://upload.wikimedia.org/wikipedia/commons/7/7b/Julian_Assange_at_2025_Cannes_The_Six_Billion_Dollar_Man_Photocall_3_%28cropped%29.jpg"
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
            }}
            contentFit="cover"
          />
        </TouchableOpacity>

        <View className="w-56">
          <Text className="text-sm text-[#7A7A7A] mb-1.5 " numberOfLines={1}>
            👋 Hello, Md Talath Un Nabi Anik
          </Text>
          <Text className="font-proximanova-semibold">
            Ready for today's task?
          </Text>
        </View>
      </View>

      {/* coin */}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/rewards")}
        className="flex-row items-center"
      >
        <Image
          source={require("@/assets/images/hiruu-coin.svg")}
          style={{
            width: 32,
            height: 32,
          }}
          contentFit="contain"
        />
        <View className="px-5 py-2 bg-[#DDF1FF] -ml-4 -z-10 rounded-r-[40px]">
          <Text className="text-sm font-proximanova-semibold">05</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeHeader;

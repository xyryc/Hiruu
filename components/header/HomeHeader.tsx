import ChatBell from "@/components/ui/notification/ChatBell";
import NotificationBell from "@/components/ui/notification/NotificationBell";
import { HomeHeaderProps } from "@/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const HomeHeader = ({ className }: HomeHeaderProps) => {
  return (
    <View className={`${className} px-4 flex-row justify-between`}>
      <Image
        source={require("@/assets/images/hiruu-logo.svg")}
        style={{
          width: 97,
          height: 34,
        }}
      />

      <View className="flex-row items-center gap-1.5">
        {/* messages */}
        <ChatBell
          className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
          iconSize={22}
        />

        <NotificationBell
          className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
          iconSize={22}
        />

        {/* scanner to join business */}
        <TouchableOpacity
          onPress={() => router.push("/screens/home/qr/scan")}
          className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
        >
          <Image
            source={require("@/assets/images/scan.svg")}
            style={{
              width: 18,
              height: 18,
            }}
            contentFit="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;

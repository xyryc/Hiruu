import { HomeHeaderProps } from "@/types";
import { useBusinessStore } from "@/stores/businessStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const HomeHeader = ({ className }: HomeHeaderProps) => {
  const { selectedBusinesses } = useBusinessStore();
  const hasSelectedBusiness = selectedBusinesses.length > 0;

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
        <TouchableOpacity
          onPress={() => router.push("/screens/inbox/chat-list")}
          className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
        >
          <Image
            source={require("@/assets/images/messages.svg")}
            style={{
              width: 22,
              height: 22,
            }}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* notification */}
        <TouchableOpacity
          onPress={() => router.push("/shared/notification")}
          className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
        >
          <Image
            source={require("@/assets/images/bell.svg")}
            style={{
              width: 22,
              height: 22,
            }}
            contentFit="contain"
          />
          <View className="bg-[#4FB2F3] absolute top-1.5 right-2 w-3.5 h-3.5 items-center rounded-full">
            <Text className="text-[10px] text-white">1</Text>
          </View>
        </TouchableOpacity>

        {/* scanner */}
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

        {hasSelectedBusiness && (
          <TouchableOpacity
            onPress={() => router.push("/screens/home/qr/generate")}
            className="h-10 w-10 bg-[#F5F5F5] border-[0.5px] border-[#b2b1b185] rounded-full items-center justify-center"
          >
            <Ionicons name="qr-code-outline" size={18} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HomeHeader;

import { WelcomeHeaderProps } from "@/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

const WelcomeHeader = ({
  className,
  name = "User",
  avatar,
  coins = 0,
}: WelcomeHeaderProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const helloLabel = t("common.hello", { name: name || t("common.user") });
  const helloText = helloLabel.replace(/^[^\p{L}\p{N}]+/u, "").trimStart();

  return (
    <View className={`${className} pb-2 px-4 flex-row justify-between`}>
      {/* profile */}
      <View className="flex-row items-center gap-2.5">
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/user-profile")}
        >
          <Image
            source={avatar || require("@/assets/images/placeholder.png")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
            }}
            contentFit="cover"
          />
        </TouchableOpacity>

        <View className="w-56">
          <View className="mb-1.5 flex-row items-center">
            <Image
              source={require("@/assets/images/wave.png")}
              style={{ width: 16, height: 16 }}
              contentFit="contain"
            />
            <Text className="text-sm text-[#7A7A7A] ml-1" numberOfLines={1}>
              {helloText}
            </Text>
          </View>
          <Text className="font-proximanova-semibold">
            {t("common.readyForTodaysTask")}
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
          <Text className="text-sm font-proximanova-semibold">
            {coins ?? 0}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default WelcomeHeader;

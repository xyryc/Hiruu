import ScreenHeader from "@/components/header/ScreenHeader";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Info = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const appVersion = Constants.expoConfig?.version ?? "?.?"; // fallback if something goes wrong
  const currentYear = new Date().getFullYear(); // e.g. 2025

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="App Info"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>
      <View className="flex-1 justify-center items-center">
        <Text className="font-proximanova-semibold text-2xl text-primary dark:text-dark-primary">
          Hiruu Platform
        </Text>
        <Text className="font-proximanova-regular text-lg text-secondary dark:text-dark-secondary">
          Version {appVersion}
        </Text>
        <Image
          source={require("@/assets/images/hiruu-logo.svg")}
          contentFit="contain"
          style={{ height: 34, width: 98 }}
        />
        <Text className="font-proximanova-regular text-lg text-secondary dark:text-dark-secondary mt-2.5">
          2023-{currentYear} Hiruu Inc.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Info;

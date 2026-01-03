import ScreenHeader from "@/components/header/ScreenHeader";
import { AntDesign, Fontisto } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpSupport = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Help and Support"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mx-5 flex-1">
        <Text className=" font-proximanova-regular text-sm  mt-8">
          Track your shifts, manage your team, and grow your work journey — all
          in one place with Hiruu. Whether you’re just getting started or
          already a pro, we’re here to support you every step of the way.
        </Text>
        <Text className=" font-proximanova-regular text-sm  mt-1">
          Have a question?
        </Text>
        <Text className="font-proximanova-semibold text-xl mt-8">FAQs</Text>
        <Text className="font-proximanova-regular text-sm mt-2.5">
          Quick solutions for common issues.
        </Text>
        <Text className="font-proximanova-semibold mt-2.5 text-sm">
          1. Torem ipsum dolor sit amet, consecteture.
        </Text>
        <Text className=" font-proximanova-regular text-sm  mt-1.5">
          Torem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
          turpis molestie, dictum est a, mattis tellus.
        </Text>

        <Text className="font-proximanova-semibold text-sm mt-12">
          2. Torem ipsum dolor sit amet, consecteture.
        </Text>
        <Text className=" font-proximanova-regular text-sm  mt-1.5">
          Torem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
          turpis molestie, dictum est a, amet, consectetur mattis tellus.
        </Text>

        <Text className="font-proximanova-semibold text-sm mt-12">
          2. Torem ipsum dolor sit amet, consecteture.
        </Text>
        <Text className=" font-proximanova-regular text-sm  mt-1.5">
          Torem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu
          turpis molestie, dictum est a, amet, consectetur mattis tellus.
        </Text>
      </ScrollView>

      {/* bottom  buttons */}
      <View className="flex-row justify-between gap-3 my-10 mx-5">
        <TouchableOpacity
          onPress={() => router.push("/screens/profile/settings/help-chat")}
          className="rounded-full border border-[#11111133] py-2.5 px-5 flex-1 flex-row gap-1.5 items-center justify-center"
        >
          <AntDesign name="message" size={18} color="black" />
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
            Chat with us
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-full border border-[#11111133] py-2.5 px-5 flex-1 flex-row gap-1.5 items-center justify-center">
          <Fontisto name="email" size={18} color="black" />
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
            Email us
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HelpSupport;

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Image } from "expo-image";
import ScreenHeader from "@/components/header/ScreenHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import SearchBar from "@/components/ui/inputs/SearchBar";
import JobCard from "@/components/ui/cards/JobCard";

const JobRequest = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const tabs = ["send request", "received"];
  const [isActive, setIsActive] = useState("send request");

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-dark-background">
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-4 pt-2.5 rounded-b-3xl bg-[#E5F4FD] overflow-hidden"
        title="Job Request"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111111"}
        components={
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/hiruu-coin.svg")}
              style={{
                width: 32,
                height: 32,
              }}
              contentFit="contain"
            />
            <View className="px-4 py-2 bg-white -ml-3 -z-10 rounded-r-[40px]">
              <Text className="text-sm font-proximanova-semibold">540</Text>
            </View>
          </View>
        }
      />

      <View className="flex-row justify-center mx-5">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            className={`w-1/2 flex-row items-center justify-center gap-2 border-b  pb-2 ${isActive === tab && "border-[#11293A] border-b-2"}`}
            onPress={() => setIsActive(tab)}
          >
            <Text
              className={`text-center capitalize ${isActive === tab ? "font-proximanova-semibold text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"} `}
            >
              {tab}
            </Text>

            <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
              <Text className="font-proximanova-semibold text-sm text-white">
                3
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-white px-5"
      >
        <SearchBar className="mt-5 mb-4" />

        <JobCard
          className="bg-white border border-[#EEEEEE] mb-4"
          status={isActive}
        />

        <JobCard
          className="bg-white border border-[#EEEEEE] mb-4"
          status={isActive}
        />

        <JobCard
          className="bg-white border border-[#EEEEEE] mb-4"
          status={isActive}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default JobRequest;

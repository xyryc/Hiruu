import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessJobCard from "@/components/ui/cards/BusinessJobCard";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BusinessJobs = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "top", "right"]}
    >
      <ScreenHeader
        className="my-4 mx-5"
        onPressBack={() => router.back()}
        title="Find Employee"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <View className="flex-row items-center gap-2.5">
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/jobs/business/candidate-requests")
              }
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
            >
              <Ionicons name="document-text-outline" size={18} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/screens/jobs/chatlist")}
              className="h-10 w-10 bg-[#F5F5F5] flex-row justify-center items-center rounded-full"
            >
              <Image
                source={require("@/assets/images/messages.svg")}
                contentFit="contain"
                style={{ height: 22, width: 22 }}
              />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        className="mx-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* search and filter button */}
        <View className="flex-row items-center mt-4">
          <View className="flex-1 border border-[#EEEEEE] rounded-[10px] ">
            <View className="flex-row items-center ">
              {/* Search Icon */}
              <EvilIcons
                name="search"
                size={24}
                color="black"
                className="ml-4"
              />

              {/* Input */}
              <TextInput
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                className="flex-1 ml-2 text-base text-gray-800 dark:text-gray-200"
              />
            </View>
          </View>

          {/* Filter Icon Button */}
          <TouchableOpacity
            onPress={() => router.push("/screens/jobs/business/filter")}
            className="w-10 h-10 bg-[#0C2433] rounded-full items-center justify-center ml-2"
          >
            <Ionicons name="options-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Featured Profile */}
        <View className="mt-8">
          <View className="flex-row justify-between">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Featured Profile
            </Text>
            <TouchableOpacity>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <BusinessJobCard className="mt-4" status="featured" />
        </View>

        {/* Suggested Profile */}
        <View className="mt-8">
          <View className="flex-row justify-between">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Suggested Profile
            </Text>
            <TouchableOpacity>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <BusinessJobCard className="mt-4" />
          <BusinessJobCard className="mt-4" />
          <BusinessJobCard className="mt-4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessJobs;

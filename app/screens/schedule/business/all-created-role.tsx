import ScreenHeader from "@/components/header/ScreenHeader";
import { Entypo, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const AllCreatedRole = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const roleData = [
    {
      name: "employee",
    },
    {
      name: "manager",
    },
    {
      name: "HR / recruiter",
    },
    {
      name: "shift supervisor",
    },
    {
      name: "auditor",
    },
    {
      name: "trainer",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5">
        <ScreenHeader
          style={{ paddingTop: insets.top + 15, paddingBottom: 20 }}
          className=""
          onPressBack={() => router.back()}
          title="All Created Role"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/schedule/business/create-role")
              }
              className="h-10 w-10 rounded-full bg-[#FFFFFF] flex-row justify-center items-center "
            >
              <Feather name="plus" size={24} color="black" />
            </TouchableOpacity>
          }
        />
      </View>
      <ScrollView className="mx-5">
        <View className="mt-4">
          {roleData.map((role, index) => (
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/schedule/business/create-role")
              }
              className="flex-row justify-between items-center border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
              key={index}
            >
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary capitalize">
                {role.name}
              </Text>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AllCreatedRole;

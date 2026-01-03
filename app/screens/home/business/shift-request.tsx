import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessShiftPending from "@/components/ui/cards/BusinessShiftPending";
import RequestLogModal from "@/components/ui/modals/RequestLogModal";
import { Feather, SimpleLineIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const ShiftRequest = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedTab, setSelectedTab] = useState("Pending Requests");
  const insets = useSafeAreaInsets();
  const [isModalSettings, setIsModalSettings] = useState(false);
  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl   px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <ScreenHeader
          className="mb-5"
          onPressBack={() => router.back()}
          title="Shift Requests"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => setIsModalSettings(true)}
                className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center"
              >
                <SimpleLineIcons name="settings" size={22} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push("/screens/home/business/filter-shift")
                }
                className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center"
              >
                <Feather name="filter" size={22} color="black" />
              </TouchableOpacity>
            </View>
          }
        />

        <RequestLogModal
          visible={isModalSettings}
          onClose={() => setIsModalSettings(false)}
        />
        {/* tabs  */}
        <View className="flex-row mx-5 mt-2 dark:bg-dark-background">
          {["Pending Requests", "Request History"].map((tab) => (
            <TouchableOpacity
              className={`w-1/2 ${selectedTab === tab ? "border-b-2 border-[#11293A] pb-2" : ""}`}
              key={tab}
              onPress={() => setSelectedTab(tab)}
            >
              <View className="flex-row justify-center gap-2">
                <Text
                  className={`text-center dark:text-dark-primary ${selectedTab === tab ? "font-proximanova-semibold" : "font-proximanova-regular"}`}
                >
                  {tab}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
        {/* pending screen */}
        {selectedTab === "Pending Requests" && (
          <View>
            <BusinessShiftPending status="Missed Clock-out" title="Pending" />
            <BusinessShiftPending status="Late Clock-in" />
            <BusinessShiftPending status="Missed Clock-out" />
            <BusinessShiftPending status="Network Issues" />
            <BusinessShiftPending status="Missed Clock-out" title="Pending" />
          </View>
        )}

        {/* Request History */}
        {selectedTab === "Request History" && (
          <View>
            <BusinessShiftPending selectedTab status="Missed Clock-out" />
            <BusinessShiftPending selectedTab status="Late Clock-in" />
            <BusinessShiftPending selectedTab status="Missed Clock-out" />
            <BusinessShiftPending selectedTab status="Network Issues" />
            <BusinessShiftPending selectedTab status="Missed Clock-out" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftRequest;

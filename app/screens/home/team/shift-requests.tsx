import ScreenHeader from "@/components/header/ScreenHeader";
import TeamShiftRequestCard from "@/components/ui/cards/TeamShiftRequestCard";
import RequestLogModal from "@/components/ui/modals/RequestLogModal";
import { Ionicons } from "@expo/vector-icons";
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
                <Ionicons name="settings-outline" size={20} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  router.push("/screens/home/shift/shift-filter")
                }
                className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center"
              >
                <Ionicons name="filter" size={20} color="black" />
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
            <TeamShiftRequestCard status="Missed Clock-out" title="Pending" />
            <TeamShiftRequestCard status="Late Clock-in" />
            <TeamShiftRequestCard status="Missed Clock-out" />
            <TeamShiftRequestCard status="Network Issues" />
            <TeamShiftRequestCard status="Missed Clock-out" title="Pending" />
          </View>
        )}

        {/* Request History */}
        {selectedTab === "Request History" && (
          <View>
            <TeamShiftRequestCard isHistory status="Missed Clock-out" />
            <TeamShiftRequestCard isHistory status="Late Clock-in" />
            <TeamShiftRequestCard isHistory status="Missed Clock-out" />
            <TeamShiftRequestCard isHistory status="Network Issues" />
            <TeamShiftRequestCard isHistory status="Missed Clock-out" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftRequest;

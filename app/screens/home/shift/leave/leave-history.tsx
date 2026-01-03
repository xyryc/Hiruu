import ScreenHeader from "@/components/header/ScreenHeader";
import SickLeaveCard from "@/components/ui/cards/SickLeaveCard";
import UserCalenderShidulModal from "@/components/ui/modals/UserCalenderShidulModal";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type LeaveItem = {
  id: string;
  img?: string;
  name: string;
  status: "approved" | "pending" | "rejected";
  date: string;
  coses: string;
  details: string;
  category?: string;
  duration?: string;
};

const DATA: LeaveItem[] = [
  {
    id: "1",
    img: require("@/assets/images/location.png"),
    name: "John Doe",
    status: "approved",
    date: "Apr 20–23, 2025",
    coses: "Sick Leave",
    details: "Fever and body ache Medical checkup and recovery at home.",
    category: "Leave",
    duration: "09:00 AM to 1:00 PM",
  },
  {
    id: "2",
    img: require("@/assets/images/location.png"),
    name: "Emma Watson",
    status: "pending",
    date: "May 12–14, 2025",
    coses: "Personal Leave",
    details: "Fever and body ache Medical checkup and recovery at home.",
    category: "Leave",
  },
  {
    id: "3",
    img: require("@/assets/images/location.png"),
    name: "David Smith",
    status: "rejected",
    date: "Jun 1–2, 2025",
    coses: "Casual Leave",
    details: "Fever and body ache Medical checkup and recovery at home.",
    category: "Leave",
    duration: "09:00 AM to 1:00 PM",
  },
  {
    id: "4",
    img: require("@/assets/images/location.png"),
    name: "Sarah Khan",
    status: "approved",
    date: "May 18–19, 2025",
    coses: "Sick Leave",
    details: "Fever and body ache Medical checkup and recovery at home.",
    category: "Medical",
  },
];

const CATEGORIES = ["all", "approved", "pending", "rejected"];

const LeaveHistory = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedCategory, setSelectedCategory] = useState("all"); // Set default to 'all'

  // Filtered data
  const filteredData =
    selectedCategory === "all"
      ? DATA
      : DATA.filter((item) => item.status === selectedCategory);

  // Count per category
  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] =
        cat === "all"
          ? DATA.length
          : DATA.filter((item) => item.status === cat).length;
      return acc;
    },
    {} as Record<string, number>
  );
  const [onCalender, setOnCalendet] = useState(false);
  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5"
        onPressBack={() => router.back()}
        title="Leave"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setOnCalendet(true)}
              className="bg-[#F5F5F5] rounded-full p-2"
            >
              <Ionicons name="calendar-outline" size={22} color="#111111" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push("/screens/schedule/shift/request-leave")
              }
              className="bg-[#F5F5F5] rounded-full p-2"
            >
              <Image
                source={require("@/assets/images/card-send.svg")}
                style={{
                  width: 24,
                  height: 24,
                }}
                contentFit="contain"
              />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Month */}
      <View className="flex-row items-center mt-5 mx-5">
        <Text className="text-xl w-32 font-proximanova-bold text-primary dark:text-dark-primary">
          April, 2025
        </Text>
        <Ionicons name="chevron-down" size={18} color="#666" />
      </View>

      {/* Categories */}
      <View>
        <FlatList
          data={CATEGORIES}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => {
            const selected = selectedCategory === item;
            return (
              <TouchableOpacity onPress={() => setSelectedCategory(item)}>
                <View
                  className={`px-4 py-2 border rounded-[30px] mr-2 my-4 ${selected ? "bg-[#11293A] " : "bg-white border-[#d8d7d7]"}`}
                >
                  <Text
                    className={`font-proximanova-semibold text-sm ${selected ? "text-white" : "text-[#111]"}`}
                  >
                    <Text className="capitalize">{item}</Text>
                    {` (${categoryCounts[item]})`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Text className="font-semibold text-xl mx-5 text-[#111] mb-3">
        Leave Request List
      </Text>

      {/* Leave list */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <SickLeaveCard item={item} selectedCategory={selectedCategory} />
        )}
      />
      <UserCalenderShidulModal
        visible={onCalender}
        onClose={() => setOnCalendet(false)}
      />
    </SafeAreaView>
  );
};

export default LeaveHistory;

import ScreenHeader from "@/components/header/ScreenHeader";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LeaderboardInfo = () => {
  const router = useRouter();

  const renderComponent = ({
    icon,
    title,
    subtitle,
    point,
    className,
  }: any) => {
    return (
      <View
        className={`flex-row gap-2.5 border-b border-[#EEEEEE] pb-2.5 ${className || ""}`}
      >
        <View className="border-[0.5px] border-[#11293A1A] h-10 w-10 rounded-full bg-[#EEEEEE] flex-row justify-center items-center">
          {icon || <SimpleLineIcons name="clock" size={18} color="black" />}
        </View>

        <View className="flex-1 jusce">
          {/* Title and Points */}
          <View className="flex-row  mt-2">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary flex-1">
              {title || "Be On Time"}
            </Text>

            <View className="border-[0.5px] border-[#3EBF5A4D] rounded-full py-1.5 px-2 bg-[#3EBF5A1A]">
              <Text
                className="text-[#3EBF5A] font-proximanova-regular text-sm"
                numberOfLines={1}
              >
                {point}
              </Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5">
            {subtitle || "+2 points for every day you arrive on time"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      {/* Custom Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-4 mt-2"
        title="Leaderboard Info"
      />

      {/* rules */}
      <ScrollView className="mt-7 mx-5" showsVerticalScrollIndicator={false}>
        {/* rules */}
        <View className="bg-[#E5F4FD] rounded-xl p-4">
          {/* Title */}
          <Text className="font-proximanova-semibold text-lg mb-3">
            Visibility Rules:
          </Text>

          {/* Item 1 */}
          <View className="flex-row gap-2">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              1.
            </Text>
            <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              Employees automatically appear on the leaderboard when they start
              earning points through their shift activity.
            </Text>
          </View>

          {/* Item 2 */}
          <View className="flex-row gap-2">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              2.
            </Text>
            <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              Rankings reset at the start of each month.
            </Text>
          </View>
        </View>

        {/* how to earn */}
        <View className="mt-6">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            How to Earn Points
          </Text>
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5">
            Want to be a Top Performer this month? Here's how you collect points
            based on your shift activity
          </Text>
        </View>

        {/* card */}
        <View>
          {renderComponent({
            icon: <SimpleLineIcons name="clock" size={18} color="black" />,
            title: "Be On Time",
            subtitle:
              "Earn +2 points for every day you arrive on time. Show up consistently and rack up points all month long!",
            point: "Up to +40 Points/month",
            className: "mt-8",
          })}
          {renderComponent({
            icon: <Ionicons name="calendar-outline" size={18} color="black" />,
            title: "Arrive Early",
            subtitle:
              "Show up 10+ minutes early for your shift and earn a small bonus for being proactive.",
            point: "+1 Point/shift ",
            className: "mt-4",
          })}
          {renderComponent({
            icon: <Feather name="repeat" size={16} color="black" />,
            title: "Cover a Teammate's Shift",
            subtitle:
              "Step in and cover a shift for a teammate to earn extra points and appreciation. Accept a swap request from teammate.",
            point: "+2 Points/shift",
            className: "mt-4",
          })}
          {renderComponent({
            icon: (
              <MaterialCommunityIcons
                name="clock-alert-outline"
                size={18}
                color="black"
              />
            ),
            title: "Late Arrival",
            subtitle:
              "Running late? You won’t lose points, but you’ll miss out on that day’s punctuality bonus.",
            point: "0 Points",
            className: "mt-4",
          })}
          {renderComponent({
            icon: (
              <FontAwesome name="calendar-times-o" size={16} color="black" />
            ),
            title: "Missed Shift",
            subtitle:
              "Missing a scheduled shift without notice will cost you. Always notify your manager ahead of time.",
            point: "-4 Points/shift",
            className: "mt-4",
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaderboardInfo;

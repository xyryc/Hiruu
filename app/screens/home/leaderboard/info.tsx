import ScreenHeader from "@/components/header/ScreenHeader";
import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { t } from "i18next";
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
        title={t("user.profile.leaderboard.infoTitle")}
      />

      {/* rules */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 40
        }}
        className="mt-7 mx-5"
        showsVerticalScrollIndicator={false}>
        {/* rules */}
        <View className="bg-[#E5F4FD] rounded-xl p-4">
          {/* Title */}
          <Text className="font-proximanova-semibold text-lg mb-3">
            {t("user.profile.leaderboard.visibilityRules")}
          </Text>

          {/* Item 1 */}
          <View className="flex-row gap-2">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              1.
            </Text>
            <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              {t("user.profile.leaderboard.rule1")}
            </Text>
          </View>

          {/* Item 2 */}
          <View className="flex-row gap-2">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              2.
            </Text>
            <Text className="flex-1 text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              {t("user.profile.leaderboard.rule2")}
            </Text>
          </View>
        </View>

        {/* how to earn */}
        <View className="mt-6">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
            {t("user.profile.leaderboard.howToEarn")}
          </Text>
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5">
            {t("user.profile.leaderboard.howToEarnSubtitle")}
          </Text>
        </View>

        {/* card */}
        <View>
          {renderComponent({
            icon: <SimpleLineIcons name="clock" size={18} color="black" />,
            title: t("user.profile.leaderboard.beOnTime"),
            subtitle: t("user.profile.leaderboard.beOnTimeSubtitle"),
            point: t("user.profile.leaderboard.beOnTimePoints"),
            className: "mt-8",
          })}
          {renderComponent({
            icon: <Ionicons name="calendar-outline" size={18} color="black" />,
            title: t("user.profile.leaderboard.arriveEarly"),
            subtitle: t("user.profile.leaderboard.arriveEarlySubtitle"),
            point: t("user.profile.leaderboard.arriveEarlyPoints"),
            className: "mt-4",
          })}
          {renderComponent({
            icon: <Feather name="repeat" size={16} color="black" />,
            title: t("user.profile.leaderboard.coverShift"),
            subtitle: t("user.profile.leaderboard.coverShiftSubtitle"),
            point: t("user.profile.leaderboard.coverShiftPoints"),
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
            title: t("user.profile.leaderboard.lateArrival"),
            subtitle: t("user.profile.leaderboard.lateArrivalSubtitle"),
            point: t("user.profile.leaderboard.lateArrivalPoints"),
            className: "mt-4",
          })}
          {renderComponent({
            icon: (
              <FontAwesome name="calendar-times-o" size={16} color="black" />
            ),
            title: t("user.profile.leaderboard.missedShift"),
            subtitle: t("user.profile.leaderboard.missedShiftSubtitle"),
            point: t("user.profile.leaderboard.missedShiftPoints"),
            className: "mt-4",
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LeaderboardInfo;

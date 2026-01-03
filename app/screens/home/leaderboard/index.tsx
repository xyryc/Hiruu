// app/(buyer)/leaderboard.tsx
import businesses from "@/assets/data/businesses.json";
import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import CountdownTimer from "@/components/ui/timer/CountdownTimer";
import { MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Performer {
  id: string;
  name: string;
  avatar: string;
  points: number;
  verified?: boolean;
  rank: number;
}

export default function LeaderboardScreen() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 30,
    minutes: 60,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const router = useRouter();

  const topPerformers: Performer[] = [
    {
      id: "1",
      name: "Emily Kristine",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/7/7b/Julian_Assange_at_2025_Cannes_The_Six_Billion_Dollar_Man_Photocall_3_%28cropped%29.jpg",
      points: 100,
      verified: true,
      rank: 1,
    },
    {
      id: "2",
      name: "Ethan Lert",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/7/7b/Julian_Assange_at_2025_Cannes_The_Six_Billion_Dollar_Man_Photocall_3_%28cropped%29.jpg",
      points: 30,
      rank: 2,
    },
    {
      id: "3",
      name: "Emily Kristine",
      avatar:
        "https://upload.wikimedia.org/wikipedia/commons/7/7b/Julian_Assange_at_2025_Cannes_The_Six_Billion_Dollar_Man_Photocall_3_%28cropped%29.jpg",
      points: 15,
      verified: true,
      rank: 3,
    },
  ];

  const currentUser = {
    name: "You",
    avatar:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Julian_Assange_at_2025_Cannes_The_Six_Billion_Dollar_Man_Photocall_3_%28cropped%29.jpg",
    points: 10,
  };

  // Countdown timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return require("@/assets/images/rank1.svg");
      case 2:
        return require("@/assets/images/rank2.svg");
      case 3:
        return require("@/assets/images/rank3.svg");
      default:
        return require("@/assets/images/rank1.svg");
    }
  };

  const getPointsColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-[#F3934F]";
      case 2:
        return "text-[#3EBF5A]";
      case 3:
        return "text-[#4FB2F3]";
      default:
        return "text-[#F3934F]";
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      {/* Custom Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-4 mt-2.5"
        title="Leaderboard"
        components={
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-[#E5F4FD] flex-row items-center p-0.5 rounded-[26px]"
          >
            <Image
              source="https://cdn.textstudio.com/output/studio/template/preview/stamped/g/4/c/7/z7a7c4g.webp"
              style={{ width: 28, height: 28, borderRadius: 999 }}
              contentFit="cover"
            />
            <SimpleLineIcons
              className="px-1.5"
              name="arrow-down"
              size={12}
              color="#111111"
            />
          </TouchableOpacity>
        }
      />

      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={businesses}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      <LinearGradient
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
        className="flex-1 justify-center"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="h-screen-safe mx-4 pt-8"
        >
          {/* Countdown Timer Card */}
          <View className="pt-2.5 bg-white border border-[#EEEEEE] rounded-2xl dark:bg-dark-surface">
            <Text className="text-center text-sm text-secondary dark:text-dark-secondary font-proximanova-regular mb-4">
              Next Top Performer Results in
            </Text>

            {/* countdown timer */}
            <CountdownTimer
              targetTime="2025-12-31T23:01:60"
              className="mb-20"
            />

            {/* bars */}
            <View className="absolute bottom-0 inset-x-0 items-center">
              <Image
                source={require("@/assets/images/pillar.svg")}
                style={{
                  width: 143,
                  height: 65,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Top 3 Performer Section */}
          <View className="mt-7">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
                Top 3 Performer
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/screens/home/leaderboard/info")}
                className="p-2"
              >
                <SimpleLineIcons name="info" size={18} color="#282930" />
              </TouchableOpacity>
            </View>

            {/* Performer Cards */}
            <View>
              {topPerformers.map((performer) => (
                <TouchableOpacity
                  key={performer.id}
                  className={`
                    flex-row items-center p-4 rounded-2xl border ml-5 pl-7 mb-4
                    ${performer.rank === 1 ? "bg-[#f1c6ba09] border-[#F3934F]" : ""}
                    ${performer.rank === 2 ? "bg-[#e3f6e763] border-[#3EBF5A]" : ""}
                    ${performer.rank === 3 ? "bg-[#badcf125] border-[#4FB2F3]" : ""}
                `}
                >
                  {/* Rank Badge */}
                  <View className="absolute -left-6">
                    <Image
                      source={getRankBadge(performer.rank)}
                      style={{
                        width: 40,
                        height: 40,
                      }}
                      contentFit="contain"
                    />
                  </View>

                  {/* Avatar */}
                  <Image
                    source={{ uri: performer.avatar }}
                    style={{
                      width: 50,
                      height: 50,
                      borderWidth: 1,
                      borderRadius: 999,
                      borderColor: "#CECECE",
                    }}
                  />

                  {/* Name & Verified */}
                  <View className="flex-1 ml-2">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                        {performer.name}
                      </Text>
                      {performer.verified && (
                        <MaterialCommunityIcons
                          name="crown"
                          size={14}
                          color="#3B82F6"
                        />
                      )}
                    </View>

                    <View className="flex-row items-center mt-2">
                      <Image
                        source={require("@/assets/images/hiruu-coin.svg")}
                        style={{
                          width: 22,
                          height: 22,
                        }}
                        contentFit="contain"
                      />
                      <View className="px-4 py-1 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
                        <Text className="text-xs font-proximanova-semibold">
                          15 token reward
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Points */}
                  <View
                    className={`
                      px-4 py-2 rounded-full border-[0.5px]
                      ${performer.rank === 1 ? "bg-[#F3934F1A] border-[#F3934F4D] dark:bg-orange-900/20" : ""}
                      ${performer.rank === 2 ? "bg-green-50 border-[#3EBF5A] dark:bg-green-900/20" : ""}
                      ${performer.rank === 3 ? "bg-blue-50 border-[#4FB2F34D] dark:bg-blue-900/20" : ""}
                `}
                  >
                    <Text
                      className={`font-proximanova-regular text-sm ${getPointsColor(performer.rank)}`}
                    >
                      {performer.points} Points
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Current User Card */}
        <View className="bg-[#E5F4FD] dark:bg-blue-900/20 border border-[#EEEEEE] rounded-2xl px-4 py-6 flex-row items-center justify-between absolute bottom-0 inset-x-0">
          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: currentUser.avatar }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#CECECE",
              }}
            />
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              {currentUser.name}
            </Text>
          </View>

          <View className="bg-[#11293A] dark:bg-gray-700 px-3.5 py-2 rounded-full">
            <Text className="text-white font-proximanova-semibold text-sm">
              {currentUser.points} Points
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

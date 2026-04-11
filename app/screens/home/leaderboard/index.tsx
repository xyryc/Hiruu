import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessSelectionTrigger from "@/components/ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import CountdownTimer from "@/components/ui/timer/CountdownTimer";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import axiosInstance from "@/utils/axios";
import { MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Performer {
  id: string;
  name: string;
  avatar?: string | null;
  points: number;
  isPremium?: boolean;
  rank: number;
}

interface LeaderboardResponse {
  period?: {
    resetAt?: string;
  };
  top?: {
    userId: string;
    userName?: string;
    avatar?: string | null;
    isPremium?: boolean;
    rank: number;
    points: number;
  }[];
  rewards?: {
    rank: number;
    coins: number;
  }[];
  me?: {
    userId: string;
    rank: number | null;
    points: number;
    isRanked?: boolean;
  };
}

export default function LeaderboardScreen() {
  const myEmployments = useBusinessStore((state) => state.myEmployments);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const setSelectedBusinesses = useBusinessStore(
    (state) => state.setSelectedBusinesses
  );
  const getMyEmployments = useBusinessStore((state) => state.getMyEmployments);
  const authUser = useAuthStore((state) => state.user);
  const currentBusinessId = selectedBusinesses?.[0] || null;
  const [showModal, setShowModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    getMyEmployments().catch(() => undefined);
  }, [getMyEmployments]);

  const activeBusinesses = useMemo(() => {
    const activeEmployments = (Array.isArray(myEmployments) ? myEmployments : []).filter(
      (employment: any) => String(employment?.status || "").toLowerCase() === "active"
    );
    const uniqueByBusinessId = new Map<string, any>();

    activeEmployments.forEach((employment: any) => {
      const business = employment?.business;
      const businessId = business?.id || employment?.businessId;
      if (!businessId || uniqueByBusinessId.has(businessId)) return;

      uniqueByBusinessId.set(businessId, {
        id: businessId,
        name: business?.name || "Business",
        address: business?.address,
        imageUrl: business?.logo,
        logo: business?.logo,
      });
    });

    return Array.from(uniqueByBusinessId.values());
  }, [myEmployments]);

  useEffect(() => {
    if (selectedBusinesses.length > 0) return;
    const firstBusinessId = activeBusinesses?.[0]?.id;
    if (!firstBusinessId) return;
    setSelectedBusinesses([firstBusinessId]);
  }, [activeBusinesses, selectedBusinesses, setSelectedBusinesses]);

  useEffect(() => {
    if (!currentBusinessId) {
      setLeaderboardData(null);
      return;
    }

    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        const response = await axiosInstance.get(
          `/analytics/leaderboard/monthly/${currentBusinessId}`,
          {
            params: { limit: 3 },
          }
        );
        const result = response?.data;
        if (!isMounted) return;
        setLeaderboardData(result?.data ?? null);
      } catch {
        if (!isMounted) return;
        setLeaderboardData(null);
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [currentBusinessId]);

  const displayContent = useMemo(() => {
    if (selectedBusinesses.length === 0) {
      return { type: "all" as const, content: "All" };
    }

    if (selectedBusinesses.length === 1) {
      const selectedBusiness = (activeBusinesses || []).find(
        (business: any) => business?.id === selectedBusinesses[0]
      );
      return {
        type: "single" as const,
        content: selectedBusiness
          ? {
            name: selectedBusiness.name,
            logo: selectedBusiness.logo,
            imageUrl: selectedBusiness.logo,
          }
          : undefined,
      };
    }

    return {
      type: "multi" as const,
      content: `${selectedBusinesses.length} Selected`,
    };
  }, [activeBusinesses, selectedBusinesses]);

  const topPerformers = useMemo<Performer[]>(() => {
    return (leaderboardData?.top ?? []).map((item) => ({
      id: item.userId,
      name: item.userName || "User",
      avatar: item.avatar || null,
      points: item.points ?? 0,
      isPremium: item.isPremium === true,
      rank: item.rank,
    }));
  }, [leaderboardData]);

  const currentUser = useMemo(() => {
    return {
      name:
        authUser?.name ||
        (authUser?.firstName || authUser?.lastName
          ? `${authUser?.firstName || ""} ${authUser?.lastName || ""}`.trim()
          : authUser?.email || "You"),
      avatar: authUser?.avatar || null,
      points: leaderboardData?.me?.points ?? 0,
    };
  }, [authUser, leaderboardData]);

  const resetAt = leaderboardData?.period?.resetAt || "2025-12-31T23:01:60";
  const getRewardCoins = (rank: number) =>
    leaderboardData?.rewards?.find((item) => item.rank === rank)?.coins ?? 0;
  const handleLeaderboardBusinessSelection = (ids: string[]) => {
    const nextBusinessId = ids[0] || currentBusinessId || activeBusinesses?.[0]?.id;
    if (!nextBusinessId) return;
    setSelectedBusinesses([nextBusinessId]);
  };

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
          <BusinessSelectionTrigger
            displayContent={displayContent}
            onPress={() => setShowModal(true)}
            compact
          />
        }
      />

      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={[]}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={handleLeaderboardBusinessSelection}
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
            <CountdownTimer targetTime={resetAt} className="mb-20" />

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
                    source={
                      performer.avatar
                        ? { uri: performer.avatar }
                        : require("@/assets/images/placeholder.png")
                    }
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
                      {performer.isPremium && (
                        <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
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
                          {getRewardCoins(performer.rank)} token reward
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
              source={
                currentUser.avatar
                  ? { uri: currentUser.avatar }
                  : require("@/assets/images/placeholder.png")
              }
              style={{
                width: 50,
                height: 50,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#CECECE",
              }}
            />
            <View className="flex-row items-center gap-1.5">
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                {currentUser.name}
              </Text>
              {authUser?.isPremium === true ? (
                <MaterialCommunityIcons
                  name="crown"
                  size={16}
                  color="#4FB2F3"
                />
              ) : null}
            </View>
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

import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import CountdownTimer from "@/components/ui/timer/CountdownTimer";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { MaterialCommunityIcons, SimpleLineIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
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
  const getMyEmployments = useBusinessStore((state) => state.getMyEmployments);
  const getMonthlyLeaderboard = useBusinessStore((state) => state.getMonthlyLeaderboard);
  const authUser = useAuthStore((state) => state.user);
  const selectedBusinessId = selectedBusinesses?.[0] || null;
  const [leaderboardBusinessId, setLeaderboardBusinessId] = useState<string | null>(null);
  const currentBusinessId = leaderboardBusinessId;
  const [showModal, setShowModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(
    null
  );
  const [isEmploymentsHydrated, setIsEmploymentsHydrated] = useState(false);
  const isFocused = useIsFocused();
  const router = useRouter();

  useEffect(() => {
    if (!isFocused) {
      setIsEmploymentsHydrated(false);
      return;
    }
    let isMounted = true;
    const hydrateEmployments = async () => {
      try {
        await getMyEmployments(true);
        if (!isMounted) return;
        setIsEmploymentsHydrated(true);
      } catch {
        if (!isMounted) return;
        setIsEmploymentsHydrated(false);
      }
    };
    void hydrateEmployments();
    return () => {
      isMounted = false;
    };
  }, [getMyEmployments, isFocused]);

  const activeBusinesses = useMemo(() => {
    const uniqueByBusinessId = new Map<string, any>();

    (Array.isArray(myEmployments) ? myEmployments : []).forEach((employment: any) => {
      const employmentStatus = String(employment?.status || "").toLowerCase();
      const businessStatus = String(employment?.business?.status || "").toLowerCase();
      const business = employment?.business;
      const businessId = business?.id || employment?.businessId;
      const isPremium = business?.isPremium === true;
      if (
        !businessId ||
        uniqueByBusinessId.has(businessId) ||
        employmentStatus !== "active" ||
        businessStatus !== "active" ||
        !isPremium
      ) {
        return;
      }

      uniqueByBusinessId.set(businessId, {
        id: businessId,
        name: business?.name || "Business",
        address: business?.address,
        imageUrl: business?.logo,
        logo: business?.logo,
      });
    });

    (Array.isArray((authUser as any)?.employments) ? (authUser as any).employments : []).forEach(
      (employment: any) => {
        const employmentStatus = String(employment?.status || "").toLowerCase();
        const businessStatus = String(employment?.business?.status || "").toLowerCase();
        const business = employment?.business;
        const businessId = business?.id || employment?.businessId;
        const isPremium = business?.isPremium === true;
        if (
          !businessId ||
          uniqueByBusinessId.has(businessId) ||
          employmentStatus !== "active" ||
          businessStatus !== "active" ||
          !isPremium
        ) {
          return;
        }

        uniqueByBusinessId.set(businessId, {
          id: businessId,
          name: business?.name || "Business",
          address: business?.address,
          imageUrl: business?.logo,
          logo: business?.logo,
        });
      }
    );

    (Array.isArray((authUser as any)?.ownedBusinesses)
      ? (authUser as any).ownedBusinesses
      : []
    ).forEach((business: any) => {
      const businessId = business?.id;
      const isPremium = business?.isPremium === true;
      const businessStatus = String(business?.status || "").toLowerCase();
      if (
        !businessId ||
        uniqueByBusinessId.has(businessId) ||
        businessStatus !== "active" ||
        !isPremium
      ) {
        return;
      }

      uniqueByBusinessId.set(businessId, {
        id: businessId,
        name: business?.name || "Business",
        address: business?.address,
        imageUrl: business?.logo,
        logo: business?.logo,
      });
    });

    return Array.from(uniqueByBusinessId.values());
  }, [authUser, myEmployments]);

  useEffect(() => {
    if (!isFocused) return;
    if (!isEmploymentsHydrated) return;

    const selectedIsActive = selectedBusinessId
      ? activeBusinesses.some((business) => business.id === selectedBusinessId)
      : false;
    if (selectedIsActive) {
      if (leaderboardBusinessId !== selectedBusinessId) {
        setLeaderboardBusinessId(selectedBusinessId);
      }
      return;
    }

    const firstBusinessId = activeBusinesses?.[0]?.id;
    setLeaderboardBusinessId(firstBusinessId || null);
  }, [activeBusinesses, isEmploymentsHydrated, isFocused, leaderboardBusinessId, selectedBusinessId]);

  useEffect(() => {
    if (!isFocused) return;
    if (!isEmploymentsHydrated) return;
    if (!currentBusinessId) {
      setLeaderboardData(null);
      return;
    }
    const isCurrentBusinessActive = activeBusinesses.some(
      (business) => business.id === currentBusinessId
    );
    if (!isCurrentBusinessActive) {
      setLeaderboardData(null);
      return;
    }

    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        const result = await getMonthlyLeaderboard(currentBusinessId, { limit: 3 });
        if (!isMounted) return;
        setLeaderboardData(result ?? null);
      } catch {
        if (!isMounted) return;
        setLeaderboardData(null);
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [
    activeBusinesses,
    currentBusinessId,
    getMonthlyLeaderboard,
    isEmploymentsHydrated,
    isFocused,
  ]);

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
    const candidateId = ids[0] || null;
    const isActiveCandidate = candidateId
      ? activeBusinesses.some((business) => business.id === candidateId)
      : false;
    const nextBusinessId = isActiveCandidate
      ? candidateId
      : currentBusinessId || activeBusinesses?.[0]?.id;
    if (!nextBusinessId) return;
    setLeaderboardBusinessId(nextBusinessId);
  };
  const hasPremiumBusinesses = activeBusinesses.length > 0;

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
        title={t("user.profile.leaderboard.title")}
      />

      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={[]}
        selectedBusinesses={leaderboardBusinessId ? [leaderboardBusinessId] : []}
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
          {!hasPremiumBusinesses ? (
            <View className="pt-2.5 bg-white border border-[#EEEEEE] rounded-2xl px-5 py-6">
              <Text className="text-center font-proximanova-semibold text-lg text-primary">
                {t("user.profile.leaderboard.premiumRequiredTitle", {
                  defaultValue: "Premium Required",
                })}
              </Text>
              <Text className="text-center font-proximanova-regular text-sm text-secondary mt-2">
                {t("user.profile.leaderboard.premiumRequiredSubtitle", {
                  defaultValue:
                    "Leaderboard is available only for premium businesses.",
                })}
              </Text>
            </View>
          ) : (
            <>
          {/* Countdown Timer Card */}
          <View className="pt-2.5 bg-white border border-[#EEEEEE] rounded-2xl dark:bg-dark-surface">
            <Text className="text-center text-sm text-secondary dark:text-dark-secondary font-proximanova-regular mb-4">
              {t("user.profile.leaderboard.resultsIn")}
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
                {t("user.profile.leaderboard.top3")}
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
                          {`${getRewardCoins(performer.rank)} ${t("user.profile.leaderboard.tokenReward")}`}
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
                      {performer.points} {t("user.profile.leaderboard.points")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
            </>
          )}
        </ScrollView>

        {hasPremiumBusinesses ? (
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
                {currentUser.points} {t("user.profile.leaderboard.points")}
              </Text>
            </View>
          </View>
        ) : null}
      </LinearGradient>
    </SafeAreaView>
  );
}

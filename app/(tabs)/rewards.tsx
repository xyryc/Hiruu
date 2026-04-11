import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { walletService } from "@/services/walletService";
import { useAchievementStore } from "@/stores/achievementStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { formatCountdownFromSeconds } from "@/utils/date";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DateTime } from "luxon";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EMPTY_CHALLENGES: any[] = [];

const UserRewards = () => {
  const screenWidth = Dimensions.get("window").width;
  const [totalTokens, setTotalTokens] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const getBoard = useAchievementStore((state) => state.getBoard);
  const board = useAchievementStore((state) => state.board);
  const recentAchievement = board?.recentAchievement ?? null;
  const standardChallenges = board?.standardChallenges ?? EMPTY_CHALLENGES;
  const timezone = usePreferencesStore((state) => state.timezone);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const loadWallet = useCallback(async () => {
    try {
      const result = await walletService.getWallet();
      const nextTokens = Number(result?.data?.coins ?? result?.data?.wallet?.coins);
      setTotalTokens(Number.isFinite(nextTokens) ? nextTokens : 0);
    } catch {
      setTotalTokens(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
      getBoard().catch(() => undefined);
    }, [getBoard, loadWallet])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadWallet(), getBoard()]);
    } catch {
      // no-op: existing UI already handles fallback values
    } finally {
      setRefreshing(false);
    }
  }, [getBoard, loadWallet]);

  const totalTokensLabel = useMemo(
    () => new Intl.NumberFormat("en-US").format(totalTokens),
    [totalTokens]
  );

  const recentAchievementTitle = useMemo(
    () => recentAchievement?.title?.trim() || "You've Completed 3 Shifts In A Row!",
    [recentAchievement?.title]
  );

  const recentAchievementProgress = useMemo(() => {
    const progress = Number(recentAchievement?.userProgress?.progress || 0);
    return Number.isFinite(progress) ? progress : 0;
  }, [recentAchievement?.userProgress?.progress]);

  const recentAchievementTarget = useMemo(() => {
    const target = Number(recentAchievement?.target || 0);
    return Number.isFinite(target) && target > 0 ? target : 5;
  }, [recentAchievement?.target]);

  const recentAchievementRewardTokens = useMemo(() => {
    const tokens = Number(recentAchievement?.rewardTokens || 0);
    return Number.isFinite(tokens) ? tokens : 20;
  }, [recentAchievement?.rewardTokens]);

  const recentAchievementProgressLabel = useMemo(() => {
    if (recentAchievement?.description?.trim()) {
      return recentAchievement.description.trim();
    }

    return `Completed: ${recentAchievementProgress}/${recentAchievementTarget}`;
  }, [
    recentAchievement?.description,
    recentAchievementProgress,
    recentAchievementTarget,
  ]);

  const recentAchievementProgressPercent = useMemo(() => {
    const target = recentAchievementTarget;
    const calculatedPercent =
      target > 0 ? (recentAchievementProgress / target) * 100 : 0;
    const apiPercent = Number(recentAchievement?.userProgress?.progressPercent ?? NaN);
    const value = Number.isFinite(apiPercent)
      ? apiPercent
      : Number.isFinite(calculatedPercent)
        ? calculatedPercent
        : 0;

    return Math.max(0, Math.min(100, value));
  }, [
    recentAchievement?.userProgress?.progressPercent,
    recentAchievementProgress,
    recentAchievementTarget,
  ]);

  const recentAchievementProgressColor = useMemo(() => {
    if (recentAchievementProgressPercent < 10) return "#F9B8A6";
    if (recentAchievementProgressPercent < 20) return "#F7A58E";
    if (recentAchievementProgressPercent < 35) return "#EFDDA0";
    if (recentAchievementProgressPercent < 50) return "#E9D68A";
    if (recentAchievementProgressPercent < 65) return "#CFE09A";
    if (recentAchievementProgressPercent < 80) return "#BFD98C";
    if (recentAchievementProgressPercent < 90) return "#ACD88F";
    return "#9EDF91";
  }, [recentAchievementProgressPercent]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const remainingTimeLabel = useMemo(() => {
    const periodStartRaw = recentAchievement?.userProgress?.periodStart;
    const periodEndRaw = recentAchievement?.userProgress?.periodEnd;

    if (!periodStartRaw || !periodEndRaw) {
      return "00:00:00";
    }

    const zone = timezone || "UTC";
    const now = DateTime.fromMillis(nowMs, { zone });
    const periodStart = DateTime.fromISO(periodStartRaw, { zone: "utc" }).setZone(zone);
    const periodEnd = DateTime.fromISO(periodEndRaw, { zone: "utc" }).setZone(zone);

    if (!now.isValid || !periodStart.isValid || !periodEnd.isValid) {
      return "00:00:00";
    }

    const effectiveNow = now < periodStart ? periodStart : now;
    const secondsLeft = Math.max(
      0,
      Math.floor(periodEnd.diff(effectiveNow, "seconds").seconds)
    );

    return formatCountdownFromSeconds(secondsLeft);
  }, [
    nowMs,
    recentAchievement?.userProgress?.periodEnd,
    recentAchievement?.userProgress?.periodStart,
    timezone,
  ]);

  const fallbackChallengeImage = require("@/assets/images/reward/giftbox.svg");
  const challengeCardStyleCycle = [
    { border: "#3EBF5A", back: "#ECF9EF" },
    { border: "#F3934F", back: "#FEEFE5" },
    { border: "#788CFF", back: "#788CFF10" },
  ] as const;

  const toTwoLineTitle = useCallback((title?: string | null) => {
    const words = String(title || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!words.length) return { line1: "Challenge", line2: "" };
    if (words.length === 1) return { line1: words[0], line2: "" };
    return {
      line1: words.slice(0, Math.ceil(words.length / 2)).join(" "),
      line2: words.slice(Math.ceil(words.length / 2)).join(" "),
    };
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
        className="flex-1 justify-center items-center"
      >
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4FB2F3"
            />
          }
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          <View className="mx-5">
            <TouchableOpacity
              onPress={() => router.push("/screens/rewards/token-activity")}
              className="w-10 h-10 items-center justify-center bg-[#ffffff] rounded-full absolute top-2.5 right-0"
            >
              <Octicons name="history" size={18} color="black" />
            </TouchableOpacity>

            <View className="flex-col mt-8 justify-between items-center">
              <Text className="font-proximanova-regular text-base text-secondary dark:text-dark-secondary text-center mt-2.5">
                Total Tokens
              </Text>

              <View className="flex-row items-center justify-center mt-1 gap-2.5">
                <View>
                  <Image
                    source={require("@/assets/images/hiruu-coin.svg")}
                    contentFit="contain"
                    style={{ height: 44, width: 40 }}
                  />
                </View>
                <Text className="font-proximanova-bold text-[40px] text-[#4FB2F3]">
                  {totalTokensLabel}
                </Text>
              </View>

            </View>

            <PrimaryButton
              title="Redeem"
              onPress={() => router.push("/screens/rewards/redeem-tokens")}
              className="w-44 justify-center items-center mx-auto mt-4"
              iconSize={18}
            />

            <Text className="font-proximanova-regular text-sm text-center text-primary dark:text-dark-primary mt-2.5">
              Earn tokens as you unlock and level up badges!
            </Text>

            <View className="bg-[#4FB2F3] p-4 rounded-2xl mt-8">
              <Text className="font-proximanova-semibold text-lg text-[#FFFFFF]">
                {recentAchievementTitle}
              </Text>

              <View className="flex-row gap-2 mt-3">
                <View>
                  <Image
                    source={require("@/assets/images/reward/reward-complete-spark.svg")}
                    contentFit="contain"
                    style={{ width: 44, height: 44 }}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text className="font-proximanova-regular text-sm text-[#ffffff]">
                      <Text className="text-[#ffffff]/70">
                        {recentAchievementProgressLabel}
                      </Text>
                    </Text>
                    <Text className="font-proximanova-semibold text-sm text-[#ffffff]">
                      {recentAchievementRewardTokens} Tokens
                    </Text>
                  </View>

                  <View className="h-6 w-full justify-center">
                    <View
                      className="w-full bg-white/35 overflow-hidden"
                      style={{ height: 16, borderRadius: 10 }}
                    >
                      <View
                        className="h-full"
                        style={{
                          width: `${recentAchievementProgressPercent}%`,
                          backgroundColor: recentAchievementProgressColor,
                          borderRadius: 10,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View className="items-center">
              <Image
                source={require("@/assets/images/shift-ongoing-bg.svg")}
                contentFit="contain"
                style={{ height: 34, width: 250, marginHorizontal: "auto" }}
              />

              <View className="flex-row items-center justify-center -mt-8 gap-1">
                <Text className="text-center font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                  Your Time Remaining:
                </Text>

                <Image
                  source={require("@/assets/images/reward/timer.svg")}
                  contentFit="contain"
                  style={{
                    height: 18,
                    width: 18,
                  }}
                />

                <Text className="text-center font-proximanova-bold text-[#F3934F]">
                  {remainingTimeLabel}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-8 mx-5">
            <View className="flex-row justify-between items-center">
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Standard Challenges
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/screens/rewards/challenges")}
              >
                <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {/* standard challenges */}
            <ScrollView
              horizontal
              className="mt-4"
              showsHorizontalScrollIndicator={false}
            >
              {standardChallenges.map((challenge, index) => {
                const cardStyle =
                  challengeCardStyleCycle[index % challengeCardStyleCycle.length];
                const titleLines = toTwoLineTitle(challenge?.title);
                const rewardTokens = Number(challenge?.rewardTokens || 0);
                const challengeImageSource =
                  typeof challenge?.icon === "string" && challenge.icon.trim()
                    ? { uri: challenge.icon.trim() }
                    : fallbackChallengeImage;
                return (
                  <TouchableOpacity
                    key={challenge?.id || String(index)}
                    style={{
                      width: screenWidth * 0.3,
                    }}
                    className="border-[#EEEEEE] border p-3 rounded-xl mr-1 items-center"
                    onPress={() => router.push("/screens/rewards/challenges")}
                  >
                    <View
                      className="h-[72px] w-[63px] border border-b-[3px] justify-between items-center flex-row rounded-xl"
                      style={{
                        backgroundColor: cardStyle.back,
                        borderColor: cardStyle.border,
                      }}
                    >
                      <Image
                        source={challengeImageSource}
                        contentFit="contain"
                        style={{ height: 57, width: 59 }}
                      />
                    </View>
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5 text-center ">
                      {titleLines.line1}
                    </Text>
                    <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center ">
                      {titleLines.line2}
                    </Text>

                    <View className="flex-row justify-between items-center"></View>

                    <View className="flex-row items-center justify-between gap-2 mt-2">
                      <Image
                        source={require("@/assets/images/hiruu-coin.svg")}
                        style={{
                          width: 22,
                          height: 22,
                        }}
                        contentFit="contain"
                      />
                      <View className="px-2.5 py-0.5 bg-[#DDF1FF]  -ml-2.5 -z-10 rounded-r-[40px]">
                        <Text className="text-xs font-proximanova-semibold">
                          {rewardTokens}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="crown"
                        className="ml-0.5"
                        size={18}
                        color="#4FB2F3"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* redeem rewards */}
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-6">
              Redeem Rewards
            </Text>

            <View className="relative mt-4">
              {/* background */}
              <Image
                source={require("@/assets/images/reward/subtract.svg")}
                style={{
                  width: screenWidth * 0.9,
                  height: 230,
                }}
                contentFit="fill"
              />

              {/* content */}
              <View className="absolute top-0 left-0 w-full">
                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <MaterialCommunityIcons name="crown" size={18} color="#4FB2F3" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Premium for a month
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <MaterialCommunityIcons
                      name="gift"
                      size={15}
                      color="#4FB2F3"
                    />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Gift Premium for a month
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <Ionicons name="person" size={15} color="#4FB2F3" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Be feature profile as user
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <Ionicons
                      name="person-circle-outline"
                      size={15}
                      color="#4FB2F3"
                    />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Be feature profile as business
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/screens/rewards/redeem-tokens")}
                  className="flex-row justify-between items-center p-4"
                >
                  <View className="flex-row  gap-1.5">
                    <FontAwesome name="map-signs" size={15} color="#4FB2F3" />
                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                      Featured profile nameplate
                    </Text>
                  </View>
                  <MaterialIcons
                    name="arrow-forward-ios"
                    size={10}
                    color="black"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default UserRewards;

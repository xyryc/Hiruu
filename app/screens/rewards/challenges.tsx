import ScreenHeader from "@/components/header/ScreenHeader";
import AutoHideTooltip from "@/components/ui/dropdown/AutoHideTooltip";
import CoinProgressSlider from "@/components/ui/inputs/CoinProgressSlider";
import {
  AchievementItem,
  AchievementType,
  useAchievementStore,
} from "@/stores/achievementStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { t } from "i18next";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const tabs = [t("user.profile.challenges.oneTime"), t("user.profile.challenges.repeatable")];
const achievementTypeByTab: Record<(typeof tabs)[number], AchievementType> = {
  [t("user.profile.challenges.oneTime")]: "onetime",
  [t("user.profile.challenges.repeatable")]: "repeat",
};

const challengeIllustrations: Record<string, any> = {
  coins: require("@/assets/images/reward/giftbox.svg"),
  shifts: require("@/assets/images/reward/accept.svg"),
  rating: require("@/assets/images/reward/reted.svg"),
  referral: require("@/assets/images/reward/refer-friend.svg"),
  attendance: require("@/assets/images/reward/timer.svg"),
  onboarding: require("@/assets/images/reward/complate-profile.svg"),
};

const getChallengeImage = (achievement: AchievementItem) => {
  const conditionType = achievement?.conditions?.type || "";
  return (
    challengeIllustrations[conditionType] ||
    require("@/assets/images/reward/giftbox.svg")
  );
};

const getChallengeActionLabel = (achievement: AchievementItem) => {
  if (achievement?.userProgress?.isClaimed) return t("user.profile.challenges.collected");
  if (achievement?.userProgress?.canClaim) return t("user.profile.challenges.claim");
  if (achievement?.userProgress?.completedAt) return t("user.profile.challenges.complete");
  return t("user.profile.challenges.inProgress");
};

const Challenges = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isActive, setIsActive] = useState("One-Time");
  const [page, setPage] = useState(1);
  const limit = 10;
  const currentType = achievementTypeByTab[isActive];
  const {
    achievements,
    achievementsPagination,
    isLoadingAchievements,
    isLoadingMoreAchievements,
    claimingAchievementId,
    getAchievements,
    claimAchievement,
  } = useAchievementStore();

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      getAchievements(currentType, 1, limit, false).catch((error: any) => {
        toast.error(error?.message || t("user.profile.challenges.failedToLoadChallenges"));
      });
    }, [currentType, getAchievements])
  );

  const handleClaim = useCallback(
    async (achievement: AchievementItem) => {
      if (!achievement?.id || !achievement?.userProgress?.canClaim) return;

      try {
        const result = await claimAchievement(achievement.id);
        toast.success(
          translateApiMessage(result?.message) || t("user.profile.challenges.claimedSuccessfully")
        );
        setPage(1);
        await getAchievements(currentType, 1, limit, false);
      } catch (error: any) {
        toast.error(
          translateApiMessage(error?.message) || t("user.profile.challenges.failedToClaimAchievement")
        );
      }
    },
    [claimAchievement, currentType, getAchievements]
  );

  const handleLoadMore = useCallback(async () => {
    const hasNext = Boolean(achievementsPagination?.hasNext);
    if (!hasNext || isLoadingAchievements || isLoadingMoreAchievements) return;

    const nextPage = Number(achievementsPagination?.page || page) + 1;
    try {
      await getAchievements(currentType, nextPage, limit, true);
      setPage(nextPage);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load more challenges");
    }
  }, [
    achievementsPagination?.hasNext,
    achievementsPagination?.page,
    currentType,
    getAchievements,
    isLoadingAchievements,
    isLoadingMoreAchievements,
    page,
  ]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const threshold = 120;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold) {
      void handleLoadMore();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background">
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-6 rounded-b-3xl overflow-hidden"
        title={t("user.profile.challenges.standardChallenges")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111111"}
      />

      <TouchableOpacity
        onPress={() => router.push("/screens/rewards/redeem-tokens")}
      >
        <View className="bg-[#aed7f1] mx-4 rounded-xl flex-row">
          <View className="mt-3 mb-2">
            <Image
              source={require("@/assets/images/engagement.svg")}
              contentFit="contain"
              style={{
                width: 80,
                height: 80,
                marginLeft: -7,
                transform: [{ rotate: "90deg" }],
              }}
            />
          </View>

          <View className="flex-1 flex-row mt-2 justify-between">
            <View>
              <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary">
                {t("user.profile.challenges.redeemYourTokens")}
              </Text>
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5">
                {t("user.profile.challenges.redeemForPerks")}
              </Text>
              <TouchableOpacity className="mt-1.5 bg-[#11293A] rounded-full px-2 py-1.5 justify-center items-center w-28">
                <Text className="font-proximanova-bold text-sm text-white text-center">
                  {t("user.profile.challenges.extraBonus")}
                </Text>
              </TouchableOpacity>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              className="right-5 top-2"
              size={15}
              color="black"
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className="mt-5 flex-row mx-5">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            className={`w-1/2 border-b pb-2 ${isActive === tab && "border-[#11293A] border-b-2"
              }`}
            onPress={() => setIsActive(tab)}
          >
            <Text
              className={`text-center ${isActive === tab
                ? "font-proximanova-semibold text-base text-primary dark:text-dark-primary"
                : "font-proximanova-regular text-secondary dark:text-dark-secondary"
                } `}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="mx-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={150}
      >
        {isLoadingAchievements ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : achievements.length > 0 ? (
          achievements.map((achievement, index) => {
            const progress = Number(achievement?.userProgress?.progress || 0);
            const target = Number(achievement?.conditions?.target || 0);
            const rewardCoins = Number(
              achievement?.rewardCoins ?? achievement?.rewards?.[0]?.coins ?? 0
            );
            const actionLabel = getChallengeActionLabel(achievement);
            const isClaimed = Boolean(achievement?.userProgress?.isClaimed);
            const canClaim = Boolean(achievement?.userProgress?.canClaim);
            const isClaiming = claimingAchievementId === achievement.id;

            return (
              <View key={achievement.id}>
                <View className={`flex-row gap-4 ${index === 0 ? "mt-4" : "mt-5"} ${isClaimed ? "opacity-50" : ""}`}>
                  <View>
                    <Image
                      source={getChallengeImage(achievement)}
                      contentFit="contain"
                      style={{ height: 87, width: 63 }}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 pr-3 mt-2">
                        <View className="flex-row items-center flex-wrap gap-2">
                          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                            {achievement.title}
                          </Text>

                          <View className="flex-row items-center">
                            <Image
                              source={require("@/assets/images/hiruu-coin.svg")}
                              style={{ width: 20, height: 20 }}
                              contentFit="contain"
                            />
                            <View className="px-3 py-1 bg-[#DDF1FF] -ml-2 -z-10 rounded-r-[40px]">
                              <Text className="text-xs font-proximanova-semibold">
                                {rewardCoins}
                              </Text>
                            </View>
                          </View>

                          {achievement?.rewardCosmetic ? (
                            <AutoHideTooltip
                              message={achievement.rewardCosmetic?.name || "Cosmetic reward"}
                              duration={3000}
                            >
                              <MaterialCommunityIcons
                                name="palette-outline"
                                size={18}
                                color="#4FB2F3"
                              />
                            </AutoHideTooltip>
                          ) : null}
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={canClaim ? 0.85 : 1}
                        disabled={!canClaim || isClaiming}
                        onPress={() => handleClaim(achievement)}
                        className={`mt-2 self-start rounded-full ${canClaim && !isClaiming ? "bg-[#11293A]" : "bg-[#8FA7B8]"}`}
                      >
                        <Text className="px-4 py-2 font-proximanova-semibold text-sm text-[#ffffff] text-center">
                          {isClaiming ? "Claiming..." : actionLabel}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-0.5">
                      {achievement.description}
                    </Text>

                    <View className="mt-3.5 flex-row items-center gap-3">
                      <View className="flex-1">
                        <CoinProgressSlider achieved={progress} max={target || 1} />
                      </View>
                      <Text className="min-w-[40px] text-right font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                        <Text className="text-[#4FB2F3]">{progress}</Text>/{target}
                      </Text>
                    </View>
                  </View>
                </View>

                {index !== achievements.length - 1 ? (
                  <Image
                    source={require("@/assets/images/dotted-line.svg")}
                    contentFit="contain"
                    style={{
                      width: "100%",
                      height: 2,
                      marginHorizontal: "auto",
                      marginTop: 20,
                    }}
                  />
                ) : null}
              </View>
            );
          })
        ) : (
          <View className="py-10">
            <Text className="text-center text-sm text-secondary dark:text-dark-secondary">
              {isActive === t("user.profile.challenges.oneTime")
                ? t("user.profile.challenges.noOneTimeFound")
                : t("user.profile.challenges.noRepeatableFound")}
            </Text>
          </View>
        )}

        {isLoadingMoreAchievements ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Challenges;

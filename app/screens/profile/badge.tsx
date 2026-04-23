import ScreenHeader from "@/components/header/ScreenHeader";
import BadgeCardWithSlider from "@/components/ui/cards/BadgeCardWithSlider";
import BadgeModal from "@/components/ui/modals/BadgeModal";
import axiosInstance from "@/utils/axios";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type BadgeTrack = {
  id: string;
  key: string;
  title: string;
  displayUnit: string;
  ongoingTier: string;
  nextTier: string;
  nextThreshold: number;
  currentProgress: number;
  threshold: number;
};

type BadgeTrackReward = {
  id?: string;
  type?: string;
  coins?: number;
  badgeConfig?: {
    tier?: string;
    assetKey?: string;
    threshold?: number;
  } | null;
  metadata?: any;
};

type BadgeTrackUserBadge = {
  achievementRewardId?: string;
  earnedAt?: string;
  progressSnapshot?: number;
  isEquipped?: boolean;
  equippedSlot?: string | null;
};

type BadgeTrackDetail = {
  id: string;
  key: string;
  title: string;
  category?: string;
  displayUnit?: string;
  ongoingTier?: string;
  nextTier?: string;
  nextThreshold?: number;
  currentProgress?: number;
  threshold?: number;
  rewards?: BadgeTrackReward[];
  userBadges?: BadgeTrackUserBadge[];
};

type BadgeUiMeta = {
  img: any;
  badgeBackground: string;
  tagColor: string;
};

const TIER_UI_MAP: Record<string, BadgeUiMeta> = {
  bronze: {
    img: require("@/assets/images/reward/red-bands.svg"),
    badgeBackground: "#FFF4ED",
    tagColor: "#F3934F",
  },
  silver: {
    img: require("@/assets/images/reward/black-bands.svg"),
    badgeBackground: "#80808008",
    tagColor: "#808080",
  },
  gold: {
    img: require("@/assets/images/reward/gold-bands.svg"),
    badgeBackground: "#FFFBE8",
    tagColor: "#F1C400",
  },
  diamond: {
    img: require("@/assets/images/reward/blue-bands.svg"),
    badgeBackground: "#EFF9FF",
    tagColor: "#4FB2F3",
  },
};

const DEFAULT_TIER_UI = TIER_UI_MAP.bronze;

const normalizeTier = (tier?: string) => String(tier || "").toLowerCase();
const formatTier = (tier?: string, fallback = "") => {
  const value = normalizeTier(tier);
  if (!value) return fallback;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatProgressText = (
  currentProgress?: number,
  nextThreshold?: number,
  displayUnit?: string
) => {
  const current = typeof currentProgress === "number" ? currentProgress : 0;
  const max = typeof nextThreshold === "number" ? nextThreshold : 0;
  const unit = String(displayUnit || "").trim();
  return `${current}${unit}/ ${max}${unit}`;
};

const formatNextText = (
  nextTier?: string,
  threshold?: number,
  displayUnit?: string,
  nextBadgeAtLabel = "",
  tierFallback = ""
) => {
  if (!nextTier || typeof threshold !== "number") {
    return null;
  }
  const tier = formatTier(nextTier, tierFallback);
  const max = threshold;
  const unit = String(displayUnit || "").trim();
  return `${tier} ${nextBadgeAtLabel} ${max} ${unit}`;
};

const getTierUi = (tier?: string) => {
  const key = normalizeTier(tier);
  return TIER_UI_MAP[key] || DEFAULT_TIER_UI;
};

const Badge = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [tracks, setTracks] = useState<BadgeTrack[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<{
    coin?: number;
    img: any;
    badgeBackground: string;
    tagColor: string;
    title?: string;
    buttonTitle?: string;
    time?: string;
    subTitle?: string;
    details?: string;
    max?: number;
    achieved?: number;
    metricLabel?: string;
    tierItems?: {
      id: string;
      title: string;
      img: any;
      bgColor: string;
      color: string;
      time: string;
      isEarned?: boolean;
    }[];
  }>({
    coin: 0,
    img: "",
    badgeBackground: "",
    tagColor: "",
    title: "",
    buttonTitle: "",
    time: "",
    subTitle: "",
    details: "",
    max: 0,
    achieved: 0,
    metricLabel: t("user.profile.badgeScreen.progress"),
    tierItems: [],
  });
  const modalRequestIdRef = React.useRef(0);

  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadBadgeTracks = async () => {
      try {
        const response = await axiosInstance.get("/badges/tracks");
        const result = response?.data;
        const badgeTracks = Array.isArray(result?.data) ? result.data : [];
        if (!mounted) return;
        setTracks(badgeTracks);
      } catch (error: any) {
        if (!mounted) return;
        if (isExpectedAuthError(error)) return;
        toast.error(error?.message || t("user.profile.badgeScreen.failedToLoadBadges"));
      }
    };

    void loadBadgeTracks();

    return () => {
      mounted = false;
    };
  }, [t]);

  const uiTracks = useMemo(() => {
    return tracks.map((track) => {
      const tierKey = normalizeTier(track?.ongoingTier);
      const tierUi = TIER_UI_MAP[tierKey] || DEFAULT_TIER_UI;
      return {
        ...track,
        tierUi,
        tag: formatTier(track?.ongoingTier, t("user.profile.badgeScreen.bronze")),
        time: formatProgressText(
          track?.currentProgress,
          track?.threshold,
          track?.displayUnit
        ),
        nextText: formatNextText(
          track?.nextTier,
          track?.nextThreshold,
          track?.displayUnit,
          t("user.profile.badgeScreen.badgeAt"),
          t("user.profile.badgeScreen.bronze")
        ),
      };
    });
  }, [tracks, t]);

  const handleClickOpenModal = async (track: (typeof uiTracks)[number]) => {
    const requestId = ++modalRequestIdRef.current;
    setVisible(true);
    setData({
      coin: 0,
      img: track.tierUi.img,
      badgeBackground: track.tierUi.badgeBackground,
      tagColor: track.tierUi.tagColor,
      title: track.title,
      buttonTitle: track.tag,
      time: track.time,
      subTitle: track.nextText,
      details: "",
      max: Number(track.threshold || 0),
      achieved: Number(track.currentProgress || 0),
      metricLabel: t("user.profile.badgeScreen.progress"),
      tierItems: [],
    });

    try {
      const response = await axiosInstance.get(`/badges/tracks/${track.id}`);
      const result = response?.data;
      const detail: BadgeTrackDetail | null =
        result?.data && typeof result.data === "object" ? result.data : null;
      if (!detail) return;
      if (requestId !== modalRequestIdRef.current) return;

      const earnedRewardIds = new Set(
        Array.isArray(detail?.userBadges)
          ? detail.userBadges
            .map((item) => item?.achievementRewardId)
            .filter((id): id is string => typeof id === "string" && id.length > 0)
          : []
      );

      const tierItems = (Array.isArray(detail?.rewards) ? detail.rewards : [])
        .map((reward) => {
          const tier = reward?.badgeConfig?.tier;
          const tierUi = getTierUi(tier);
          const thresholdValue =
            typeof reward?.badgeConfig?.threshold === "number"
              ? reward.badgeConfig.threshold
              : 0;
          const unit = String(detail?.displayUnit || "").trim();

          return {
            id: String(reward?.id || `${tier || "bronze"}-${thresholdValue}`),
            title: formatTier(tier, t("user.profile.badgeScreen.bronze")),
            img: tierUi.img,
            bgColor: `${tierUi.tagColor}26`,
            color: tierUi.tagColor,
            time: `${thresholdValue} ${unit}`.trim(),
            isEarned: reward?.id ? earnedRewardIds.has(reward.id) : false,
          };
        })
        .sort((a, b) => {
          const aThreshold = Number(String(a.time).split(" ")[0] || 0);
          const bThreshold = Number(String(b.time).split(" ")[0] || 0);
          return aThreshold - bThreshold;
        });

      const ongoingTierUi = getTierUi(detail?.ongoingTier);
      const ongoingReward = (Array.isArray(detail?.rewards) ? detail.rewards : []).find(
        (item) => normalizeTier(item?.badgeConfig?.tier) === normalizeTier(detail?.ongoingTier)
      );

      setData({
        coin: Number(ongoingReward?.coins || 0),
        img: ongoingTierUi.img,
        badgeBackground: ongoingTierUi.badgeBackground,
        tagColor: ongoingTierUi.tagColor,
        title: detail?.title || track.title,
        buttonTitle: formatTier(
          detail?.ongoingTier,
          t("user.profile.badgeScreen.bronze")
        ),
        time: formatProgressText(
          detail?.currentProgress,
          detail?.threshold,
          detail?.displayUnit
        ),
        subTitle: formatNextText(
          detail?.nextTier,
          detail?.nextThreshold,
          detail?.displayUnit,
          t("user.profile.badgeScreen.badgeAt"),
          t("user.profile.badgeScreen.bronze")
        ),
        details: "",
        max: Number(detail?.threshold || 0),
        achieved: Number(detail?.currentProgress || 0),
        metricLabel: t("user.profile.badgeScreen.progress"),
        tierItems,
      });
    } catch (error: any) {
      if (requestId !== modalRequestIdRef.current) return;
      if (isExpectedAuthError(error)) return;
      toast.error(error?.message || t("user.profile.badgeScreen.failedToLoadBadgeDetails"));
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="#E5F4FD"
        translucent={false}
      />
      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
          onPressBack={() => router.back()}
          title={t("user.profile.userProfile.badge")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView contentContainerStyle={{
        paddingBottom: 80
      }}>
        {uiTracks.map((track, index) => (
          <BadgeCardWithSlider
            key={track.id}
            onPress={() => handleClickOpenModal(track)}
            className={`${index === 0 ? "mt-5" : "mt-4"} mx-5`}
            badgeBackground={track.tierUi.badgeBackground}
            tagColor={track.tierUi.tagColor}
            img={track.tierUi.img}
            title={track.title}
            time={track.time}
            text={track.nextText || ""}
            max={Number(track.threshold || 0)}
            achieved={Number(track.currentProgress || 0)}
            tag={track.tag}
          />
        ))}
      </ScrollView>

      <BadgeModal
        visible={visible}
        onClose={() => setVisible(false)}
        data={data}
      />
    </SafeAreaView>
  );
};

export default Badge;

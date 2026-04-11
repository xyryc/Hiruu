import ScreenHeader from "@/components/header/ScreenHeader";
import BadgeCardWithSlider from "@/components/ui/cards/BadgeCardWithSlider";
import BadgeModal from "@/components/ui/modals/BadgeModal";
import axiosInstance from "@/utils/axios";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
const formatTier = (tier?: string) => {
  const value = normalizeTier(tier);
  if (!value) return "Bronze";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatProgressText = (
  currentProgress?: number,
  threshold?: number,
  displayUnit?: string
) => {
  const current = typeof currentProgress === "number" ? currentProgress : 0;
  const max = typeof threshold === "number" ? threshold : 0;
  const unit = String(displayUnit || "").trim();
  return `${current}${unit}/ ${max}${unit}`;
};

const formatNextText = (
  nextTier?: string,
  threshold?: number,
  displayUnit?: string
) => {
  const tier = formatTier(nextTier);
  const max = typeof threshold === "number" ? threshold : 0;
  const unit = String(displayUnit || "").trim();
  return `${tier} badge at ${max} ${unit}`;
};

const Badge = () => {
  const [visible, setVisible] = useState(false);
  const [tracks, setTracks] = useState<BadgeTrack[]>([]);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
    metricLabel: "Progress",
  });

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
        toast.error(error?.message || "Failed to load badges");
      }
    };

    void loadBadgeTracks();

    return () => {
      mounted = false;
    };
  }, []);

  const uiTracks = useMemo(() => {
    return tracks.map((track) => {
      const tierKey = normalizeTier(track?.ongoingTier);
      const tierUi = TIER_UI_MAP[tierKey] || DEFAULT_TIER_UI;
      return {
        ...track,
        tierUi,
        tag: formatTier(track?.ongoingTier),
        time: formatProgressText(
          track?.currentProgress,
          track?.threshold,
          track?.displayUnit
        ),
        nextText: formatNextText(
          track?.nextTier,
          track?.threshold,
          track?.displayUnit
        ),
      };
    });
  }, [tracks]);

  const handleClickOpenModal = (track: (typeof uiTracks)[number]) => {
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
      metricLabel: "Progress",
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Badge"
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
            text={track.nextText}
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


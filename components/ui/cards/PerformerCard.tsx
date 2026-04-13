import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import SimpleStatusBadge from "../badges/SimpleStatusBadge";
import SmallButton from "../buttons/SmallButton";

type PerformerCounts = {
  onTime?: number;
  early?: number;
  shiftCover?: number;
  late?: number;
  missed?: number;
};

type PerformerCardProps = {
  userName: string;
  avatar?: string | null;
  isPremium?: boolean;
  points: number;
  counts?: PerformerCounts;
  onPressSeeProfile?: () => void;
};

const BADGE_STYLE_MAP: Record<
  keyof PerformerCounts,
  { labelKey: string; textColor: string; bgColor: string }
> = {
  onTime: { labelKey: "user.profile.leaderboard.onTime", textColor: "#6998EF", bgColor: "#E9F0FD" },
  early: { labelKey: "user.profile.leaderboard.early", textColor: "#3EBF5A", bgColor: "#3EBF5A1F" },
  shiftCover: { labelKey: "user.profile.leaderboard.shiftCover", textColor: "#EAC324", bgColor: "#EAC3241F" },
  late: { labelKey: "user.profile.leaderboard.late", textColor: "#F3934F", bgColor: "#F3934F1F" },
  missed: { labelKey: "user.profile.leaderboard.missed", textColor: "#F34F4F", bgColor: "#F34F4F1A" },
};

const PerformerCard = ({
  userName,
  avatar,
  isPremium,
  points,
  counts,
  onPressSeeProfile,
}: PerformerCardProps) => {
  const { t } = useTranslation();
  const badgeItems = (Object.keys(BADGE_STYLE_MAP) as (keyof PerformerCounts)[])
    .map((key) => {
      const style = BADGE_STYLE_MAP[key];
      const value = Number(counts?.[key] ?? 0);
      return {
        key,
        title: `${t(style.labelKey)}: ${value}`,
        textColor: style.textColor,
        bgColor: style.bgColor,
      };
    })
    .slice(0, 3);

  return (
    <View
      className="border border-[#EEEEEE] rounded-xl mt-4 mr-4"
    >
      <View className="flex-row items-start justify-between gap-4 p-4">
        <View className="flex-row gap-2.5">
          <Image
            source={
              avatar
                ? { uri: avatar }
                : require("@/assets/images/placeholder.png")
            }
            style={{
              width: 42,
              height: 42,
              borderRadius: 999,
            }}
            contentFit="cover"
          />
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                {userName}
              </Text>
              {isPremium ? (
                <MaterialCommunityIcons name="crown" size={14} color="#4FB2F3" />
              ) : null}
            </View>
            <Text className="text-sm font-proximanova-regular text-[#4FB2F3] mt-1">
              {points} {t("user.profile.leaderboard.pointsEarned")}
            </Text>
          </View>
        </View>

        <SmallButton title={t("user.profile.leaderboard.seeProfile")} onPress={onPressSeeProfile} />
      </View>

      <View className="flex-row pl-4 pb-4 overflow-hidden">
        {badgeItems.map((item) => (
          <SimpleStatusBadge
            key={item.key}
            className="mr-1.5"
            title={item.title}
            textColor={item.textColor}
            bgColor={item.bgColor}
          />
        ))}
      </View>
    </View>
  );
};

export default PerformerCard;

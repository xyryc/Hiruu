import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
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
  points: number;
  counts?: PerformerCounts;
  onPressSeeProfile?: () => void;
};

const BADGE_STYLE_MAP: Record<
  keyof PerformerCounts,
  { label: string; textColor: string; bgColor: string }
> = {
  onTime: { label: "On Time", textColor: "#6998EF", bgColor: "#E9F0FD" },
  early: { label: "Early", textColor: "#3EBF5A", bgColor: "#3EBF5A1F" },
  shiftCover: { label: "Shift Cover", textColor: "#EAC324", bgColor: "#EAC3241F" },
  late: { label: "Late", textColor: "#F3934F", bgColor: "#F3934F1F" },
  missed: { label: "Missed", textColor: "#F34F4F", bgColor: "#F34F4F1A" },
};

const PerformerCard = ({
  userName,
  avatar,
  points,
  counts,
  onPressSeeProfile,
}: PerformerCardProps) => {
  const badgeItems = (Object.keys(BADGE_STYLE_MAP) as (keyof PerformerCounts)[])
    .map((key) => {
      const style = BADGE_STYLE_MAP[key];
      const value = Number(counts?.[key] ?? 0);
      return {
        key,
        title: `${style.label}: ${value}`,
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
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              {userName}
            </Text>
            <Text className="text-sm font-proximanova-regular text-[#4FB2F3] mt-1">
              {points} points earned
            </Text>
          </View>
        </View>

        <SmallButton title="See Profile" onPress={onPressSeeProfile} />
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

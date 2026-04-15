import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

type EquippedBadge = {
  id?: string;
  tier?: string;
  isEquipped?: boolean;
  equippedSlot?: number | null;
  achievement?: {
    title?: string;
  } | null;
};

const getBadgeAsset = (tier?: string) => {
  const normalized = String(tier || "").toLowerCase();
  switch (normalized) {
    case "silver":
      return require("@/assets/images/reward/black-bands.svg");
    case "gold":
      return require("@/assets/images/reward/gold-bands.svg");
    case "diamond":
      return require("@/assets/images/reward/blue-bands.svg");
    case "bronze":
    default:
      return require("@/assets/images/reward/red-bands.svg");
  }
};

const BadgeCard = ({ className, badges = [] }: { className?: string; badges?: EquippedBadge[] }) => {
  const { t } = useTranslation();
  const equippedBadges = (Array.isArray(badges) ? badges : [])
    .filter((badge) => badge?.isEquipped)
    .sort((a, b) => Number(a?.equippedSlot || 0) - Number(b?.equippedSlot || 0))
    .slice(0, 3);

  return (
    <View
      className={`flex-row justify-between px-4 border-hairline rounded-2xl ${className} `}
    >
      {equippedBadges.length > 0 ? (
        equippedBadges.map((badge, index) => (
          <React.Fragment key={badge?.id || `${badge?.tier || "bronze"}-${index}`}>
            <View className="pb-4 items-center flex-1">
              <Image
                source={getBadgeAsset(badge?.tier)}
                contentFit="cover"
                style={{ height: 75, width: 50 }}
              />
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center">
                {badge?.achievement?.title || t("user.profile.userProfile.badge")}
              </Text>
            </View>
            {index < equippedBadges.length - 1 ? (
              <Image
                source={require("@/assets/images/vertical-dotted-line.svg")}
                contentFit="contain"
                style={{ height: 60, width: 2, marginTop: 20 }}
              />
            ) : null}
          </React.Fragment>
        ))
      ) : (
        <View className="w-full py-6 items-center justify-center">
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
            {t("user.profile.userProfile.noEquippedBadges")}
          </Text>
        </View>
      )}
    </View>
  );
};

export default BadgeCard;

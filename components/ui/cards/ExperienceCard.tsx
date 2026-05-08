import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

type ExperienceCardProps = {
  focus?: boolean;
  className?: string;
  companyName?: string;
  position?: string;
  startDate?: string | null;
  endDate?: string | null;
  workedWeeks?: number | null;
  companyLogo?: string | { uri: string };
  isVerified?: boolean;
  isCurrent?: boolean;
};

const ExperienceCard = ({
  isCurrent,
  className,
  companyName,
  position,
  startDate,
  endDate,
  workedWeeks,
  companyLogo,
  isVerified,
}: ExperienceCardProps) => {
  const { t } = useTranslation();

  const getDurationLabel = () => {
    if (typeof workedWeeks === "number" && Number.isFinite(workedWeeks) && workedWeeks > 0) {
      const normalizedWeeks = Math.max(1, Math.floor(workedWeeks));
      if (normalizedWeeks < 4) {
        return `${normalizedWeeks} ${normalizedWeeks === 1 ? "Week" : "Weeks"}`;
      }
      const months = Math.max(1, Math.floor(normalizedWeeks / 4));
      if (months >= 12) {
        const years = Math.max(1, Math.floor(months / 12));
        return `${years} ${years === 1 ? "Year" : "Years"}`;
      }
      return `${months} ${months === 1 ? "Month" : "Months"}`;
    }

    if (!startDate) return "";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    if (end.getTime() <= start.getTime()) return "";

    const diffMs = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (totalDays < 7) {
      return `${totalDays} ${totalDays === 1 ? "Day" : "Days"}`;
    }

    if (totalDays < 30) {
      const weeks = Math.floor(totalDays / 7);
      return `${weeks} ${weeks === 1 ? "Week" : "Weeks"}`;
    }

    const totalMonths = Math.floor(totalDays / 30);
    if (totalMonths < 12) {
      return `${totalMonths} ${totalMonths === 1 ? "Month" : "Months"}`;
    }

    const years = Math.floor(totalMonths / 12);
    return `${years} ${years === 1 ? "Year" : "Years"}`;
  };

  const durationLabel = getDurationLabel();
  const subtitle = position
    ? durationLabel
      ? `${durationLabel} As ${position}`
      : `${t("user.profile.userProfile.workingAs")} ${position}`
    : t("user.profile.userProfile.roleNotSpecified");

  return (
    <View className={`${className} ${isCurrent ? "pt-9" : ""}`}>
      {isCurrent && (
        <View className="absolute top-0.5 right-3 z-10">
          <Image
            source={require("@/assets/images/experience.svg")}
            contentFit="contain"
            style={{ height: 30, width: 150 }}
          />
          <Text className="-mt-6 text-center font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            {t("user.profile.userProfile.currentWorking")}
          </Text>
        </View>
      )}
      <View
        className={`p-2.5 rounded-2xl ${isCurrent ? "border border-gray-400" : "border border-gray-300"}`}
      >
        <View className="flex-row justify-between ">
          <View className="flex-row items-center gap-3">
            <View>
              <Image
                source={companyLogo}
                contentFit="cover"
                style={{ height: 50, width: 50, borderRadius: 999 }}
              />
            </View>
            <View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {companyName || t("user.profile.userProfile.company")}
              </Text>
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {subtitle}
              </Text>
            </View>
          </View>

          {/* hiruu logo */}
          {isVerified && (
            <View>
              <Image
                source={require("@/assets/images/hiruu-logo.svg")}
                contentFit="contain"
                style={{ height: 14, width: 38 }}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default ExperienceCard;

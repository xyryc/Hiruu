import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

type ExperienceCardProps = {
  focus?: boolean;
  className?: string;
  companyName?: string;
  position?: string;
  companyLogo?: string | { uri: string };
  isVerified?: boolean;
  isCurrent?: boolean;
};

const ExperienceCard = ({
  isCurrent,
  className,
  companyName,
  position,
  companyLogo,
  isVerified,
}: ExperienceCardProps) => {
  const { t } = useTranslation();
  return (
    <View
      className={`p-2.5  ${className} ${isCurrent ? " border rounded-2xl" : "border border-[#0000000D] rounded-2xl"}`}>
      {isCurrent && (
        <View className="absolute -top-9 right-2">
          <Image
            source={require("@/assets/images/experience.svg")}
            contentFit="contain"
            style={{ height: 30, width: 150 }}
          />
          <Text className="-top-6 text-center font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            {t("user.profile.userProfile.currentWorking")}
          </Text>
        </View>
      )}
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
              {position ? `${t("user.profile.userProfile.workingAs")} ${position}` : t("user.profile.userProfile.roleNotSpecified")}
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
  );
};

export default ExperienceCard;

import { EngagementPerksProps } from "@/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import ActionCard from "../ui/cards/ActionCard";

const EngagementPerks = ({ className }: EngagementPerksProps) => {
  const { t } = useTranslation();

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        {t("common.engagementPerksTitle")}
      </Text>

      {/* action card */}
      <ActionCard
        title={t("common.engagementPerksCardTitle")}
        buttonTitle={t("common.howToEarn")}
        rightImage={require("@/assets/images/engagement.svg")}
        imageClass="right-4.5 -bottom-5"
        imageWidth={131}
        imageHeight={117}
        background={require("@/assets/images/engagement-bg.svg")}
        backgroundClass="right-9"
        backgroundWidth={103}
        backgroundHeight={80}
      />
    </View>
  );
};

export default EngagementPerks;

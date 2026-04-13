import { JobBoardCtaProps } from "@/types";
import { Href, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import ActionCard from "../ui/cards/ActionCard";

const JobBoardCta = ({ className, title, subtitle, route }: JobBoardCtaProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const targetRoute: Href = route || "/(tabs)/user-jobs";

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        {title}
      </Text>

      {/* job listing card */}
      <ActionCard
        onPress={() => router.push(targetRoute)}
        title={subtitle}
        buttonTitle={t("common.findNow")}
        rightImage={require("@/assets/images/toolbox.svg")}
        imageWidth={110}
        imageHeight={80}
        background={require("@/assets/images/chessboard-bg.svg")}
      />
    </View>
  );
};

export default JobBoardCta;

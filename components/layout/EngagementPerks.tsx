import { EngagementPerksProps } from "@/types";
import React from "react";
import { Text, View } from "react-native";
import ActionCard from "../ui/cards/ActionCard";

const EngagementPerks = ({ className }: EngagementPerksProps) => {
  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        Engagement & Perks
      </Text>

      {/* action card */}
      <ActionCard
        title="Let’s Start Earning Your First Tokens!"
        buttonTitle="How to Earn"
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

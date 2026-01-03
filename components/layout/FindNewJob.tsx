import { FindNewJobProps } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import ActionCard from "../ui/cards/ActionCard";

const FindNewJob = ({ className, business }: FindNewJobProps) => {
  const router = useRouter();

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        {business ? "Job Board" : "Find New Job"}
      </Text>

      {/* job listing card */}
      <ActionCard
        onPress={() => router.push("/(tabs)/user-jobs")}
        title={
          business
            ? "Need more hands? Post  & receiving applicants!"
            : "Explore All Job Listings"
        }
        buttonTitle="Find Now"
        rightImage={require("@/assets/images/toolbox.svg")}
        imageWidth={110}
        imageHeight={80}
        background={require("@/assets/images/chessboard-bg.svg")}
      />
    </View>
  );
};

export default FindNewJob;

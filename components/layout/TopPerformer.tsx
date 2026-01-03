import React from "react";
import { ScrollView, Text, View } from "react-native";
import PerformerCard from "../ui/cards/PerformerCard";

const TopPerformer = ({ className }: any) => {
  return (
    <View className={`${className}`}>
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
          Top Performer
        </Text>

        <Text className="text-sm font-proximanova-semibold text-[#4FB2F3] p-1">
          See All
        </Text>
      </View>

      {/* main content */}
      <ScrollView
        className="pl-5"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <PerformerCard />
        <PerformerCard />
        <PerformerCard />
        <PerformerCard />
      </ScrollView>
    </View>
  );
};

export default TopPerformer;

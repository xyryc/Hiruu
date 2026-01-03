import { WidgetsProps } from "@/types";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import AnnouncementCard from "../ui/cards/AnnouncementCard";
import WidgetCard from "../ui/cards/WidgetCard";

const Widgets = ({ className }: WidgetsProps) => {
  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">Widgets</Text>

      {/* widget card */}
      <ScrollView
        className="mb-7"
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      >
        <WidgetCard />
        <AnnouncementCard />
        <AnnouncementCard />
        <WidgetCard />
        <WidgetCard />
        <WidgetCard />
      </ScrollView>
    </View>
  );
};

export default Widgets;

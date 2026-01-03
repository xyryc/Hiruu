import React from "react";
import { Text, View } from "react-native";
import ShiftsLineChart from "../ui/cards/ShiftLineChart";

const PerformanceTrend = ({ className }: any) => {
  return (
    <View className={`${className} px-5`}>
      <Text className="mb-4 font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
        Performance Trend
      </Text>

      <ShiftsLineChart />
    </View>
  );
};

export default PerformanceTrend;

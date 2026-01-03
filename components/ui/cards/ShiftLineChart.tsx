import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
const { width } = Dimensions.get("window");

const ShiftsLineChart = () => {
  const completedShifts = [
    { value: 45 },
    { value: 50 },
    { value: 55 },
    { value: 72 },
    { value: 68 },
    { value: 45 },
    { value: 38 },
    { value: 42 },
    { value: 30 },
    { value: 48 },
    { value: 52 },
    { value: 45 },
  ];

  const missedShifts = [
    { value: 28 },
    { value: 35 },
    { value: 40 },
    { value: 48 },
    { value: 35 },
    { value: 25 },
    { value: 42 },
    { value: 38 },
    { value: 28 },
    { value: 52 },
    { value: 45 },
    { value: 38 },
  ];

  return (
    <View className="bg-[#E5F4FD] p-4 rounded-2xl border border-[#4FB2F350] overflow-hidden">
      {/* Chart */}
      <LineChart
        data={completedShifts}
        data2={missedShifts}
        height={180}
        width={width - 80}
        spacing={30}
        initialSpacing={10}
        endSpacing={10}
        color1="#22C55E"
        color2="#EF4444"
        thickness={3}
        curved
        hideDataPoints
        hideRules={false}
        hideYAxisText={false}
        yAxisColor="transparent"
        xAxisColor="transparent"
        yAxisTextStyle={{
          color: "#6B7280",
          fontSize: 12,
          fontWeight: "400",
        }}
        xAxisLabelTextStyle={{
          color: "#6B7280",
          fontSize: 12,
          textAlign: "center",
          marginTop: 4,
        }}
        noOfSections={4}
        maxValue={100}
        stepValue={25}
        backgroundColor="transparent"
        isAnimated
        animationDuration={800}
        areaChart={false}
        startOpacity={0}
        endOpacity={0}
        xAxisLabelTexts={[
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ]}
      />

      {/* Legend */}
      <View className="flex-row gap-6 mt-6">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <Text className="text-sm font-proximanova-regular text-gray-700">
            Completed Shifts
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <Text className="text-sm font-proximanova-regular text-gray-700">
            Missed Shifts
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ShiftsLineChart;

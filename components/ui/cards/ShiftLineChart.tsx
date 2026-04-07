import React from "react";
import { Dimensions, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
const { width } = Dimensions.get("window");

type ShiftLineChartProps = {
  completedShifts?: Array<{ value: number }>;
  missedShifts?: Array<{ value: number }>;
  labels?: string[];
  completedPercentage?: number;
  missedPercentage?: number;
  fixedMaxValue?: number;
  fixedStepValue?: number;
};

const ShiftsLineChart = ({
  completedShifts = [],
  missedShifts = [],
  labels = [],
  completedPercentage = 0,
  missedPercentage = 0,
  fixedMaxValue,
  fixedStepValue,
}: ShiftLineChartProps) => {
  const fallbackCompleted = [{ value: 0 }, { value: 0 }, { value: 0 }];
  const fallbackMissed = [{ value: 0 }, { value: 0 }, { value: 0 }];
  const chartCompleted = completedShifts.length > 0 ? completedShifts : fallbackCompleted;
  const chartMissed = missedShifts.length > 0 ? missedShifts : fallbackMissed;
  const maxSeriesValue = Math.max(
    ...chartCompleted.map((item) => item?.value ?? 0),
    ...chartMissed.map((item) => item?.value ?? 0),
    1
  );
  const computedMaxValue = Math.max(4, Math.ceil(maxSeriesValue / 4) * 4);
  const maxValue = fixedMaxValue ?? computedMaxValue;
  const stepValue = fixedStepValue ?? Math.max(1, Math.ceil(maxValue / 4));
  const chartLabels =
    labels.length === chartCompleted.length
      ? labels
      : chartCompleted.map((_, index) => `${index + 1}`);

  return (
    <View className="bg-[#E5F4FD] p-4 rounded-2xl border border-[#4FB2F350] overflow-hidden">
      {/* Chart */}
      <LineChart
        data={chartCompleted}
        data2={chartMissed}
        height={180}
        width={width - 80}
        spacing={chartCompleted.length > 12 ? 18 : 30}
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
          fontSize: 10,
          textAlign: "center",
          marginTop: 4,
        }}
        noOfSections={4}
        maxValue={maxValue}
        stepValue={stepValue}
        backgroundColor="transparent"
        isAnimated
        animationDuration={800}
        areaChart={false}
        startOpacity={0}
        endOpacity={0}
        xAxisLabelTexts={chartLabels}
      />

      {/* Legend */}
      <View className="flex-row gap-6 mt-6">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-[#22C55E]" />
          <Text className="text-sm font-proximanova-regular text-gray-700">
            Completed Shifts ({completedPercentage}%)
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <Text className="text-sm font-proximanova-regular text-gray-700">
            Missed Shifts ({missedPercentage}%)
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ShiftsLineChart;

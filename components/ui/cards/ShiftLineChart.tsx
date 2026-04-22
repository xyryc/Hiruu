import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
const { width } = Dimensions.get("window");

type GraphType = "daily" | "monthly" | "yearly";

type ShiftLineChartProps = {
  completedShifts?: { value: number; label?: string }[];
  missedShifts?: { value: number; label?: string }[];
  graphType?: GraphType;
  completedPercentage?: number;
  missedPercentage?: number;
  fixedMaxValue?: number;
  fixedStepValue?: number;
};

const ShiftsLineChart = ({
  completedShifts = [],
  missedShifts = [],
  graphType = "daily",
  completedPercentage = 0,
  missedPercentage = 0,
  fixedMaxValue,
  fixedStepValue,
}: ShiftLineChartProps) => {
  const chartScrollRef = useRef<any>(null);
  const autoFocusKeyRef = useRef("");
  const fallbackCompleted = [{ value: 0, label: "" }, { value: 0, label: "" }, { value: 0, label: "" }];
  const fallbackMissed = [{ value: 0 }, { value: 0 }, { value: 0 }];
  const chartCompletedBase = completedShifts.length > 0 ? completedShifts : fallbackCompleted;
  const chartMissedBase = missedShifts.length > 0 ? missedShifts : fallbackMissed;
  const isDaily = graphType === "daily";
  const initialSpacing = isDaily ? 24 : 14;
  const endSpacing = isDaily ? 28 : 20;
  const spacing = isDaily ? 72 : graphType === "monthly" ? 48 : 44;
  const visibleChartWidth = width - 80;

  const chartCompleted = useMemo(
    () =>
      chartCompletedBase.map((item) => {
        const value = Number(item?.value ?? 0);
        const isNonZero = value > 0;
        return {
          ...item,
          value,
          dataPointRadius: isNonZero ? 4 : 2.5,
          dataPointText: isNonZero ? String(value) : "",
          textColor: "#22C55E",
          textFontSize: 11,
          textShiftY: -10,
        };
      }),
    [chartCompletedBase]
  );

  const chartMissed = useMemo(
    () =>
      chartMissedBase.map((item) => {
        const value = Number(item?.value ?? 0);
        const isNonZero = value > 0;
        return {
          ...item,
          value,
          dataPointRadius: isNonZero ? 4 : 2.5,
          dataPointText: isNonZero ? String(value) : "",
          textColor: "#EF4444",
          textFontSize: 11,
          textShiftY: -10,
        };
      }),
    [chartMissedBase]
  );

  const requiredChartWidth =
    initialSpacing + endSpacing + Math.max(1, chartCompleted.length) * spacing + 24;
  const chartWidth = Math.max(visibleChartWidth, requiredChartWidth);
  const latestNonZeroIndex = useMemo(
    () =>
      chartCompleted.reduce((latestIndex, point, index) => {
        const hasCompleted = (point?.value ?? 0) > 0;
        const hasMissed = (chartMissed[index]?.value ?? 0) > 0;
        return hasCompleted || hasMissed ? index : latestIndex;
      }, -1),
    [chartCompleted, chartMissed]
  );
  const focusKey = useMemo(() => {
    const completedTotal = chartCompleted.reduce((sum, item) => sum + (item?.value ?? 0), 0);
    const missedTotal = chartMissed.reduce((sum, item) => sum + (item?.value ?? 0), 0);
    return `${graphType}:${chartCompleted.length}:${latestNonZeroIndex}:${completedTotal}:${missedTotal}`;
  }, [chartCompleted, chartMissed, graphType, latestNonZeroIndex]);

  useEffect(() => {
    if (graphType !== "daily") return;
    if (autoFocusKeyRef.current === focusKey) return;
    autoFocusKeyRef.current = focusKey;

    const targetIndex = latestNonZeroIndex >= 0 ? latestNonZeroIndex : chartCompleted.length - 1;
    const targetX = Math.max(
      0,
      initialSpacing + Math.max(0, targetIndex) * spacing - visibleChartWidth * 0.55
    );

    const run = () => chartScrollRef.current?.scrollTo?.({ x: targetX, animated: false });
    requestAnimationFrame(run);
    const t1 = setTimeout(run, 120);
    const t2 = setTimeout(run, 260);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [
    chartCompleted.length,
    focusKey,
    graphType,
    initialSpacing,
    latestNonZeroIndex,
    spacing,
    visibleChartWidth,
  ]);

  const maxSeriesValue = Math.max(
    ...chartCompleted.map((item) => item?.value ?? 0),
    ...chartMissed.map((item) => item?.value ?? 0),
    1
  );
  const computedMaxValue = Math.max(4, Math.ceil(maxSeriesValue / 4) * 4);
  const maxValue = fixedMaxValue ?? computedMaxValue;
  const stepValue = fixedStepValue ?? Math.max(1, Math.ceil(maxValue / 4));

  return (
    <View className="bg-[#E5F4FD] p-4 rounded-2xl border border-[#4FB2F350] overflow-hidden">
      {/* Chart */}
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
        ref={chartScrollRef}
      >
        <LineChart
          data={chartCompleted}
          data2={chartMissed}
          height={180}
          width={chartWidth}
          parentWidth={visibleChartWidth}
          adjustToWidth={false}
          spacing={spacing}
          initialSpacing={initialSpacing}
          endSpacing={endSpacing}
          color1="#22C55E"
          color2="#EF4444"
          thickness={2.5}
          curved
          curvature={0.18}
          hideDataPoints={false}
          showValuesAsDataPointsText
          dataPointsRadius={2.5}
          dataPointsColor="#22C55E"
          dataPointsColor2="#EF4444"
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
          maxValue={maxValue}
          stepValue={stepValue}
          backgroundColor="transparent"
          isAnimated
          animationDuration={800}
          areaChart={false}
          startOpacity={0}
          endOpacity={0}
          disableScroll
          xAxisTextNumberOfLines={1}
        />
      </ScrollView>

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

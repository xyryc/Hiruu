import { useFont } from "@shopify/react-native-skia";
import { CartesianChart, Line } from "victory-native";
import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";

const { width } = Dimensions.get("window");

type GraphType = "daily" | "monthly" | "yearly";

type ShiftLineChartProps = {
  completedShifts?: { value: number; label?: string }[];
  missedShifts?: { value: number; label?: string }[];
  graphType?: GraphType;
  completedPercentage?: number;
  missedPercentage?: number;
};

type TrendDatum = {
  label: string;
  completed: number;
  missed: number;
};

const ShiftsLineChartVictory = ({
  completedShifts = [],
  missedShifts = [],
  graphType = "daily",
  completedPercentage = 0,
  missedPercentage = 0,
}: ShiftLineChartProps) => {
  const axisFont = useFont(require("../../../assets/fonts/ProximaNova-Regular.ttf"), 11);
  const chartScrollRef = useRef<ScrollView | null>(null);
  const autoFocusKeyRef = useRef("");
  const isDaily = graphType === "daily";
  const perPointWidth = isDaily ? 68 : graphType === "monthly" ? 50 : 46;
  const visibleChartWidth = width - 80;

  const fallbackCompleted = [
    { value: 0, label: "" },
    { value: 0, label: "" },
    { value: 0, label: "" },
  ];
  const fallbackMissed = [{ value: 0 }, { value: 0 }, { value: 0 }];

  const chartCompleted = completedShifts.length > 0 ? completedShifts : fallbackCompleted;
  const chartMissed = missedShifts.length > 0 ? missedShifts : fallbackMissed;

  const chartData = useMemo<TrendDatum[]>(
    () =>
      chartCompleted.map((item, index) => ({
        label: typeof item?.label === "string" ? item.label : "",
        completed: Number(item?.value ?? 0),
        missed: Number(chartMissed[index]?.value ?? 0),
      })),
    [chartCompleted, chartMissed]
  );

  const chartWidth = Math.max(
    visibleChartWidth,
    Math.max(1, chartData.length) * perPointWidth + 72
  );

  const xTickCount = useMemo(() => {
    const pointCount = Math.max(2, chartData.length);
    if (graphType === "daily") return Math.min(pointCount, 10);
    if (graphType === "monthly") return Math.min(pointCount, 6);
    return Math.min(pointCount, 6);
  }, [chartData.length, graphType]);

  const latestNonZeroIndex = useMemo(
    () =>
      chartData.reduce((latestIndex, point, index) => {
        return point.completed > 0 || point.missed > 0 ? index : latestIndex;
      }, -1),
    [chartData]
  );

  const focusKey = useMemo(() => {
    const completedTotal = chartData.reduce((sum, item) => sum + item.completed, 0);
    const missedTotal = chartData.reduce((sum, item) => sum + item.missed, 0);
    return `${graphType}:${chartData.length}:${latestNonZeroIndex}:${completedTotal}:${missedTotal}`;
  }, [chartData, graphType, latestNonZeroIndex]);

  useEffect(() => {
    if (graphType !== "daily") return;
    if (autoFocusKeyRef.current === focusKey) return;
    autoFocusKeyRef.current = focusKey;

    const targetIndex = latestNonZeroIndex >= 0 ? latestNonZeroIndex : chartData.length - 1;
    const targetX = Math.max(
      0,
      Math.max(0, targetIndex) * perPointWidth - visibleChartWidth * 0.55
    );
    const run = () => chartScrollRef.current?.scrollTo?.({ x: targetX, animated: false });
    requestAnimationFrame(run);
    const t1 = setTimeout(run, 120);
    const t2 = setTimeout(run, 260);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [chartData.length, focusKey, graphType, latestNonZeroIndex, perPointWidth, visibleChartWidth]);

  return (
    <View className="bg-[#E5F4FD] p-4 rounded-2xl border border-[#4FB2F350] overflow-hidden">
      <ScrollView
        ref={chartScrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        <View style={{ width: chartWidth, height: 220 }}>
          <CartesianChart
            data={chartData}
            xKey={"label"}
            yKeys={["completed", "missed"]}
            axisOptions={{
              tickCount: {
                x: xTickCount,
                y: 5,
              },
              font: axisFont,
              labelColor: "#6B7280",
              formatYLabel: (value) => `${Math.max(0, Number(value) || 0)}`,
              formatXLabel: (value) => `${value ?? ""}`,
            }}
          >
            {({ points }) => (
              <>
                <Line
                  points={points.completed}
                  color="#22C55E"
                  strokeWidth={2.5}
                  curveType="catmullRom"
                />
                <Line
                  points={points.missed}
                  color="#EF4444"
                  strokeWidth={2.5}
                  curveType="catmullRom"
                />
              </>
            )}
          </CartesianChart>
        </View>
      </ScrollView>

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

export default ShiftsLineChartVictory;

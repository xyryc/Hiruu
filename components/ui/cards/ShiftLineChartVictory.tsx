import { useEffect, useMemo, useRef } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

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
  const chartScrollRef = useRef<ScrollView | null>(null);
  const autoFocusKeyRef = useRef("");
  const isDaily = graphType === "daily";
  const perPointWidth = isDaily ? 68 : graphType === "monthly" ? 50 : 64;
  const visibleChartWidth = width - 80;

  const fallbackCompleted = [
    { value: 0, label: "" },
    { value: 0, label: "" },
    { value: 0, label: "" },
  ];
  const fallbackMissed = [{ value: 0 }, { value: 0 }, { value: 0 }];

  const chartCompleted =
    completedShifts.length > 0 ? completedShifts : fallbackCompleted;
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
    Math.max(1, chartData.length) * perPointWidth + 64
  );

  const latestNonZeroIndex = useMemo(
    () =>
      chartData.reduce((latestIndex, point, index) => {
        return point.completed > 0 || point.missed > 0
          ? index
          : latestIndex;
      }, -1),
    [chartData]
  );

  const focusKey = useMemo(() => {
    const completedTotal = chartData.reduce((sum, item) => sum + item.completed, 0);
    const missedTotal = chartData.reduce((sum, item) => sum + item.missed, 0);
    return `${graphType}:${chartData.length}:${latestNonZeroIndex}:${completedTotal}:${missedTotal}`;
  }, [chartData, graphType, latestNonZeroIndex]);

  const yAxisMax = useMemo(() => {
    const maxValue = chartData.reduce(
      (max, point) => Math.max(max, point.completed, point.missed),
      0
    );
    if (maxValue <= 0) return 5;
    if (maxValue <= 5) return 5;
    return Math.ceil(maxValue / 5) * 5;
  }, [chartData]);

  const normalizedChartData = useMemo(() => {
    if (chartData.length !== 1) return chartData;
    const only = chartData[0];
    return [only, { ...only, label: "" }];
  }, [chartData]);

  const labels = useMemo(
    () => normalizedChartData.map((item) => item.label || ""),
    [normalizedChartData]
  );
  const completedValues = useMemo(
    () => normalizedChartData.map((item) => item.completed),
    [normalizedChartData]
  );
  const missedValues = useMemo(
    () => normalizedChartData.map((item) => item.missed),
    [normalizedChartData]
  );

  useEffect(() => {
    if (graphType !== "daily") return;
    if (autoFocusKeyRef.current === focusKey) return;
    autoFocusKeyRef.current = focusKey;

    const targetIndex = latestNonZeroIndex >= 0 ? latestNonZeroIndex : chartData.length - 1;

    const targetX = Math.max(
      0,
      Math.max(0, targetIndex) * perPointWidth - visibleChartWidth * 0.55
    );

    const run = () =>
      chartScrollRef.current?.scrollTo?.({
        x: targetX,
        animated: false,
      });

    requestAnimationFrame(run);
    const t1 = setTimeout(run, 120);
    const t2 = setTimeout(run, 260);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [
    chartData.length,
    focusKey,
    graphType,
    latestNonZeroIndex,
    perPointWidth,
    visibleChartWidth,
  ]);

  useEffect(() => {
    if (graphType === "daily") return;

    const run = () =>
      chartScrollRef.current?.scrollTo?.({
        x: 0,
        animated: false,
      });

    requestAnimationFrame(run);
    const t = setTimeout(run, 120);

    return () => clearTimeout(t);
  }, [focusKey, graphType]);

  return (
    <View className="bg-[#E5F4FD] p-4 rounded-2xl border border-[#4FB2F350] overflow-hidden">
      <ScrollView
        ref={chartScrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator
      >
        <LineChart
          key={focusKey}
          data={{
            labels,
            datasets: [
              {
                data: completedValues,
                color: () => "#22C55E",
                strokeWidth: 2.5,
              },
              {
                data: missedValues,
                color: () => "#EF4444",
                strokeWidth: 2.5,
              },
            ],
          }}
          width={chartWidth}
          height={220}
          fromZero
          withInnerLines
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines
          withVerticalLabels
          withHorizontalLabels
          yAxisInterval={1}
          segments={5}
          bezier
          xLabelsOffset={10}
          chartConfig={{
            backgroundColor: "#E5F4FD",
            backgroundGradientFrom: "#E5F4FD",
            backgroundGradientTo: "#E5F4FD",
            decimalPlaces: 0,
            color: () => "#6B7280",
            labelColor: () => "#6B7280",
            strokeWidth: 2,
            propsForBackgroundLines: {
              stroke: "#E5E7EB",
              strokeDasharray: "4,4",
            },
            propsForDots: {
              r: "0",
            },
            propsForLabels: {
              fontSize: 10,
            },
          }}
          style={{
            borderRadius: 0,
            marginLeft: 10,
            paddingRight: 8,
          }}
          formatYLabel={(value) => {
            const n = Number(value);
            if (!Number.isFinite(n)) return "0";
            return `${Math.max(0, Math.min(yAxisMax, Math.round(n)))}`;
          }}
          formatXLabel={(value) => `${value ?? ""}`}
        />
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

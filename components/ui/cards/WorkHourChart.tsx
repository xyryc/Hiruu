import { useFont } from "@shopify/react-native-skia";
import { Bar, CartesianChart } from "victory-native";
import React, { useMemo } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import type { TrackHoursTimeframe } from "../modals/TrackHoursFilter";

const { width } = Dimensions.get("window");

type WorkPatternPoint = {
  date: string;
  workedHours: number;
  completedShifts?: number;
};

type WorkHoursChartProps = {
  workPattern?: WorkPatternPoint[];
  selectedTimeframe?: TrackHoursTimeframe;
};

type WorkHourDatum = {
  x: number;
  label: string;
  hours: number;
};

const WorkHoursChart = ({
  workPattern = [],
  selectedTimeframe = "all_time",
}: WorkHoursChartProps) => {
  const axisFont = useFont(require("../../../assets/fonts/ProximaNova-Regular.ttf"), 11);
  const hasPattern = Array.isArray(workPattern) && workPattern.length > 0;

  const chartData = useMemo<WorkHourDatum[]>(() => {
    const source = hasPattern
      ? workPattern.map((item, index) => {
          const dateValue = new Date(item.date);
          const dayLabel = Number.isNaN(dateValue.getTime())
            ? `D${index + 1}`
            : dateValue.toLocaleDateString("en-US", { weekday: "short" });
          const dateLabel = Number.isNaN(dateValue.getTime())
            ? String(index + 1).padStart(2, "0")
            : String(dateValue.getDate()).padStart(2, "0");
          const hours = Number(item.workedHours || 0);

          return {
            label: `${dateLabel} ${dayLabel}`,
            hours,
          };
        })
      : [
          { label: "01 Mon", hours: 5 },
          { label: "02 Tue", hours: 9 },
          { label: "03 Wed", hours: 7 },
          { label: "04 Thu", hours: 3 },
          { label: "05 Fri", hours: 15 },
          { label: "06 Sat", hours: 8 },
          { label: "08 Mon", hours: 6 },
        ];

    return source.map((item, index) => ({
      x: index,
      label: item.label,
      hours: Number.isFinite(item.hours) ? item.hours : 0,
    }));
  }, [hasPattern, workPattern]);

  const now = new Date();
  const headerMonths = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
      label: date.toLocaleDateString("en-US", { month: "long" }),
    };
  });

  const highlightedMonthKeys = (() => {
    const getKey = (monthIndex: number, year: number) => `${year}-${monthIndex}`;

    if (selectedTimeframe === "all_time") {
      return new Set(headerMonths.map((item) => getKey(item.monthIndex, item.year)));
    }

    if (selectedTimeframe === "this_month" || selectedTimeframe === "this_week") {
      return new Set([getKey(now.getMonth(), now.getFullYear())]);
    }

    if (selectedTimeframe === "last_six_month") {
      return new Set(headerMonths.map((item) => getKey(item.monthIndex, item.year)));
    }

    if (selectedTimeframe === "this_year") {
      return new Set(
        headerMonths
          .filter((item) => item.year === now.getFullYear())
          .map((item) => getKey(item.monthIndex, item.year))
      );
    }

    return new Set<string>();
  })();

  const chartMax = Math.max(18, ...chartData.map((item) => item.hours));
  const yStep = Math.max(1, Math.ceil(chartMax / 4));
  const yTickValues = [0, yStep, yStep * 2, yStep * 3, yStep * 4];
  const yDomainMax = yTickValues[yTickValues.length - 1] ?? chartMax;

  const chartVisibleWidth = width - 80;
  const barSlotWidth = 52;
  const chartWidth = Math.max(chartVisibleWidth, chartData.length * barSlotWidth + 40);

  const xTickValues = chartData.map((item) => item.x);

  return (
    <View>
      <View className="flex-row justify-between mb-6">
        {headerMonths.map((month, index) => {
          const monthKey = `${month.year}-${month.monthIndex}`;
          const isHighlighted = highlightedMonthKeys.has(monthKey);

          return (
            <Text
              key={index}
              className={`text-sm font-proximanova-regular ${
                isHighlighted
                  ? "text-primary dark:text-dark-primary"
                  : "text-secondary dark:text-dark-secondary"
              }`}
            >
              {month.label}
            </Text>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: chartWidth, height: 220 }}>
          <CartesianChart
            data={chartData}
            xKey={"x"}
            yKeys={["hours"]}
            domain={{ y: [0, yDomainMax] }}
            domainPadding={{ left: 22, right: 22, top: 8 }}
            axisOptions={{
              font: axisFont,
              labelColor: "#7A7A7A",
              lineWidth: { grid: { x: 0, y: 1 }, frame: 0 },
              lineColor: { grid: { x: "transparent", y: "#D8EAF8" }, frame: "transparent" },
              tickValues: {
                x: xTickValues,
                y: yTickValues,
              },
              tickCount: {
                x: xTickValues.length,
                y: yTickValues.length,
              },
              formatXLabel: (value) => {
                const ix = Math.round(Number(value));
                const label = chartData[ix]?.label || "";
                return label.replace(" ", "\n");
              },
              formatYLabel: (value) => `${Math.max(0, Number(value) || 0)} Hr`,
            }}
          >
            {({ points, chartBounds }) => (
              <Bar
                points={points.hours}
                chartBounds={chartBounds}
                color="#93C5FD"
                barWidth={30}
                roundedCorners={{ topLeft: 16, topRight: 16 }}
              />
            )}
          </CartesianChart>
        </View>
      </ScrollView>
    </View>
  );
};

export default WorkHoursChart;

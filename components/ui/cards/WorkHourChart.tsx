import React, { useMemo } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import type { TrackHoursTimeframe } from "../modals/TrackHoursFilter";

const { width } = Dimensions.get("window");

type WorkPatternPoint = {
  date: string;
  day?: string;
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
  const hasPattern = Array.isArray(workPattern) && workPattern.length > 0;

  const chartData = useMemo<WorkHourDatum[]>(() => {
    const source = hasPattern
      ? workPattern.map((item, index) => {
        const dateValue = new Date(item.date);
        const dayFromApi = String(item?.day || "").trim();
        const normalizedDay = dayFromApi
          ? `${dayFromApi.charAt(0).toUpperCase()}${dayFromApi.slice(1, 3).toLowerCase()}`
          : "";
        const dayLabel = normalizedDay || (Number.isNaN(dateValue.getTime())
          ? `D${index + 1}`
          : dateValue.toLocaleDateString("en-US", { weekday: "short" }));
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

  const headerMonths = useMemo(() => {
    const now = new Date();
    if (selectedTimeframe === "all_time") return [];

    if (selectedTimeframe === "this_week" || selectedTimeframe === "this_month") {
      return [now.toLocaleDateString("en-US", { month: "long" })];
    }

    if (selectedTimeframe === "last_six_month") {
      return Array.from({ length: 6 }).map((_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        return date.toLocaleDateString("en-US", { month: "long" });
      });
    }

    if (selectedTimeframe === "this_year") {
      return Array.from({ length: 12 }).map((_, index) =>
        new Date(now.getFullYear(), index, 1).toLocaleDateString("en-US", { month: "long" })
      );
    }

    return [];
  }, [selectedTimeframe]);

  const chartMax = Math.max(18, ...chartData.map((item) => item.hours));
  const yStep = Math.max(1, Math.ceil(chartMax / 4));
  const yTickValues = [0, yStep, yStep * 2, yStep * 3, yStep * 4];
  const yDomainMax = yTickValues[yTickValues.length - 1] ?? chartMax;

  const chartVisibleWidth = width - 80;
  const barSlotWidth = 52;
  const chartWidth = Math.max(chartVisibleWidth, chartData.length * barSlotWidth + 40);
  const chartHeight = 220;
  const chartInnerHeight = chartHeight - 16;
  const yAxisWidth = 44;

  const yGridLabels = [...yTickValues].reverse();

  return (
    <View>
      {headerMonths.length > 0 && (
        <View className="flex-row justify-between mb-6">
          {headerMonths.map((month, index) => (
            <Text
              key={`${month}-${index}`}
              className="text-sm font-proximanova-regular text-primary dark:text-dark-primary"
            >
              {month}
            </Text>
          ))}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: chartWidth + yAxisWidth }}>
          <View style={{ height: chartHeight, flexDirection: "row" }}>
            <View style={{ width: yAxisWidth, justifyContent: "space-between", paddingTop: 8, paddingBottom: 8 }}>
              {yGridLabels.map((tick, index) => (
                <Text
                  key={`y-tick-${index}-${tick}`}
                  className="text-[10px] font-proximanova-regular text-secondary dark:text-dark-secondary"
                >
                  {`${Math.max(0, Number(tick) || 0)} Hr`}
                </Text>
              ))}
            </View>

            <View style={{ width: chartWidth, height: chartHeight, paddingTop: 8, paddingBottom: 8 }}>
              <View style={{ position: "absolute", left: 0, right: 0, top: 8, bottom: 8, justifyContent: "space-between" }}>
                {yGridLabels.map((_, idx) => (
                  <View key={`grid-${idx}`} style={{ height: 1, backgroundColor: "#D8EAF8" }} />
                ))}
              </View>

              <View style={{ flexDirection: "row", alignItems: "flex-end", height: chartInnerHeight }}>
                {chartData.map((item) => {
                  const ratio = yDomainMax > 0 ? item.hours / yDomainMax : 0;
                  const computedHeight = Math.max(0, ratio * (chartInnerHeight - 8));
                  const barHeight = item.hours > 0 ? Math.max(4, computedHeight) : 1;

                  return (
                    <View
                      key={`bar-${item.x}-${item.label}`}
                      style={{ width: barSlotWidth, alignItems: "center", justifyContent: "flex-end" }}
                    >
                      <View
                        style={{
                          width: 30,
                          height: barHeight,
                          backgroundColor: "#93C5FD",
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <View style={{ width: yAxisWidth }} />
            <View style={{ width: chartWidth, flexDirection: "row" }}>
              {chartData.map((item) => (
                <View
                  key={`x-label-${item.x}-${item.label}`}
                  style={{ width: barSlotWidth, alignItems: "center" }}
                >
                  <Text className="text-[10px] font-proximanova-regular text-secondary dark:text-dark-secondary">
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WorkHoursChart;

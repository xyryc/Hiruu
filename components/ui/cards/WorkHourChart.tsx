import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, NativeSyntheticEvent, ScrollView, Text, View, NativeScrollEvent, TouchableOpacity } from "react-native";
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
  monthKey: string;
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
      monthKey: (() => {
        const parsed = new Date(workPattern[index]?.date || "");
        if (Number.isNaN(parsed.getTime())) return "";
        return `${parsed.getFullYear()}-${parsed.getMonth()}`;
      })(),
      x: index,
      label: item.label,
      hours: Number.isFinite(item.hours) ? item.hours : 0,
    }));
  }, [hasPattern, workPattern]);

  const headerMonths = useMemo(() => {
    const now = new Date();
    if (selectedTimeframe === "all_time") {
      const monthMap = new Map<string, { key: string; label: string }>();
      workPattern.forEach((item) => {
        const parsed = new Date(item?.date || "");
        if (Number.isNaN(parsed.getTime())) return;
        const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
        if (monthMap.has(key)) return;
        const monthName = parsed.toLocaleDateString("en-US", { month: "long" });
        const shortYear = String(parsed.getFullYear()).slice(-2);
        monthMap.set(key, {
          key,
          label: `${monthName}, ${shortYear}`,
        });
      });
      return Array.from(monthMap.values());
    }

    if (selectedTimeframe === "this_week" || selectedTimeframe === "this_month") {
      return [{
        key: `${now.getFullYear()}-${now.getMonth()}`,
        label: now.toLocaleDateString("en-US", { month: "long" }),
      }];
    }

    if (selectedTimeframe === "last_six_month") {
      return Array.from({ length: 6 }).map((_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
        return {
          key: `${date.getFullYear()}-${date.getMonth()}`,
          label: date.toLocaleDateString("en-US", { month: "long" }),
        };
      });
    }

    if (selectedTimeframe === "this_year") {
      return Array.from({ length: 12 }).map((_, index) => ({
        key: `${now.getFullYear()}-${index}`,
        label: new Date(now.getFullYear(), index, 1).toLocaleDateString("en-US", { month: "long" }),
      }));
    }

    return [];
  }, [selectedTimeframe, workPattern]);

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
  const tooltipWidth = 112;
  const tooltipHeight = 30;
  const [activeMonthKeys, setActiveMonthKeys] = useState<Set<string>>(new Set());
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);

  const monthRanges = useMemo(() => {
    const ranges: { key: string; start: number; end: number }[] = [];
    chartData.forEach((item, index) => {
      if (!item.monthKey) return;
      const last = ranges[ranges.length - 1];
      if (!last || last.key !== item.monthKey) {
        ranges.push({ key: item.monthKey, start: index, end: index });
      } else {
        last.end = index;
      }
    });
    return ranges;
  }, [chartData]);

  const headerMonthKeyByLabel = useMemo(
    () => new Map(headerMonths.map((item) => [item.label, item.key])),
    [headerMonths]
  );

  const handleChartScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const xOffset = Math.max(0, event.nativeEvent.contentOffset.x || 0);
    const firstVisibleIndex = Math.floor(xOffset / barSlotWidth);
    const lastVisibleIndex = Math.floor((xOffset + chartVisibleWidth - 1) / barSlotWidth);

    const visibleKeys = new Set<string>();
    monthRanges.forEach((range) => {
      const intersects = range.end >= firstVisibleIndex && range.start <= lastVisibleIndex;
      if (intersects) visibleKeys.add(range.key);
    });
    setActiveMonthKeys(visibleKeys);
  };

  useEffect(() => {
    const initiallyVisibleLastIndex = Math.floor((chartVisibleWidth - 1) / barSlotWidth);
    const initialKeys = new Set<string>();
    monthRanges.forEach((range) => {
      const intersects = range.end >= 0 && range.start <= initiallyVisibleLastIndex;
      if (intersects) initialKeys.add(range.key);
    });
    setActiveMonthKeys(initialKeys);
  }, [barSlotWidth, chartVisibleWidth, monthRanges]);

  const yGridLabels = [...yTickValues].reverse();

  return (
    <View>
      {headerMonths.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
          className="mb-6"
        >
          <View className="flex-row items-center">
            {headerMonths.map((month, index) => (
              <Text
                key={`${month.key}-${index}`}
                className={`text-sm mr-5 ${activeMonthKeys.has(headerMonthKeyByLabel.get(month.label) || "")
                  ? "font-proximanova-semibold text-primary dark:text-dark-primary"
                  : "font-proximanova-regular text-secondary dark:text-dark-secondary"
                  }`}
              >
                {month.label}
              </Text>
            ))}
          </View>
        </ScrollView>
      )}

      <View style={{ flexDirection: "row" }}>
        <View style={{ width: yAxisWidth, height: chartHeight, justifyContent: "space-between", paddingTop: 8, paddingBottom: 8 }}>
          {yGridLabels.map((tick, index) => (
            <Text
              key={`y-tick-${index}-${tick}`}
              className="text-[10px] font-proximanova-regular text-secondary dark:text-dark-secondary"
            >
              {`${Math.max(0, Number(tick) || 0)} Hr`}
            </Text>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleChartScroll}
          scrollEventThrottle={16}
        >
          <View style={{ width: chartWidth }}>
            <View style={{ width: chartWidth, height: chartHeight, paddingTop: 8, paddingBottom: 8 }}>
              <View style={{ position: "absolute", left: 0, right: 0, top: 8, bottom: 8, justifyContent: "space-between" }}>
                {yGridLabels.map((_, idx) => (
                  <View key={`grid-${idx}`} style={{ height: 1, backgroundColor: "#D8EAF8" }} />
                ))}
              </View>

              {selectedBarIndex !== null && chartData[selectedBarIndex] && (() => {
                const selected = chartData[selectedBarIndex];
                const ratio = yDomainMax > 0 ? selected.hours / yDomainMax : 0;
                const computedHeight = Math.max(0, ratio * (chartInnerHeight - 8));
                const barHeight = selected.hours > 0 ? Math.max(4, computedHeight) : 1;
                const centerX = selected.x * barSlotWidth + barSlotWidth / 2;
                const left = Math.max(0, Math.min(chartWidth - tooltipWidth, centerX - tooltipWidth / 2));
                const top = Math.max(0, chartInnerHeight - barHeight - tooltipHeight - 12);
                const pointerLeft = Math.max(10, Math.min(tooltipWidth - 10, centerX - left));

                return (
                  <View
                    style={{
                      position: "absolute",
                      left,
                      top,
                      width: tooltipWidth,
                      alignItems: "center",
                      zIndex: 10,
                    }}
                  >
                    <View
                      style={{
                        minHeight: tooltipHeight,
                        borderRadius: 999,
                        backgroundColor: "#C8D0D6",
                        paddingHorizontal: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text className="text-sm font-proximanova-semibold text-[#11293A]">
                        {`${Number(selected.hours || 0).toFixed(0)} Hr Worked`}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 0,
                        height: 0,
                        borderLeftWidth: 6,
                        borderRightWidth: 6,
                        borderTopWidth: 8,
                        borderLeftColor: "transparent",
                        borderRightColor: "transparent",
                        borderTopColor: "#C8D0D6",
                        marginTop: -1,
                        marginLeft: pointerLeft - tooltipWidth / 2,
                      }}
                    />
                  </View>
                );
              })()}

              <View style={{ flexDirection: "row", alignItems: "flex-end", height: chartInnerHeight }}>
                {chartData.map((item) => {
                  const ratio = yDomainMax > 0 ? item.hours / yDomainMax : 0;
                  const computedHeight = Math.max(0, ratio * (chartInnerHeight - 8));
                  const barHeight = item.hours > 0 ? Math.max(4, computedHeight) : 1;

                  return (
                    <TouchableOpacity
                      key={`bar-${item.x}-${item.label}`}
                      onPress={() => setSelectedBarIndex(item.x)}
                      activeOpacity={0.8}
                      style={{ width: barSlotWidth, alignItems: "center", justifyContent: "flex-end" }}
                    >
                      <View
                        style={{
                          width: 30,
                          height: barHeight,
                          backgroundColor: selectedBarIndex === item.x ? "#4FB2F3" : "#93C5FD",
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ flexDirection: "row", marginTop: 8 }}>
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
        </ScrollView>
      </View>
    </View>
  );
};

export default WorkHoursChart;

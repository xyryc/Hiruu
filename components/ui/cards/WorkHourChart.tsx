import React from "react";
import { Dimensions, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

type WorkPatternPoint = {
  date: string;
  workedHours: number;
  completedShifts?: number;
};

type WorkHoursChartProps = {
  workPattern?: WorkPatternPoint[];
};

const WorkHoursChart = ({ workPattern = [] }: WorkHoursChartProps) => {
  const fallbackBarData = [
    {
      value: 5,
      label: "01\nMon",
      frontColor: "#93C5FD",
      gradientColor: "#BFDBFE",
      date: "01",
      day: "Mon",
      hours: 5,
    },
    {
      value: 9,
      label: "02\nTue",
      frontColor: "#93C5FD",
      gradientColor: "#BFDBFE",
      date: "02",
      day: "Tue",
      hours: 9,
    },
    {
      value: 7,
      label: "03\nWed",
      frontColor: "#93C5FD",
      gradientColor: "#BFDBFE",
      date: "03",
      day: "Wed",
      hours: 7,
    },
    {
      value: 3,
      label: "04\nThu",
      frontColor: "#93C5FD",
      gradientColor: "#BFDBFE",
      date: "04",
      day: "Thu",
      hours: 3,
    },
    {
      value: 15,
      label: "05\nFri",
      frontColor: "#3B82F6",
      gradientColor: "#60A5FA",
      date: "05",
      day: "Fri",
      hours: 15,
    },
    {
      value: 8,
      label: "06\nSat",
      frontColor: "#93C5FD",
      gradientColor: "#BFDBFE",
      date: "06",
      day: "Sat",
      hours: 8,
    },
    {
      value: 6,
      label: "08\nMon",
      frontColor: "#93C5FD",
      gradientColor: "#BFDBFE",
      date: "08",
      day: "Mon",
      hours: 6,
    },
  ];

  const hasPattern = Array.isArray(workPattern) && workPattern.length > 0;

  const barData = hasPattern
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
          value: hours,
          label: `${dateLabel}\n${dayLabel}`,
          frontColor: "#93C5FD",
          gradientColor: "#BFDBFE",
          date: dateLabel,
          day: dayLabel,
          hours,
        };
      })
    : fallbackBarData;

  const monthHeaders = hasPattern
    ? Array.from(
        new Set(
          workPattern
            .map((item) => {
              const dateValue = new Date(item.date);
              if (Number.isNaN(dateValue.getTime())) return null;
              return dateValue.toLocaleDateString("en-US", { month: "long" });
            })
            .filter(Boolean) as string[]
        )
      ).slice(0, 6)
    : ["March", "April", "May", "June", "July", "August"];

  const chartMax = Math.max(
    6,
    ...barData.map((item: any) =>
      Number.isFinite(Number(item?.value)) ? Number(item.value) : 0
    )
  );

  const renderTooltip = (item: any) => {
    return (
      <View className="bg-[#E5F4FD] py-1.5 px-3 rounded-full">
        <Text className="text-xs font-proximanova-semibold text-primary dark:text-primary">
          {item.hours} Hr Worked
        </Text>
      </View>
    );
  };

  return (
    <View>
      {/* Month Headers */}
      <View className="flex-row justify-between mb-6">
        {monthHeaders.map((month, index) => (
          <Text
            key={index}
            className="text-sm font-proximanova-regular text-primary dark:text-dark-primary"
          >
            {month}
          </Text>
        ))}
      </View>

      {/* Chart */}
      <BarChart
        data={barData}
        width={width - 80}
        height={200}
        barWidth={30}
        spacing={14}
        barBorderRadius={16}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{
          color: "#7A7A7A",
          fontSize: 12,
          fontWeight: "400",
        }}
        xAxisLabelTextStyle={{
          color: "#7A7A7A",
          fontSize: 12,
          textAlign: "center",
        }}
        showGradient
        gradientColor="#BFDBFE"
        frontColor="#93C5FD"
        isAnimated
        animationDuration={800}
        renderTooltip={renderTooltip}
        initialSpacing={10}
        endSpacing={10}
        maxValue={chartMax}
        stepValue={6}
        yAxisLabelPrefix=""
        yAxisLabelSuffix=" Hr"
        hideRules={false}
        showVerticalLines={false}
        showYAxisIndices={false}
        backgroundColor="transparent"
      />
    </View>
  );
};

export default WorkHoursChart;

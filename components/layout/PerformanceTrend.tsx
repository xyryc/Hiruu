import { useBusinessStore } from "@/stores/businessStore";
import { Entypo, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import ShiftsLineChart from "../ui/cards/ShiftLineChart";

const GRAPH_OPTIONS = ["daily", "monthly", "yearly"] as const;
type GraphType = (typeof GRAPH_OPTIONS)[number];

const formatTrendLabel = (value: string) => {
  if (!value) return "";

  if (/^\d{4}-\d{2}$/.test(value)) {
    const date = new Date(`${value}-01`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-US", { month: "short" });
    }
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.slice(5);
  }

  if (/^\d{4}$/.test(value)) {
    return value;
  }

  return value;
};

const PerformanceTrend = ({ className }: any) => {
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const getBusinessPerformanceTrends = useBusinessStore(
    (state) => state.getBusinessPerformanceTrends
  );
  const [graphType, setGraphType] = useState<GraphType>("daily");
  const [showGraphMenu, setShowGraphMenu] = useState(false);
  const [chartData, setChartData] = useState<{
    completedShifts: { value: number }[];
    missedShifts: { value: number }[];
    labels: string[];
    completedPercentage: number;
    missedPercentage: number;
  }>({
    completedShifts: [],
    missedShifts: [],
    labels: [],
    completedPercentage: 0,
    missedPercentage: 0,
  });
  const selectedBusinessId = selectedBusinesses?.[0] || "";

  useEffect(() => {
    let mounted = true;

    const loadPerformanceTrends = async () => {
      try {
        if (!selectedBusinessId) {
          if (!mounted) return;
          setChartData({
            completedShifts: [],
            missedShifts: [],
            labels: [],
            completedPercentage: 0,
            missedPercentage: 0,
          });
          return;
        }

        const data = await getBusinessPerformanceTrends(selectedBusinessId, graphType);
        if (!mounted || !data) return;

        const summary = data?.summary;
        const series = Array.isArray(data?.series) ? data.series : [];

        setChartData({
          completedShifts: series.map((item) => ({
            value:
              typeof item?.completedShifts === "number" ? item.completedShifts : 0,
          })),
          missedShifts: series.map((item) => ({
            value: typeof item?.missedShifts === "number" ? item.missedShifts : 0,
          })),
          labels: series.map((item) => {
            const rawLabel = typeof item?.label === "string" ? item.label : "";
            return formatTrendLabel(rawLabel);
          }),
          completedPercentage:
            typeof summary?.completedShiftPercentage === "number"
              ? summary.completedShiftPercentage
              : 0,
          missedPercentage:
            typeof summary?.missedShiftPercentage === "number"
              ? summary.missedShiftPercentage
              : 0,
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to load performance trends");
      }
    };

    void loadPerformanceTrends();

    return () => {
      mounted = false;
    };
  }, [getBusinessPerformanceTrends, graphType, selectedBusinessId]);

  const graphLabel = useMemo(
    () => graphType.charAt(0).toUpperCase() + graphType.slice(1),
    [graphType]
  );

  return (
    <View className={`${className} px-5`}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
          Performance Trend
        </Text>

        <TouchableOpacity
          onPress={() => setShowGraphMenu(true)}
          className="bg-[#E5F4FD] flex-row items-center rounded-[26px] p-1"
        >
          <View className="pl-2.5 py-1.5">
            <Text className="font-semibold text-sm text-primary">{graphLabel}</Text>
          </View>
          <SimpleLineIcons
            className="p-1.5"
            name="arrow-down"
            size={12}
            color="#111111"
          />
        </TouchableOpacity>
      </View>

      <ShiftsLineChart
        completedShifts={chartData.completedShifts}
        missedShifts={chartData.missedShifts}
        labels={chartData.labels}
        completedPercentage={chartData.completedPercentage}
        missedPercentage={chartData.missedPercentage}
        fixedMaxValue={graphType === "monthly" ? 100 : undefined}
        fixedStepValue={graphType === "monthly" ? 25 : undefined}
      />

      <Modal
        visible={showGraphMenu}
        animationType="fade"
        transparent
        onRequestClose={() => setShowGraphMenu(false)}
      >
        <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[45%]">
            <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
              <TouchableOpacity onPress={() => setShowGraphMenu(false)}>
                <View className="bg-[#000] rounded-full p-2.5">
                  <Entypo name="cross" size={30} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            <SafeAreaView edges={["bottom"]}>
              <View className="px-6 py-7">
                <Text className="font-proximanova-bold text-xl text-center">
                  Select Graph Type
                </Text>
              </View>

              <View className="px-6 pb-10">
                {GRAPH_OPTIONS.map((option) => {
                  const label = option.charAt(0).toUpperCase() + option.slice(1);
                  const isActive = option === graphType;

                  return (
                    <TouchableOpacity
                      key={option}
                      onPress={() => {
                        setGraphType(option);
                        setShowGraphMenu(false);
                      }}
                      className={`flex-row items-center p-3 mb-3 rounded-xl ${
                        isActive ? "bg-[#4FB2F3]" : "bg-white"
                      }`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`font-proximanova-semibold ${
                            isActive ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {label}
                        </Text>
                      </View>

                      <Ionicons
                        name={isActive ? "checkmark-circle" : "radio-button-off"}
                        size={20}
                        color={isActive ? "white" : "black"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SafeAreaView>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
};

export default PerformanceTrend;

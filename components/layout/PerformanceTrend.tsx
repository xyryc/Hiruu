import { useBusinessStore } from "@/stores/businessStore";
import { Entypo, Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { t } from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import ShiftsLineChart from "../ui/cards/ShiftLineChartVictory";

const GRAPH_OPTIONS = ["daily", "monthly", "yearly"] as const;
type GraphType = (typeof GRAPH_OPTIONS)[number];
const DAILY_API_DELAY_MS = 2000;

const shouldSilenceTrendError = (error: any) => {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    ""
  ).toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes("insufficient_permissions") ||
    message.includes("unauthorized") ||
    message.includes("token_revoked_or_not_found") ||
    message.includes("no refresh token available")
  );
};

const formatTrendLabel = (value: string, graphType: GraphType) => {
  if (!value) return "";

  if (graphType === "daily" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      return `${day} ${month}`;
    }
  }

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

const shouldShowLabel = (index: number, length: number, graphType: GraphType) => {
  if (graphType === "daily") return index % 3 === 0 || index === length - 1;
  if (graphType === "monthly") return true;
  return true;
};

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCompletedValue = (item: any) =>
  toNumber(
    item?.completedShifts ??
    item?.completedShift ??
    item?.completed ??
    item?.counts?.completedShifts ??
    item?.counts?.completedShift ??
    item?.counts?.completed ??
    0
  );

const getMissedValue = (item: any) =>
  toNumber(
    item?.missedShifts ??
    item?.missedShift ??
    item?.missed ??
    item?.counts?.missedShifts ??
    item?.counts?.missedShift ??
    item?.counts?.missed ??
    0
  );

const PerformanceTrend = ({ className }: any) => {
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const getBusinessPerformanceTrends = useBusinessStore(
    (state) => state.getBusinessPerformanceTrends
  );
  const [graphType, setGraphType] = useState<GraphType>("daily");
  const [showGraphMenu, setShowGraphMenu] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartData, setChartData] = useState<{
    completedShifts: { value: number; label?: string }[];
    missedShifts: { value: number; label?: string }[];
    completedPercentage: number;
    missedPercentage: number;
  }>({
    completedShifts: [],
    missedShifts: [],
    completedPercentage: 0,
    missedPercentage: 0,
  });
  const selectedBusinessId = selectedBusinesses?.[0] || "";

  useEffect(() => {
    let mounted = true;
    let fetchTimer: ReturnType<typeof setTimeout> | null = null;

    const loadPerformanceTrends = async () => {
      try {
        if (!selectedBusinessId) {
          if (__DEV__) {
            console.log("[PerformanceTrend] skip fetch: no selected business");
          }
          if (!mounted) return;
          setChartData({
            completedShifts: [],
            missedShifts: [],
            completedPercentage: 0,
            missedPercentage: 0,
          });
          setIsChartLoading(false);
          return;
        }

        const data = await getBusinessPerformanceTrends(selectedBusinessId, graphType);
        if (!mounted || !data) return;

        const summary = data?.summary;
        const series = Array.isArray(data?.series) ? data.series : [];
        let completedShifts = series.map((item: any, index: number) => {
          const rawLabel =
            typeof item?.label === "string"
              ? item.label
              : typeof item?.key === "string"
                ? item.key
                : "";
          const formattedLabel = formatTrendLabel(rawLabel, graphType);
          return {
            value: getCompletedValue(item),
            label: shouldShowLabel(index, series.length, graphType)
              ? formattedLabel
              : "",
          };
        });
        let missedShifts = series.map((item: any) => ({
          value: getMissedValue(item),
        }));

        // Safety fallback: if parsed series is all-zero but summary has values,
        // place summary values at the last point so chart is never misleadingly flat.
        const totalCompletedFromSeries = completedShifts.reduce(
          (sum, point) => sum + toNumber(point?.value),
          0
        );
        const totalMissedFromSeries = missedShifts.reduce(
          (sum, point) => sum + toNumber(point?.value),
          0
        );
        const completedFromSummary = toNumber(summary?.completedShifts);
        const missedFromSummary = toNumber(summary?.missedShifts);

        if (
          series.length > 0 &&
          totalCompletedFromSeries === 0 &&
          totalMissedFromSeries === 0 &&
          (completedFromSummary > 0 || missedFromSummary > 0)
        ) {
          const lastIndex = series.length - 1;
          completedShifts = completedShifts.map((point, index) =>
            index === lastIndex ? { ...point, value: completedFromSummary } : point
          );
          missedShifts = missedShifts.map((point, index) =>
            index === lastIndex ? { ...point, value: missedFromSummary } : point
          );
        }

        const nextChartData = {
          completedShifts,
          missedShifts,
          completedPercentage: toNumber(summary?.completedShiftPercentage),
          missedPercentage: toNumber(summary?.missedShiftPercentage),
        };

        if (!mounted) return;
        setChartData(nextChartData);
      } catch (error: any) {
        if (!mounted) return;
        setChartData({
          completedShifts: [],
          missedShifts: [],
          completedPercentage: 0,
          missedPercentage: 0,
        });
        if (__DEV__) {
          console.log("[PerformanceTrend] fetch failed", {
            businessId: selectedBusinessId,
            graphType,
            status: error?.response?.status,
            message:
              error?.response?.data?.message ||
              error?.response?.data?.error?.message ||
              error?.message,
          });
        }
        if (shouldSilenceTrendError(error)) return;
        toast.error(error?.message || t("common.failedToLoadPerformanceTrend"));
      } finally {
        if (!mounted) return;
        setIsChartLoading(false);
      }
    };

    if (selectedBusinessId) {
      setIsChartLoading(true);
    } else {
      setIsChartLoading(false);
    }

    if (graphType === "daily") {
      fetchTimer = setTimeout(() => {
        void loadPerformanceTrends();
      }, DAILY_API_DELAY_MS);
    } else {
      void loadPerformanceTrends();
    }

    return () => {
      if (fetchTimer) clearTimeout(fetchTimer);
      mounted = false;
    };
  }, [getBusinessPerformanceTrends, graphType, selectedBusinessId]);

  const graphLabel = useMemo(
    () => graphType.charAt(0).toUpperCase() + graphType.slice(1),
    [graphType]
  );

  // useEffect(() => {
  //   if (!__DEV__) return;
  //   try {
  //     const payload = {
  //       businessId: selectedBusinessId,
  //       graphType,
  //       chartData,
  //     };
  //     console.log(
  //       `[PerformanceTrend -> ShiftsLineChart] chartDataFromApi ${JSON.stringify(payload, null, 2)}`
  //     );
  //   } catch {
  //     console.log("[PerformanceTrend -> ShiftsLineChart] chartDataFromApi", {
  //       businessId: selectedBusinessId,
  //       graphType,
  //       chartData,
  //     });
  //   }
  // }, [chartData, graphType, selectedBusinessId]);

  return (
    <View className={`${className} px-5`}>
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
          {t("user.profile.performanceTrend.title")}
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

      {isChartLoading ? (
        <View
          pointerEvents="none"
          className="rounded-2xl border border-[#E5E7EB] bg-white p-4"
        >
          <View className="h-5 w-32 rounded-md bg-[#E5E7EB]" />
          <View className="mt-4 h-40 w-full rounded-xl bg-[#E5E7EB]" />
          <View className="mt-4 flex-row justify-between">
            <View className="h-3 w-10 rounded-md bg-[#E5E7EB]" />
            <View className="h-3 w-10 rounded-md bg-[#E5E7EB]" />
            <View className="h-3 w-10 rounded-md bg-[#E5E7EB]" />
            <View className="h-3 w-10 rounded-md bg-[#E5E7EB]" />
          </View>
        </View>
      ) : (
        <ShiftsLineChart
          completedShifts={chartData.completedShifts}
          missedShifts={chartData.missedShifts}
          graphType={graphType}
          completedPercentage={chartData.completedPercentage}
          missedPercentage={chartData.missedPercentage}
        />
      )}

      <Modal
        visible={showGraphMenu}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGraphMenu(false)}
      >
        <BlurView intensity={80} tint="dark" className="flex-1" style={{ justifyContent: "flex-end" }}>
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
                  {t("user.profile.performanceTrend.selectGraphType")}
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
                      className={`flex-row items-center p-3 mb-3 rounded-xl ${isActive ? "bg-[#4FB2F3]" : "bg-white"
                        }`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`font-proximanova-semibold ${isActive ? "text-white" : "text-gray-900"
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

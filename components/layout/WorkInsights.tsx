import businesses from "@/assets/data/businesses.json";
import { useShiftStore } from "@/stores/shiftStore";
import { WorkInsightsProps } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import StatCardSecondary from "../ui/cards/StatCardSecondary";
import BusinessSelectionTrigger from "../ui/dropdown/BusinessSelectionTrigger";
import MonthPicker from "../ui/inputs/MonthPicker";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

const WorkInsights = ({ className, title }: WorkInsightsProps) => {
  const [reportMonth, setReportMonth] = useState<Date | null>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const getWorkInsightsAnalytics = useShiftStore((s) => s.getWorkInsightsAnalytics);
  const [insights, setInsights] = useState<{
    completedShifts: number;
    workedHours: number;
    performanceStatus: number;
  }>({
    completedShifts: 0,
    workedHours: 0,
    performanceStatus: 0,
  });

  const handleReportMonthChange = (date: Date) => {
    setReportMonth(date);
  };

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = businesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      if (selectedBusiness) {
        return { type: "single", content: selectedBusiness };
      }
    }
    return { type: "all", content: "All" }; // fallback
  };

  const displayContent = getDisplayContent();

  const monthParam = useMemo(() => {
    const date = reportMonth || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [reportMonth]);

  useEffect(() => {
    let mounted = true;

    const loadInsights = async () => {
      try {
        const data = await getWorkInsightsAnalytics({ month: monthParam });
        if (!mounted || !data) return;

        setInsights({
          completedShifts:
            typeof data?.completedShifts === "number" ? data.completedShifts : 0,
          workedHours: typeof data?.workedHours === "number" ? data.workedHours : 0,
          performanceStatus:
            typeof data?.performanceStatus === "number"
              ? data.performanceStatus
              : 0,
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to load work insights");
      }
    };

    void loadInsights();

    return () => {
      mounted = false;
    };
  }, [getWorkInsightsAnalytics, monthParam]);

  return (
    <View className={`${className} px-4`}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-proximanova-semibold">
          {title ? title : "Work Insights"}
        </Text>

        {!title && (
          <View className="flex-row items-center gap-2">
            <MonthPicker
              value={reportMonth}
              onDateChange={handleReportMonthChange}
            />

            <BusinessSelectionTrigger
              displayContent={displayContent as any}
              onPress={() => setShowModal(true)}
              compact
            />
          </View>
        )}
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={businesses}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      {/* stats */}
      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title="Completed Shifts"
          point={insights.completedShifts}
          subtitle="Shifts"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="Worked Hours"
          point={insights.workedHours}
          subtitle="Hour"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>

      <StatCardSecondary
        isCompletedMode={insights.performanceStatus < 0}
        point={`${insights.performanceStatus > 0 ? "+" : ""}${insights.performanceStatus}%`}
        background={require("@/assets/images/stats-bg2.svg")}
      />
    </View>
  );
};

export default WorkInsights;

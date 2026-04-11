import { useShiftStore } from "@/stores/shiftStore";
import { WorkInsightsProps } from "@/types";
import React, { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import StatCardSecondary from "../ui/cards/StatCardSecondary";
import MonthPicker from "../ui/inputs/MonthPicker";
import BusinessSelectionModal from "../ui/modals/BusinessSelectionModal";

const UserWorkInsights = ({ className, title }: WorkInsightsProps) => {
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

  const monthParam = useMemo(() => {
    const date = reportMonth || new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, [reportMonth]);

  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    if (status === 403) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("insufficient_permissions") ||
      message.includes("status code 403") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };

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
        if (isExpectedAuthError(error)) return;
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
          Work Insights
        </Text>

        <View className="bg-[#E5F4FD] flex-row items-center gap-2 px-3 py-1 border border-gray-100 rounded-full">
          <MonthPicker
            value={reportMonth}
            onDateChange={handleReportMonthChange}
          />
        </View>
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={[]}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />

      {/* stats */}
      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title="Completed Shifts"
          point={insights.completedShifts}
          subtitle="Tasks"
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
        mode="user"
        point={`${insights.performanceStatus > 0 ? "+" : ""}${insights.performanceStatus}%`}
        background={require("@/assets/images/stats-bg2.svg")}
      />
    </View>
  );
};

export default UserWorkInsights;

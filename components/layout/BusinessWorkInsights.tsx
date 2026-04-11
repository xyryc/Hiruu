import { useBusinessStore } from "@/stores/businessStore";
import { WorkInsightsProps } from "@/types";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import StatCardPrimary from "../ui/cards/StatCardPrimary";
import StatCardSecondary from "../ui/cards/StatCardSecondary";

const BusinessWorkInsights = ({ className, title }: WorkInsightsProps) => {
  const activeBusinessIds = useBusinessStore((state) => state.selectedBusinesses);
  const getBusinessOverview = useBusinessStore((state) => state.getBusinessOverview);
  const [insights, setInsights] = useState<{
    totalEmployees: number;
    onLeaveToday: number;
    ratingsCount: number;
    averageRating: number;
  }>({
    totalEmployees: 0,
    onLeaveToday: 0,
    ratingsCount: 0,
    averageRating: 0,
  });
  const selectedBusinessId = activeBusinessIds?.[0] || "";

  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadInsights = async () => {
      try {
        if (!selectedBusinessId) {
          if (!mounted) return;
          setInsights({
            totalEmployees: 0,
            onLeaveToday: 0,
            ratingsCount: 0,
            averageRating: 0,
          });
          return;
        }

        const data = await getBusinessOverview(selectedBusinessId);
        if (!mounted || !data) return;

        const teamInsights = data?.teamInsights;
        const ratingsRecent = teamInsights?.ratingsRecent;

        setInsights({
          totalEmployees:
            typeof teamInsights?.totalEmployees === "number"
              ? teamInsights.totalEmployees
              : 0,
          onLeaveToday:
            typeof teamInsights?.onLeaveToday === "number"
              ? teamInsights.onLeaveToday
              : 0,
          ratingsCount:
            typeof ratingsRecent?.ratingsCount === "number"
              ? ratingsRecent.ratingsCount
              : 0,
          averageRating:
            typeof ratingsRecent?.average === "number" ? ratingsRecent.average : 0,
        });
      } catch (error: any) {
        if (!mounted) return;
        if (isExpectedAuthError(error)) return;
        toast.error(error?.message || "Failed to load work insights");
      }
    };

    void loadInsights();

    return () => {
      mounted = false;
    };
  }, [getBusinessOverview, selectedBusinessId]);

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        {title || "Team Insights"}
      </Text>

      <View className="flex-row gap-3 mb-4">
        <StatCardPrimary
          title="Total Employees"
          point={insights.totalEmployees}
          subtitle="Employees"
          background={require("@/assets/images/stats-bg.svg")}
        />
        <StatCardPrimary
          title="On Leave Today"
          point={insights.onLeaveToday}
          subtitle="Employees"
          background={require("@/assets/images/stats-bg.svg")}
        />
      </View>

      <StatCardSecondary
        mode="business"
        point={insights.ratingsCount}
        averageRating={insights.averageRating}
        background={require("@/assets/images/stats-bg2.svg")}
      />
    </View>
  );
};

export default BusinessWorkInsights;

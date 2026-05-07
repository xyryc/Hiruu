import ScreenHeader from "@/components/header/ScreenHeader";
import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type ShiftReportItem = {
  id: string;
  type?: string;
  issueType?: string;
  notes?: string | null;
  attachment?: string | null;
  createdAt?: string;
  shiftAssignment?: {
    id?: string;
    date?: string;
    startsAt?: string;
    endsAt?: string;
    status?: string;
  } | null;
  employee?: {
    id?: string;
    user?: {
      id?: string;
      name?: string;
      avatar?: string | null;
    } | null;
  } | null;
};

const formatIssueType = (value: string | undefined, fallback: string) => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatShiftWindow = (
  startsAt?: string,
  endsAt?: string,
  date?: string
) => {
  const shiftDate = formatDateTime(date);
  const start = formatDateTime(startsAt);
  const end = formatDateTime(endsAt);
  if (start === "-" && end === "-") return shiftDate;
  return `${start} - ${end}`;
};

const ShiftReportCardSkeleton = () => {
  return (
    <View className="border border-[#EEEEEE] rounded-2xl p-4 mb-3 bg-white">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-[#E5E7EB]" />
          <View>
            <View className="h-4 w-36 rounded-md bg-[#E5E7EB]" />
            <View className="mt-2 h-3 w-20 rounded-md bg-[#E5E7EB]" />
          </View>
        </View>
        <View className="h-6 w-24 rounded-full bg-[#E5E7EB]" />
      </View>

      <View className="mt-3">
        <View className="h-3 w-16 rounded-md bg-[#E5E7EB]" />
        <View className="mt-2 h-3 w-4/5 rounded-md bg-[#E5E7EB]" />
      </View>

      <View className="mt-3">
        <View className="h-3 w-12 rounded-md bg-[#E5E7EB]" />
        <View className="mt-2 h-3 w-full rounded-md bg-[#E5E7EB]" />
        <View className="mt-2 h-3 w-3/4 rounded-md bg-[#E5E7EB]" />
      </View>

      <View className="mt-3 flex-row justify-between items-center">
        <View className="h-3 w-20 rounded-md bg-[#E5E7EB]" />
        <View className="h-3 w-28 rounded-md bg-[#E5E7EB]" />
      </View>
    </View>
  );
};

const ShiftReports = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const getBusinessShiftReports = useShiftStore((state) => state.getBusinessShiftReports);
  const [reports, setReports] = useState<ShiftReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const selectedBusinessId = selectedBusinesses?.[0] || "";

  const loadReports = useCallback(async () => {
    if (!selectedBusinessId) {
      setReports([]);
      return;
    }

    try {
      setLoading(true);
      const result = await getBusinessShiftReports(selectedBusinessId, {
        page: 1,
        limit: 20,
      });
      setReports(Array.isArray(result?.data) ? result.data : []);
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.message ||
            t(
              "user.profile.todayShiftsSummary.shiftReports.failedToLoad",
              { defaultValue: "Failed to load shift reports" }
            )
        )
      );
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [getBusinessShiftReports, selectedBusinessId, t]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadReports();
    } finally {
      setRefreshing(false);
    }
  }, [loadReports]);

  const openUserProfile = useCallback(
    (userId?: string) => {
      if (!userId) return;
      router.push({
        pathname: "/screens/jobs/business/user-profile-preview",
        params: {
          userId,
          ...(selectedBusinessId ? { businessId: selectedBusinessId } : {}),
          canRate: selectedBusinessId ? "true" : "false",
        },
      });
    },
    [selectedBusinessId]
  );

  const skeletonItems = useMemo(
    () => Array.from({ length: 4 }, (_, i) => `shift-report-skeleton-${i}`),
    []
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      <ScreenHeader
        className="mx-5 my-2.5"
        onPressBack={() => router.back()}
        title={tr("user.profile.todayShiftsSummary.shiftReports.title", "Shift Reports")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 90 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View pointerEvents="none">
            {skeletonItems.map((id) => (
              <ShiftReportCardSkeleton key={id} />
            ))}
          </View>
        ) : reports.length === 0 ? (
          <View className="pt-10">
            <StatusStateCard
              image={require("@/assets/images/toolbox.svg")}
              title={tr(
                "user.profile.todayShiftsSummary.shiftReports.emptyTitle",
                "No Shift Reports"
              )}
              text={tr(
                "user.profile.todayShiftsSummary.shiftReports.emptyText",
                "There are no shift reports to show right now."
              )}
            />
          </View>
        ) : (
          reports.map((item) => {
            const user = item?.employee?.user;
            const issue = formatIssueType(
              item?.issueType,
              tr(
                "user.profile.todayShiftsSummary.shiftReports.untitledIssue",
                "General report"
              )
            );
            const submittedAt = formatDateTime(item?.createdAt);
            const shiftWindow = formatShiftWindow(
              item?.shiftAssignment?.startsAt,
              item?.shiftAssignment?.endsAt,
              item?.shiftAssignment?.date
            );

            return (
              <View
                key={item.id}
                className="border border-[#EEEEEE] rounded-2xl p-4 mb-3 bg-white dark:bg-dark-background"
              >
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    className="flex-row items-center gap-3 flex-1"
                    activeOpacity={0.8}
                    onPress={() => openUserProfile(user?.id)}
                  >
                    <Image
                      source={user?.avatar || require("@/assets/images/placeholder.png")}
                      contentFit="cover"
                      style={{ width: 40, height: 40, borderRadius: 999 }}
                    />
                    <View className="flex-1">
                      <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
                        {user?.name ||
                          tr(
                            "user.profile.todayShiftsSummary.shiftReports.unknownEmployee",
                            "Unknown employee"
                          )}
                      </Text>
                      <Text className="mt-0.5 text-xs text-secondary dark:text-dark-secondary">
                        {tr(
                          "user.profile.todayShiftsSummary.shiftReports.reportedBy",
                          "Reported by"
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View className="bg-[#E5F4FD] px-3 py-1 rounded-full">
                    <Text className="text-[#11293A] text-xs font-proximanova-semibold">
                      {issue}
                    </Text>
                  </View>
                </View>

                <View className="mt-3">
                  <Text className="text-xs text-secondary dark:text-dark-secondary">
                    {tr(
                      "user.profile.todayShiftsSummary.shiftReports.shiftTime",
                      "Shift time"
                    )}
                  </Text>
                  <Text className="mt-1 text-sm text-primary dark:text-dark-primary font-proximanova-regular">
                    {shiftWindow}
                  </Text>
                </View>

                <View className="mt-3">
                  <Text className="text-xs text-secondary dark:text-dark-secondary">
                    {tr("user.profile.todayShiftsSummary.shiftReports.notes", "Notes")}
                  </Text>
                  <Text className="mt-1 text-sm text-primary dark:text-dark-primary font-proximanova-regular">
                    {item?.notes?.trim() ||
                      tr(
                        "user.profile.todayShiftsSummary.shiftReports.noNotes",
                        "No notes provided."
                      )}
                  </Text>
                </View>

                <View className="mt-3 flex-row justify-between items-center">
                  <Text className="text-xs text-secondary dark:text-dark-secondary">
                    {tr(
                      "user.profile.todayShiftsSummary.shiftReports.submittedAt",
                      "Submitted at"
                    )}
                  </Text>
                  <Text className="text-xs text-primary dark:text-dark-primary font-proximanova-semibold">
                    {submittedAt}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftReports;

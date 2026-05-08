import { useShiftStore } from "@/stores/shiftStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ShiftDetailsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ businessId?: string; id?: string }>();
  const businessId = String(params.businessId || "");
  const id = String(params.id || "");

  const {
    shiftAssignmentDetails,
    shiftAssignmentDetailsLoading,
    shiftAssignmentDetailsError,
    getBusinessShiftAssignmentDetails,
  } = useShiftStore();

  const loadDetails = useCallback(async () => {
    if (!businessId || !id) return;
    try {
      await getBusinessShiftAssignmentDetails(businessId, id);
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    }
  }, [businessId, getBusinessShiftAssignmentDetails, id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const toDateLabel = (value?: string | null) => {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toTimeLabel = (value?: string | null) => {
    if (!value) return "--:--";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "--:--";
    return parsed.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const details = shiftAssignmentDetails;
  const employeeAvatar =
    typeof details?.assignedEmployee?.avatar === "string" &&
    details.assignedEmployee.avatar.trim().length > 0
      ? { uri: details.assignedEmployee.avatar }
      : require("@/assets/images/placeholder.png");

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <View className="px-5 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-proximanova-bold text-primary">
          {t("user.jobs.schedule.viewDetails")}
        </Text>
      </View>

      {shiftAssignmentDetailsLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4FB2F3" />
        </View>
      ) : shiftAssignmentDetailsError ? (
        <View className="px-5 pt-8">
          <Text className="text-base font-proximanova-semibold text-primary">
            {t("common.error")}
          </Text>
          <Text className="mt-1 text-sm font-proximanova-regular text-secondary">
            {shiftAssignmentDetailsError}
          </Text>
        </View>
      ) : !details ? (
        <View className="px-5 pt-8">
          <Text className="text-sm font-proximanova-regular text-secondary">
            {t("user.jobs.schedule.noShiftScheduled")}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={shiftAssignmentDetailsLoading}
              onRefresh={loadDetails}
            />
          }
        >
          <View className="border border-[#EEEEEE] rounded-xl p-4">
            <View className="flex-row items-center">
              <Image source={employeeAvatar} style={{ width: 52, height: 52, borderRadius: 999 }} />
              <View className="ml-3 flex-1">
                <Text className="text-base font-proximanova-bold text-primary">
                  {details?.assignedEmployee?.name || "-"}
                </Text>
                <Text className="text-sm font-proximanova-regular text-secondary">
                  {details?.assignedEmployee?.roleName || "-"}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-secondary font-proximanova-regular">
                  Date
                </Text>
                <Text className="text-sm text-primary font-proximanova-semibold">
                  {toDateLabel(details?.date)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-secondary font-proximanova-regular">
                  {t("user.jobs.schedule.shiftTime")}
                </Text>
                <Text className="text-sm text-primary font-proximanova-semibold">
                  {toTimeLabel(details?.startsAt)} - {toTimeLabel(details?.endsAt)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-secondary font-proximanova-regular">
                  {t("user.jobs.schedule.location")}
                </Text>
                <Text className="text-sm text-primary font-proximanova-semibold text-right flex-1 ml-3">
                  {details?.business?.address?.address || details?.business?.name || "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-secondary font-proximanova-regular">
                  {t("user.jobs.schedule.shift")}
                </Text>
                <Text className="text-sm text-primary font-proximanova-semibold">
                  {details?.shiftTemplate?.name || "-"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-secondary font-proximanova-regular">
                  Status
                </Text>
                <Text className="text-sm text-primary font-proximanova-semibold capitalize">
                  {details?.status || "-"}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ShiftDetailsScreen;

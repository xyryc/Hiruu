import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimePicker from "@/components/ui/inputs/TimePicker";
import { useShiftStore } from "@/stores/shiftStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const CANONICAL_ATTENDANCE_STATUS = [
  "completed",
  "missed",
  "holiday",
  "cancelled",
  "late",
  "early_leave",
  "absent",
  "leave",
  "weekly_off",
] as const;

const ShiftDetailsScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ businessId?: string; id?: string }>();
  const businessId = String(params.businessId || "");
  const id = String(params.id || "");
  const [manualStatus, setManualStatus] = useState<string>("completed");
  const [manualClockInDate, setManualClockInDate] = useState<Date>(new Date());
  const [manualClockOutDate, setManualClockOutDate] = useState<Date>(new Date());
  const [manualClockInTime, setManualClockInTime] = useState<Date>(new Date());
  const [manualClockOutTime, setManualClockOutTime] = useState<Date>(new Date());
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const {
    shiftAssignmentDetails,
    shiftAssignmentDetailsLoading,
    shiftAssignmentDetailsError,
    getBusinessShiftAssignmentDetails,
    submitBusinessManualAttendance,
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
  const isCompletedShift = String(details?.status || "").toLowerCase() === "completed";
  const statusOptions = useMemo(
    () =>
      CANONICAL_ATTENDANCE_STATUS.map((value) => ({
        value,
        label: value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    []
  );

  useEffect(() => {
    if (!details) return;
    const startDate = details?.startsAt ? new Date(details.startsAt) : new Date();
    const endDate = details?.endsAt ? new Date(details.endsAt) : new Date();
    setManualClockInDate(startDate);
    setManualClockOutDate(endDate);
    setManualClockInTime(startDate);
    setManualClockOutTime(endDate);
  }, [details]);

  const mergeDateAndTimeToIso = (date: Date, time: Date) => {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const merged = new Date(date);
    merged.setHours(hour, minute, 0, 0);
    return merged.toISOString();
  };

  const handleSubmitManualAttendance = async () => {
    if (!businessId || !id) return;
    if (!manualStatus) {
      toast.error("Please fill all attendance fields");
      return;
    }

    const clockInTime = mergeDateAndTimeToIso(manualClockInDate, manualClockInTime);
    const clockOutTime = mergeDateAndTimeToIso(manualClockOutDate, manualClockOutTime);
    try {
      setIsSubmittingManual(true);
      await submitBusinessManualAttendance({
        businessId,
        shiftAssignmentId: id,
        clockInTime,
        clockOutTime,
        status: manualStatus,
      });
      toast.success("Manual attendance submitted");
      await loadDetails();
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit manual attendance");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const employeeAvatar =
    typeof details?.assignedEmployee?.avatar === "string" &&
      details.assignedEmployee.avatar.trim().length > 0
      ? { uri: details.assignedEmployee.avatar }
      : require("@/assets/images/placeholder.png");

  const ShiftDetailsSkeleton = () => (
    <View className="px-5">
      <View className="border border-[#EEEEEE] rounded-xl p-4 bg-white">
        <View className="flex-row items-center">
          <View className="h-[52px] w-[52px] rounded-full bg-[#E5E7EB]" />
          <View className="ml-3 flex-1">
            <View className="h-4 w-40 rounded bg-[#E5E7EB]" />
            <View className="mt-2 h-3 w-24 rounded bg-[#E5E7EB]" />
          </View>
        </View>
        <View className="mt-5 gap-y-3">
          <View className="h-3 w-full rounded bg-[#E5E7EB]" />
          <View className="h-3 w-full rounded bg-[#E5E7EB]" />
          <View className="h-3 w-full rounded bg-[#E5E7EB]" />
          <View className="h-3 w-2/3 rounded bg-[#E5E7EB]" />
        </View>
      </View>
      <View className="mt-4 border border-[#EEEEEE] rounded-xl p-4 bg-white">
        <View className="h-4 w-44 rounded bg-[#E5E7EB]" />
        <View className="mt-4 h-11 rounded-xl bg-[#E5E7EB]" />
        <View className="mt-3 h-11 rounded-xl bg-[#E5E7EB]" />
        <View className="mt-3 h-11 rounded-xl bg-[#E5E7EB]" />
        <View className="mt-4 h-11 rounded-full bg-[#E5E7EB]" />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <View className="px-5 py-3">
        <ScreenHeader title="Shift Details" onPressBack={() => router.back()} />
      </View>

      {shiftAssignmentDetailsLoading ? (
        <ShiftDetailsSkeleton />
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

          {isCompletedShift ? (
            <View className="mt-4 border border-[#EEEEEE] rounded-xl p-4">
              <Text className="text-base font-proximanova-bold text-primary mb-3">
                Manual Attendance
              </Text>

              <SelectDropdown
                label="Attendance Status"
                placeholder="Select status"
                options={statusOptions}
                value={manualStatus}
                onSelect={setManualStatus}
                className="mb-3"
              />

              <View className="mb-3">
                <Text className="text-sm font-proximanova-semibold text-primary mb-2">
                  Clock In Date
                </Text>
                <DatePicker
                  value={manualClockInDate}
                  onChange={setManualClockInDate}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-proximanova-semibold text-primary mb-2">
                  Clock In Time
                </Text>
                <TimePicker
                  value={manualClockInTime}
                  onChangeTime={setManualClockInTime}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm font-proximanova-semibold text-primary mb-2">
                  Clock Out Date
                </Text>
                <DatePicker
                  value={manualClockOutDate}
                  onChange={setManualClockOutDate}
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-proximanova-semibold text-primary mb-2">
                  Clock Out Time
                </Text>
                <TimePicker
                  value={manualClockOutTime}
                  onChangeTime={setManualClockOutTime}
                />
              </View>

              <PrimaryButton
                onPress={handleSubmitManualAttendance}
                disabled={isSubmittingManual}
                loading={isSubmittingManual}
                title="Submit Manual Attendance"
              />
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ShiftDetailsScreen;

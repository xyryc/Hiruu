import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimePicker from "@/components/ui/inputs/TimePicker";
import { useBusinessStore } from "@/stores/businessStore";
import { useJobStore } from "@/stores/jobStore";
import { useShiftStore } from "@/stores/shiftStore";
import { MyEmploymentItem } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const OvertimeRequest = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    shiftAssignmentId?: string | string[];
    employmentId?: string | string[];
    shiftEndAt?: string | string[];
  }>();
  const shiftAssignmentId = Array.isArray(params.shiftAssignmentId)
    ? params.shiftAssignmentId[0]
    : params.shiftAssignmentId;
  const employmentIdFromParams = Array.isArray(params.employmentId)
    ? params.employmentId[0]
    : params.employmentId;
  const shiftEndAtParam = Array.isArray(params.shiftEndAt)
    ? params.shiftEndAt[0]
    : params.shiftEndAt;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const myEmployments = useJobStore((state) => state.myEmployments);
  const myEmploymentsLoading = useJobStore((state) => state.myEmploymentsLoading);
  const getMyEmployments = useJobStore((state) => state.getMyEmployments);
  const createShiftRequest = useShiftStore((state) => state.createShiftRequest);
  const createShiftRequestLoading = useShiftStore(
    (state) => state.createShiftRequestLoading
  );
  const parsedShiftEndAt = useMemo(() => {
    if (!shiftEndAtParam) return null;
    const date = new Date(shiftEndAtParam);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [shiftEndAtParam]);
  const [requestedDate, setRequestedDate] = useState<Date>(
    () => parsedShiftEndAt || new Date()
  );
  const [overtimeStart, setOvertimeStart] = useState<Date>(
    () => parsedShiftEndAt || new Date()
  );
  const [overtimeEnd, setOvertimeEnd] = useState<Date>(() => {
    const base = parsedShiftEndAt ? new Date(parsedShiftEndAt) : new Date();
    base.setHours(base.getHours() + 1);
    return base;
  });
  const [reason, setReason] = useState("");

  useEffect(() => {
    getMyEmployments().catch((error: any) => {
      toast.error(
        translateApiMessage(error?.message || "Failed to load businesses")
      );
    });
  }, [getMyEmployments]);

  const selectedBusinessId = selectedBusinesses?.[0] || "";
  useEffect(() => {
    if (!parsedShiftEndAt) return;
    setRequestedDate(new Date(parsedShiftEndAt));
    setOvertimeStart(new Date(parsedShiftEndAt));
    setOvertimeEnd((prev) => {
      const next = new Date(parsedShiftEndAt);
      if (prev <= next) {
        next.setHours(next.getHours() + 1);
        return next;
      }
      return prev;
    });
  }, [parsedShiftEndAt]);
  const selectedEmployment = useMemo<MyEmploymentItem | null>(() => {
    const list = Array.isArray(myEmployments) ? myEmployments : [];
    if (employmentIdFromParams) {
      return list.find((employment) => employment?.id === employmentIdFromParams) || null;
    }
    if (selectedBusinessId) {
      return (
        list.find((employment) => employment?.businessId === selectedBusinessId) || null
      );
    }
    return list[0] || null;
  }, [employmentIdFromParams, myEmployments, selectedBusinessId]);

  const formatYmd = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatHm24 = (date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const calculateOvertimeHours = (start: Date, end: Date) => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const diffMinutes = endMinutes - startMinutes;
    return diffMinutes / 60;
  };

  const handleSubmit = async () => {
    if (!shiftAssignmentId) {
      toast.error("Shift assignment not found");
      return;
    }

    if (!selectedEmployment?.id) {
      toast.error("Employment not found");
      return;
    }

    const overtimeHours = calculateOvertimeHours(overtimeStart, overtimeEnd);
    if (!Number.isFinite(overtimeHours) || overtimeHours <= 0) {
      toast.error("Overtime end time must be after start time");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    const payload = {
      type: "overtime_request" as const,
      requestedDate: formatYmd(requestedDate),
      startTime: formatHm24(overtimeStart),
      endTime: formatHm24(overtimeEnd),
      overtimeHours,
      overtimeRate: 1.5,
      reason: reason.trim(),
      employmentId: selectedEmployment.id,
      shiftAssignmentId,
    };

    try {
      const result = await createShiftRequest(payload);
      toast.success(translateApiMessage(result?.message || "shift_request_created"));
      router.back();
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "Failed to submit overtime request")
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-dark-background">
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-6 rounded-b-3xl overflow-hidden"
        title="Overtime Request"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111111"}
      />

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 bg-white dark:bg-dark-background"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 py-6">
          {/* Overtime Details Section */}
          <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary mb-7">
            Overtime Details
          </Text>

          {/* Select Dates */}
          <View className="mb-5">
            <DatePicker title="Select Dates" value={requestedDate} onChange={setRequestedDate} />
          </View>

          {/* Overtime Start and End Time */}
          <View className="flex-row mb-5 gap-3">
            {/* Overtime Start */}
            <View className="flex-1">
              <TimePicker
                title="Overtime Start"
                value={overtimeStart}
                onChangeTime={setOvertimeStart}
              />
            </View>

            {/* To Separator */}
            <View className="items-center justify-end pb-3.5">
              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                To
              </Text>
            </View>

            {/* Overtime End */}
            <View className="flex-1">
              <TimePicker
                title=" Overtime End"
                value={overtimeEnd}
                onChangeTime={setOvertimeEnd}
              />
            </View>
          </View>

          {/* Reason (Optional) */}
          <View className="mb-5">
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
              Reason (Optional)
            </Text>
            <View className="bg-white dark:bg-dark-surface rounded-xl border border-[#EEEEEE] dark:border-dark-border overflow-hidden">
              <TextInput
                className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary min-h-[120px]"
                placeholder="Mention any reason or notes for manager...."
                placeholderTextColor="#7D7D7D"
                multiline
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="mx-5 absolute bottom-0 left-0 right-0 py-5 items-center justify-end bg-white dark:bg-dark-background rounded-t-[20px]">
        {myEmploymentsLoading ? (
          <View className="py-4">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : null}
        <PrimaryButton
          title="Send Request"
          className="my-10"
          loading={createShiftRequestLoading}
          disabled={createShiftRequestLoading || myEmploymentsLoading}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

export default OvertimeRequest;

import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Dropdown from "@/components/ui/dropdown/DropDown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimePicker from "@/components/ui/inputs/TimePicker";
import { useShiftStore } from "@/stores/shiftStore";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const CorrectionRequest = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    attendanceId?: string;
    employmentId?: string;
    shiftAssignmentId?: string;
  }>();
  const [reason, setReason] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
  const [clockInDate, setClockInDate] = useState<Date>(new Date());
  const [clockOutDate, setClockOutDate] = useState<Date>(new Date());
  const [resolvedEmploymentId, setResolvedEmploymentId] = useState(
    typeof params.employmentId === "string" ? params.employmentId : ""
  );
  const [resolvedShiftAssignmentId, setResolvedShiftAssignmentId] = useState(
    typeof params.shiftAssignmentId === "string" ? params.shiftAssignmentId : ""
  );
  const getMyLatestIncompleteAttendance = useShiftStore(
    (s) => s.getMyLatestIncompleteAttendance
  );
  const createShiftRequest = useShiftStore((s) => s.createShiftRequest);
  const createShiftRequestLoading = useShiftStore(
    (s) => s.createShiftRequestLoading
  );
  const issues = [
    { label: "Missed Punch", value: "missed_punch" },
    { label: "Late Arrival", value: "late_arrival" },
    { label: "Early Departure", value: "early_departure" },
    { label: "Forgot to Tap", value: "forgot_to_tap" },
    { label: "Network Issues", value: "network_issues" },
    { label: "Other", value: "other" },
  ];
  const issueValues = useMemo(
    () => new Set(issues.map((item) => item.value)),
    [issues]
  );
  const selectedIssueLabel = useMemo(
    () =>
      issues.find((item) => item.value === selectedIssue)?.label || "",
    [issues, selectedIssue]
  );

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    let mounted = true;

    const hydrateFromLatestIncomplete = async () => {
      if (resolvedEmploymentId && resolvedShiftAssignmentId) return;
      try {
        const data = await getMyLatestIncompleteAttendance({ page: 1, limit: 1 });
        const first = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!mounted || !first) return;

        if (!resolvedEmploymentId && first?.employmentId) {
          setResolvedEmploymentId(String(first.employmentId));
        }
        if (!resolvedShiftAssignmentId && first?.shiftAssignmentId) {
          setResolvedShiftAssignmentId(String(first.shiftAssignmentId));
        }
        const shiftStartsAt = first?.shiftAssignment?.startsAt
          ? new Date(first.shiftAssignment.startsAt)
          : null;
        const shiftEndsAt = first?.shiftAssignment?.endsAt
          ? new Date(first.shiftAssignment.endsAt)
          : null;

        if (shiftStartsAt && !Number.isNaN(shiftStartsAt.getTime())) {
          setAttendanceDate(shiftStartsAt);
          setClockInDate(shiftStartsAt);
        }
        if (shiftEndsAt && !Number.isNaN(shiftEndsAt.getTime())) {
          setClockOutDate(shiftEndsAt);
        }
      } catch (error: any) {
        if (!mounted) return;
        toast.error(error?.message || "Failed to load shift data.");
      }
    };

    void hydrateFromLatestIncomplete();
    return () => {
      mounted = false;
    };
  }, [
    getMyLatestIncompleteAttendance,
    resolvedEmploymentId,
    resolvedShiftAssignmentId,
  ]);

  const handleSendRequest = async () => {
    if (!issueValues.has(selectedIssue)) {
      toast.error("Please select a reason type.");
      return;
    }

    if (!resolvedEmploymentId) {
      toast.error("Employment information is missing.");
      return;
    }

    if (!resolvedShiftAssignmentId) {
      toast.error("Shift assignment information is missing.");
      return;
    }

    const formatAttendanceDate = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const mergeDateAndTimeIso = (date: Date, time: Date) => {
      const merged = new Date(date);
      merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
      return merged.toISOString();
    };

    const clockInTime = mergeDateAndTimeIso(attendanceDate, clockInDate);
    const clockOutTime = mergeDateAndTimeIso(attendanceDate, clockOutDate);
    if (new Date(clockOutTime).getTime() <= new Date(clockInTime).getTime()) {
      toast.error("End time must be after start time.");
      return;
    }

    try {
      const result = await createShiftRequest({
        employmentId: resolvedEmploymentId,
        type: "manual_attendance",
        manualAttendanceReasonType: selectedIssue as
          | "missed_punch"
          | "late_arrival"
          | "early_departure"
          | "forgot_to_tap"
          | "network_issues"
          | "other",
        shiftAssignmentId: resolvedShiftAssignmentId,
        clockInTime,
        clockOutTime,
        attendanceDate: formatAttendanceDate(attendanceDate),
        attendanceNotes: reason.trim() || undefined,
      });

      const messageKey = result?.message || "shift_request_created";
      toast.success(
        t(`api.${messageKey}`, {
          defaultValue: messageKey,
        })
      );
      router.back();
    } catch (error: any) {
      const messageKey = error?.message || "UNKNOWN_ERROR";
      toast.error(
        t(`api.${messageKey}`, {
          defaultValue: messageKey,
        })
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className="mx-5 rounded-3xl"
        onPressBack={() => router.back()}
        title="Correction Request"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={<View></View>}
      />

      <ScrollView className="flex-1">
        <View>
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mx-5 mt-4">
            Select Date
          </Text>
          <View className="mx-5 mt-2.5">
            <DatePicker value={attendanceDate} onChange={setAttendanceDate} />
          </View>
          <View className={`flex-row justify-between gap-3 mx-5 mt-[15px]`}>
            <>
              <TimePicker
                title="Start Time"
                value={clockInDate}
                onChangeTime={setClockInDate}
              />
              <TimePicker
                title="End Time"
                value={clockOutDate}
                onChangeTime={setClockOutDate}
              />
            </>
          </View>
        </View>
        <View className="mb-5 mx-5 mt-4">
          <Dropdown
            label="Reason Type"
            placeholder="Select an issue"
            options={issues}
            value={selectedIssueLabel}
            onSelect={setSelectedIssue}
          />
        </View>
        <View className="mb-5">
          <Text className="mx-5 text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
            Reason (Optional)
          </Text>
          <View className="bg-white mx-5 dark:bg-dark-surface rounded-xl border border-[#EEEEEE] dark:border-dark-border overflow-hidden">
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
      </ScrollView>
      <PrimaryButton
        title="Send Request"
        className="mx-5 my-10"
        onPress={handleSendRequest}
        loading={createShiftRequestLoading}
      />
    </SafeAreaView>
  );
};

export default CorrectionRequest;


import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Dropdown from "@/components/ui/dropdown/DropDown";
import { useShiftStore } from "@/stores/shiftStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ReportIssue = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string | string[];
    shiftAssignmentId?: string | string[];
    employmentId?: string | string[];
  }>();
  const shiftAssignmentIdFromParams = Array.isArray(params.shiftAssignmentId)
    ? params.shiftAssignmentId[0]
    : params.shiftAssignmentId;
  const fallbackShiftAssignmentId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;
  const shiftAssignmentId = shiftAssignmentIdFromParams || fallbackShiftAssignmentId;
  const employmentIdFromParams = Array.isArray(params.employmentId)
    ? params.employmentId[0]
    : params.employmentId;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selectedIssue, setSelectedIssue] = useState("");
  const createShiftReport = useShiftStore((state) => state.createShiftReport);
  const getShiftAssignmentDetails = useShiftStore(
    (state) => state.getShiftAssignmentDetails
  );
  const createShiftReportLoading = useShiftStore(
    (state) => state.createShiftReportLoading
  );
  const [reason, setReason] = useState("");
  const [resolvedEmploymentId, setResolvedEmploymentId] = useState<string>(
    employmentIdFromParams || ""
  );
  const issues = [
    { label: "System not working", value: "system_not_working" },
    { label: "Overstaffed shift", value: "overstaffed_shift" },
    { label: "Missing team members on shift", value: "missing_team_members" },
    { label: "Wrong timezone display", value: "wrong_timezone_display" },
    { label: "Building access problems", value: "building_access_problems" },
  ];
  const selectedIssueLabel =
    issues.find((item) => item.value === selectedIssue)?.label || "";

  useEffect(() => {
    if (employmentIdFromParams) {
      setResolvedEmploymentId(employmentIdFromParams);
      return;
    }
    if (!shiftAssignmentId) return;

    let isMounted = true;
    getShiftAssignmentDetails(shiftAssignmentId)
      .then(() => {
        const details = useShiftStore.getState().shiftAssignmentDetails;
        const derivedEmploymentId =
          details?.employmentId ||
          details?.employment?.id ||
          details?.employment?.employmentId ||
          "";
        if (isMounted && derivedEmploymentId) {
          setResolvedEmploymentId(derivedEmploymentId);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [employmentIdFromParams, getShiftAssignmentDetails, shiftAssignmentId]);

  const handleSubmit = async () => {
    if (!shiftAssignmentId) {
      toast.error("Shift assignment id is missing");
      return;
    }
    if (!resolvedEmploymentId) {
      toast.error("Employment id is missing");
      return;
    }
    if (!selectedIssue) {
      toast.error("Please select an issue type");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please add issue details");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "report");
      formData.append("issueType", selectedIssue);
      formData.append("notes", reason.trim());
      formData.append("employmentId", resolvedEmploymentId);
      formData.append("shiftAssignmentId", shiftAssignmentId);

      const result = await createShiftReport(formData as any);
      toast.success(translateApiMessage(result?.message || "shift_report_created"));
      router.back();
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "Failed to submit shift report")
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-dark-background">
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 py-4 rounded-b-3xl overflow-hidden"
        title="Report Issue"
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
            Report a Shift-related Issue
          </Text>

          {/* Select Company */}
          <View className="mb-5">
            <Dropdown
              label="Issue Types"
              placeholder="Select an issue"
              options={issues}
              value={selectedIssueLabel}
              onSelect={setSelectedIssue}
            />
          </View>

          {/* description */}
          <View className="mb-5">
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
              Description
            </Text>
            <View className="bg-white dark:bg-dark-surface rounded-xl border border-[#EEEEEE] dark:border-dark-border overflow-hidden">
              <TextInput
                className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary min-h-[120px]"
                placeholder="Mention any Issue or notes for manager....."
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
        <PrimaryButton
          title="Send Request"
          loading={createShiftReportLoading}
          disabled={createShiftReportLoading}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

export default ReportIssue;

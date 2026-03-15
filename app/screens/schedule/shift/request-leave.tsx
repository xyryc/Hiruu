import ScreenHeader from "@/components/header/ScreenHeader";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import ActionCard from "@/components/ui/cards/ActionCard";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import LeaveRequestModal from "@/components/ui/modals/LeaveRequestModal";
import SelectLeaveType, {
  LEAVE_TYPE_OPTIONS,
  LeaveTypeValue,
} from "@/components/ui/modals/SelectLeaveType";
import { useJobStore } from "@/stores/jobStore";
import { useShiftStore } from "@/stores/shiftStore";
import { LeaveCreditItem, MyEmploymentItem } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const LEAVE_TYPE_TO_CREDIT_KEY: Record<LeaveTypeValue, keyof LeaveCreditItem> = {
  sick: "sick_leave",
  personal: "personal_leave",
  workFromHome: "work_from_home",
  emergency: "emergency_leave",
  casual: "casual_leave",
  unpaid: "unpaid_leave",
  other: "other_leave",
};

const RequestLeave = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isOn, setIsOn] = useState(false);
  const [leaveText, setLeaveText] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const insets = useSafeAreaInsets();

  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveTypeValue>("sick");
  const myEmployments = useJobStore((state) => state.myEmployments);
  const myEmploymentsLoading = useJobStore((state) => state.myEmploymentsLoading);
  const getMyEmployments = useJobStore((state) => state.getMyEmployments);
  const getMyLeaveCredits = useShiftStore((state) => state.getMyLeaveCredits);
  const createShiftRequest = useShiftStore((state) => state.createShiftRequest);
  const createShiftRequestLoading = useShiftStore(
    (state) => state.createShiftRequestLoading
  );
  const leaveCreditsLoading = useShiftStore((state) => state.leaveCreditsLoading);
  const leaveCredits = useShiftStore((state) =>
    selectedBusiness ? state.leaveCreditsByBusiness[selectedBusiness] || null : null
  );

  useEffect(() => {
    getMyEmployments().catch((error: any) => {
      toast.error(
        translateApiMessage(error?.message || "Failed to load businesses")
      );
    });
  }, [getMyEmployments]);

  const businessOptions = useMemo(
    () => {
      const uniqueByBusinessId = new Map<string, MyEmploymentItem>();
      (myEmployments || []).forEach((employment) => {
        if (employment?.businessId && !uniqueByBusinessId.has(employment.businessId)) {
          uniqueByBusinessId.set(employment.businessId, employment);
        }
      });

      return Array.from(uniqueByBusinessId.values()).map((employment) => ({
        label: employment?.business?.name || "Business",
        value: employment?.businessId || "",
        avatar: employment?.business?.logo || undefined,
      }));
    },
    [myEmployments]
  );

  useEffect(() => {
    const fetchLeaveCredits = async () => {
      if (!selectedBusiness) {
        return;
      }

      try {
        const credits = await getMyLeaveCredits(selectedBusiness);
        // console.log("[RequestLeave] leave credits:", credits);
      } catch (error: any) {
        toast.error(
          translateApiMessage(
            error?.message || "Failed to fetch leave credits"
          )
        );
      }
    };

    fetchLeaveCredits();
  }, [getMyLeaveCredits, selectedBusiness]);

  const selectedLeaveTypeLabel = useMemo(
    () =>
      LEAVE_TYPE_OPTIONS.find((item) => item.value === selectedLeaveType)
        ?.label || "Leave",
    [selectedLeaveType]
  );

  const selectedLeaveBalance = useMemo(() => {
    if (!leaveCredits) return null;
    const key = LEAVE_TYPE_TO_CREDIT_KEY[selectedLeaveType];
    const value = leaveCredits[key];
    return typeof value === "number" ? value : Number(value || 0);
  }, [leaveCredits, selectedLeaveType]);

  const selectedEmployment = useMemo(
    () =>
      (myEmployments || []).find(
        (employment) => employment?.businessId === selectedBusiness
      ) || null,
    [myEmployments, selectedBusiness]
  );

  const leaveBalanceTitle = useMemo(() => {
    if (!selectedBusiness) {
      return "Select a business to see leave balance";
    }

    if (leaveCreditsLoading) {
      return "Loading leave balance...";
    }

    return `You have ${selectedLeaveBalance ?? 0} ${selectedLeaveTypeLabel} leave remaining this month`;
  }, [
    leaveCreditsLoading,
    selectedBusiness,
    selectedLeaveBalance,
    selectedLeaveTypeLabel,
  ]);

  const durationDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diff = end.getTime() - start.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    return days > 0 ? days : 1;
  }, [startDate, endDate]);

  const formatYmd = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmitLeaveRequest = async () => {
    if (!selectedBusiness) {
      toast.error("Please select a business");
      throw new Error("missing_business");
    }

    if (!selectedEmployment?.id) {
      toast.error("Employment not found for selected business");
      throw new Error("missing_employment");
    }

    const normalizedStart = new Date(startDate);
    const normalizedEnd = new Date(endDate);
    normalizedStart.setHours(0, 0, 0, 0);
    normalizedEnd.setHours(0, 0, 0, 0);

    if (normalizedEnd.getTime() < normalizedStart.getTime()) {
      toast.error("End day must be after or equal to start day");
      throw new Error("invalid_date_range");
    }

    if (!leaveText.trim()) {
      toast.error("Please enter a reason");
      throw new Error("missing_reason");
    }

    const payload = {
      employmentId: selectedEmployment.id,
      type: "leave_request" as const,
      isHalfDay: isOn,
      startDate: formatYmd(normalizedStart),
      endDate: formatYmd(normalizedEnd),
      leaveType: selectedLeaveType,
      reason: leaveText.trim(),
    };

    const result = await createShiftRequest(payload);
    toast.success(
      translateApiMessage(result?.message || "shift_request_created")
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className='mx-5 pt-4'
        style={{ paddingBottom: insets.bottom }}
        onPressBack={() => router.back()}
        title="Request Leave"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView>
        {/* Section title */}
        <Text className="mx-5 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
          Select Dates
        </Text>

        {/* Duration + toggle */}
        <View className="mx-5 mt-[10px] flex-row justify-between items-center">
          <Text className="text-sm font-normal text-[#4FB2F3]">
            Duration: {durationDays} {durationDays > 1 ? "Days" : "Day"}
          </Text>

          <View className='flex-row items-center'>
            <Text className='text-sm font-proximanova-regular text-secondary'>Half Day</Text>
            <ToggleButton isOn={isOn} setIsOn={setIsOn} />
          </View>
        </View>

        <View className="flex-row justify-between gap-3 mx-5 mt-[10px]">
          <DatePicker
            className="flex-1"
            title="Start Day"
            value={startDate}
            onChange={setStartDate}
          />
          <DatePicker
            className="flex-1"
            title="End Day"
            value={endDate}
            onChange={setEndDate}
          />
        </View>


        {/* Select Leave Type start */}
        <View className="mx-5  mt-7">
          <SelectLeaveType
            value={selectedLeaveType}
            onChange={setSelectedLeaveType}
          />
        </View>
        {/* Select Leave Type end */}

        {/* Reason start */}
        <View className="mx-5 py-2 mt-2">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            Reason
          </Text>
          <TextInput
            value={leaveText}
            onChangeText={setLeaveText}
            placeholder="Mention any reason or notes for manager....."
            multiline
            textAlignVertical="top"
            className="font-proximanova-regular text-secondary border border-[#EEEEEE] mt-2.5 h-[100px] rounded-xl px-4 py-3 bg-white"
            keyboardType="default"
            autoCapitalize="none"
          />
        </View>
        {/* Reason End */}

        {/* Select business start */}
        <View className="mx-5 py-2 mt-2">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mb-2">
            Select Business
          </Text>
          {myEmploymentsLoading ? (
            <View className="mt-2 py-4 items-center border border-[#EEEEEE] rounded-[10px]">
              <ActivityIndicator size="small" />
            </View>
          ) : (
            <SelectDropdown
              placeholder="Choose Business"
              options={businessOptions}
              value={selectedBusiness}
              onSelect={(value: string) => setSelectedBusiness(value)}
            />
          )}
        </View>
        {/* Select business end */}

        {/* Remaining shick leave start */}
        <View className="mx-5  mt-8">
          <ActionCard
            title={leaveBalanceTitle}
            rightImage={require("@/assets/images/remaining-sick.png")}
            imageWidth={82}
            imageHeight={55}
            background={require("@/assets/images/chessboard-bg.svg")}
          />
        </View>
        {/* Remaining shick leave start */}
        <View className="mx-5 mt-5">
          <LeaveRequestModal
            onSubmit={handleSubmitLeaveRequest}
            loading={createShiftRequestLoading}
            disabled={createShiftRequestLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestLeave;

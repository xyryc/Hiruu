import ScreenHeader from "@/components/header/ScreenHeader";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import ActionCard from "@/components/ui/cards/ActionCard";
import SelectDropdown from "@/components/ui/dropdown/SelectDropdown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimePicker from "@/components/ui/inputs/TimePicker";
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
  const insets = useSafeAreaInsets();

  const [selectedBusiness, setSelectedBusiness] = useState<string>("");
  const [selectedLeaveType, setSelectedLeaveType] =
    useState<LeaveTypeValue>("sick");
  const myEmployments = useJobStore((state) => state.myEmployments);
  const myEmploymentsLoading = useJobStore((state) => state.myEmploymentsLoading);
  const getMyEmployments = useJobStore((state) => state.getMyEmployments);
  const getMyLeaveCredits = useShiftStore((state) => state.getMyLeaveCredits);
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

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* Header */}
      <ScreenHeader
        className='mx-5'
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
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
            Duration: {isOn ? "1" : "3"} Days
          </Text>
          <ToggleButton isOn={isOn} setIsOn={setIsOn} />
        </View>

        {/* Half Day Start */}
        <View className="mx-5 mt-[10px]">{isOn ? <DatePicker /> : ""}</View>
        <View
          className={`flex-row justify-between gap-3 mx-5 ${isOn && "mt-[15px]"}`}
        >
          {isOn ? (
            <>
              <TimePicker title="Start Time" />
              <TimePicker title="End Time" />
            </>
          ) : null}
        </View>
        {/* Half day end */}

        {/* 3 Day Leav Start */}
        <View className="flex-row justify-between gap-3 mx-5">
          {isOn ? (
            ""
          ) : (
            <>
              <DatePicker className="flex-1" title="Start Day" />
              <DatePicker className="flex-1" title="End Day" />
            </>
          )}
        </View>
        {/* 3 Day Leav End */}

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
          <LeaveRequestModal />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RequestLeave;

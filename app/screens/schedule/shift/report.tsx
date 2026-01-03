import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Dropdown from "@/components/ui/dropdown/DropDown";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ReportIssue = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [overtimeStart, setOvertimeStart] = useState("10:00Am");
  const [overtimeEnd, setOvertimeEnd] = useState("04:00pm");

  const [reason, setReason] = useState("");
  const issues = [
    { label: "System not working", value: "issue-a" },
    { label: "Overstaffed shift", value: "issue-b" },
    { label: "Missing team members on shift", value: "issue-c" },
    { label: "Wrong timezone display", value: "issue-d" },
    { label: "Building access problems", value: "issue-e" },
  ];

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
            Report a Shift-related Issue
          </Text>

          {/* Select Company */}
          <View className="mb-5">
            <Dropdown
              label="Issue Types"
              placeholder="Select an issue"
              options={issues}
              value={selectedIssue}
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
          onPress={() => setShowModal(true)}
        />
      </View>
    </SafeAreaView>
  );
};

export default ReportIssue;

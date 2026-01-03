import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Dropdown from "@/components/ui/dropdown/DropDown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import TimePicker from "@/components/ui/inputs/TimePicker";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CorrectionRequest = () => {
  const [reason, setReason] = useState("");
  const [selectedIssue, setSelectedIssue] = useState("");
  const issues = [
    { label: "Missed Punch", value: "Missed Punch" },
    { label: "Late arrival", value: "Late arrival" },
    { label: "Early Departure", value: "Early Departure" },
    { label: "Forget to Tap", value: "Forget to Tap" },
    { label: "Network Issues", value: "Network Issues" },
  ];

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
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
            Select Dats
          </Text>
          <View className="mx-5 mt-2.5">
            <DatePicker />
          </View>
          <View className={`flex-row justify-between gap-3 mx-5 mt-[15px]`}>
            <>
              <TimePicker title="Start Time" />
              <TimePicker title="End Time" />
            </>
          </View>
        </View>
        <View className="mb-5 mx-5 mt-4">
          <Dropdown
            label="Reason Type"
            placeholder="Select an issue"
            options={issues}
            value={selectedIssue}
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
      <PrimaryButton title="Send Request" className="mx-5 my-10" />
    </SafeAreaView>
  );
};

export default CorrectionRequest;

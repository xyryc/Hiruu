import ScreenHeader from "@/components/header/ScreenHeader";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import NotificationPreferencesInpute from "@/components/ui/dropdown/NotificationPreferencesInpute";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationPreferences = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isAll, setIsAll] = React.useState(false);
  const [isGeneral, setIsGeneral] = React.useState(false);
  const [isEmail, setIsEmail] = React.useState(false);
  const [isPush, setIsPush] = React.useState(false);

  const [general, setGeneral] = useState({
    shiftReminders: true,
    scheduleUpdates: false,
    newAssigned: false,
    shiftCancellation: false,
    managerMessages: false,
  });
  const [email, setEmail] = useState({
    DailyWeeklyReports: true,
    SubscriptionPaymentUpdates: false,
    LeaveRequestsStatus: false,
    ShiftCancellation: false,
    ImportantAnnouncements: false,
  });
  const [push, setPush] = useState({
    AppUpdatesTips: true,
    NewJobOpportunities: false,
    RatingreviewReceived: false,
    NewMessageAlerts: false,
    ImportantAnnouncements: false,
  });

  type GeneralKeys = keyof typeof general;
  type EmailKeys = keyof typeof email;
  type PushKeys = keyof typeof push;

  const toggleGeneral = (key: GeneralKeys) => {
    setGeneral((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const toggleEmail = (key: EmailKeys) => {
    setEmail((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const togglePush = (key: PushKeys) => {
    setPush((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const generalConfig: { key: GeneralKeys; label: string }[] = [
    { key: "shiftReminders", label: "Shift Reminders" },
    { key: "scheduleUpdates", label: "Schedule Updates" },
    { key: "newAssigned", label: "New Assigned" },
    { key: "shiftCancellation", label: "Shift Cancellation" },
    { key: "managerMessages", label: "Manager Messages" },
  ];
  const emailConfig: { key: EmailKeys; label: string }[] = [
    { key: "DailyWeeklyReports", label: "Daily/Weekly Reports" },
    {
      key: "SubscriptionPaymentUpdates",
      label: "Subscription Payment Updates",
    },
    { key: "LeaveRequestsStatus", label: "Leave Requests Status" },
    { key: "ShiftCancellation", label: "Shift Cancellation" },
    { key: "ImportantAnnouncements", label: "Important Announcements" },
  ];
  const pushConfig: { key: PushKeys; label: string }[] = [
    { key: "AppUpdatesTips", label: "App Updates / Tips" },
    {
      key: "NewJobOpportunities",
      label: "New Job Opportunities",
    },
    { key: "RatingreviewReceived", label: "Rating/review Received" },
    { key: "NewMessageAlerts", label: "App Updates / Tips" },
    { key: "ImportantAnnouncements", label: "Important Announcements" },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-14 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Notification Preferences"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} className="px-5">
        <View className="flex-row justify-between items-center mt-7">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            Enable All Notification
          </Text>
          <ToggleButton setIsOn={setIsAll} isOn={isAll} />
        </View>

        <NotificationPreferencesInpute
          title="General Notification"
          settingsConfig={generalConfig}
          settings={general}
          toggleSetting={toggleGeneral}
          isToggle={isGeneral}
          setIsToggle={setIsGeneral}
        />

        <NotificationPreferencesInpute
          title="Email Notification"
          settingsConfig={emailConfig}
          settings={email}
          toggleSetting={toggleEmail}
          isToggle={isEmail}
          setIsToggle={setIsEmail}
        />

        <NotificationPreferencesInpute
          title="Push Notification"
          settingsConfig={pushConfig}
          settings={push}
          toggleSetting={togglePush}
          isToggle={isPush}
          setIsToggle={setIsPush}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPreferences;

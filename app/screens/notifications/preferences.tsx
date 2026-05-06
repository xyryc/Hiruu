import ScreenHeader from "@/components/header/ScreenHeader";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import NotificationPreferencesInput from "@/components/ui/dropdown/NotificationPreferencesInput";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { EmailSettings, GeneralSettings, PushSettings } from "@/types";
import { translateApiMessage } from "@/utils/apiMessages";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const defaultGeneral: GeneralSettings = {
  shiftReminders: true,
  scheduleUpdates: true,
  newAssigned: true,
  shiftCancellation: true,
  managerMessages: true,
};

const defaultEmail: EmailSettings = {
  dailyWeeklyReports: true,
  subscriptionPaymentUpdates: true,
  leaveRequestStatus: true,
  shiftCancellation: true,
  importantAnnouncements: true,
};

const defaultPush: PushSettings = {
  newMessageAlerts: true,
  ratingReviewReceived: true,
  newJobOpportunities: true,
  appUpdatesTips: true,
};

const anyTrue = (record: Record<string, boolean>) =>
  Object.values(record).some(Boolean);

const setAllValues = <T extends Record<string, boolean>>(input: T, value: boolean): T =>
  Object.keys(input).reduce((acc, key) => {
    (acc as Record<string, boolean>)[key] = value;
    return acc;
  }, { ...input });

const NotificationPreferences = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const user = useAuthStore((state) => state.user as any);
  const updatePreferences = useProfileStore((state) => state.updatePreferences);

  const [isAll, setIsAll] = useState(false);
  const [isGeneral, setIsGeneral] = useState(false);
  const [isEmail, setIsEmail] = useState(false);
  const [isPush, setIsPush] = useState(false);
  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [email, setEmail] = useState<EmailSettings>(defaultEmail);
  const [push, setPush] = useState<PushSettings>(defaultPush);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedPayloadRef = useRef<string | null>(null);

  const notificationPayload = useMemo(
    () => ({
      enableAll: isAll,
      general: {
        enabled: isGeneral,
        ...general,
      },
      email: {
        enabled: isEmail,
        ...email,
      },
      push: {
        enabled: isPush,
        ...push,
      },
    }),
    [email, general, isAll, isEmail, isGeneral, isPush, push]
  );

  useEffect(() => {
    const notification = user?.appSettings?.notification || {};
    const generalFromApi: GeneralSettings = {
      shiftReminders: Boolean(
        notification?.general?.shiftReminders ?? defaultGeneral.shiftReminders
      ),
      scheduleUpdates: Boolean(
        notification?.general?.scheduleUpdates ?? defaultGeneral.scheduleUpdates
      ),
      newAssigned: Boolean(
        notification?.general?.newAssigned ?? defaultGeneral.newAssigned
      ),
      shiftCancellation: Boolean(
        notification?.general?.shiftCancellation ?? defaultGeneral.shiftCancellation
      ),
      managerMessages: Boolean(
        notification?.general?.managerMessages ?? defaultGeneral.managerMessages
      ),
    };

    const emailFromApi: EmailSettings = {
      dailyWeeklyReports: Boolean(
        notification?.email?.dailyWeeklyReports ?? defaultEmail.dailyWeeklyReports
      ),
      subscriptionPaymentUpdates: Boolean(
        notification?.email?.subscriptionPaymentUpdates ??
          defaultEmail.subscriptionPaymentUpdates
      ),
      leaveRequestStatus: Boolean(
        notification?.email?.leaveRequestStatus ?? defaultEmail.leaveRequestStatus
      ),
      shiftCancellation: Boolean(
        notification?.email?.shiftCancellation ?? defaultEmail.shiftCancellation
      ),
      importantAnnouncements: Boolean(
        notification?.email?.importantAnnouncements ??
          defaultEmail.importantAnnouncements
      ),
    };

    const pushFromApi: PushSettings = {
      newMessageAlerts: Boolean(
        notification?.push?.newMessageAlerts ?? defaultPush.newMessageAlerts
      ),
      ratingReviewReceived: Boolean(
        notification?.push?.ratingReviewReceived ?? defaultPush.ratingReviewReceived
      ),
      newJobOpportunities: Boolean(
        notification?.push?.newJobOpportunities ?? defaultPush.newJobOpportunities
      ),
      appUpdatesTips: Boolean(
        notification?.push?.appUpdatesTips ?? defaultPush.appUpdatesTips
      ),
    };

    const generalEnabled = Boolean(
      notification?.general?.enabled ?? anyTrue(generalFromApi)
    );
    const emailEnabled = Boolean(
      notification?.email?.enabled ?? anyTrue(emailFromApi)
    );
    const pushEnabled = Boolean(
      notification?.push?.enabled ?? anyTrue(pushFromApi)
    );
    const allEnabled = Boolean(
      notification?.enableAll ??
        (generalEnabled && emailEnabled && pushEnabled)
    );

    setGeneral(generalFromApi);
    setEmail(emailFromApi);
    setPush(pushFromApi);
    setIsGeneral(generalEnabled);
    setIsEmail(emailEnabled);
    setIsPush(pushEnabled);
    setIsAll(allEnabled);

    const initialPayload = {
      language: String(user?.appSettings?.language || "en"),
      timeZone: String(user?.appSettings?.timeZone || "UTC"),
      theme: String(user?.appSettings?.theme || "light"),
      smartAlert: Boolean(user?.appSettings?.smartAlert),
      smartAlertTime: Number(user?.appSettings?.smartAlertTime ?? 30),
      notification: {
        enableAll: allEnabled,
        general: { enabled: generalEnabled, ...generalFromApi },
        email: { enabled: emailEnabled, ...emailFromApi },
        push: { enabled: pushEnabled, ...pushFromApi },
      },
    };
    lastSyncedPayloadRef.current = JSON.stringify(initialPayload);
  }, [user?.appSettings]);

  useEffect(() => {
    const payload = {
      language: String(user?.appSettings?.language || "en"),
      timeZone: String(user?.appSettings?.timeZone || "UTC"),
      theme: String(user?.appSettings?.theme || "light"),
      smartAlert: Boolean(user?.appSettings?.smartAlert),
      smartAlertTime: Number(user?.appSettings?.smartAlertTime ?? 30),
      notification: notificationPayload,
    };

    const serializedPayload = JSON.stringify(payload);
    if (lastSyncedPayloadRef.current === serializedPayload) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updatePreferences(payload);
        lastSyncedPayloadRef.current = serializedPayload;
      } catch (error: any) {
        toast.error(
          translateApiMessage(
            error?.message || t("notificationsScreen.preferences.error.failedToUpdate")
          )
        );
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    notificationPayload,
    updatePreferences,
    user?.appSettings?.language,
    user?.appSettings?.smartAlert,
    user?.appSettings?.smartAlertTime,
    user?.appSettings?.theme,
    user?.appSettings?.timeZone,
    t,
  ]);

  type GeneralKeys = keyof GeneralSettings;
  type EmailKeys = keyof EmailSettings;
  type PushKeys = keyof PushSettings;

  const toggleGeneral = (key: GeneralKeys) => {
    setGeneral((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const generalEnabled = anyTrue(next);
      setIsGeneral(generalEnabled);
      setIsAll(generalEnabled && isEmail && isPush);
      return next;
    });
  };

  const toggleEmail = (key: EmailKeys) => {
    setEmail((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const emailEnabled = anyTrue(next);
      setIsEmail(emailEnabled);
      setIsAll(isGeneral && emailEnabled && isPush);
      return next;
    });
  };

  const togglePush = (key: PushKeys) => {
    setPush((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const pushEnabled = anyTrue(next);
      setIsPush(pushEnabled);
      setIsAll(isGeneral && isEmail && pushEnabled);
      return next;
    });
  };

  const handleToggleAll = (next: boolean) => {
    setIsAll(next);
    setIsGeneral(next);
    setIsEmail(next);
    setIsPush(next);
    setGeneral((prev) => setAllValues(prev, next));
    setEmail((prev) => setAllValues(prev, next));
    setPush((prev) => setAllValues(prev, next));
  };

  const handleToggleGeneralBlock = (next: boolean) => {
    setIsGeneral(next);
    setGeneral((prev) => setAllValues(prev, next));
    setIsAll(next && isEmail && isPush);
  };

  const handleToggleEmailBlock = (next: boolean) => {
    setIsEmail(next);
    setEmail((prev) => setAllValues(prev, next));
    setIsAll(isGeneral && next && isPush);
  };

  const handleTogglePushBlock = (next: boolean) => {
    setIsPush(next);
    setPush((prev) => setAllValues(prev, next));
    setIsAll(isGeneral && isEmail && next);
  };

  const generalConfig: { key: GeneralKeys; label: string }[] = [
    {
      key: "shiftReminders",
      label: t("notificationsScreen.preferences.generalSettings.shiftReminders"),
    },
    {
      key: "scheduleUpdates",
      label: t("notificationsScreen.preferences.generalSettings.scheduleUpdates"),
    },
    {
      key: "newAssigned",
      label: t("notificationsScreen.preferences.generalSettings.newAssigned"),
    },
    {
      key: "shiftCancellation",
      label: t("notificationsScreen.preferences.generalSettings.shiftCancellation"),
    },
    {
      key: "managerMessages",
      label: t("notificationsScreen.preferences.generalSettings.managerMessages"),
    },
  ];

  const emailConfig: { key: EmailKeys; label: string }[] = [
    {
      key: "dailyWeeklyReports",
      label: t("notificationsScreen.preferences.emailSettings.dailyWeeklyReports"),
    },
    {
      key: "subscriptionPaymentUpdates",
      label: t(
        "notificationsScreen.preferences.emailSettings.subscriptionPaymentUpdates"
      ),
    },
    {
      key: "leaveRequestStatus",
      label: t("notificationsScreen.preferences.emailSettings.leaveRequestStatus"),
    },
    {
      key: "shiftCancellation",
      label: t("notificationsScreen.preferences.emailSettings.shiftCancellation"),
    },
    {
      key: "importantAnnouncements",
      label: t("notificationsScreen.preferences.emailSettings.importantAnnouncements"),
    },
  ];

  const pushConfig: { key: PushKeys; label: string }[] = [
    {
      key: "newMessageAlerts",
      label: t("notificationsScreen.preferences.pushSettings.newMessageAlerts"),
    },
    {
      key: "ratingReviewReceived",
      label: t("notificationsScreen.preferences.pushSettings.ratingReviewReceived"),
    },
    {
      key: "newJobOpportunities",
      label: t("notificationsScreen.preferences.pushSettings.newJobOpportunities"),
    },
    {
      key: "appUpdatesTips",
      label: t("notificationsScreen.preferences.pushSettings.appUpdatesTips"),
    },
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
          title={t("notificationsScreen.preferences.title")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5">
        <View className="flex-row justify-between items-center mt-7">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
            {t("notificationsScreen.preferences.enableAll")}
          </Text>
          <ToggleButton setIsOn={handleToggleAll} isOn={isAll} />
        </View>

        <NotificationPreferencesInput
          title={t("notificationsScreen.preferences.generalTitle")}
          settingsConfig={generalConfig}
          settings={general}
          toggleSetting={toggleGeneral}
          isToggle={isGeneral}
          setIsToggle={handleToggleGeneralBlock}
        />

        <NotificationPreferencesInput
          title={t("notificationsScreen.preferences.emailTitle")}
          settingsConfig={emailConfig}
          settings={email}
          toggleSetting={toggleEmail}
          isToggle={isEmail}
          setIsToggle={handleToggleEmailBlock}
        />

        <NotificationPreferencesInput
          title={t("notificationsScreen.preferences.pushTitle")}
          settingsConfig={pushConfig}
          settings={push}
          toggleSetting={togglePush}
          isToggle={isPush}
          setIsToggle={handleTogglePushBlock}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationPreferences;

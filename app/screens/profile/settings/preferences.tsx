import ScreenHeader from "@/components/header/ScreenHeader";
import { AnimatedThemeToggle } from "@/components/ui/buttons/AnimatedThemeToggle";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import SettingsCard from "@/components/ui/cards/SettingsCard";
import LanguageSwitcherModal from "@/components/ui/modals/LanguageSwitcherModal";
import TimezoneSwitcherModal from "@/components/ui/modals/TimezoneSwitcherModal";
import { getTimezoneLabel } from "@/constants/timezones";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import { useJobStore, WeeklyAvailabilityItem } from "@/stores/jobStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useProfileStore } from "@/stores/profileStore";
import { translateApiMessage } from "@/utils/apiMessages";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SMART_ALERT_MIN_MINUTES = 5;
const SMART_ALERT_MAX_MINUTES = 180;
const SMART_ALERT_STEP_MINUTES = 5;

const clampSmartAlertMinutes = (value: number) => {
  const normalized = Math.round(value / SMART_ALERT_STEP_MINUTES) * SMART_ALERT_STEP_MINUTES;
  return Math.min(
    SMART_ALERT_MAX_MINUTES,
    Math.max(SMART_ALERT_MIN_MINUTES, normalized)
  );
};

const isValidWeeklyAvailability = (availability: WeeklyAvailabilityItem[]) =>
  availability.every((item) => {
    if (!item.isOpen) return true;
    if (!item.startTime || !item.endTime) return false;
    return item.startTime < item.endTime;
  });

const Preferences = () => {
  const user = useAuthStore((state) => state.user as any);
  const updatePreferences = useProfileStore((state) => state.updatePreferences);
  const [isOn, setIsOn] = useState(Boolean(user?.appSettings?.smartAlert));
  const [smartAlertTime, setSmartAlertTime] = useState(
    clampSmartAlertMinutes(Number(user?.appSettings?.smartAlertTime ?? 30))
  );
  const [isSoundOn, setIsSoundOn] = useState(false);
  const { theme, isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const timezone = usePreferencesStore((state) => state.timezone);
  const resetTimezoneToDevice = usePreferencesStore(
    (state) => state.resetTimezoneToDevice
  );
  const getMyJobProfile = useJobStore((state) => state.getMyJobProfile);
  const updateMyJobProfile = useJobStore((state) => state.updateMyJobProfile);
  const jobProfile = useJobStore((state) => state.jobProfile);
  const [pendingAvailability, setPendingAvailability] = useState<
    WeeklyAvailabilityItem[] | null
  >(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preferenceSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const lastSyncedPreferencesRef = useRef<{
    language: string;
    timeZone: string;
    theme: string;
    smartAlert: boolean;
    smartAlertTime: number;
  } | null>(null);

  // language
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

  useEffect(() => {
    if (!timezone) {
      resetTimezoneToDevice();
    }
  }, [resetTimezoneToDevice, timezone]);

  useEffect(() => {
    const nextPreferences = {
      language: String(user?.appSettings?.language || currentLanguage || "en"),
      timeZone: String(user?.appSettings?.timeZone || timezone || "UTC"),
      theme: String(
        theme ||
          user?.appSettings?.theme ||
          "light"
      ),
      smartAlert: Boolean(user?.appSettings?.smartAlert),
      smartAlertTime: clampSmartAlertMinutes(
        Number(user?.appSettings?.smartAlertTime ?? 30)
      ),
    };

    setIsOn(nextPreferences.smartAlert);
    setSmartAlertTime(nextPreferences.smartAlertTime);
    lastSyncedPreferencesRef.current = nextPreferences;
  }, [
    currentLanguage,
    theme,
    timezone,
    user?.appSettings?.language,
    user?.appSettings?.smartAlert,
    user?.appSettings?.smartAlertTime,
    user?.appSettings?.theme,
    user?.appSettings?.timeZone,
  ]);

  useFocusEffect(
    useCallback(() => {
      const loadJobProfile = async () => {
        try {
          await getMyJobProfile();
          // console.log(
          //   "weekly schedule integration check:",
          //   data?.weeklyAvailability ?? null
          // );
        } catch (error) {
          console.error("weekly schedule integration error:", error);
        }
      };

      loadJobProfile();
    }, [getMyJobProfile])
  );

  useEffect(() => {
    if (!pendingAvailability) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (!isValidWeeklyAvailability(pendingAvailability)) {
          return;
        }

        await updateMyJobProfile({
          weeklyAvailability: pendingAvailability,
        });
      } catch {
        console.error("weekly schedule autosave error:", error);
      }
    }, 700);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [pendingAvailability, updateMyJobProfile]);

  useEffect(() => {
    const language = String(currentLanguage || user?.appSettings?.language || "en");
    const timeZone = String(timezone || user?.appSettings?.timeZone || "UTC");
    const themeValue = String(
      theme || user?.appSettings?.theme || "light"
    );

    const payload = {
      language,
      timeZone,
      theme: themeValue,
      smartAlert: isOn,
      smartAlertTime,
    };

    if (
      lastSyncedPreferencesRef.current &&
      lastSyncedPreferencesRef.current.language === payload.language &&
      lastSyncedPreferencesRef.current.timeZone === payload.timeZone &&
      lastSyncedPreferencesRef.current.theme === payload.theme &&
      lastSyncedPreferencesRef.current.smartAlert === payload.smartAlert &&
      lastSyncedPreferencesRef.current.smartAlertTime === payload.smartAlertTime
    ) {
      return;
    }

    if (preferenceSaveTimeoutRef.current) {
      clearTimeout(preferenceSaveTimeoutRef.current);
    }

    preferenceSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updatePreferences(payload);
        lastSyncedPreferencesRef.current = payload;
      } catch (error: any) {
        toast.error(
          translateApiMessage(error?.message || "Failed to update preferences")
        );
      }
    }, 700);

    return () => {
      if (preferenceSaveTimeoutRef.current) {
        clearTimeout(preferenceSaveTimeoutRef.current);
      }
    };
  }, [
    currentLanguage,
    isOn,
    smartAlertTime,
    theme,
    timezone,
    updatePreferences,
    user?.appSettings?.language,
    user?.appSettings?.theme,
    user?.appSettings?.timeZone,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title={t("user.profile.appPreferences")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-5">
        {/* settings card */}
        <SettingsCard
          fullTouchable={false}
          subtitle={currentLanguage.toUpperCase()}
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<Ionicons name="language-outline" size={24} color="#11293A" />}
          className="mt-8"
          text={t("user.profile.language")}
          arrowIcon={
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => setShowModal(true)}
            >
              <Entypo name="chevron-thin-down" size={20} color="black" />
            </TouchableOpacity>
          }
        />
        <LanguageSwitcherModal
          visible={showModal}
          onClose={() => setShowModal(false)}
        />

        <SettingsCard
          fullTouchable={false}
          subtitle={t("user.profile.smartAlertTimeSubtitle", {
            minutes: smartAlertTime,
          })}
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<Ionicons name="alarm-outline" size={24} color="black" />}
          className="mt-4"
          text={t("user.profile.smartAlert")}
          arrowIcon={
            <ToggleButton isOn={isOn} setIsOn={() => setIsOn(!isOn)} />
          }
        />

        {isOn ? (
          <SettingsCard
            fullTouchable={false}
            icon={<Ionicons name="time-outline" size={24} color="black" />}
            className="mt-4"
            text={t("user.profile.smartAlertTime")}
            subtitle={t("user.profile.smartAlertTimeSubtitle", {
              minutes: smartAlertTime,
            })}
            arrowIcon={
              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  className={`h-7 w-7 rounded-full items-center justify-center border ${
                    smartAlertTime <= SMART_ALERT_MIN_MINUTES
                      ? "border-[#E5E5E5] bg-[#F5F5F5]"
                      : "border-[#D8D8D8] bg-white"
                  }`}
                  disabled={smartAlertTime <= SMART_ALERT_MIN_MINUTES}
                  onPress={() =>
                    setSmartAlertTime((prev) =>
                      clampSmartAlertMinutes(prev - SMART_ALERT_STEP_MINUTES)
                    )
                  }
                >
                  <Entypo
                    name="minus"
                    size={14}
                    color={
                      smartAlertTime <= SMART_ALERT_MIN_MINUTES
                        ? "#BDBDBD"
                        : "#111"
                    }
                  />
                </TouchableOpacity>
                <Text className="text-primary dark:text-dark-primary text-sm font-proximanova-semibold min-w-[40px] text-center">
                  {smartAlertTime}m
                </Text>
                <TouchableOpacity
                  className={`h-7 w-7 rounded-full items-center justify-center border ${
                    smartAlertTime >= SMART_ALERT_MAX_MINUTES
                      ? "border-[#E5E5E5] bg-[#F5F5F5]"
                      : "border-[#D8D8D8] bg-white"
                  }`}
                  disabled={smartAlertTime >= SMART_ALERT_MAX_MINUTES}
                  onPress={() =>
                    setSmartAlertTime((prev) =>
                      clampSmartAlertMinutes(prev + SMART_ALERT_STEP_MINUTES)
                    )
                  }
                >
                  <Entypo
                    name="plus"
                    size={14}
                    color={
                      smartAlertTime >= SMART_ALERT_MAX_MINUTES
                        ? "#BDBDBD"
                        : "#111"
                    }
                  />
                </TouchableOpacity>
              </View>
            }
          />
        ) : null}

        <SettingsCard
          fullTouchable={false}
          subtitle={`${getTimezoneLabel(timezone)} (${timezone})`}
          icon={<AntDesign name="global" size={24} color="black" />}
          className="mt-4"
          text={t("user.profile.timeZone")}
          arrowIcon={
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => setShowTimezoneModal(true)}
            >
              <Entypo name="chevron-thin-down" size={20} color="black" />
            </TouchableOpacity>
          }
        />
        <TimezoneSwitcherModal
          visible={showTimezoneModal}
          onClose={() => setShowTimezoneModal(false)}
        />

        <SettingsCard
          fullTouchable={false}
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<Ionicons name="volume-high-outline" size={24} color="black" />}
          className="mt-4"
          text={t("user.profile.appSound")}
          arrowIcon={
            <ToggleButton
              isOn={isSoundOn}
              setIsOn={() => setIsSoundOn(!isSoundOn)}
            />
          }
        />

        <SettingsCard
          fullTouchable={false}
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={
            <MaterialCommunityIcons
              name="water-opacity"
              size={24}
              color="black"
            />
          }
          className="mt-4"
          text={t("user.profile.themeMode")}
          subtitle={t("user.profile.lightMode")}
          arrowIcon={<AnimatedThemeToggle />}
        />

        <SettingsCard
          fullTouchable={false}
          icon={
            <MaterialCommunityIcons
              name="calendar-multiselect-outline"
              size={24}
              color="black"
            />
          }
          className="mt-4 pb-4"
          text={t("user.profile.availableWorkingDays")}
          arrowIcon={
            <TouchableOpacity
              className="h-9 w-9 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => setSchedule(!schedule)}
            >
              <Entypo
                name={schedule ? "chevron-thin-up" : "chevron-thin-down"}
                size={16}
                color="black"
              />
            </TouchableOpacity>
          }
          border={true}
        />

        {schedule && (
          <WeeklySchedule
            availability={jobProfile?.weeklyAvailability}
            onChange={setPendingAvailability}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Preferences;

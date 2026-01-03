import ScreenHeader from "@/components/header/ScreenHeader";
import { AnimatedThemeToggle } from "@/components/ui/buttons/AnimatedThemeToggle";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import WeeklySchedule from "@/components/ui/buttons/WeeklySchedule";
import SettingsCard from "@/components/ui/cards/SettingsCard";
import LanguageSwitcherModal from "@/components/ui/modals/LanguageSwitcherModal";
import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const preferences = () => {
  const [isOn, setIsOn] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showModal, setShowModal] = useState(false);
  const [schedule, setSchedule] = useState(false);

  // language
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;

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
          click={() => setShowModal(true)}
          subtitle={currentLanguage.toUpperCase()}
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<Ionicons name="language-outline" size={24} color="#11293A" />}
          className="mt-8"
          text={t("user.profile.appPreferences")}
          arrowIcon={
            <Entypo name="chevron-thin-down" size={20} color="black" />
          }
        />
        <LanguageSwitcherModal
          visible={showModal}
          onClose={() => setShowModal(false)}
        />

        <SettingsCard
          subtitle="Notify me 3 hours before shift"
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<Ionicons name="alarm-outline" size={24} color="black" />}
          className="mt-4"
          text="Smart Alarm"
          arrowIcon={
            <ToggleButton isOn={isOn} setIsOn={() => setIsOn(!isOn)} />
          }
        />

        <SettingsCard
          subtitle="Asia/kolkata"
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<AntDesign name="global" size={24} color="black" />}
          className="mt-4"
          text="Time Zone"
          arrowIcon={
            <Entypo name="chevron-thin-down" size={20} color="black" />
          }
        />

        <SettingsCard
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={<Ionicons name="volume-high-outline" size={24} color="black" />}
          className="mt-4"
          text="App Sound"
          arrowIcon={
            <ToggleButton
              isOn={isSoundOn}
              setIsOn={() => setIsSoundOn(!isSoundOn)}
            />
          }
        />

        <SettingsCard
          //   click={() => router.push("/(user)/profile/settings/preferences")}
          icon={
            <MaterialCommunityIcons
              name="water-opacity"
              size={24}
              color="black"
            />
          }
          className="mt-4"
          text="Theme Mode"
          subtitle="Light Mode"
          arrowIcon={<AnimatedThemeToggle />}
        />

        <SettingsCard
          click={() => setSchedule(!schedule)}
          icon={
            <MaterialCommunityIcons
              name="calendar-multiselect-outline"
              size={24}
              color="black"
            />
          }
          className="mt-4 pb-4"
          text="Available Working Days"
          arrowIcon={
            <Entypo
              name={schedule ? "chevron-thin-up" : "chevron-thin-down"}
              size={16}
              color="black"
            />
          }
          border={true}
        />

        {schedule && <WeeklySchedule />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default preferences;

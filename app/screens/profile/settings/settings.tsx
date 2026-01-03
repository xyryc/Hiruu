import ScreenHeader from "@/components/header/ScreenHeader";
import NamePlateCard from "@/components/ui/cards/NamePlateCard";
import SettingsCard from "@/components/ui/cards/SettingsCard";
import LogoutDeletModal from "@/components/ui/modals/LogoutDeletModal";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Settings = () => {
  const delImg = require("@/assets/images/trash.svg");
  const logOutImg = require("@/assets/images/Logout.svg");
  const [isModal, setIsModal] = useState(false);
  const [data, setData] = useState<{
    img: any;
    title: string;
    subtitle: string;
    color?: string;
    border?: string;
    buttonName?: string;
    buttonColor?: string;
  }>();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const delData = {
    title: "Are you sure you want to delete your account?",
    subtitle:
      "Once deleted, all your data including shifts, chats, and profile will be permanently removed.",
    img: delImg,
    color: "#F34F4F26",
    border: "#F34F4F",
    buttonName: "Delete",
    buttonColor: "#F34F4F",
  };

  const logOutData = {
    title: "Are you sure you want to Logout your account?",
    subtitle:
      "You will be signed out from your account. Your data will remain safe and intact.",
    img: logOutImg,
    color: "#E5F4FD",
    border: "#4FB2F3",
    buttonName: "Logout",
    buttonColor: "#11293A",
  };

  // console.log(data);

  const handleClick = (e: string) => {
    if (e === "delete") {
      setData(delData);
      setIsModal(true);
    } else if (e === "logout") {
      setData(logOutData);
      setIsModal(true);
    }
  };

  // language
  const { t } = useTranslation();

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title={t("user.profile.settings")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          marginHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {/* Create Business Profile */}
        <View className="bg-[#FCF7E4] px-3 py-4 mt-8 rounded-xl flex-row justify-between border border-[#EEEEEE]">
          <View>
            <Text className="text-lg font-proximanova-semibold text-[#11293A]">
              Grow and Manage All Your
            </Text>
            <Text className="text-lg font-proximanova-semibold text-[#11293A]">
              Businesses Effortlessly
            </Text>
            <TouchableOpacity className="bg-[#11293A] rounded-full py-1.5 px-4 mt-5">
              <Text className="text-sm font-proximanova-semibold text-[#ffffff] text-center">
                Create Business Profile
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Image
              source={require("@/assets/images/guy-in-chair.svg")}
              contentFit="contain"
              style={{ height: 110, width: 104 }}
            />
          </View>
        </View>

        {/* Name plate */}
        <View className="mt-8">
          <NamePlateCard variant="variant3" />
        </View>

        {/* settings card */}
        <SettingsCard
          click={() => router.push("/screens/profile/settings/preferences")}
          icon={<Ionicons name="language-outline" size={24} color="#11293A" />}
          className="mt-8"
          text={t("user.profile.appPreferences")}
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />

        <SettingsCard
          click={() =>
            router.push("/screens/profile/settings/subscription/subscription")
          }
          icon={
            <MaterialCommunityIcons
              name="crown-outline"
              size={24}
              color="black"
            />
          }
          text={t("user.profile.subscription")}
          className="mt-5"
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />

        <SettingsCard
          click={() => router.push("/screens/profile/settings/refer")}
          icon={<Ionicons name="wallet-outline" size={24} color="#11293A" />}
          text={t("user.profile.referAndEarn")}
          className="mt-5"
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />

        <SettingsCard
          click={() => router.push("/screens/profile/settings/privacy")}
          icon={<SimpleLineIcons name="lock" size={24} color="black" />}
          text={t("user.profile.privacyPolicy")}
          className="mt-5"
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />

        <SettingsCard
          click={() => router.push("/screens/profile/settings/terms")}
          icon={<Ionicons name="calendar-outline" size={24} color="black" />}
          text={t("user.profile.termsAndConditions")}
          className="mt-5"
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />
        <SettingsCard
          click={() => router.push("/screens/profile/settings/support")}
          icon={<FontAwesome name="handshake-o" size={20} color="#111111" />}
          text={t("user.profile.helpAndSupport")}
          className="mt-5"
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />
        <SettingsCard
          click={() => router.push("/screens/profile/settings/info")}
          icon={<SimpleLineIcons name="info" size={22} color="black" />}
          text={t("user.profile.appInfo")}
          className="mt-5"
          arrowIcon={
            <Entypo name="chevron-thin-right" size={20} color="#111111" />
          }
        />

        <TouchableOpacity onPress={() => handleClick("delete")}>
          <Text className="text-[#F34F4F] font-proximanova-bold mt-5">
            {t("user.profile.deleteAccount")}
          </Text>
        </TouchableOpacity>

        <View className="border-b-2 border-[#EEEEEE] mt-5" />
        <TouchableOpacity onPress={() => handleClick("logout")}>
          <Text className="text-[#4FB2F3] font-proximanova-bold mt-5">
            {t("user.profile.logout")}
          </Text>
        </TouchableOpacity>

        <LogoutDeletModal
          visible={isModal}
          onClose={() => setIsModal(false)}
          data={data}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

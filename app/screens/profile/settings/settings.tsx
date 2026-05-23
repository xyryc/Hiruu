import ScreenHeader from "@/components/header/ScreenHeader";
import BasicNameplateCard from "@/components/ui/cards/BasicNameplateCard";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import SettingsCard from "@/components/ui/cards/SettingsCard";
import LogoutDeleteModal from "@/components/ui/modals/LogoutDeleteModal";
import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const Settings = () => {
  const logOutImg = require("@/assets/images/logout.svg");
  const [isModal, setIsModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const getProfile = useProfileStore((state) => state.getProfile);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
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
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  // language
  const { t } = useTranslation();

  const logOutData = {
    title: t("user.profile.logoutTitle"),
    subtitle: t("user.profile.logoutSubtitle"),
    img: logOutImg,
    color: "#E5F4FD",
    border: "#4FB2F3",
    buttonName: t("user.profile.logoutAction"),
    buttonColor: "#11293A",
  };
  const isBusinessProfileMode = selectedBusinesses.length > 0;


  const loadProfile = useCallback(async () => {
    try {
      const result = await getProfile();
      setProfileData(result?.data || null);
    } catch {
      // Keep previous snapshot if refresh fails to avoid partial/blank flashes.
    }
  }, [getProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const addressValue =
    typeof profileData?.address === "string"
      ? profileData.address
      : profileData?.address?.address || "Location unavailable";
  const equippedNameplate = profileData?.appearance?.nameplate;
  const isFullyVerified = Boolean(
    profileData?.isEmailVerified && profileData?.isNumberVerified
  );

  const handleClick = (e: string) => {
    if (e === "logout") {
      setData(logOutData);
      setIsModal(true);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
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
        <View className="bg-[#FCF7E4] px-3 py-4 mt-5 rounded-xl flex-row justify-between border border-[#EEEEEE]">
          <View>
            <Text className="text-lg font-proximanova-semibold text-[#11293A]">
              {t("user.profile.growBusinessLine1")}
            </Text>
            <Text className="text-lg font-proximanova-semibold text-[#11293A]">
              {t("user.profile.growBusinessLine2")}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/business-setup")}
              className="bg-[#11293A] rounded-full py-1.5 px-4 mt-7">
              <Text className="text-sm font-proximanova-semibold text-[#ffffff] text-center">
                {t("user.profile.createBusinessProfile")}
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
        <View className="mt-5">
          {equippedNameplate?.metadata ? (
            <DynamicNameplateCard
              metadata={equippedNameplate.metadata}
              mode="redeem"
              preview={{
                avatarUrl: profileData?.avatar,
                name: profileData?.name || profileData?.email || "User",
                location: addressValue,
                rating: profileData?.rating ?? 0,
                isVerified: isFullyVerified,
              }}
            />
          ) : (
            <BasicNameplateCard
              avatarUrl={profileData?.avatar}
              name={profileData?.name || profileData?.email || "User"}
              location={addressValue}
              rating={profileData?.rating ?? 0}
              isVerified={isFullyVerified}
            />
          )}
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

        {isBusinessProfileMode ? (
          <>
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/settings/close-business")}
            >
              <Text className="text-[#F34F4F] font-proximanova-bold mt-5">
                {t("user.profile.closeBusiness")}
              </Text>
            </TouchableOpacity>

            <View className="border-b-2 border-[#EEEEEE] mt-5" />
          </>
        ) : null}

        <TouchableOpacity
          onPress={() => router.push("/screens/profile/settings/delete-account")}
        >
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

        <LogoutDeleteModal
          visible={isModal}
          onClose={() => setIsModal(false)}
          data={data}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

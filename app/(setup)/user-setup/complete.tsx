import TitleHeader from "@/components/header/TitleHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useProfileStore } from "@/stores/profileStore";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const Complete = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { setProfileComplete } = useProfileStore();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Mark profile setup as complete
    await setProfileComplete(true);

    // route to home
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1" edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#BDE4F9" />

      <LinearGradient
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <View className="px-5 pt-12 flex-1 justify-center">
          <Image
            source={require("@/assets/images/complete.svg")}
            style={{
              width: 218,
              height: 168,
              marginHorizontal: "auto",
              marginBottom: 30,
            }}
          />

          <TitleHeader
            title={t("user.setup.profileReadyTitle")}
            subtitle={t("user.setup.profileReadySubtitle")}
          />
        </View>

        <View className="px-5 pb-4">
          <PrimaryButton
            onPress={handleComplete}
            className="w-full"
            title={t("user.setup.goToProfile")}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Complete;

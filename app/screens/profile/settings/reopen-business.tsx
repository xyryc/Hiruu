import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import LogoutDeleteModal from "@/components/ui/modals/LogoutDeleteModal";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import axiosInstance from "@/utils/axios";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ReopenBusiness = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const { businessId } = useLocalSearchParams<{ businessId?: string }>();
  const user = useAuthStore((state) => state.user);
  const getProfile = useProfileStore((state) => state.getProfile);
  const getMyEmployments = useBusinessStore((state) => state.getMyEmployments);
  const setSelectedBusinesses = useBusinessStore((state) => state.setSelectedBusinesses);

  const [profileData, setProfileData] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [isWarningChecked, setIsWarningChecked] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getProfile()
      .then((result) => {
        if (!isMounted) return;
        setProfileData(result?.data || null);
      })
      .catch(() => {
        // Keep previous data snapshot to avoid partial/blank flashes on iOS.
      });
    return () => {
      isMounted = false;
    };
  }, [getProfile]);

  const targetBusiness = useMemo(() => {
    const ownedBusinesses = Array.isArray(profileData?.ownedBusinesses)
      ? profileData.ownedBusinesses
      : [];
    if (businessId) {
      const selected = ownedBusinesses.find(
        (item: any) => item?.id === businessId
      );
      if (selected) return selected;
    }
    return null;
  }, [businessId, profileData?.ownedBusinesses]);

  const canProceed = password.trim().length > 0 && isWarningChecked;

  const reopenModalData = useMemo(
    () => ({
      title: targetBusiness?.name || t("user.profile.reopenBusiness"),
      subtitle: t("user.profile.reopenBusinessSubtitle"),
      img: targetBusiness?.logo
        ? { uri: targetBusiness.logo }
        : require("@/assets/images/placeholder.png"),
      roundImage: true,
      imageSize: 96,
      color: "#E5F4FD",
      border: "#4FB2F3",
      buttonName: t("user.profile.reopenBusinessAction"),
      buttonColor: "#11293A",
    }),
    [t, targetBusiness?.logo, targetBusiness?.name]
  );

  const handleConfirmReopenBusiness = async () => {
    if (!targetBusiness?.id) {
      toast.error(t("user.profile.noBusinessToReopen"));
      return;
    }

    try {
      setIsReopening(true);
      const response = await axiosInstance.patch(`/business/${targetBusiness.id}/reopen`, {
        password: password.trim(),
      });
      const result = response?.data;

      if (result?.success === false) {
        throw new Error(result?.message || "UNKNOWN_ERROR");
      }

      toast.success(
        t(`api.${result?.message || "business_reopened_successfully"}`, {
          defaultValue: "Business reopened successfully",
        })
      );
      setShowReopenModal(false);
      setSelectedBusinesses([targetBusiness.id]);
      await Promise.all([
        getMyEmployments(true).catch(() => undefined),
        getProfile().catch(() => undefined),
      ]);
      router.replace("/(tabs)/business-profile");
    } catch (error: any) {
      const messageKey =
        error?.response?.data?.message || error?.message || "UNKNOWN_ERROR";
      toast.error(
        t(`api.${messageKey}`, {
          defaultValue: messageKey,
        })
      );
    } finally {
      setIsReopening(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
            title={t("user.profile.reopenBusiness")}
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
          />
        </View>

        <ScrollView
          className="mx-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mt-7">
            <Image
              source={
                targetBusiness?.logo
                  ? { uri: targetBusiness.logo }
                  : require("@/assets/images/placeholder.png")
              }
              contentFit="cover"
              style={{ width: 90, height: 90, borderRadius: 999 }}
            />
            <Text className="mt-3 font-proximanova-semibold text-lg text-primary dark:text-dark-primary text-center">
              {targetBusiness?.name || t("user.profile.reopenBusiness")}
            </Text>
          </View>

          <View className="mt-6 px-4 py-4 border border-[#EEEEEE] dark:border-dark-border rounded-xl bg-white dark:bg-dark-border gap-3">
            <View>
              <Text className="font-proximanova-semibold text-xs text-secondary dark:text-dark-secondary">
                {t("user.profile.businessNameLabel")}
              </Text>
              <Text className="mt-1 font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                {targetBusiness?.name || t("common.notSet")}
              </Text>
            </View>

            <View>
              <Text className="font-proximanova-semibold text-xs text-secondary dark:text-dark-secondary">
                {t("user.profile.businessEmailLabel")}
              </Text>
              <Text className="mt-1 font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                {targetBusiness?.email || t("common.notSet")}
              </Text>
            </View>

            <View>
              <Text className="font-proximanova-semibold text-xs text-secondary dark:text-dark-secondary">
                {t("user.profile.userEmailLabel")}
              </Text>
              <Text className="mt-1 font-proximanova-regular text-sm text-primary dark:text-dark-primary">
                {user?.email || t("common.notSet")}
              </Text>
            </View>
          </View>

          <View className="mt-8">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mb-2.5">
              {t("user.profile.password", { defaultValue: "Password" })}
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder={t("user.profile.password", {
                defaultValue: "Password",
              })}
              placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
              className="w-full px-4 py-3 bg-white dark:bg-dark-border border border-[#EEEEEE] dark:border-dark-border rounded-[10px] text-primary dark:text-dark-primary text-sm"
            />
          </View>

          <TouchableOpacity
            onPress={() => setIsWarningChecked((prev) => !prev)}
            className="flex-row items-start mt-6"
            activeOpacity={0.8}
          >
            <Ionicons
              name={isWarningChecked ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={isWarningChecked ? "#4FB2F3" : isDark ? "#CBD5E1" : "#7A7A7A"}
            />
            <Text className="ml-3 flex-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {t("user.profile.reopenBusinessWarning")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="absolute bottom-10 left-5 right-5">
          <PrimaryButton
            title={t("user.profile.reopenBusinessAction")}
            onPress={() => setShowReopenModal(true)}
            disabled={!canProceed || isReopening}
            loading={isReopening}
            className={`${!canProceed || isReopening ? "opacity-50" : ""}`}
          />
        </View>

        <LogoutDeleteModal
          visible={showReopenModal}
          onClose={() => setShowReopenModal(false)}
          data={reopenModalData}
          onConfirm={handleConfirmReopenBusiness}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ReopenBusiness;

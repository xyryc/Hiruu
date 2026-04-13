import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import LogoutDeleteModal from "@/components/ui/modals/LogoutDeleteModal";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
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

const DeleteAccount = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { deleteMe, isLoading } = useProfileStore();

  const [password, setPassword] = useState("");
  const [isWarningChecked, setIsWarningChecked] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const deleteModalData = useMemo(
    () => ({
      title: t("user.profile.deleteAccountTitle"),
      subtitle: t("user.profile.deleteAccountSubtitle"),
      img: require("@/assets/images/trash.svg"),
      color: "#F34F4F26",
      border: "#F34F4F",
      buttonName: t("user.profile.deleteAction"),
      buttonColor: "#F34F4F",
    }),
    [t]
  );

  const canProceed = password.trim().length > 0 && isWarningChecked;

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
            title={t("user.profile.deleteAccount")}
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
                user?.avatar
                  ? { uri: user.avatar }
                  : require("@/assets/images/placeholder.png")
              }
              contentFit="cover"
              style={{ width: 90, height: 90, borderRadius: 999 }}
            />
            <Text className="mt-3 font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              {user?.name || user?.email || "User"}
            </Text>
            {user?.email ? (
              <Text className="mt-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {user.email}
              </Text>
            ) : null}
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
              color={isWarningChecked ? "#F34F4F" : isDark ? "#CBD5E1" : "#7A7A7A"}
            />
            <Text className="ml-3 flex-1 font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {t("user.profile.deleteAccountSubtitle")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="absolute bottom-10 left-5 right-5">
          <PrimaryButton
            title={t("user.profile.deleteAction")}
            onPress={() => setShowDeleteModal(true)}
            disabled={!canProceed || isLoading}
            loading={isLoading}
            className={`${!canProceed || isLoading ? "opacity-50" : ""}`}
          />
        </View>

        <LogoutDeleteModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          data={deleteModalData}
          onConfirm={async () => {
            try {
              const result = await deleteMe(password.trim());
              const messageKey = result?.message || "auth_account_deleted";
              toast.success(
                t(`api.${messageKey}`, {
                  defaultValue: messageKey,
                })
              );

              setShowDeleteModal(false);
              await logout();
              router.replace("/(auth)/login");
            } catch (error: any) {
              const messageKey = error?.message || "UNKNOWN_ERROR";
              toast.error(
                t(`api.${messageKey}`, {
                  defaultValue: messageKey,
                })
              );
            }
          }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default DeleteAccount;

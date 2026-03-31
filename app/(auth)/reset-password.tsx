import TitleHeader from "@/components/header/TitleHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useAuthStore } from "@/stores/authStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import React, { useState } from "react";
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ResetPassword = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email || "").trim().toLowerCase();

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, isLoading, clearError } = useAuthStore();

  const handleResetPassword = async () => {
    clearError();

    if (!email || !otp || !password || !confirmPassword) {
      Alert.alert(t("common.error"), t("validation.fillAllFields"));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("common.error"), t("validation.passwordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t("common.error"), "Passwords do not match");
      return;
    }

    try {
      const result = await resetPassword({
        email,
        otp: otp.trim(),
        password,
      });

      if (result?.success) {
        toast.success(translateApiMessage(result?.message || "password_reset_successful"));
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      const messageKey = error?.message || "UNKNOWN_ERROR";
      toast.error(translateApiMessage(messageKey));
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient colors={["#BDE4F9", "#F7F7F7"]} locations={[0, 0.38]}>
        <ScrollView className="px-5 h-screen" contentContainerClassName="pb-10">
          <TitleHeader
            className="mt-[71px] mb-7"
            title="Reset Password"
            subtitle="Enter the OTP sent to your email and set a new password."
          />

          <View className="relative mb-4">
            <View className="absolute left-4 top-3 z-10">
              <Ionicons name="key-outline" size={24} color="#4FB2F3" />
            </View>
            <TextInput
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              className="w-full pl-12 pr-4 py-4 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A]"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View className="relative mb-4">
            <View className="absolute left-4 top-3 z-10">
              <Ionicons name="lock-closed-outline" size={24} color="#4FB2F3" />
            </View>
            <TextInput
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="w-full pl-12 pr-12 py-4 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A]"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4"
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#7A7A7A"
              />
            </TouchableOpacity>
          </View>

          <View className="relative mb-4">
            <View className="absolute left-4 top-3 z-10">
              <Ionicons name="lock-closed-outline" size={24} color="#4FB2F3" />
            </View>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              className="w-full pl-12 pr-12 py-4 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A]"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-4"
            >
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#7A7A7A"
              />
            </TouchableOpacity>
          </View>

          <PrimaryButton
            className="w-full mt-2"
            title={isLoading ? "Resetting..." : "Reset Password"}
            onPress={handleResetPassword}
            loading={isLoading}
          />
        </ScrollView>

        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-3 left-5 z-10"
        >
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ResetPassword;


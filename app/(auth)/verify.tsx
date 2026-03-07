import TitleHeader from "@/components/header/TitleHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useAuthStore } from "@/stores/authStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Verify = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const didRequestInitialCode = useRef(false);

  // Create refs for each input
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const { verifyAccount, requestVerifyAccount, resendOTP, isLoading, clearError } = useAuthStore();
  const source = params.source === "login" ? "login" : "signup";
  const email = typeof params.email === "string" ? params.email : "";
  const phoneNumber = typeof params.phoneNumber === "string" ? params.phoneNumber : "";
  const countryCode = typeof params.countryCode === "string" ? params.countryCode : "+1";

  const getVerificationType = () => {
    const hasEmail = Boolean(email);
    const hasPhone = Boolean(phoneNumber);

    if (hasEmail && hasPhone) return "both" as const;
    if (hasPhone) return "phone" as const;
    return "email" as const;
  };

  useEffect(() => {
    if (source !== "login") return;
    if (didRequestInitialCode.current) return;
    didRequestInitialCode.current = true;

    requestVerifyAccount({ type: getVerificationType() }).catch((error) => {
      const message = error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    });
  }, [requestVerifyAccount, source]);

  const handleVerify = async () => {
    if (!isOtpComplete) return;

    clearError();
    const otpCode = otp.join("");

    try {
      const payload = {
        code: otpCode,
        ...(email
          ? { email }
          : {
              phoneNumber,
              countryCode,
            }),
      };

      const result = await verifyAccount(payload);

      if (result?.success) {
        if (source === "login") {
          router.replace("/(tabs)/home");
          return;
        }

        router.replace("/(setup)/user-setup/progress");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    }
  };

  const handleResendOTP = async () => {
    try {
      const result =
        source === "login"
          ? await requestVerifyAccount({ type: getVerificationType() })
          : await resendOTP(
              email
                ? { email }
                : {
                    phoneNumber,
                    countryCode,
                  }
            );

      if (result?.success) {
        toast.success(translateApiMessage(result?.message || "otp_sent_email"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("common.error");
      toast.error(message);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient colors={["#BDE4F9", "#F7F7F7"]} locations={[0, 0.38]}>
        <ScrollView className="px-5 h-screen">
          {/* Header */}
          <TitleHeader
            className="mt-28 mb-7"
            title="Verify OTP Now"
            subtitle={`Onetime OTP has been sent to your registered ${email ? "email" : "phone number"}`}
          />

          {/* OTP Input Boxes */}
          <View className="flex-row justify-between px-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                //@ts-ignore
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-14 h-14 border rounded-[10px] text-center text-lg place-items-center ${digit
                  ? "border-gray-300 bg-white"
                  : "border-[#EEEEEE] bg-white"
                  }`}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="numeric"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text className="text-xs mt-4 text-[#7D7D7D]">
            *Do Not Communicate this code to stranger
          </Text>

          {/* Resend OTP */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-[#7D7D7D]">Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
              <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sign Up Button */}
        <View className="mx-5 absolute bottom-28 inset-x-0">
          <PrimaryButton
            className="w-full"
            title={isLoading ? "Verifying..." : "Verify"}
            onPress={handleVerify}
            loading={isLoading}
          />
        </View>

        {/* arrow icon */}
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

export default Verify;

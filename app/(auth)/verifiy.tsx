import TitleHeader from "@/components/header/TitleHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Verify = () => {
  const router = useRouter();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

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

  const handleVerify = () => {
    if (isOtpComplete) {
      const otpCode = otp.join("");
      console.log("OTP:", otpCode);
      // Add your verification logic here
      router.push("/(auth)/login");
    }
  };

  const handleResendOtp = () => {
    // Add resend OTP logic here
    console.log("Resending OTP...");
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
            subtitle="Onetime OTP has been sent to your registered email or phone number"
          />

          {/* OTP Input Boxes */}
          <View className="flex-row justify-between px-2">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                //@ts-ignore
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-14 h-14 border rounded-[10px] text-center text-lg place-items-center ${
                  digit
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
        </ScrollView>

        {/* Sign Up Button */}
        <View className="mx-5 absolute bottom-28 inset-x-0">
          <PrimaryButton
            className="w-full"
            title="Verify"
            onPress={() => router.push("/(setup)/user-setup/progress")}
          />
        </View>

        {/* arrow icon */}
        <View className="absolute top-3 left-5 z-10">
          <Feather name="arrow-left" size={24} color="black" />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Verify;

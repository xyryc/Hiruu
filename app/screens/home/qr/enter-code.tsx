import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const CODE_LENGTH = 6;

const EnterJoinCode = () => {
  const { joinBusiness, isJoiningBusiness } = useBusinessStore();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleDigitChange = (value: string, index: number) => {
    const sanitized = value.replace(/\D/g, "");
    const next = [...code];

    // Support paste/autofill of full code.
    if (sanitized.length > 1) {
      const chars = sanitized.slice(0, CODE_LENGTH).split("");
      for (let i = 0; i < CODE_LENGTH; i += 1) {
        next[i] = chars[i] || "";
      }
      setCode(next);
      if (chars.length < CODE_LENGTH) {
        inputRefs.current[chars.length]?.focus();
      } else {
        inputRefs.current[CODE_LENGTH - 1]?.blur();
      }
      return;
    }

    next[index] = sanitized;
    setCode(next);

    if (sanitized && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const invitationCode = code.join("");
  const isCodeComplete = invitationCode.length === CODE_LENGTH;

  const handleJoin = async () => {
    if (!isCodeComplete || isJoiningBusiness) return;

    try {
      await joinBusiness(invitationCode);
      toast.success("You joined the business successfully!");
      router.replace("/(tabs)/home");
    } catch (err: any) {
      toast.error(translateApiMessage(err?.message || "Failed to join business"));
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Enter Invite Code"
          titleClass="text-primary dark:text-dark-primary"
        />
      </View>

      <View className="px-5 pt-10">
        <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary text-center">
          Join Your Team
        </Text>
        <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary text-center mt-2">
          Enter the 6-digit invitation code from your manager.
        </Text>

        <View className="flex-row justify-between mt-8">
          {code.map((digit, index) => (
            <TextInput
              key={`invite-code-${index}`}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(value) => handleDigitChange(value, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              className="w-12 h-14 border border-[#EEEEEE] rounded-xl text-center text-lg font-proximanova-semibold text-primary dark:text-dark-primary"
            />
          ))}
        </View>

        <PrimaryButton
          className="mt-8"
          title={isJoiningBusiness ? "Joining..." : "Join Business"}
          onPress={handleJoin}
          disabled={!isCodeComplete || isJoiningBusiness}
          loading={isJoiningBusiness}
        />

        <TouchableOpacity
          onPress={() => router.push("/screens/home/qr/scan")}
          className="mt-4 py-2"
        >
          <Text className="text-sm font-proximanova-semibold text-[#4FB2F3] text-center">
            Scan QR instead
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EnterJoinCode;


import React, { useRef } from "react";
import { TextInput, View } from "react-native";

const OTPInput = ({ otp, setOtp }: any) => {
  // Create refs for each input
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "");
    const newOtp = [...otp];

    if (!digits) {
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    if (digits.length > 1) {
      const remainingSlots = 6 - index;
      const fillDigits = digits.slice(0, remainingSlots).split("");

      fillDigits.forEach((digit, offset) => {
        newOtp[index + offset] = digit;
      });

      setOtp(newOtp);

      const nextFocusIndex = index + fillDigits.length;
      requestAnimationFrame(() => {
        if (nextFocusIndex <= 5) {
          inputRefs.current[nextFocusIndex]?.focus();
        } else {
          inputRefs.current.forEach((input) => input?.blur());
        }
      });
      return;
    }

    newOtp[index] = digits;
    setOtp(newOtp);

    // Auto focus next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="flex-row justify-between px-2">
      {otp.map(
        (
          //@ts-ignore
          digit,
          //@ts-ignore
          index
        ) => (
          <TextInput
            key={index}
            //@ts-ignore
            ref={(ref) => (inputRefs.current[index] = ref)}
            className={`w-14 h-14 border rounded-[10px] text-center text-lg place-items-center ${
              digit ? "border-gray-300 bg-white" : "border-[#EEEEEE] bg-white"
            }`}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="numeric"
            maxLength={6}
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            selectTextOnFocus
          />
        )
      )}
    </View>
  );
};

export default OTPInput;

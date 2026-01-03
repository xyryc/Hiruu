import React, { useRef } from "react";
import { TextInput, View } from "react-native";

const OTPInput = ({ otp, setOtp }: any) => {
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

  //   @ts-ignore
  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleVerify = () => {
    if (isOtpComplete) {
      const otpCode = otp.join("");
      console.log("OTP:", otpCode);
    }
  };

  const handleResendOtp = () => {
    // Add resend OTP logic here
    console.log("Resending OTP...");
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
            maxLength={1}
            selectTextOnFocus
          />
        )
      )}
    </View>
  );
};

export default OTPInput;

import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import OTPInput from "@/components/ui/inputs/OTPInput";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { useRouter } from "expo-router";
import { t } from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import PhoneInput, {
  getCountryByCca2,
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";
import * as Progress from "react-native-progress";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { toast } from "sonner-native";

const AnimatedView = Animated.createAnimatedComponent(View);
const OTP_RESEND_SECONDS = 60;

export default function Step5({
  progress,
  currentStep,
  getStepName,
  onComplete,
  handleBack,
}: any) {
  const router = useRouter();
  const { user, addContact, verifyAccount } = useAuthStore();
  const { updateProfile, isLoading } = useProfileStore();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [onboardingSent, setOnboardingSent] = useState(false);
  const autoVerifyInFlightRef = useRef(false);
  const lastAutoSubmittedOtpRef = useRef("");
  const fallbackCountry = useMemo(() => getCountryByCca2("US"), []);


  useEffect(() => {
    if (user?.isNumberVerified && !onboardingSent) {
      setIsOtpVerified(true);
      updateProfile({ onboarding: 5 }).catch(() => undefined);
      setOnboardingSent(true);
    }
  }, [onboardingSent, updateProfile, user?.isNumberVerified]);

  const getDialCode = (country?: ICountry | null) => {
    if (!country?.idd?.root) return "";
    const suffix = country.idd.suffixes?.[0] || "";
    return `${country.idd.root}${suffix}`;
  };

  const validatePhone = (value: string, country?: ICountry | null) => {
    const countryToUse = country ?? selectedCountry ?? fallbackCountry;
    if (!countryToUse || !value) return true;
    return isValidPhoneNumber(value, countryToUse);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setCountryCode(getDialCode(selectedCountry ?? fallbackCountry) || "");
    setIsValidPhone(validatePhone(value));
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
    setCountryCode(getDialCode(country));
    setIsValidPhone(validatePhone(phoneNumber, country));
  };

  useEffect(() => {
    setCountryCode(getDialCode(fallbackCountry) || "");
  }, [fallbackCountry]);

  useEffect(() => {
    if (!otpSent || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, resendCountdown]);

  const getPhonePayload = () => {
    const trimmed = phoneNumber.trim();
    if (!trimmed || !countryCode) {
      return { countryCode: "", phoneNumber: "" };
    }

    const ccDigits = countryCode.replace(/\D/g, "");
    const numberOnly = trimmed.replace(/\D/g, "");
    const phoneOnly = numberOnly.startsWith(ccDigits)
      ? numberOnly.slice(ccDigits.length)
      : numberOnly;

    return { countryCode, phoneNumber: phoneOnly };
  };

  const handleSendOtp = async () => {
    const parsed = getPhonePayload();
    if (!parsed.phoneNumber || !parsed.countryCode) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    try {
      setIsSendingOtp(true);
      await addContact(parsed);
      setOtpSent(true);
      setOtp(["", "", "", "", "", ""]);
      setResendCountdown(OTP_RESEND_SECONDS);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.message || t("common.error"));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (options?: { auto?: boolean }) => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      if (!options?.auto) {
        toast.error("Please enter the 6-digit OTP.");
      }
      return;
    }

    try {
      const isAuto = Boolean(options?.auto);
      if (isAuto) {
        if (autoVerifyInFlightRef.current) return;
        if (lastAutoSubmittedOtpRef.current === otpCode) return;
        autoVerifyInFlightRef.current = true;
        lastAutoSubmittedOtpRef.current = otpCode;
      }

      setIsVerifyingOtp(true);
      const parsed = getPhonePayload();
      if (!parsed.phoneNumber || !parsed.countryCode) {
        if (!options?.auto) {
          toast.error("Please enter a valid phone number.");
        }
        return;
      }

      await verifyAccount({
        phoneNumber: parsed.phoneNumber,
        countryCode: parsed.countryCode,
        code: otpCode,
      });
      setIsOtpVerified(true);
      if (!onboardingSent) {
        await updateProfile({ onboarding: 5 });
        setOnboardingSent(true);
      }
      toast.success("Phone number verified!");
      onComplete();
    } catch (error: any) {
      if (!options?.auto) {
        toast.error(error.message || t("common.error"));
      }
    } finally {
      if (options?.auto) {
        autoVerifyInFlightRef.current = false;
      }
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      lastAutoSubmittedOtpRef.current = "";
      return;
    }
    if (!otpSent || isOtpVerified || isVerifyingOtp || isSendingOtp) return;
    handleVerifyOtp({ auto: true });
  }, [otp, otpSent, isOtpVerified, isVerifyingOtp, isSendingOtp]);

  return (
    <AnimatedView
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      className="flex-1"
    >
      <ScreenHeader
        onPressBack={handleBack}
        title="Mobile Verification"
        buttonTitle="Skip"
        className="mt-3"
        onPress={() => router.replace("/(tabs)/home")}
      />

      {/* progress details */}
      <View className="my-7">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-sm font-proximanova-semibold">
            Your Progress: {currentStep * 20}%
          </Text>

          <Text className="text-sm font-proximanova-semibold">
            {getStepName(currentStep)}
          </Text>
        </View>

        <AnimatedView layout={Layout.springify()}>
          <Progress.Bar
            progress={progress}
            width={null}
            height={11}
            color="#11293A"
            unfilledColor="#FFFFFF"
            borderWidth={0}
            borderRadius={100}
            animated={true}
            animationConfig={{ duration: 300 }}
          />
        </AnimatedView>
      </View>

      {/* main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        className="flex-1"
      >
        <View>
          <Text className="text-sm mb-2 text-[#7A7A7A]">Phone number</Text>
          <PhoneInput
            value={phoneNumber}
            onChangePhoneNumber={handlePhoneChange}
            selectedCountry={selectedCountry}
            onChangeSelectedCountry={handleSelectedCountry}
            defaultCountry="US"
            placeholder="Enter phone number"
            phoneInputStyles={{
              container: {
                borderWidth: 1,
                borderColor: "#EEEEEE",
                borderRadius: 10,
                backgroundColor: "#fff",
              },
              input: {
                fontSize: 14,
                color: "#7A7A7A",
              },
              divider: {
                backgroundColor: "#E5E7EB",
              },
            }}
            phoneInputPlaceholderTextColor="#9CA3AF"
          />
          {!isValidPhone && phoneNumber && (
            <Text className="text-red-500 text-xs mt-1 ml-1">
              {t("validation.invalidPhone")}
            </Text>
          )}
        </View>

        <View className="mt-4 items-center">
          {!otpSent ? (
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isSendingOtp || isVerifyingOtp}
            >
              <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </Text>
            </TouchableOpacity>
          ) : resendCountdown > 0 ? (
            <Text className="text-sm font-proximanova-semibold text-[#7D7D7D]">
              Resend OTP in {String(Math.floor(resendCountdown / 60)).padStart(2, "0")}:
              {String(resendCountdown % 60).padStart(2, "0")}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isSendingOtp || isVerifyingOtp}
            >
              <Text className="text-sm font-proximanova-semibold text-[#4FB2F3]">
                {isSendingOtp ? "Sending OTP..." : "Resend OTP"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {otpSent && (
          <View className="mt-4">
            <Text className="text-sm mb-2 text-[#7D7D7D]">OTP input</Text>
            <OTPInput otp={otp} setOtp={setOtp} />
          </View>
        )}
      </ScrollView>

      {/* Button fixed at bottom */}
      <View className="pb-10 pt-4 bg-transparent">
        <PrimaryButton
          title="Next"
          className="w-full"
          onPress={onComplete}
          loading={isLoading}
          disabled={!isOtpVerified || isVerifyingOtp}
        />
      </View>
    </AnimatedView>
  );
}

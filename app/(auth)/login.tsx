import TitleHeader from "@/components/header/TitleHeader";
import SocialAuth from "@/components/layout/SocialAuth";
import { registerForFcmToken } from "@/services/notificationService";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useAuthStore } from "@/stores/authStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { t } from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput, {
  getCountryByCca2,
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Login = () => {
  const lastEmailKey = "auth:last_login_email";
  const [selectedTab, setSelectedTab] = useState("Email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const router = useRouter();
  const { login, isLoading, clearError } = useAuthStore();
  const fallbackCountry = useMemo(() => getCountryByCca2("US"), []);

  useEffect(() => {
    const loadLastEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem(lastEmailKey);
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch {
        // no-op
      }
    };

    loadLastEmail();
  }, []);

  const getDialCode = (country?: ICountry | null) => {
    if (!country?.idd?.root) return "";
    const suffix = country.idd.suffixes?.[0] || "";
    return `${country.idd.root}${suffix}`;
  };

  const validatePhone = (value: string, country?: ICountry | null) => {
    const countryToUse = country ?? selectedCountry ?? fallbackCountry;
    if (!countryToUse) return false;
    return isValidPhoneNumber(value, countryToUse);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    if (!value) {
      setIsValidPhone(true);
      return;
    }
    setIsValidPhone(validatePhone(value));
  };

  const handleSelectedCountry = (country: ICountry) => {
    setSelectedCountry(country);
    const dialCode = getDialCode(country);
    if (dialCode) setCountryCode(dialCode);
    if (phoneNumber) setIsValidPhone(validatePhone(phoneNumber, country));
  };

  useEffect(() => {
    const dialCode = getDialCode(fallbackCountry);
    if (dialCode) setCountryCode(dialCode);
  }, [fallbackCountry]);

  const handleLogin = async () => {
    clearError();
    const fcmToken = await registerForFcmToken().catch(() => undefined);

    if (selectedTab === "Email") {
      if (!email || !password) {
        Alert.alert(t("common.error"), t("validation.fillAllFields"));
        return;
      }

      try {
        const result = await login({
          email,
          password,
          rememberMe,
          fcmToken,
        });

        if (result?.success) {
          if (email) {
            await AsyncStorage.setItem(lastEmailKey, email);
          }
          if (result?.data?.isEmailVerified === false) {
            toast.success(translateApiMessage(result?.message || "auth_login_success"));
            router.replace({
              pathname: "/(auth)/verify",
              params: {
                email,
                source: "login",
              },
            });
            return;
          }

          toast.success(t("common.success", "Success"));
          router.replace("/(tabs)/home");
        }
      } catch (error: any) {
        const messageKey = error?.message || "UNKNOWN_ERROR";
        toast.error(translateApiMessage(messageKey));
      }
    } else {
      const normalizedPhone = phoneNumber.replace(/\D/g, "");
      const effectiveCountryCode =
        getDialCode(selectedCountry ?? fallbackCountry) || countryCode;
      const isPhoneValid = validatePhone(phoneNumber);

      if (!normalizedPhone || !isPhoneValid) {
        Alert.alert(t("common.error"), t("validation.invalidPhone"));
        return;
      }

      try {
        const result = await login({
          countryCode: effectiveCountryCode,
          phoneNumber: normalizedPhone,
          rememberMe,
          fcmToken,
        });

        if (result?.success) {
          toast.success(translateApiMessage(result?.message || "auth_phone_otp_sent"));
          router.push({
            pathname: "/(auth)/verify",
            params: {
              phoneNumber: normalizedPhone,
              countryCode: effectiveCountryCode,
            },
          });
        }
      } catch (error: any) {
        const messageKey = error?.message || "UNKNOWN_ERROR";
        toast.error(translateApiMessage(messageKey));
      }
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
          {/* Header */}
          <TitleHeader
            className="mt-[71px] mb-7"
            title="Welcome Back!"
            subtitle="Log in to continue managing your account and exploring new features."
          />

          {/* Tab Selector */}
          <View className="flex-row rounded-full mb-8">
            <TouchableOpacity
              onPress={() => setSelectedTab("Email")}
              className={`flex-1 py-3 rounded-full ${selectedTab === "Email" ? "bg-[#11293A]" : "bg-white"
                }`}
            >
              <Text
                className={`text-center text-sm font-proximanova-semibold ${selectedTab === "Email" ? "text-white" : "text-gray-600"
                  }`}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab("Phone number")}
              className={`flex-1 py-3 rounded-full ${selectedTab === "Phone number" ? "bg-[#11293A]" : "bg-white"
                }`}
            >
              <Text
                className={`text-center text-sm font-proximanova-semibold ${selectedTab === "Phone number"
                  ? "text-white"
                  : "text-gray-600"
                  }`}
              >
                Phone number
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="h-64 ">
            {selectedTab === "Email" ? (
              <View>
                {/* Email Input */}
                <View className="relative mb-4">
                  <View className="absolute left-4 top-3 z-10">
                    <Ionicons name="mail-outline" size={24} color="#4FB2F3" />
                  </View>
                  <TextInput
                    placeholder="Enter Email"
                    value={email}
                    onChangeText={setEmail}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-[#EEEEEE] rounded-xl text-[#7A7A7A]"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View className="relative mb-4">
                  <View className="absolute left-4 top-3 z-10">
                    <Ionicons
                      name="lock-closed-outline"
                      size={24}
                      color="#4FB2F3"
                    />
                  </View>
                  <TextInput
                    placeholder="Password"
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

                {/* Remember Me & Forgot Password */}
                <View className="flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center gap-1.5"
                  >
                    <View
                      className={`w-4 h-4 border-2 rounded ${rememberMe ? "bg-[#11293A]" : "border-[#7A7A7A]"
                        }`}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={10} color="white" />
                      )}
                    </View>
                    <Text className="text-xs text-[#7A7A7A]">Remember Me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                    <Text className="text-xs font-proximanova-semibold text-[#4FB2F3]">
                      Forgot Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-sm mb-2 text-[#7A7A7A]">
                  Phone number
                </Text>

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
                    Please enter a valid phone number
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* login Button */}
          <PrimaryButton
            className="mb-7"
            title="Log in"
            onPress={handleLogin}
            loading={isLoading}
          />

          {/* OR Divider */}
          <View className="flex-row items-center mb-7">
            <View className="flex-1 h-px bg-[#EEEEEE]" />
            <Text className="px-2.5 text-sm text-[#666666]">
              OR Log in with
            </Text>
            <View className="flex-1 h-px bg-[#EEEEEE]" />
          </View>

          {/* Social Login Buttons */}
          <View className="mb-7">
            <SocialAuth />
          </View>

          {/* Already have account */}
          <View className="flex-row mx-auto">
            <Text className="text-sm">Don't have an account?</Text>

            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-sm font-proximanova-semibold underline px-2">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Login;

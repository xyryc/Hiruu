import TitleHeader from "@/components/header/TitleHeader";
import SocialAuth from "@/components/layout/SocialAuth";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-input";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const [selectedTab, setSelectedTab] = useState("Email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(true);
  const router = useRouter();

  let phoneRef: any = null;

  const handlePhoneChange = () => {
    const number = phoneRef.getValue();
    const isValid = phoneRef.isValidNumber();

    setPhoneNumber(number);
    setIsValidPhone(isValid);
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
            title="Create Your Account"
            subtitle="Start by creating your account to explore jobs, manage shifts, and connect with teams."
          />

          {/* Tab Selector */}
          <View className="flex-row rounded-full mb-8">
            <TouchableOpacity
              onPress={() => setSelectedTab("Email")}
              className={`flex-1 py-3 rounded-full ${
                selectedTab === "Email" ? "bg-[#11293A]" : "bg-white"
              }`}
            >
              <Text
                className={`text-center text-sm font-proximanova-semibold ${
                  selectedTab === "Email" ? "text-white" : "text-gray-600"
                }`}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedTab("Phone number")}
              className={`flex-1 py-3 rounded-full ${
                selectedTab === "Phone number" ? "bg-[#11293A]" : "bg-white"
              }`}
            >
              <Text
                className={`text-center text-sm font-proximanova-semibold ${
                  selectedTab === "Phone number"
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
                      className={`w-4 h-4 border-2 rounded ${
                        rememberMe ? "bg-[#11293A]" : "border-[#7A7A7A]"
                      }`}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={10} color="white" />
                      )}
                    </View>
                    <Text className="text-xs text-[#7A7A7A]">Remember Me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
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
                  ref={(ref) => {
                    phoneRef = ref;
                  }}
                  onChangePhoneNumber={handlePhoneChange}
                  initialCountry={"us"}
                  style={{
                    borderWidth: 1,
                    borderColor: "#EEEEEE",
                    borderRadius: 10,
                    paddingHorizontal: 15,
                    paddingVertical: 12,
                    backgroundColor: "#fff",
                  }}
                  textStyle={{
                    fontSize: 14,
                    color: "#7A7A7A",
                  }}
                  flagStyle={{
                    width: 25,
                    height: 18,
                  }}
                  autoFormat={true}
                  allowZeroAfterCountryCode={false}
                  textProps={{
                    placeholder: "Enter phone number",
                    placeholderTextColor: "#9CA3AF",
                  }}
                />

                {!isValidPhone && phoneNumber && (
                  <Text className="text-red-500 text-xs mt-1 ml-1">
                    Please enter a valid phone number
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Sign Up Button */}
          <PrimaryButton
            className="w-full mb-7"
            title="Sign Up"
            onPress={() => router.push("/(auth)/verifiy")}
          />

          {/* OR Divider */}
          <View className="flex-row items-center mb-7">
            <View className="flex-1 h-px bg-[#EEEEEE]" />
            <Text className="px-2.5 text-sm text-[#666666]">
              OR Sign up with
            </Text>
            <View className="flex-1 h-px bg-[#EEEEEE]" />
          </View>

          {/* Social Login Buttons */}
          <View className="mb-7">
            <SocialAuth />
          </View>

          {/* Already have account */}
          <View className="flex-row mx-auto">
            <Text className="text-sm">Already have an account?</Text>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-sm font-proximanova-semibold underline px-2">
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignUp;

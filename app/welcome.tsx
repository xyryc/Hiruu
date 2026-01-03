import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  const router = useRouter();

  return (
    <SafeAreaView
      className="flex-1 bg-[#BDE4F9]"
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      <LinearGradient colors={["#BDE4F9", "#F7F7F7"]} locations={[0, 0.38]}>
        <View className="h-[60%]">
          <Image
            source={require("@/assets/images/hero_image.svg")}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="contain"
          />
        </View>

        {/* text content */}
        <View className="h-[40%] justify-center items-center">
          <View className="w-4/5">
            <Text className="text-2xl font-proximanova-bold capitalize mb-4 text-center text-[#111111]">
              Welcome to Hiruu
            </Text>

            <Text className="text-sm font-proximanova-semibold text-center capitalize text-[#7A7A7A]">
              Manage your team, track shifts, and grow your business — all in
              one place. Let’s get started!
            </Text>
          </View>

          {/* button */}
          <PrimaryButton
            className="my-[30px] mx-5"
            title="Get Started"
            onPress={() => router.push("/(auth)/signup")}
          />

          <View className="flex-row mx-auto">
            <Text className="text-sm">Already have an account?</Text>

            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-sm font-proximanova-semibold underline px-2">
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Welcome;

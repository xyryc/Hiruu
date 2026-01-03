import TitleHeader from "@/components/header/TitleHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Complete = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" edges={["left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#BDE4F9" />

      <LinearGradient
        colors={["#BDE4F9", "#F7F7F7"]}
        locations={[0, 0.38]}
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <View className="px-5 ">
          <Image
            source={require("@/assets/images/complete.svg")}
            style={{
              width: 218,
              height: 168,
              marginHorizontal: "auto",
              marginBottom: 30,
            }}
          />

          <TitleHeader
            title="Your Hirru Profile is Ready!"
            subtitle="Start managing shifts, applying for jobs, and tracking your work, all in one place. Let's get to work!"
          />
        </View>

        <View className="absolute bottom-0 inset-x-5">
          <PrimaryButton
            onPress={() => router.push("/(tabs)/user-home")}
            className="w-full"
            title="Go to Profile"
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Complete;

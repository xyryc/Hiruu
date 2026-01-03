import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import BlankNamePlateCard from "@/components/ui/cards/BlankNamePlateCard";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const YourNamePlates = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [selected, setSelected] = useState("none");

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{
          paddingTop: insets.top + 10,
        }}
        className="bg-[#E5F4FD] rounded-b-2xl px-4 pb-4"
        onPressBack={() => router.back()}
        title="Your Nameplates"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <TouchableOpacity
            onPress={() => router.push("/screens/rewards/nameplate")}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
          >
            <MaterialIcons name="storefront" size={18} color="black" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="pt-6 px-5"
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* none */}
        <TouchableOpacity
          className="p-3 border border-secondary rounded-[10px] flex-row justify-between items-center"
          onPress={() => setSelected("none")}
        >
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="ban-outline" size={24} color="black" />
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
              None
            </Text>
          </View>

          <Ionicons
            name={selected === "none" ? "radio-button-on" : "radio-button-off"}
            size={20}
            color="#11293A"
          />
        </TouchableOpacity>

        <View className="mt-4">
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
            Style Advisor
          </Text>
          <BlankNamePlateCard
            variant="variant4"
            isSelected={selected === "variant4"}
            onPress={() => setSelected("variant4")}
          />
        </View>

        <View className="mt-4">
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
            Caffeine Commander
          </Text>
          <BlankNamePlateCard
            variant="variant2"
            isSelected={selected === "variant2"}
            onPress={() => setSelected("variant2")}
          />
        </View>

        <View className="mt-4">
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
            Checkout Champion
          </Text>
          <BlankNamePlateCard
            variant="variant3"
            isSelected={selected === "variant3"}
            onPress={() => setSelected("variant3")}
          />
        </View>

        <View className="mt-4">
          <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
            Fryer Fiend
          </Text>
          <BlankNamePlateCard
            variant="variant5"
            isSelected={selected === "variant5"}
            onPress={() => setSelected("variant5")}
          />
        </View>
      </ScrollView>

      <PrimaryButton title="Apply" className="mx-5 mt-3" />
    </SafeAreaView>
  );
};

export default YourNamePlates;

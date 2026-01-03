import ScreenHeader from "@/components/header/ScreenHeader";
import ShiftTemplateCard from "@/components/ui/cards/ShiftTemplateCard";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const SavedShiftTemplate = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <SafeAreaView
        className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
        edges={["left", "right", "bottom"]}
      >
        <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pb-4 pt-2.5 px-5">
          <ScreenHeader
            className=""
            style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
            onPressBack={() => router.back()}
            title="Saved Shift template"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
            components={
              <View className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center">
                <Ionicons name="documents-outline" size={22} color="black" />
              </View>
            }
          />
        </View>
        <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
          <ShiftTemplateCard title="Morning Shift" className="mt-8" />
          <ShiftTemplateCard title="Afternoon Shift" className="mt-4" />
          <ShiftTemplateCard title="Evening Shift" className="mt-4" />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SavedShiftTemplate;

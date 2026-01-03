import ScreenHeader from "@/components/header/ScreenHeader";
import GradientButton from "@/components/ui/buttons/GradientButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ShiftTemplateCard from "@/components/ui/cards/ShiftTemplateCard";
import { FontAwesome6, SimpleLineIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const SavedShiftTemplate = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const daysData = [
    {
      label: "Monday",
    },
    {
      label: "Tuesday",
    },
    {
      label: "Wednesday",
    },
    {
      label: "Thursday",
    },
    {
      label: "Saturday",
    },
    {
      label: "Sunday",
    },
  ];

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
            className="capitalize"
            style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
            onPressBack={() => router.back()}
            title="weekly schedule"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
          />
        </View>
        <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() =>
              router.push("/screens/schedule/business/list-shifts")
            }
            className="border mt-9 border-[#eeeeee] rounded-[10px] py-5 px-4 gap-5 flex-row items-center"
          >
            <SimpleLineIcons name="plus" size={24} color="#4FB2F3" />
            <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
              Monday
            </Text>
          </TouchableOpacity>

          <ShiftTemplateCard
            weekly={true}
            title="Morning Shift"
            className="mt-3"
          />

          <View>
            {daysData.map((day, index) => (
              <TouchableOpacity
                onPress={() =>
                  router.push("/screens/schedule/business/list-shifts")
                }
                key={index}
                className="border mt-3 border-[#eeeeee] rounded-[10px] py-5 px-4 gap-5 flex-row items-center"
              >
                <SimpleLineIcons name="plus" size={24} color="#4FB2F3" />
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {day.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* button  */}
          <GradientButton
            className="mt-10"
            title="Fill With AI"
            icon={<FontAwesome6 name="crown" size={20} color="white" />}
          />
          <PrimaryButton title="Next" className="my-4" />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default SavedShiftTemplate;

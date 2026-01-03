import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  Image,
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

const tabs = [
  "Cashier (1/3)",
  "Bartender (3/5)",
  "Waiter (7/10)",
  "Reception (5/7)",
  "Others (2/5)",
];

const ListofShifts = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = React.useState("Cashier (1/3)");
  const [selectedCashier, setSelectedCashier] = useState<number | null>(null);

  // Sample cashier data
  const cashierData = [
    {
      id: 1,
      name: "Morning Shift",
      role: "10:00AM to 5:00PM",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Afternoon Shift",
      role: "10:00AM to 5:00PM",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Evening Shift",
      role: "10:00AM to 5:00PM",
      avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    },
  ];

  // Function to handle cashier selection and toggle (for multiple selections)
  const handleCashierPress = (id: number) => {
    setSelectedCashier((prev) => (prev === id ? null : id));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "height" : "padding"}
    >
      <SafeAreaView
        className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
        edges={["left", "right", "bottom"]}
      >
        <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-2.5 px-5">
          <ScreenHeader
            className="capitalize mb-7"
            style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
            onPressBack={() => router.back()}
            title="ListofShifts"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
            // components={
            //   <View className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center">
            //     <MaterialCommunityIcons
            //       name="line-scan"
            //       size={20}
            //       color="black"
            //     />
            //   </View>
            // }
          />
        </View>
        <ScrollView
          className="mx-5 flex-1"
          showsVerticalScrollIndicator={false}
        >
          {/* chashar list */}
          <View className="mt-4">
            {cashierData.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCashierPress(item.id)}
                className={`flex-row items-center p-4 mt-4 rounded-xl border border-[#eeeeee] `}
              >
                <Image
                  source={{
                    uri: "https://randomuser.me/api/portraits/lego/3.jpg",
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary">
                    {item.name}
                  </Text>
                  <Text className="text-sm text-secondary dark:text-dark-secondary font-proximanova-regular">
                    {item.role}
                  </Text>
                </View>
                <Ionicons
                  name={
                    selectedCashier === item.id
                      ? "checkmark-circle"
                      : "radio-button-off"
                  }
                  size={24}
                  color={selectedCashier === item.id ? "#11293A" : "#C7C7CC"}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* button  */}
        </ScrollView>
        <PrimaryButton className="mx-5" title="Next" />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ListofShifts;

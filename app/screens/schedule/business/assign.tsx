import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
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

const Assign = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = React.useState("Cashier (1/3)");
  const [selectedCashiers, setSelectedCashiers] = useState<number[]>([]);

  // Sample cashier data
  const cashierData = [
    {
      id: 1,
      name: "Rohan Mehta",
      role: "Cashier",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Priya Shah",
      role: "Cashier",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Amit Patel",
      role: "Cashier",
      avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    },
  ];

  // Function to handle cashier selection and toggle (for multiple selections)
  const handleCashierPress = (id: number) => {
    setSelectedCashiers((prev) => {
      // If the cashier is already selected, remove them from the array (deselect)
      if (prev.includes(id)) {
        return prev.filter((cashierId) => cashierId !== id);
      } else {
        // If the cashier is not selected, add them to the array (select)
        return [...prev, id];
      }
    });
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
            className="capitalize"
            style={{ paddingTop: insets.top + 10, paddingBottom: 10 }}
            onPressBack={() => router.back()}
            title="Assign"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
            components={
              <View className="h-10 w-10 bg-white rounded-full flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="line-scan"
                  size={20}
                  color="black"
                />
              </View>
            }
          />

          {/* Role Tabs */}
          <View className="mx-4  ">
            <FlatList
              data={tabs}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedTab(item)}
                  className="mx-1.5"
                >
                  <Text
                    className={` ${selectedTab === item ? "border-b-2 border-primary dark:border-dark-primary" : ""} font-proximanova-semibold text-primary dark:text-dark-primary pb-3`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
        <ScrollView
          className="mx-5 flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="border mt-9 border-[#eeeeee] rounded-[10px] px-4 flex-row items-center">
            {/* Search Icon */}
            <Ionicons
              name="search"
              size={16}
              color={isDark ? "#fff" : "#7A7A7A"}
              style={{ marginRight: 10 }}
            />

            {/* Search Input */}
            <TextInput
              placeholder="Search here..."
              placeholderTextColor={isDark ? "#fff" : "#7A7A7A"}
              style={{
                flex: 1,
                color: isDark ? "#fff" : "#111",
                backgroundColor: isDark ? "#111" : "#fff",
              }}
            />
          </View>

          {/* chashar list */}
          <View>
            {cashierData.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCashierPress(item.id)}
                className={`flex-row items-center p-4 mt-4 rounded-xl border border-[#eeeeee] `}
              >
                <Image
                  source={{ uri: item.avatar }}
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
                  name="checkmark-circle"
                  size={24}
                  color={
                    selectedCashiers.includes(item.id) ? "#11293A" : "#7A7A7A"
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* button  */}
        </ScrollView>
        <PrimaryButton className="mx-5" title="Assign" />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default Assign;

import ScreenHeader from "@/components/header/ScreenHeader";
import CheckButton from "@/components/ui/buttons/CheckButton";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { ToggleButton } from "@/components/ui/buttons/ToggleButton";
import SearchBar from "@/components/ui/inputs/SearchBar";
import RoleSelector from "@/components/ui/modals/RoleSelector";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
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

const CreateRole = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const [toggleData, setToggleData] = useState([
    {
      name: "Business Overview",
      isOn: false,
    },
    {
      name: "People Management",
      isOn: false,
    },
    {
      name: "Job Management",
      isOn: false,
    },
    {
      name: "Shift & Schedule",
      isOn: false,
    },
    {
      name: "System Access",
      isOn: false,
    },
  ]);

  const handleToggle = (index: number) => {
    setToggleData((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isOn: !item.isOn } : item
      )
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5">
          <ScreenHeader
            style={{ paddingTop: insets.top + 15, paddingBottom: 20 }}
            className=""
            onPressBack={() => router.back()}
            title="Create Role"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
            components={
              <TouchableOpacity className="">
                <Text className="font-proximanova-semibold text-[#4FB2F3]">
                  Reset
                </Text>
              </TouchableOpacity>
            }
          />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} className="mx-5">
          {/* predefine role */}
          <View className="mt-4">
            <RoleSelector className="" />
          </View>

          {/* Permissions Section */}
          <View className="mt-8">
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              Permissions Section
            </Text>
            <SearchBar onSearch={(text) => setSearch(text)} className="mt-4" />
            <View className="flex-row justify-between items-center px-4 py-3 border border-[#EEEEEE] rounded-[10px] mt-4">
              <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                Actions
              </Text>
              <View className="flex-row items-center gap-7 ">
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  View
                </Text>
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                  Edit
                </Text>
              </View>
            </View>
          </View>

          {/* toggle button */}
          <View>
            {toggleData.map((toggle, index) => (
              <View
                key={index}
                className="border border-[#EEEEEE] p-4 rounded-[10px] mt-4"
              >
                <View className="flex-row justify-between items-center ">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary capitalize">
                    {toggle.name}
                  </Text>
                  <ToggleButton
                    isOn={toggle.isOn}
                    setIsOn={() => handleToggle(index)}
                  />
                </View>
                {toggle.isOn && (
                  <View className="border-b border-[#EEEEEE] mt-3" />
                )}
                {toggle.isOn && <CheckButton title="View Business Summary" />}
                {toggle.isOn && (
                  <CheckButton title="View Business Statistics" />
                )}
                {toggle.isOn && <CheckButton title="View User Statistics" />}
              </View>
            ))}
          </View>

          <PrimaryButton title="Save Role" className="my-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateRole;

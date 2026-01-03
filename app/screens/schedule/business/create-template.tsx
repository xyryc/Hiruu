import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import BusinessDropdown from "@/components/ui/dropdown/BusinessDropdown";
import ExperienceLevel from "@/components/ui/inputs/ExperienceLevel";
import SearchBar from "@/components/ui/inputs/SearchBar";
import TimePicker from "@/components/ui/inputs/TimePicker";
import PreviewTemplateModal from "@/components/ui/modals/PreviewTemplateModal";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const leaveTypes = [
  {
    label: "Sick Leave",
    value: "sick",
    avatar:
      "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
  },
  {
    label: "Personal Leave",
    value: "personal",
    avatar:
      "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
  },
  {
    label: "Work From Home",
    value: "wfh",
    avatar:
      "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
  },
  {
    label: "Emergency Leave",
    value: "emergency",
    avatar:
      "https://i.pinimg.com/736x/16/6f/73/166f73ab4a3d7657e67b4ec1246cc2d6.jpg",
  },
];
const CreateTemplate = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const [selectedLeave, setSelectedLeave] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isPreview, setIsPreview] = useState(false);

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
            className=""
            style={{ paddingTop: insets.top + 10, paddingBottom: 26 }}
            onPressBack={() => router.back()}
            title="Create Templete"
            titleClass="text-primary dark:text-dark-primary"
            iconColor={isDark ? "#fff" : "#111"}
          />
        </View>
        <ScrollView className="mx-5" showsVerticalScrollIndicator={false}>
          {/* inpute */}
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-7">
            Templete Name
          </Text>
          <TextInput
            className="px-4 py-3 text-sm font-proximanova-regular text-primary dark:text-dark-primary  border border-[#EEEEEE] mt-2.5 rounded-[10px]"
            placeholder="Morning Shift"
            placeholderTextColor="#7D7D7D"
            textAlignVertical="top"
          />

          {/* Time Picker shift  */}
          <View className="mt-8">
            <View className="flex-row gap-4 items-center">
              <View className="flex-1">
                <TimePicker title="Shift Start Time" />
              </View>
              <Text className="mt-7 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                To
              </Text>
              <View className="flex-1">
                <TimePicker title="Shift End Time" />
              </View>
            </View>
          </View>

          {/* Time Picker shift  */}
          <View className="mt-8">
            <View className="flex-row gap-4 items-center">
              <View className="flex-1">
                <TimePicker title="Add Break" />
              </View>
              <Text className="mt-7 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                To
              </Text>
              <View className="flex-1">
                <TimePicker title="  " />
              </View>
            </View>
          </View>

          {/* hapiness bar */}
          <View>
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-8">
              Select business
            </Text>
            <BusinessDropdown
              className="mt-4"
              placeholder="Choose leave type"
              options={leaveTypes}
              value={selectedLeave}
              onSelect={(value: any) => setSelectedLeave(value)}
            />
          </View>

          {/* role requard */}
          <View className="mt-8 flex-row justify-between items-center">
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              Roles & Required Count
            </Text>
            <View className="bg-[#E5F4FD] flex-row gap-2.5 rounded-lg items-center p-1">
              <Text>15</Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                color="black"
              />
            </View>
          </View>

          {/* <TextInput /> */}

          <SearchBar
            className="mt-4 py-1"
            onSearch={(text) => setSearch(text)}
          />

          {/* ExperienceLevel */}
          <ExperienceLevel titleHeight={true} />

          {/* Total roles must equal required staff */}
          <View className="flex-row items-center gap-2.5 -mt-4">
            <Feather name="alert-triangle" size={16} color="#F34F4F" />
            <Text
              numberOfLines={1}
              className="ml-1.5 text-sm font-proximanova-regular text-[#F34F4F]"
            >
              Total roles must equal required staff
            </Text>
          </View>

          <View className="mt-8 mb-5">
            <PrimaryButton
              onPress={() => setIsPreview(true)}
              title="Save Template"
            />
          </View>
          <PreviewTemplateModal
            visible={isPreview}
            onClose={() => setIsPreview(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreateTemplate;

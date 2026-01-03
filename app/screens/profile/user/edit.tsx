import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SmallButton from "@/components/ui/buttons/SmallButton";
import BadgeCard from "@/components/ui/cards/BadgeCard";
import ExperienceCard from "@/components/ui/cards/ExperienceCard";
import NamePlateCard from "@/components/ui/cards/NamePlateCard";
import Dropdown from "@/components/ui/dropdown/DropDown";
import DatePicker from "@/components/ui/inputs/DatePicker";
import EditBadgeModal from "@/components/ui/modals/EditBadgeModal";
import InterestModal from "@/components/ui/modals/InterestModal";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import {
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

const Edit = () => {
  const [isBadgeVisible, setIsBadgeVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{
          paddingTop: insets.top + 10,
        }}
        className="bg-[#E5F4FD] rounded-b-2xl px-4 pb-6"
        onPressBack={() => router.back()}
        title="Edit Profile"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView
        className="bg-white"
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: 40,
        }}
      >
        <View className="mx-5">
          <View className="flex-row justify-between items-center mb-2.5">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Your Nameplate
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/screens/profile/nameplate-options")}
            >
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <NamePlateCard variant="variant5" />
        </View>

        {/* Badge item */}
        <View>
          <View className="mx-5 flex-row justify-between mt-8 items-center">
            <View className="flex-row gap-2.5 items-center">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row items-center justify-center ">
                <FontAwesome6 name="id-badge" size={14} color="black" />
              </View>
              <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
                Badge
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsBadgeVisible(true)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </TouchableOpacity>
          </View>
          <BadgeCard className="mx-5 mt-3.5" />
        </View>
        <EditBadgeModal
          visible={isBadgeVisible}
          onClose={() => setIsBadgeVisible(false)}
        />
        {/* short intro */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="file-document-check-outline"
                  size={16}
                  color="black"
                />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Short Intro
              </Text>
            </View>
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              Edit
            </Text>
          </View>
          <View className="mx-5 mt-4">
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary border border-[#0000000D] rounded-xl p-3">
              Join the core team at Space Hotel, a unique dining experience
              known for its space-themed interiors and premium service. Join the
              core team at Space Hotel, a unique dining experien
            </Text>
          </View>
        </View>
        {/* Experience */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="file-document-check-outline"
                  size={16}
                  color="black"
                />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Experience
              </Text>
            </View>
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
              Edit
            </Text>
          </View>
        </View>
        <View className="mx-5 mt-4">
          <Dropdown
            // label="Select Style"
            placeholder="2 Company selected"
            // options={issues}
            // value={selectedIssue}
            // onSelect={setSelectedIssue}
          />
          <View className="p-5 mt-5 border border-[#0000000D] rounded-xl">
            <View className="flex-row justify-between items-center mt-3">
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Verified HIRUU Experience
              </Text>
              <Ionicons name="close-circle" size={24} color="black" />
            </View>
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-4">
              auto-tracked
            </Text>
            <ExperienceCard className="mt-8" />
            <ExperienceCard className="mt-2.5" />
            <View className="border border-[#0000000D] my-4" />
            {/* apply new job and roll */}
            <View className="flex-row gap-3 items-center">
              <View className="h-9 w-9 bg-[#11293A] rounded-full flex-row justify-center items-center">
                <SimpleLineIcons name="camera" size={18} color="white" />
              </View>
              <TextInput
                placeholder="Enter Company Name"
                className="flex-1 text-base border border-[#0000000D] p-2 rounded-xl"
              />
              <Ionicons name="close-circle" size={24} color="black" />
            </View>
            <View>
              <Text className="mt-2.5 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Period
              </Text>
              <View className="flex-row gap-2.5 mt-1.5">
                <DatePicker title="Start Date" className="flex-1" />
                <DatePicker title="End Date" className="flex-1" />
              </View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5">
                Job Title
              </Text>
              <TextInput
                placeholder="Enter your Role"
                className="flex-1 text-base border border-[#0000000D] p-2 rounded-xl mt-2.5"
              />
            </View>
            <View className="border border-[#0000000D] my-4" />

            {/* 2nd new job apply */}
            <View className="flex-row gap-3 items-center">
              <View className="h-9 w-9 bg-[#11293A] rounded-full flex-row justify-center items-center">
                <SimpleLineIcons name="camera" size={18} color="white" />
              </View>
              <TextInput
                placeholder="Enter Company Name"
                className="flex-1 text-base border border-[#0000000D] p-2 rounded-xl"
              />
              <Ionicons name="close-circle" size={24} color="black" />
            </View>
            <View>
              <Text className="mt-2.5 font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Period
              </Text>
              <View className="flex-row gap-2.5 mt-1.5">
                <DatePicker title="Start Date" className="flex-1" />
                <DatePicker title="End Date" className="flex-1" />
              </View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5">
                Job Title
              </Text>
              <TextInput
                placeholder="Enter your Role"
                className="flex-1 text-base border border-[#0000000D] p-2 rounded-xl mt-2.5"
              />
            </View>
          </View>
        </View>
        {/*  Interests */}
        <View>
          <View className="flex-row justify-between items-center mx-5 mt-8 ">
            <View className="flex-row gap-2.5">
              <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="file-document-check-outline"
                  size={16}
                  color="black"
                />
              </View>
              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Interests
              </Text>
            </View>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mx-5 mt-4">
            <View>
              <View className="w-16 h-16 rounded-full items-center justify-center bg-gray-200 p-2.5">
                <Text className="text-2xl">⚽</Text>
              </View>
              <Text className="text-center text-xs  mt-2 font-proximanova-medium">
                Sports
              </Text>
            </View>
            <View>
              <View className="w-16 h-16 rounded-full items-center justify-center bg-green-100 p-2.5">
                <Text className="text-2xl">🎵</Text>
              </View>
              <Text className="text-center text-xs  mt-2 font-proximanova-medium">
                Music
              </Text>
            </View>
            <View>
              <View className="w-16 h-16 rounded-full items-center justify-center bg-yellow-100 p-2.5">
                <Text className="text-2xl">📷</Text>
              </View>
              <Text className="text-center text-xs  mt-2 font-proximanova-medium">
                Photography
              </Text>
            </View>
            <View>
              <View className="w-16 h-16 rounded-full items-center justify-center bg-orange-100 p-2.5">
                <Text className="text-2xl">🎨</Text>
              </View>
              <Text className="text-center text-xs  mt-2 font-proximanova-medium">
                Art
              </Text>
            </View>
          </View>
        </View>

        <InterestModal visible={visible} onClose={() => setVisible(false)} />
        {/* Contact Us On */}
        <View className="flex-row justify-between items-center mx-5 mt-8 ">
          <View className="flex-row gap-2.5">
            <View className="h-8 w-8 rounded-full bg-[#E5F4FD] flex-row justify-center items-center">
              <Ionicons name="call-outline" size={16} color="black" />
            </View>
            <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
              Contact Us On
            </Text>
          </View>
          <Text className="font-proximanova-semibold text-sm text-[#4FB2F3] underline ">
            Edit
          </Text>
        </View>

        <View className="border border-[#EEEEEE] rounded-xl mx-5 my-4">
          <View className="flex-row justify-between items-center  p-2.5 border border-[#EEEEEE] rounded-t-xl ">
            <View className="flex-row items-center gap-2.5">
              <View>
                <Image
                  source={require("@/assets/images/facebook2.svg")}
                  contentFit="contain"
                  style={{ height: 40, width: 40 }}
                />
              </View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Facebook
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                @alvber_f{" "}
              </Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between items-center  p-2.5  border border-[#EEEEEE]">
            <View className="flex-row items-center gap-2.5">
              <View>
                <Image
                  source={require("@/assets/images/linkedin.svg")}
                  contentFit="contain"
                  style={{ height: 40, width: 40 }}
                />
              </View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Linkdin
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {" "}
                in/albert-flore-12562f25{" "}
              </Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between items-center  p-2.5 border border-[#EEEEEE] ">
            <View className="flex-row items-center gap-2.5">
              <View>
                <Image
                  source={require("@/assets/images/whatsapp.svg")}
                  contentFit="contain"
                  style={{ height: 40, width: 40 }}
                />
              </View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Whats App
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {" "}
                +1(125) 256 25612{" "}
              </Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between items-center p-2.5  border border-[#EEEEEE] ">
            <View className="flex-row items-center gap-2.5">
              <View>
                <Image
                  source={require("@/assets/images/twitter.svg")}
                  contentFit="contain"
                  style={{ height: 40, width: 40 }}
                />
              </View>
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Twitter
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                {" "}
                @alber256{" "}
              </Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>
          {/* instagram */}
          <View className="flex-row justify-between items-center bg-white p-3  border border-[#EEEEEE]">
            <TouchableOpacity className="flex-row items-center gap-1.5">
              <Image
                style={{
                  height: 36,
                  width: 36,
                }}
                source={require("@/assets/images/instagram.svg")}
                contentFit="contain"
              />

              <Text className="text-sm font-proximanova-semibold">
                Instagram
              </Text>
            </TouchableOpacity>

            <SmallButton title="Link" />
          </View>

          {/* telegram */}
          <View className="flex-row justify-between items-center bg-white p-3 rounded-b-[10px] border border-[#EEEEEE]">
            <TouchableOpacity className="flex-row items-center gap-1.5">
              <Image
                style={{
                  height: 36,
                  width: 36,
                }}
                source={require("@/assets/images/telegram.svg")}
                contentFit="contain"
              />

              <Text className="text-sm font-proximanova-semibold">
                Facebook
              </Text>
            </TouchableOpacity>

            <SmallButton title="Link" />
          </View>
        </View>

        <PrimaryButton title="Save Change" className="mx-5 mt-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Edit;

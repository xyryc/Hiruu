import ScreenHeader from "@/components/header/ScreenHeader";
import ContacrSection from "@/components/ui/cards/ContacrSection";
import ContactListWithLock from "@/components/ui/cards/ContacrSection";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import {
  Entypo,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Ionicons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const refer = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const refCard = [
    {
      coin: 20,
      text1: "Refer A",
      text2: "Friend",
      imageSource: require("@/assets/images/reward/refer-friend.svg"),
      border: "#F3934F",
      back: "#FEEFE5",
    },
    {
      coin: 40,
      text1: "Refer A",
      text2: "Business",
      imageSource: require("@/assets/images/reward/refer-business.svg"),
      border: "#788CFF",
      back: "#788CFF10",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Refer and Earn"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mx-5">
          <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-5">
            <Text className="font-proximanova-semibold">Note:</Text> Phone
            number verification is mandatory for any user who joins and wants to
            claim a reward.
          </Text>

          {/* card */}
          <View className="flex-row gap-7 items-center justify-center mt-9">
            {refCard.map((card, index) => (
              <View
                key={index}
                className="border-[#EEEEEE] p-3 rounded-xl h-[133px] w-[133px] border border-b-[3px] items-center -z-30"
                style={{
                  backgroundColor: card.back,
                  borderColor: card.border,
                }}
              >
                <Image
                  source={card.imageSource}
                  contentFit="contain"
                  style={{ height: 57, width: 59 }}
                />
                <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-2.5 text-center ">
                  {card.text1} {card.text2}
                </Text>
                <View className="flex-row items-center justify-between mt-2 -z-20">
                  <Image
                    source={require("@/assets/images/hiruu-coin.svg")}
                    style={{
                      width: 22,
                      height: 22,
                    }}
                    contentFit="contain"
                  />
                  <View className="px-4 py-1 bg-[#FFFFFF]  -ml-2.5 -z-10 rounded-r-[40px]">
                    {/*bg-[#DDF1FF]*/}
                    <Text className="text-xs font-proximanova-semibold">
                      {card.coin}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* primary button */}
          <PrimaryButton title="Refer Now" className="mt-8" />

          {/* Share Via */}
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-7">
            Share Via
          </Text>

          <View className="flex-row justify-between">
            {/* copy */}
            <View className="mt-4 items-center">
              <View className="h-11 w-11 bg-[#F5F5F5] rounded-full flex-row justify-center items-center ">
                <Ionicons name="copy-outline" size={24} color="black" />
              </View>
              <Text className="text-center font-proximanova-regular text-primary dark:text-dark-primary text-sm">
                Copy link
              </Text>
            </View>
            {/* whatsapp */}
            <View className="mt-4 items-center">
              <View className="h-11 w-11 bg-[#F5F5F5] rounded-full flex-row justify-center items-center ">
                <FontAwesome5
                  name="whatsapp-square"
                  size={24}
                  color="#22CC40"
                />
              </View>
              <Text className="text-center font-proximanova-regular text-primary dark:text-dark-primary text-sm">
                WhatsApp
              </Text>
            </View>
            {/* Instagram */}
            <View className="mt-4 items-center">
              <View className="h-11 w-11 bg-[#F5F5F5] rounded-full flex-row justify-center items-center ">
                <Entypo
                  name="instagram-with-circle"
                  size={24}
                  color="#F30005"
                />
              </View>
              <Text className="text-center font-proximanova-regular text-primary dark:text-dark-primary text-sm">
                Instagram
              </Text>
            </View>
            {/* Facebook */}
            <View className="mt-4 items-center">
              <View className="h-11 w-11 bg-[#F5F5F5] rounded-full flex-row justify-center items-center ">
                <FontAwesome6 name="facebook" size={24} color="#1877F2" />
              </View>
              <Text className="text-center font-proximanova-regular text-primary dark:text-dark-primary text-sm">
                Facebook
              </Text>
            </View>
            {/* Telegram */}
            <View className="mt-4 items-center">
              <View className="h-11 w-11 bg-[#F5F5F5] rounded-full flex-row justify-center items-center ">
                <Fontisto name="telegram" size={24} color="#41B4E6" />
              </View>
              <Text className="text-center font-proximanova-regular text-primary dark:text-dark-primary text-sm">
                Telegram
              </Text>
            </View>
          </View>

          <ContacrSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default refer;

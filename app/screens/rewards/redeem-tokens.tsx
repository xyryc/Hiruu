import ScreenHeader from "@/components/header/ScreenHeader";
import RedeemModal from "@/components/ui/modals/RedeemModal";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const RedeemTokens = () => {
  const img = require("@/assets/images/reward/premium.svg");

  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState({
    img: "",
    title: "",
    subtitle: "",
    coin: "",
  });
  const premium = {
    img,
    title: "Buy 1 Month Premium",
    subtitle: "Unlock premium features for yourself",
    coin: "200",
    listitle: "Premium Benefits Overview:",
    list1: "Access to nameplate designs",
    list2: "Profile boost",
    list3: "Early access to job listings",
    list4: "Token Cost: 200 Tokens",
    list5: "Duration: Valid for 1 Month",
    list6: "Current Token Balance: 540 Tokens",
    tag: "premium",
  };
  const gift = {
    img,
    title: "Gift 1 Month Premium",
    subtitle: "Send premium access to a friend",
    coin: "300",
    listitle: "Gift Premium for a month:",
    list1:
      "Send 1 month of premium access to another user. They’ll receive all premium benefits instantly",
    list2: "Token Cost: 300 Tokens",
    list3: "Current Token Balance: 540 Tokens",
    tag: "gift",
  };
  const me = {
    img,
    title: "Feature Me",
    subtitle: "Get noticed by top companies faster.",
    coin: "300",
    listitle: "Be feature profile as user",
    list1:
      "Boost your visibility by appearing at the top of the Job Finder page for a selected duration",
    list2: "Be feature profile as user",
    tag: "me",
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleModal = (key: string) => {
    if (key === "premium") {
      setData(premium);
      setModalVisible(true);
    } else if (key === "gift") {
      setData(gift);
      setModalVisible(true);
    } else if (key === "job") {
      setData(premium);
      setModalVisible(true);
    } else if (key === "me") {
      setData(me);
      setModalVisible(true);
    } else if (key === "nameplate") {
      router.push("/screens/rewards/nameplate");
    }
  };
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-6 rounded-b-3xl pt-2.5 overflow-hidden"
        title="Redeem Tokens"
        titleClass="text-primary "
        iconColor={isDark ? "#fff" : "#111111"}
        components={
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/hiruu-coin.svg")}
              style={{
                width: 32,
                height: 32,
              }}
              contentFit="contain"
            />
            <View className="px-4 py-2 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
              <Text className="text-sm font-proximanova-semibold">540</Text>
            </View>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="flex-row gap-5 justify-between mx-5 mt-5">
          <TouchableOpacity
            className="items-center bg-[#EFF9FF] -z-30 p-4 rounded-xl mx-auto w-[46%] border border-[#4FB2F330]"
            onPress={() => handleModal("premium")}
          >
            <Image
              source={require("@/assets/images/reward/premium.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              Buy 1 Month Premium
            </Text>

            <Text className="font-proximanova-regular text-secondary text-center text-sm mt-2 w-4/5">
              Unlock premium features for yourself
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center justify-between">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10 -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    200
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleModal("gift")}
            className="items-center bg-[#FEEFE5] -z-30 p-4 rounded-xl mx-auto w-[46%] border border-[#F68A2630]"
          >
            <Image
              source={require("@/assets/images/reward/giftbox.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary  mt-2.5 w-2/3 text-center">
              Gift 1 Month Premium
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              Send premium access to a friend
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    200
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-5 justify-between mx-5 mt-5">
          <TouchableOpacity
            onPress={() => handleModal("me")}
            className="items-center bg-[#E3F6E7] -z-30 p-4 rounded-xl mx-auto w-[46%] border border-[#3EBF5A30]"
          >
            <Image
              source={require("@/assets/images/reward/finder.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              Feature Me
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              Get noticed by top companies faster
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center justify-between">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10 -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    200
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleModal("job")}
            className="items-center bg-[#F7EEFF] mx-auto -z-30 p-4 rounded-xl w-[46%] border border-[#C583FF30]"
          >
            <Image
              source={require("@/assets/images/reward/purple-toolbox.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              Feature Job
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              Get noticed by top Employees faster
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    200
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => handleModal("nameplate")}
          className="bg-[#FFFCEE] mx-5 items-center -z-30 mt-3 rounded-xl border border-[#EEDA8130] p-4"
        >
          <Image
            source={require("@/assets/images/reward/designs.svg")}
            contentFit="contain"
            style={{ width: 60, height: 60 }}
          />
          <Text className="font-proximanova-semibold text-primary  mt-2.5">
            Unlock Nameplate Designs
          </Text>
          <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2">
            Choose profile nameplate styles
          </Text>
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <View className="flex-row -z-20 items-center">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
              <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
                <Text className="text-xs font-proximanova-semibold text-primary ">
                  200
                </Text>
              </View>
            </View>
            <Feather
              name="arrow-right"
              className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE] "
              size={20}
              color="black"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <RedeemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
      />
    </SafeAreaView>
  );
};

export default RedeemTokens;

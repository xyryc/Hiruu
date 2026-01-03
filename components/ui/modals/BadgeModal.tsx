import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CoinProgressSlider from "../inputs/CoinProgressSlider";

const BadgeModal = ({ visible, onClose, data }: any) => {
  const img1 = require("@/assets/images/reward/red-bands.svg");
  const img2 = require("@/assets/images/reward/black-bands.svg");
  const img3 = require("@/assets/images/reward/gold-bands.svg");
  const img4 = require("@/assets/images/reward/blue-bands.svg");
  const badchcard = [
    {
      img: img1,
      bgColor: "#F3934F26",
      color: "#F3934F",
      title: "Bronze",
      time: "100 hrs",
    },
    {
      img: img2,
      bgColor: "#80808026",
      color: "#808080",
      title: "Silver",
      time: "500 hrs",
    },
    {
      img: img3,
      bgColor: "#F1C40026",
      color: "#F1C400",
      title: "Gold",
      time: "1000 hrs",
    },
    {
      img: img4,
      bgColor: "#4FB2F326",
      color: "#4FB2F3",
      title: "Diamond",
      time: "2000 hrs",
    },
  ];

  const handleDone = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <View className="flex-row justify-between">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary text-center">
                Unlock this badge to earn Hirru coins.
              </Text>

              {/* coin */}
              <View className="flex-row items-center">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
                  <Text className="text-xs font-proximanova-semibold">
                    {data?.coin}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-center">
              <View
                className="h-[100px] w-[100px] border-2 mt-4 rounded-full flex-row justify-center items-center "
                style={{
                  backgroundColor: data.badgeBackground,
                  borderColor: data.tagColor,
                }}
              >
                <Image
                  source={data.img}
                  contentFit="contain"
                  style={{ height: 80, width: 55 }}
                />
              </View>
              <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary mt-4">
                {data.title || "Hard worker"}
              </Text>
              <Text
                className="mt-1.5 text-white px-4 py-2 rounded-full"
                style={{ backgroundColor: data.tagColor }}
              >
                {data.buttonTitle || "Bronze"}
              </Text>
            </View>
            <View className="flex-row justify-between mt-4">
              <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
                Hours worked
              </Text>
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                {data.time || "300hrs/ 500hrs"}
              </Text>
            </View>
            <CoinProgressSlider max={500} achieved={300} className="mt-4" />
            <Text className="text-base font-proximanova-semibold text-primary dark:text-dark-primary mt-2.5">
              <Text className="text-[#4FB2F3]">Next</Text>:{" "}
              {data.subTitle || "Silver badge at 500 Hours"}
            </Text>

            <View className="flex-row justify-between">
              {badchcard.map((item, index) => (
                <View className="items-center" key={index}>
                  <View
                    className="h-[50px] w-[50px] border-2 mt-4 rounded-full flex-row justify-center items-center "
                    style={{
                      backgroundColor: item.bgColor,
                      borderColor: item.color,
                    }}
                  >
                    <Image
                      source={item.img}
                      contentFit="contain"
                      style={{ height: 27, width: 18 }}
                    />
                  </View>
                  <Text className="font-proximanova-semibold text-base text-primary dark:text-dark-primary">
                    {item.title}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secotext-secondary">
                    {item.time}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="text-center font-proximanova-regular text-sm text-secondary dark:text-dark-secondary px-3">
              Earn this badge by working consisent hours over time. keep going
              to level up and earn rewardz
            </Text>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default BadgeModal;

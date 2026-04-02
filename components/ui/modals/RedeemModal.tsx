import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../buttons/PrimaryButton";

const RedeemModal = ({
  visible,
  onClose,
  data,
  namePlate,
  totalTokens = 0,
  coinPrice = 0,
}: any) => {
  const handleDone = () => {
    onClose?.();
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
          <ScrollView
            className="px-5 py-7"
          >
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary text-center">
              Ready to Redeem?
            </Text>
            <View className="flex-row items-center mx-auto mt-3">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
              <View className="px-4 py-1 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
                <Text className="text-xs font-proximanova-semibold">{totalTokens}</Text>
              </View>
            </View>

            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary text-center mt-2.5">
              This action will use your tokens to unlock the selected reward.
              Please confirm to proceed.
            </Text>

            {/* name plate */}
            {namePlate ? (
              <View className="mt-5">{namePlate}</View>
            ) : (
              <View className="bg-[#EFF9FF] rounded-xl p-2 w-full flex-row items-center -z-40 mt-5">
                <Image
                  source={data.img}
                  contentFit="contain"
                  style={{ width: 60, height: 60, margin: 15 }}
                />
                <View className="-z-30">
                  <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                    {data.title}
                  </Text>
                  <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary text-sm mt-2.5">
                    {data.subtitle}
                  </Text>
                  <View className="flex-row items-center mt-3  -z-20">
                    <Image
                      source={require("@/assets/images/hiruu-coin.svg")}
                      style={{
                        width: 22,
                        height: 22,
                      }}
                      contentFit="contain"
                    />
                    <View className="px-4 py-1 bg-[#ffffff] -ml-3 -z-10 rounded-r-[40px]">
                      <Text className="text-xs font-proximanova-semibold">
                        {data.coin}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <View className="flex-row gap-1.5 items-center mt-4">
              <Ionicons name="trail-sign" size={14} color="#4FB2F3" />

              <Text className="font-proximanova-semibold text-lg text-primary dark:text-dark-primary">
                Featured profile nameplate
              </Text>
            </View>

            <View className="bg-white rounded-lg ml-4">
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                1. Get Featured badge on your profile
              </Text>
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                2. Increases visibility in job search & referrals
              </Text>
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                3. Attracts more opportunities from businesses
              </Text>
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                4. Coin Price: {coinPrice} Tokens
              </Text>
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary mt-1.5">
                5. Current Token Balance: {totalTokens} Tokens
              </Text>
            </View>

            <PrimaryButton title="Confirm & Apply" className="mt-5" />
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default RedeemModal;

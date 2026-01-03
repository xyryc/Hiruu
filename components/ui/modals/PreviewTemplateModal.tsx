import { Entypo, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

interface Option {
  label: string;
  value: string;
}

const PreviewTemplateModal = ({ visible, onClose }: any) => {
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
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary text-center">
              Preview Template
            </Text>
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1.5 text-center">
              Review your template settings before saving
            </Text>

            <View className="border my-7 mx-12 border-[#eeeeee] rounded-xl px-4 ">
              <View className="relative items-center">
                <Image
                  source={require("@/assets/images/timer-bg.svg")}
                  contentFit="contain"
                  style={{
                    height: 32,
                    width: 210,
                    tintColor: "#EEEEEE",
                    marginTop: -2,
                  }}
                />
                <View className="absolute flex-row gap-3 mt-1.5">
                  <Text className="font-proximanova-bold text-primary dark:text-dark-primary text-center ">
                    Morning Shift
                  </Text>
                  <Feather name="edit-2" size={16} color="black" />
                </View>
              </View>

              {/* time box */}
              <View>
                <View className="flex-row justify-between items-center mt-3.5 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Time:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    7:00 AM - 3:00 PM
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-4 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Break Time:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    10:00 AM - 11:00 PM
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-4 ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Total Staff:
                  </Text>
                  <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary ">
                    15
                  </Text>
                </View>

                <View className="flex-row justify-between items-center mt-3  ">
                  <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                    Roles:
                  </Text>
                  <View className="flex-row gap-2 items-center">
                    <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary bg-[#f5f5f5] rounded-full px-2.5 py-1.5 ">
                      2 Bartender
                    </Text>
                    <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary bg-[#f5f5f5] rounded-full px-2.5 py-1.5 ">
                      +4
                    </Text>
                  </View>
                </View>
              </View>
              <Image
                source={require("@/assets/images/dotted-line.svg")}
                contentFit="contain"
                style={{ width: 210, height: 2, marginTop: 15 }}
              />

              <View className="flex-row gap-2 items-center my-2.5">
                <Image
                  source={require("@/assets/images/reward/nameplate-profile.png")}
                  contentFit="contain"
                  style={{ width: 30, height: 30 }}
                />
                <Text className="font-proximanova-regular  text-secondary dark:text-dark-secondary">
                  Hapiness Bar
                </Text>
              </View>
            </View>

            <PrimaryButton title="Apply Template" className="mt-5" />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default PreviewTemplateModal;

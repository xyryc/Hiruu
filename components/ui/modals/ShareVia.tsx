import {
  Entypo,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
} from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ShareVia = ({ visible, onClose }: any) => {
  const handleDone = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleDone}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[60%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7 ">
            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                {/* Share Via */}
                <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-7">
                  Share Via
                </Text>

                <View className="flex-row justify-between">
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
              </View>
            </ScrollView>
          </SafeAreaView>

          <SafeAreaView
            edges={["bottom"]}
            className="flex-1 px-5 py-7 justify-center"
          ></SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ShareVia;

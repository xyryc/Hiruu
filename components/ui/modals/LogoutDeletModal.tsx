import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LogoutDeletModal = ({ visible, onClose, data }: any) => {
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
        <View className="bg-white rounded-t-3xl max-h-[45%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView className="px-5 py-5 items-center">
            <Image
              source={data?.img}
              style={{
                width: 117,
                height: 111,
              }}
              contentFit="contain"
            />

            <Text className="text-center font-proximanova-semibold text-xl text-primary dark:text-dark-primary px-8 mt-5">
              {data?.title}
            </Text>
            <Text className="text-center text-sm font-proximanova-regular text-secondary dark:text-dark-secondary mt-2.5">
              {data?.subtitle}
            </Text>

            <View className="flex-row  justify-between mt-5 gap-5">
              <TouchableOpacity
                onPress={handleDone}
                className="border border-[#11111133] rounded-full py-3.5 w-[48%] items-center"
              >
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Cansel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-full py-3.5 w-[48%] items-center"
                style={{
                  backgroundColor: data?.buttonColor,
                }}
              >
                <Text className="font-proximanova-semibold text-white">
                  Yes, {data?.buttonName}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default LogoutDeletModal;

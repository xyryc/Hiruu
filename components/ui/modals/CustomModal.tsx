import TitleHeader from "@/components/header/TitleHeader";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomModal = ({ visible, onClose, data }: any) => {
  const handleDone = () => {
    onClose(); // Close the modal
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
          <SafeAreaView edges={["bottom"]} className="px-5 py-7 items-center">
            <Image
              source={data?.img}
              style={{
                width: 156,
                height: 120,
              }}
              contentFit="contain"
            />

            <TitleHeader
              className="mt-5"
              title={data?.title}
              subtitle={data?.subtitle}
            />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default CustomModal;

import CountryDropdown from "@/components/ui/modals/CountryDropdown";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../buttons/PrimaryButton";

const ImportHolidayModal = ({ visible, onClose }: any) => {
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
              {" "}
              Import National Holidays
            </Text>
            <View className="mt-8" />
            <CountryDropdown />

            <View className="flex-row gap-3 mt-3 items-center">
              <AntDesign name="warning" className="" size={20} color="red" />
              <Text className="font-proximanova-regular text-sm text-[#F34F4F] ">
                Importing holidays will reset all currently added holidays
              </Text>
            </View>
            <View className="flex-row gap-4 items-center"></View>
            <PrimaryButton title=" Import Holidays" className="mt-5" />
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ImportHolidayModal;

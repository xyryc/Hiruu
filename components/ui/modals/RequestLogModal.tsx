import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RequestLogModal = ({ visible, onClose }: any) => {
  const [selectedOption, setSelectedOption] = useState("automatic");

  const handleSave = () => {
    console.log("Selected option:", selectedOption);
    onClose();
  };

  const handleCancel = () => {
    setSelectedOption("automatic");
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
        <View className="bg-white rounded-t-3xl min-h-[45%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2 z-10">
            <TouchableOpacity onPress={handleCancel}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="flex-1">
            <View className="px-6 py-7">
              {/* Header */}
              <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary">
                Request Log Settings
              </Text>

              {/* Automatic Option */}
              <TouchableOpacity
                onPress={() => setSelectedOption("automatic")}
                className={`flex-row items-start p-4 rounded-2xl `}
              >
                <View className="flex-1 mt-8">
                  <View className="flex-row justify-between">
                    <Text className="font-proximanova-semibold text-primary dark:text-dark-primary ">
                      Automatic
                    </Text>
                    <View
                      className={`h-5 w-5 border border-secondary rounded-full flex-row justify-center items-center ${selectedOption === "automatic" && "bg-[#11293A]"} `}
                    >
                      {selectedOption === "automatic" && (
                        <MaterialIcons name="check" size={14} color="white" />
                      )}
                    </View>
                  </View>
                  <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary mt-4">
                    System will automatically handle and process all incoming
                    requests
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Manual Option */}
              <TouchableOpacity
                onPress={() => setSelectedOption("manual")}
                className={`flex-row items-start p-4 mt-3 rounded-2xl `}
              >
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                      Manual
                    </Text>
                    <View
                      className={`h-5 w-5 border border-secondary rounded-full flex-row justify-center items-center ${selectedOption === "manual" && "bg-[#11293A]"} `}
                    >
                      {selectedOption === "manual" && (
                        <MaterialIcons name="check" size={14} color="white" />
                      )}
                    </View>
                  </View>
                  <Text className="font-proximanova-regular text-secondary dark:text-dark-secondary mt-4">
                    You will need to manually approve and process each request
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Footer Buttons */}
              <View className="flex-row gap-3 mt-8">
                <TouchableOpacity
                  onPress={handleCancel}
                  className="flex-1 border border-[#11111133] rounded-full py-4"
                >
                  <Text className="text-center text-gray-700 font-proximanova-semibold text-base">
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  className="flex-1 rounded-full py-4 bg-[#11293A]"
                >
                  <Text className="text-center font-proximanova-semibold text-base text-white">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default RequestLogModal;

import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationModal = ({ visible, onClose }: any) => {
  const handleDone = () => {
    onClose(); // Close the modal
  };

  const handlePreferences = () => {
    router.push("/shared/notification-preferences");
    onClose(); // Close the modal
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
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <View className="items-center mb-4">
              <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary">
                {" "}
                Manage Notification
              </Text>
            </View>
            <View>
              <TouchableOpacity className="flex-row gap-2.5 items-center mb-6">
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="black"
                />

                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Mark all as read
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePreferences}
                className="flex-row gap-2.5 items-center mb-6"
              >
                <Ionicons name="settings-outline" size={24} color="black" />

                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Notification Preferences
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default NotificationModal;

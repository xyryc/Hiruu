import { useAuthStore } from "@/stores/authStore";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LogoutDeleteModal = ({ visible, onClose, data, onConfirm }: any) => {
  const router = useRouter()
  const { logout } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrimaryAction = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (typeof onConfirm === "function") {
        await onConfirm();
        return;
      }

      await logout();
      onClose();
      // Navigate to login after logout
      router.replace("/(auth)/login");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDone = () => {
    if (isProcessing) return;
    onClose();
  };

  const buttonLabel = (() => {
    if (!isProcessing) return `Yes, ${data?.buttonName}`;
    const buttonName = String(data?.buttonName || "").toLowerCase();
    return buttonName.includes("logout") ? "Logging out..." : "Processing...";
  })();
  const imageSize = Number(data?.imageSize) > 0 ? Number(data.imageSize) : 117;
  const isRoundImage = Boolean(data?.roundImage);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1" style={{ justifyContent: "flex-end" }}>
        <View className="bg-white rounded-t-3xl max-h-[45%]">
          {/* Close Button */}
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleDone} disabled={isProcessing}>
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
                width: imageSize,
                height: imageSize,
                borderRadius: isRoundImage ? imageSize / 2 : 0,
              }}
              contentFit={isRoundImage ? "cover" : "contain"}
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
                disabled={isProcessing}
                className="border border-[#11111133] rounded-full py-3.5 w-[48%] items-center"
              >
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-full py-3.5 w-[48%] items-center"
                style={{
                  backgroundColor: data?.buttonColor,
                  opacity: isProcessing ? 0.9 : 1,
                }}
                onPress={handlePrimaryAction}
                disabled={isProcessing}
              >
                <Text className="font-proximanova-semibold text-white">
                  {buttonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default LogoutDeleteModal;

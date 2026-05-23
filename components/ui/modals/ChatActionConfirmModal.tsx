import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatActionConfirmModalProps = {
  visible: boolean;
  title: string;
  subtitle: string;
  confirmLabel: string;
  confirmButtonClassName?: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const ChatActionConfirmModal = ({
  visible,
  title,
  subtitle,
  confirmLabel,
  confirmButtonClassName = "bg-[#EF4444]",
  onClose,
  onConfirm,
  loading = false,
}: ChatActionConfirmModalProps) => {
  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <BlurView intensity={80} tint="dark" className="flex-1" style={{ justifyContent: "flex-end" }}>
        <TouchableOpacity activeOpacity={1} onPress={handleClose} className="absolute inset-0" />

        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]}>
            <View className="px-6 pt-8 pb-4">
              <View className="items-center mb-4">
                <Image
                  source={require("@/assets/images/reject.png")}
                  style={{ width: 64, height: 64 }}
                  contentFit="contain"
                />
              </View>
              <Text className="font-proximanova-bold text-xl text-center text-primary">
                {title}
              </Text>
              <Text className="font-proximanova-regular text-sm text-center text-secondary mt-2">
                {subtitle}
              </Text>
            </View>

            <View className="px-6 pb-7 flex-row gap-3">
              <PrimaryButton
                title="Cancel"
                onPress={handleClose}
                showIcon={false}
                disabled={loading}
                className="flex-1 rounded-xl py-3 px-4 bg-[#11293A]"
              />
              <PrimaryButton
                title={confirmLabel}
                onPress={onConfirm}
                showIcon={false}
                loading={loading}
                disabled={loading}
                className={`flex-1 rounded-xl py-3 px-4 ${confirmButtonClassName}`}
              />
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ChatActionConfirmModal;

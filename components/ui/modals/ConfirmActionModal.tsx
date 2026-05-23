import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image, ImageSource } from "expo-image";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ConfirmActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  subtitle?: string;
  expiryDate?: string;
  icon?: ImageSource;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  disabled?: boolean;
};

const ConfirmActionModal = ({
  visible,
  onClose,
  onConfirm,
  title,
  subtitle,
  expiryDate,
  icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "#F34F4F",
  loading = false,
  disabled = false,
}: ConfirmActionModalProps) => {
  const isConfirmDisabled = disabled || loading;
  const resolvedSubtitle =
    subtitle && expiryDate
      ? subtitle.replace("[expiry date]", expiryDate)
      : subtitle;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1" style={{ justifyContent: "flex-end" }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />

        <View className="bg-white rounded-t-3xl max-h-[45%]">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView className="px-5 py-5 items-center">
            {!!icon && (
              <Image
                source={icon}
                style={{
                  width: 117,
                  height: 111,
                }}
                contentFit="contain"
              />
            )}

            <Text className="text-center font-proximanova-semibold text-xl text-primary dark:text-dark-primary px-8 mt-5">
              {title}
            </Text>
            {!!resolvedSubtitle && (
              <Text className="text-center text-sm font-proximanova-regular text-secondary dark:text-dark-secondary mt-2.5">
                {resolvedSubtitle}
              </Text>
            )}

            <View className="flex-row justify-between mt-5 gap-5">
              <TouchableOpacity
                onPress={onClose}
                disabled={loading}
                className="border border-[#11111133] rounded-full py-3.5 w-[48%] items-center"
              >
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {cancelLabel}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isConfirmDisabled}
                className="rounded-full py-3.5 w-[48%] items-center"
                style={{
                  backgroundColor: confirmColor,
                  opacity: isConfirmDisabled ? 0.7 : 1,
                }}
                onPress={onConfirm}
              >
                <Text className="font-proximanova-semibold text-white">
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default ConfirmActionModal;

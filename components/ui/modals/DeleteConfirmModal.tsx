import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Entypo } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DeleteConfirmModalProps = {
  visible: boolean;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

const DeleteConfirmModal = ({
  visible,
  deleting = false,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
}: DeleteConfirmModalProps) => {
  const { t } = useTranslation();
  const resolvedTitle = title || t("user.jobs.schedule.deleteRoleTitle");
  const resolvedDescription =
    description || t("user.jobs.schedule.deleteRoleDescription");
  const resolvedConfirmText = confirmText || t("user.jobs.schedule.delete");
  const resolvedCancelText = cancelText || t("user.jobs.schedule.cancel");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <BlurView intensity={80} tint="dark" className="flex-1 justify-end">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0"
        />

        <View className="bg-white rounded-t-3xl">
          <View className="absolute -top-24 inset-x-0 items-center pt-4 pb-2">
            <TouchableOpacity onPress={onClose}>
              <View className="bg-[#000] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]}>
            <View className="px-6 pt-8 pb-4">
              <Text className="font-proximanova-bold text-xl text-center text-primary">
                {resolvedTitle}
              </Text>
              <Text className="font-proximanova-regular text-sm text-center text-secondary mt-2">
                {resolvedDescription}
              </Text>
            </View>

            <View className="px-6 pb-7 flex-row gap-3">
              <PrimaryButton
                title={resolvedCancelText}
                onPress={onClose}
                showIcon={false}
                disabled={deleting}
                className="flex-1 rounded-xl py-3 px-4"
              />
              <PrimaryButton
                title={
                  deleting
                    ? t("user.jobs.schedule.deleting")
                    : resolvedConfirmText
                }
                onPress={onConfirm}
                showIcon={false}
                loading={deleting}
                disabled={deleting}
                className="flex-1 bg-[#EF4444] rounded-xl py-3 px-4"
              />
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default DeleteConfirmModal;

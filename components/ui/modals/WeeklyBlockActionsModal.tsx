import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Entypo } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type WeeklyBlockActionsModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  title?: string;
  subtitle?: string;
};

const WeeklyBlockActionsModal = ({
  visible,
  onClose,
  onUpdate,
  onDelete,
  title = "Weekly Block Actions",
  subtitle = "Selected block",
}: WeeklyBlockActionsModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />

        <View className="bg-white rounded-t-3xl overflow-hidden">
          <View className="px-6 pt-4 pb-2 flex-row justify-end">
            <TouchableOpacity onPress={onClose} className="bg-[#111111] rounded-full p-2">
              <Entypo name="cross" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <SafeAreaView edges={["bottom"]}>
            <View className="px-6 pt-2 pb-4">
              <Text className="font-proximanova-bold text-xl text-center text-primary">
                {title}
              </Text>
              <Text className="font-proximanova-regular text-sm text-center text-secondary mt-2">
                {subtitle}
              </Text>
            </View>

            <View className="px-6 pb-7 flex-row gap-3">
              <PrimaryButton
                title="Update"
                onPress={onUpdate}
                showIcon={false}
                className="flex-1 rounded-xl py-3 px-4 min-h-[48px]"
              />
              <PrimaryButton
                title="Delete"
                onPress={onDelete}
                showIcon={false}
                className="flex-1 bg-[#EF4444] rounded-xl py-3 px-4 min-h-[48px]"
              />
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default WeeklyBlockActionsModal;

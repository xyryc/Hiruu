import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
  onMarkAllAsRead?: () => Promise<void>;
};

const NotificationModal = ({ visible, onClose, onMarkAllAsRead }: NotificationModalProps) => {
  const { t } = useTranslation();
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const handleDone = () => {
    onClose(); // Close the modal
  };

  const handlePreferences = () => {
    router.push("/screens/notifications/preferences");
    onClose(); // Close the modal
  };

  const handleMarkAllAsRead = async () => {
    if (!onMarkAllAsRead || markingAllRead) return;
    try {
      setMarkingAllRead(true);
      await onMarkAllAsRead();
      onClose();
    } finally {
      setMarkingAllRead(false);
    }
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
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <View className="items-center mb-4">
              <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary">
                {t("notificationsScreen.modal.title")}
              </Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={handleMarkAllAsRead}
                disabled={markingAllRead}
                className={`flex-row gap-2.5 items-center mb-6 ${markingAllRead ? "opacity-60" : ""}`}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="black"
                />

                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {markingAllRead
                    ? t("notificationsScreen.modal.marking")
                    : t("notificationsScreen.modal.markAllAsRead")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePreferences}
                className="flex-row gap-2.5 items-center mb-6"
              >
                <Ionicons name="settings-outline" size={24} color="black" />

                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {t("notificationsScreen.modal.notificationPreferences")}
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

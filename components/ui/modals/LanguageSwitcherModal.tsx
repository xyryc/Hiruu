import { saveLanguage } from "@/utils/i18n";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LanguageSwitcherModal = ({ visible, onClose }: any) => {
  const handleDone = () => {
    onClose(); // Close the modal
  };

  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language;
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "gr", name: "ελληνικά", nativeName: "ελληνικά" },
  ];

  const changeLanguage = async (languageCode: string) => {
    await saveLanguage(languageCode);
    setModalVisible(false);
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
              <View className="bg-[#00000090] rounded-full p-2.5">
                <Entypo name="cross" size={30} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <SafeAreaView edges={["bottom"]} className="px-5 py-7">
            <View>
              {/* Header */}
              <Text className="text-xl font-proximanova-bold text-center text-primary dark:text-dark-primary mb-4">
                Select Language
              </Text>

              {/* Language Options */}
              {languages.map((language, index) => (
                <TouchableOpacity
                  key={language.code}
                  onPress={() => changeLanguage(language.code)}
                  className={`flex-row items-center justify-between p-4 rounded-xl ${
                    currentLanguage === language.code
                      ? "bg-[#E5F4FD] dark:bg-primary/20"
                      : "bg-gray-50 dark:bg-gray-800"
                  } ${index !== languages.length - 1 ? "mb-3" : ""}`}
                >
                  <View className="flex-row items-center gap-3">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        currentLanguage === language.code
                          ? "border-[#4FB2F3] bg-[#4FB2F3]"
                          : "border-gray-300"
                      }`}
                    >
                      {currentLanguage === language.code && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <View>
                      <Text
                        className={`text-base font-proximanova-semibold ${
                          currentLanguage === language.code
                            ? "text-[#4FB2F3]"
                            : "text-primary dark:text-dark-primary"
                        }`}
                      >
                        {language.nativeName}
                      </Text>
                      <Text className="text-xs font-proximanova-regular text-gray-500 dark:text-gray-400">
                        {language.name}
                      </Text>
                    </View>
                  </View>

                  {currentLanguage === language.code && (
                    <View className="bg-[#4FB2F3] px-3 py-1 rounded-full">
                      <Text className="text-xs font-proximanova-semibold text-white">
                        Active
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </View>
      </BlurView>
    </Modal>
  );
};

export default LanguageSwitcherModal;

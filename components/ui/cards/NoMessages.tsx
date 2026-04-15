import { View, Text } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const NoMessages = () => {
  const { t } = useTranslation();

  return (
    <View className="items-center justify-center h-[60vh]">
      <Feather name="message-square" size={48} color="#9CA3AF" />

      <Text
        className="text-gray-500 text-center mt-4"
        style={{ fontFamily: "SourceSans3-Medium" }}
      >
        {t("common.chat.noMessagesYet")}
      </Text>
    </View>
  );
};

export default NoMessages;

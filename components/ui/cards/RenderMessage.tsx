import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

const RenderMessage = ({ msg }) => {
  return (
    <View
      className={`flex-row gap-1.5 mb-4 ${
        msg.isSent ? "justify-end" : "justify-start"
      }`}
    >
      {!msg.isSent && (
        <Image
          source={{ uri: msg.avatar }}
          style={{ width: 40, height: 40, borderRadius: 999 }}
        />
      )}

      <View
        className={`max-w-[70%] ${msg.isSent ? "items-end" : "items-start"}`}
      >
        <View className="flex-row items-end gap-1.5">
          <View
            className={`p-2.5 rounded-2xl ${
              msg.isSent
                ? "bg-[#4FB2F3] rounded-br-sm"
                : "bg-white rounded-bl-sm"
            }`}
          >
            <Text
              className={`font-proximanova-regular text-sm ${
                msg.isSent ? "text-white" : "text-primary"
              }`}
            >
              {msg.text}
            </Text>
          </View>

          {msg.isSent && (
            <Image
              source={{ uri: msg.avatar }}
              style={{ width: 40, height: 40, borderRadius: 999 }}
            />
          )}
        </View>

        <View className="flex-row items-center mt-1 gap-1">
          {msg.isSent && msg.isRead && (
            <Ionicons name="checkmark-done" size={14} color="#4FB2F3" />
          )}

          <Text className="font-proximanova-regular text-xs text-secondary">
            {msg.time}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default RenderMessage;

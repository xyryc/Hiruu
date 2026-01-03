import { View, Text } from "react-native";
import React from "react";

const TypingIndicator = () => {
  return (
    <View className="flex-row items-center mb-4">
      <View className="flex-row gap-1.5">
        <View className="w-2 h-2 rounded-full bg-gray-400" />
        <View className="w-2 h-2 rounded-full bg-gray-400" />
        <View className="w-2 h-2 rounded-full bg-gray-400" />
      </View>
    </View>
  );
};

export default TypingIndicator;

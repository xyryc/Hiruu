import { SmallButtonProps } from "@/types";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const SmallButton = ({
  className,
  title,
  onPress,
  textClass,
}: SmallButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${className} bg-[#11293A] rounded-full px-4 py-2.5`}
    >
      <Text
        className={`${textClass} text-white text-center font-proximanova-semibold text-sm`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SmallButton;

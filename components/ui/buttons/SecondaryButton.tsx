import { SecondaryButtonProps } from "@/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const SecondaryButton = ({
  className,
  textClass,
  title,
  onPress,
  iconColor = "#fff",
  iconBackground = "bg-primary",
}: SecondaryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${className} py-2.5 px-5 bg-white rounded-full items-center justify-center max-w-[70%]`}
    >
      <Text className={`${textClass} font-proximanova-semibold text-sm mr-6`}>
        {title}
      </Text>

      <AntDesign
        name="arrow-right"
        size={18}
        color={iconColor}
        className={`${iconBackground} p-2 rounded-full absolute right-0.5`}
      />
    </TouchableOpacity>
  );
};

export default SecondaryButton;

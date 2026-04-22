import { SecondaryButtonProps } from "@/types";
import { Feather } from '@expo/vector-icons';
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
      className={`${className} py-2.5 pl-5 pr-12 bg-white rounded-full items-center justify-center self-start`}
    >
      <Text
        numberOfLines={1}
        className={`${textClass} font-proximanova-semibold text-sm`}
      >
        {title}
      </Text>

      <Feather
        name="arrow-right"
        size={17}
        color={iconColor}
        className={`${iconBackground} p-2 rounded-full absolute right-0.5`}
      />
    </TouchableOpacity>
  );
};

export default SecondaryButton;

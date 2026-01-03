import { SimpleStatusBadgeProps } from "@/types";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

const SimpleStatusBadge = ({
  className,
  title,
  textColor,
  bgColor,
  onPress,
}: SimpleStatusBadgeProps) => {
  return (
    <TouchableOpacity
      className={`${className} py-1.5 px-4 rounded-full`}
      style={{
        backgroundColor: bgColor,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        className="font-proximanova-regular text-sm"
        style={{
          color: textColor,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default SimpleStatusBadge;

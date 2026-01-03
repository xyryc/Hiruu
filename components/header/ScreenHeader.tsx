import { ScreenHeaderProps } from "@/types";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ScreenHeader = ({
  onPressBack,
  iconColor,
  title,
  titleClass,
  buttonTitle,
  onPress,
  className,
  style,
  components,
}: ScreenHeaderProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={style}
      className={`${className} flex-row justify-between items-center`}
    >
      {/* left */}
      <View className="flex-row items-center gap-2.5">
        <TouchableOpacity onPress={onPressBack} className="p-1">
          <Feather
            name="arrow-left"
            size={24}
            color={iconColor || (isDark ? "#FFFFFF" : "#000000")}
          />
        </TouchableOpacity>

        <Text
          className={`${titleClass} font-proximanova-bold text-2xl text-primary dark:text-dark-primary`}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* right */}
      <TouchableOpacity onPress={onPress} className="flex-1 items-end">
        <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
          {buttonTitle}
        </Text>
      </TouchableOpacity>

      <View>{components}</View>
    </View>
  );
};

export default ScreenHeader;

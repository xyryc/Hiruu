import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type SettingsCardProps = {
  text: string;
  icon: any;
  arrowIcon: any;
  className?: string;
  click?: any;
  fullTouchable?: boolean;
  subtitle?: string;
  border?: boolean;
};

const SettingsCard = ({
  text,
  icon,
  arrowIcon,
  className,
  click,
  fullTouchable = true,
  subtitle,
  border,
}: SettingsCardProps) => {
  const content = (
    <>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-4 flex-1 pr-3">
          <View className="bg-[#EEEEEE] h-[50px] w-[50px] justify-center items-center rounded-2xl border border-[#11293A1A]">
            {icon}
            {/* <Ionicons name="language-outline" size={24} color="#11293A" /> */}
          </View>
          <View className="flex-1">
            <Text className="text-primary dark:text-dark-primary font-proximanova-bold">
              {/* App Preferences */}
              {text}
            </Text>
            {subtitle && (
              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary mt-1.5">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        <View className="shrink-0">{arrowIcon}</View>
        {/* <Entypo name="chevron-thin-right" size={20} color="#111111" /> */}
      </View>

      {border || <View className="border-b border-[#EEEEEE] mt-4" />}
    </>
  );

  if (fullTouchable && click) {
    return (
      <TouchableOpacity onPress={click} className={`${className}`}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View className={`${className}`}>{content}</View>;
};

export default SettingsCard;

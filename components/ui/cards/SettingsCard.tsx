import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type SettingsCardProps = {
  text: string;
  icon: any;
  arrowIcon: any;
  className?: string;
  click?: any;
  subtitle?: string;
  border?: boolean;
};

const SettingsCard = ({
  text,
  icon,
  arrowIcon,
  className,
  click,
  subtitle,
  border,
}: SettingsCardProps) => {
  return (
    <TouchableOpacity onPress={click} className={`${className}`}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-4">
          <View className="bg-[#EEEEEE] h-[50px] w-[50px] justify-center items-center rounded-2xl border border-[#11293A1A]">
            {icon}
            {/* <Ionicons name="language-outline" size={24} color="#11293A" /> */}
          </View>
          <View>
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

        {arrowIcon}
        {/* <Entypo name="chevron-thin-right" size={20} color="#111111" /> */}
      </View>

      {border || <View className="border-b border-[#EEEEEE] mt-4" />}
    </TouchableOpacity>
  );
};

export default SettingsCard;

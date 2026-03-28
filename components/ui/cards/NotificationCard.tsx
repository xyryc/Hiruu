import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type NotificationCardProps = {
  timeTitle?: string;
  title: string;
  time: string;
  details: string;
  buttonTitle?: string;
  border?: boolean;
  className?: string;
  icon: React.ReactNode;
  iconBackgroundColor: string;
  onPress?: () => void;
  isUnread?: boolean;
};

const NotificationCard = ({
  timeTitle,
  title,
  time,
  details,
  buttonTitle,
  border,
  className,
  icon,
  iconBackgroundColor,
  onPress,
  isUnread = false,
}: NotificationCardProps) => {
  return (
    <View className={`${className}`}>
      {/* Section Title */}
      {timeTitle && (
        <Text className="mx-4 my-4 font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
          {timeTitle}
        </Text>
      )}

      {/* Notification Row */}
      <TouchableOpacity
        className={`w-full flex-row gap-3 px-6 py-4 ${isUnread ? "bg-[#E9EEF5] dark:bg-[#2A2F36]" : "bg-white dark:bg-dark-bg"
          }`}
        activeOpacity={onPress ? 0.72 : 1}
        disabled={!onPress}
        onPress={onPress}
      >
        {/* Icon */}
        <View
          className=" h-10 w-10 rounded-full justify-center items-center"
          style={{ backgroundColor: iconBackgroundColor, borderRadius: 50 }}
        >
          {icon}
        </View>

        {/* Text + Button Section */}
        <View className="flex-1">
          {/* Header Row */}
          <View className="flex-row justify-between items-center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="flex-1 mr-2 font-proximanova-semibold text-sm text-primary dark:text-dark-primary"
            >
              {title}
            </Text>
            <Text
              className="shrink-0 font-proximanova-regular text-xs text-secondary dark:text-dark-sectext-secondary"
            >
              {time}
            </Text>
          </View>

          {/* Description */}
          <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-sectext-primary mt-2">
            {details}
          </Text>

          {/* Button */}
          {buttonTitle && (
            <TouchableOpacity
              className="bg-[#11293A] px-5 py-2.5 mt-1.5 rounded-full self-start active:opacity-80"
              onPress={onPress}
            >
              <Text className="font-proximanova-semibold text-sm text-white">
                {buttonTitle}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {border && <View className="border-b border-[#eeeeee]" />}
    </View>
  );
};

export default NotificationCard;

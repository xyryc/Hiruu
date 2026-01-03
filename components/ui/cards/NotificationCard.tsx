import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

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
}: NotificationCardProps) => {
  return (
    <View className={`${className}`}>
      {/* Section Title */}
      {timeTitle && (
        <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
          {timeTitle}
        </Text>
      )}

      {/* Notification Row */}
      <View className="flex-row gap-3 mt-4 bg-white dark:bg-dark-bg rounded-2xl">
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
            <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary">
              {title}
            </Text>
            <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-sectext-secondary">
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
              onPress={() => console.log("Submit Correction pressed")}
            >
              <Text className="font-proximanova-semibold text-sm text-white">
                {buttonTitle}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {border && <View className="border-b border-[#eeeeee] mt-4 " />}
    </View>
  );
};

export default NotificationCard;

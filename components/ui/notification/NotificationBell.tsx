import { useNotificationStore } from "@/stores/notificationStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type NotificationBellProps = {
  className?: string;
  iconSize?: number;
};

const NotificationBell = ({ className = "", iconSize = 20 }: NotificationBellProps) => {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount().catch(() => undefined);
    }, [fetchUnreadCount])
  );

  return (
    <TouchableOpacity
      onPress={() => router.push("/screens/notifications")}
      className={className}
    >
      <Image
        source={require("@/assets/images/bell.svg")}
        style={{
          width: iconSize,
          height: iconSize,
        }}
        contentFit="contain"
      />
      {unreadCount > 0 ? (
        <View className="bg-[#4FB2F3] absolute top-1.5 right-2 min-w-[14px] h-3.5 px-[2px] items-center justify-center rounded-full">
          <Text className="text-[10px] text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default NotificationBell;


import { chatService } from "@/services/chatService";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ChatBellProps = {
  className?: string;
  iconSize?: number;
};

const ChatBell = ({ className = "", iconSize = 20 }: ChatBellProps) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await chatService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnreadCount();
    }, [loadUnreadCount])
  );

  return (
    <TouchableOpacity
      onPress={() => router.push("/screens/inbox/chat-list")}
      className={className}
    >
      <Image
        source={require("@/assets/images/messages.svg")}
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

export default ChatBell;

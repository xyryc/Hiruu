import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

type ChatListItemProps = {
  onPress: () => void;
  title: string;
  subtitle?: string;
  time?: string;
  avatar?: string;
  unreadCount?: number;
  badgeAvatar?: string;
  messageStatus?: string;
  isOwnMessage?: boolean;
};

const getStatusMeta = (status?: string) => {
  const value = String(status || "").toLowerCase();
  if (value === "read" || value === "seen") {
    return { name: "checkmark-done" as const, color: "#4FB2F3" };
  }
  if (value === "delivered") {
    return { name: "checkmark-done" as const, color: "#111827" };
  }
  if (value === "sent") {
    return { name: "checkmark" as const, color: "#111827" };
  }
  if (value === "sending" || value === "pending") {
    return { name: "time-outline" as const, color: "#6B7280" };
  }
  if (value === "failed") {
    return { name: "alert-circle" as const, color: "#EF4444" };
  }
  return null;
};

const ChatListItem = ({
  onPress,
  title,
  subtitle,
  time,
  avatar,
  unreadCount = 0,
  badgeAvatar,
  messageStatus,
  isOwnMessage = false,
}: ChatListItemProps) => {
  const { t } = useTranslation();
  const statusMeta = getStatusMeta(messageStatus);
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-2.5 py-4 border-b border-[#EEEEEE]"
    >
      {/* left */}
      <View>
        <Image
          source={avatar || require("@/assets/images/placeholder.png")}
          style={{
            width: 50,
            height: 50,
            borderRadius: 999,
          }}
          contentFit="cover"
        />
        {!!badgeAvatar && (
          <Image
            source={badgeAvatar}
            style={{
              width: 25,
              height: 25,
              borderRadius: 999,
              position: "absolute",
              bottom: -5,
              right: -5,
            }}
            contentFit="cover"
          />
        )}
      </View>

      {/* right */}
      <View className="flex-1">
        {/* top */}
        <View className="flex-row justify-between items-center">
          <Text className="font-proximanova-semibold text-lg text-primary">
            {title}
          </Text>
          {!!time && (
            <Text className="font-proximanova-regular text-base text-primary">
              {time}
            </Text>
          )}
        </View>

        {/* bottom */}
        <View className="flex-1 flex-row justify-between items-center">
          <View className="flex-row gap-1.5 items-center">
            {isOwnMessage && statusMeta ? (
              <Ionicons name={statusMeta.name} size={14} color={statusMeta.color} />
            ) : null}

            <Text
              className={`text-sm font-proximanova-regular text-primary ${isOwnMessage && statusMeta ? "w-4/5" : "w-[88%]"}`}
              numberOfLines={1}
            >
              {subtitle || t("common.chat.noMessagesYet")}
            </Text>
          </View>

          {unreadCount > 0 && (
            <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
              <Text className="font-proximanova-semibold text-sm text-white">
                {unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatListItem;

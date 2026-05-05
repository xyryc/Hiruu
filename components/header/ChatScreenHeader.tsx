import { Entypo, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";

interface ChatScreenHeaderProps {
  loading?: boolean;
  title?: string;
  avatar?: string | null;
  isOnline?: boolean;
  onAudioCallPress?: () => void;
  onVideoCallPress?: () => void;
  onSeeProfilePress?: () => void;
  onToggleBlockUserPress?: () => void;
  onDeleteConversationPress?: () => void;
  isBlocked?: boolean;
  isTogglingBlockUser?: boolean;
  isDeletingConversation?: boolean;
  isStartingAudioCall?: boolean;
  isStartingVideoCall?: boolean;
}

const ChatScreenHeader = ({
  loading = false,
  title,
  avatar,
  isOnline,
  onAudioCallPress,
  onVideoCallPress,
  onSeeProfilePress,
  onToggleBlockUserPress,
  onDeleteConversationPress,
  isBlocked = false,
  isTogglingBlockUser = false,
  isDeletingConversation = false,
  isStartingAudioCall = false,
  isStartingVideoCall = false,
}: ChatScreenHeaderProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <View className="bg-white px-4 pt-2.5 pb-5 flex-row items-center justify-between border-b border-[#EEEEEE]">
        <View className="flex-row items-center flex-1 min-w-0 mr-2">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back-outline" size={24} color="black" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1 min-w-0">
            <View className="w-10 h-10 rounded-full bg-[#E1EAF2]" />
            <View className="ml-3 flex-1 min-w-0">
              <View className="h-4 w-32 rounded-full bg-[#E1EAF2]" />
              <View className="h-3 w-20 rounded-full bg-[#E1EAF2] mt-2" />
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-4 shrink-0">
          <View className="w-10 h-10 rounded-full bg-[#E1EAF2]" />
          <View className="w-10 h-10 rounded-full bg-[#E1EAF2]" />
          <View className="w-4 h-4 rounded-full bg-[#E1EAF2]" />
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white px-4 pt-2.5 pb-5 flex-row items-center justify-between border-b border-[#EEEEEE]">
      <View className="flex-row items-center flex-1 min-w-0 mr-2">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center flex-1 min-w-0"
          onPress={onSeeProfilePress}
          disabled={!onSeeProfilePress}
          activeOpacity={0.7}
        >
          <Image
            source={
              avatar
                ? { uri: avatar }
                : require("@/assets/images/placeholder.png")
            }
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-3 flex-1 min-w-0">
            <Text className="text-lg font-proximanova-semibold text-primary" numberOfLines={1}>
              {title || t("common.chat.defaultTitle")}
            </Text>
            {typeof isOnline === "boolean" ? (
              <Text className="text-xs font-proximanova-regular text-secondary">
                {isOnline ? t("common.chat.online") : t("common.chat.offline")}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-4 shrink-0">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-[#F5F5F5] border-[0.5px] border-[#B2B1B165]"
          onPress={onAudioCallPress}
          disabled={isStartingAudioCall || isBlocked}
        >
          {isStartingAudioCall ? (
            <ActivityIndicator size="small" color="#111111" />
          ) : (
            <Ionicons name="call-outline" size={20} color="black" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full bg-[#F5F5F5] border-[0.5px] border-[#b2b1b165]"
          onPress={onVideoCallPress}
          disabled={isStartingVideoCall || isBlocked}
        >
          {isStartingVideoCall ? (
            <ActivityIndicator size="small" color="#111111" />
          ) : (
            <Ionicons name="videocam-outline" size={20} color="black" />
          )}
        </TouchableOpacity>

        <View className="relative">
          <TouchableOpacity onPress={() => setShowMenu((prev) => !prev)}>
            <Entypo name="dots-three-vertical" size={18} color="black" />
          </TouchableOpacity>

          {showMenu ? (
            <View className="absolute top-8 right-0 z-50 w-44 rounded-xl bg-white shadow-sm border border-gray-200">
              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-200"
                onPress={() => {
                  setShowMenu(false);
                  onSeeProfilePress?.();
                }}
              >
                <Text className="text-sm font-proximanova-regular text-primary">
                  {t("common.chat.seeProfile")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-200"
                onPress={() => {
                  setShowMenu(false);
                  onToggleBlockUserPress?.();
                }}
                disabled={!onToggleBlockUserPress || isTogglingBlockUser}
              >
                <Text className="text-sm font-proximanova-regular text-primary">
                  {isTogglingBlockUser
                    ? isBlocked
                      ? t("common.chat.unblocking")
                      : t("common.chat.blocking")
                    : isBlocked
                      ? t("common.chat.modalUnblockTitle")
                      : t("common.chat.modalBlockTitle")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => {
                  setShowMenu(false);
                  onDeleteConversationPress?.();
                }}
                disabled={!onDeleteConversationPress || isDeletingConversation}
              >
                <Text className="text-sm font-proximanova-regular text-[#EF4444]">
                  {isDeletingConversation
                    ? t("common.chat.deletingConversation")
                    : t("common.chat.modalDeleteTitle")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default ChatScreenHeader;

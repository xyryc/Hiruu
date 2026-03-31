import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";

const getStatusMeta = (status: string) => {
  switch ((status || "").toLowerCase()) {
    case "read":
      return { name: "checkmark-done" as const, color: "#4FB2F3" };
    case "delivered":
      return { name: "checkmark-done" as const, color: "#111827" };
    case "sent":
      return { name: "checkmark" as const, color: "#111827" };
    case "failed":
      return { name: "alert-circle" as const, color: "#EF4444" };
    case "deleted":
      return { name: "trash" as const, color: "#9CA3AF" };
    default:
      return null;
  }
};

interface MessageProps {
  msg: {
    id: string | number;
    text: string;
    time: string;
    isSent: boolean;
    status?: string;
    avatar: any;
    media?: {
      id: string;
      uri: string;
      previewType: "image" | "video";
      name?: string;
      thumbnailUrl?: string;
    }[];
    call?: {
      type: "audio" | "video";
      status: string;
      label: string;
      subtitle?: string;
      duration?: string;
    } | null;
    uploadState?: "uploading" | "failed";
  };
  onRetryMediaUpload?: (messageId: string | number) => void;
}

const RenderMessage: React.FC<MessageProps> = ({ msg, onRetryMediaUpload }) => {
  const statusMeta = getStatusMeta(msg.status || "");
  const media = Array.isArray(msg.media) ? msg.media : [];
  const call = msg.call || null;
  const shouldShowTextBubble = !!msg.text && !call;
  const showMediaUploadState = msg.isSent && media.length > 0;
  const isUploadingMedia = showMediaUploadState && msg.uploadState === "uploading";
  const isFailedMedia = showMediaUploadState && msg.uploadState === "failed";

  const avatarSource = typeof msg.avatar === "string" ? { uri: msg.avatar } : msg.avatar;

  return (
    <View className={`flex-row gap-1.5 mb-4 ${msg.isSent ? "justify-end" : "justify-start"}`}>
      {!msg.isSent && (
        <Image source={avatarSource} style={{ width: 40, height: 40, borderRadius: 999 }} contentFit="cover" />
      )}

      <View className={`max-w-[70%] ${msg.isSent ? "items-end" : "items-start"}`}>
        <View className="flex-row items-end gap-1.5">
          <View className="gap-2">
            {call && (
              <View
                className={`w-[220px] rounded-2xl px-3.5 py-3 border ${
                  msg.isSent
                    ? "bg-[#3D9FDF] border-[#66BCEB]"
                    : "bg-[#F8FAFC] border-[#E2E8F0]"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center ${
                      msg.isSent ? "bg-white/20" : "bg-[#E5EDF5]"
                    }`}
                  >
                    <Ionicons
                      name={call.type === "video" ? "videocam-outline" : "call-outline"}
                      size={16}
                      color={msg.isSent ? "#FFFFFF" : "#11293A"}
                    />
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-proximanova-semibold text-sm ${
                        msg.isSent ? "text-white" : "text-primary"
                      }`}
                      numberOfLines={1}
                    >
                      {call.label}
                    </Text>
                    <Text
                      className={`font-proximanova-regular text-xs mt-0.5 ${
                        msg.isSent ? "text-[#E9F6FF]" : "text-secondary"
                      }`}
                    >
                      {call.subtitle || "Call activity"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {media.map((item) =>
              item.previewType === "image" ? (
                <Image
                  key={item.id}
                  source={{ uri: item.uri }}
                  style={{ width: 220, height: 160, borderRadius: 14 }}
                  contentFit="cover"
                />
              ) : (
                <TouchableOpacity
                  key={item.id}
                  className="w-[220px] h-[140px] rounded-2xl bg-[#0F1C25] items-center justify-center px-3"
                  onPress={() => Linking.openURL(item.uri)}
                  activeOpacity={0.8}
                >
                  {item.thumbnailUrl ? (
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={{ width: 220, height: 140, borderRadius: 14, position: "absolute" }}
                      contentFit="cover"
                    />
                  ) : null}
                  <View className="w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                    <Ionicons name="play" size={18} color="#fff" />
                  </View>
                  <Text className="text-white text-xs mt-2" numberOfLines={1}>
                    {item.name || "Video"}
                  </Text>
                </TouchableOpacity>
              )
            )}

            {shouldShowTextBubble && (
              <View
                className={`p-2.5 rounded-2xl ${
                  msg.isSent ? "bg-[#4FB2F3] rounded-br-sm" : "bg-white rounded-bl-sm"
                }`}
              >
                <Text className={`font-proximanova-regular text-sm ${msg.isSent ? "text-white" : "text-primary"}`}>
                  {msg.text}
                </Text>
              </View>
            )}

            {isUploadingMedia ? (
              <Text className="font-proximanova-regular text-xs text-secondary">
                Uploading media...
              </Text>
            ) : null}

            {isFailedMedia ? (
              <View className="flex-row items-center gap-2">
                <Text className="font-proximanova-regular text-xs text-[#EF4444]">
                  Failed to upload media
                </Text>
                <TouchableOpacity
                  onPress={() => onRetryMediaUpload?.(msg.id)}
                  activeOpacity={0.8}
                >
                  <Text className="font-proximanova-semibold text-xs text-[#3D9FDF]">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {msg.isSent && (
            <Image source={avatarSource} style={{ width: 40, height: 40, borderRadius: 999 }} contentFit="cover" />
          )}
        </View>

        <View className="flex-row items-center mt-1 gap-1">
          {msg.isSent && statusMeta && <Ionicons name={statusMeta.name} size={14} color={statusMeta.color} />}

          <Text className="font-proximanova-regular text-xs text-secondary">{msg.time}</Text>
        </View>
      </View>
    </View>
  );
};

export default RenderMessage;

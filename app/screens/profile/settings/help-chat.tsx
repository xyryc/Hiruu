import ScreenHeader from "@/components/header/ScreenHeader";
import NoMessages from "@/components/ui/cards/NoMessages";
import RenderMessage from "@/components/ui/cards/RenderMessage";
import ChatInput from "@/components/ui/inputs/ChatInput";
import TypingIndicator from "@/components/ui/inputs/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const formatMessageTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const resolveAvatar = (avatar?: string | null) => {
  if (!avatar) {
    return "https://ui-avatars.com/api/?name=Support&background=E5F4FD&color=11293A";
  }

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "");
  return `${base}${avatar.startsWith("/") ? avatar : `/${avatar}`}`;
};

const HelpChat = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ roomId?: string; chatRoomName?: string }>();
  const roomId = typeof params.roomId === "string" ? params.roomId : "";
  const chatRoomName =
    typeof params.chatRoomName === "string" && params.chatRoomName.trim().length > 0
      ? params.chatRoomName
      : "Support Chat";
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [androidKeyboardOffset, setAndroidKeyboardOffset] = useState(0);

  const {
    messages,
    loading,
    sending,
    isTyping,
    typingUser,
    sendMessage,
    retryFailedMessage,
    startTyping,
    stopTyping,
    refreshMessages,
  } = useChat({
    roomId,
    onError: (error) => {
      toast.error(error?.message || "Chat error");
    },
  });

  const mappedMessages = useMemo(
    () =>
      messages.map((item: any) => ({
        id: item.id,
        text: item.content || "",
        time: formatMessageTime(item.createdAt),
        isSent: item.senderId === user?.id || item.sender?.id === user?.id,
        status: item.status,
        avatar: resolveAvatar(item.sender?.avatar),
        media: Array.isArray(item.attachments)
          ? item.attachments
              .map((attachment: any, index: number) => {
                const uri = attachment?.url || attachment?.uri;
                if (!uri) return null;
                return {
                  id: `${item.id}-${index}`,
                  uri,
                  previewType:
                    String(attachment?.type || "").toLowerCase() === "video"
                      ? "video"
                      : "image",
                  name: attachment?.fileName,
                  thumbnailUrl: attachment?.thumbnailUrl,
                };
              })
              .filter(Boolean)
          : [],
        uploadState: item.uploadState,
      })),
    [messages, user?.id]
  );

  const handleRefresh = async () => {
    if (!roomId) return;
    try {
      setRefreshing(true);
      await refreshMessages();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSend = async () => {
    const ok = await sendMessage({ content: message });
    if (ok) {
      setMessage("");
    }
  };

  React.useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setAndroidKeyboardOffset(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{ paddingTop: insets.top + 10 }}
        className="pb-6 bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        onPressBack={() => router.back()}
        title={chatRoomName}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View className="bg-white flex-1">
          {loading && !mappedMessages.length ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={isDark ? "#fff" : "#111"} />
            </View>
          ) : !mappedMessages.length ? (
            <View className="flex-1">
              <NoMessages />
            </View>
          ) : (
            <FlatList
              data={mappedMessages}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
              showsVerticalScrollIndicator={false}
              inverted
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              renderItem={({ item }) => (
                <RenderMessage
                  msg={item}
                  onRetryMediaUpload={(messageId) => {
                    retryFailedMessage(String(messageId)).catch(() => null);
                  }}
                />
              )}
              ListHeaderComponent={
                <TypingIndicator isTyping={isTyping} userName={typingUser || undefined} />
              }
            />
          )}

          <View style={{ marginBottom: Platform.OS === "android" ? androidKeyboardOffset : 0 }}>
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSend={handleSend}
              onTyping={startTyping}
              onStopTyping={stopTyping}
              isSending={sending}
              disabled={!roomId}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HelpChat;

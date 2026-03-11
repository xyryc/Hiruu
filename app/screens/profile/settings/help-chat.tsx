import ScreenHeader from "@/components/header/ScreenHeader";
import NoMessages from "@/components/ui/cards/NoMessages";
import RenderMessage from "@/components/ui/cards/RenderMessage";
import ChatInput from "@/components/ui/inputs/ChatInput";
import TypingIndicator from "@/components/ui/inputs/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useAuthStore } from "@/stores/authStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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
  const [androidKeyboardOffset, setAndroidKeyboardOffset] = useState(0);
  const listRef = useRef<FlatList<any> | null>(null);
  const previousMessageCountRef = useRef(0);
  const didInitialScrollRef = useRef(false);
  const initialAutoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
  } = useChat({
    roomId,
    onError: (error) => {
      toast.error(error?.message || "Chat error");
    },
  });

  const mappedMessages = useMemo(() => {
    const sortedMessages = [...messages].sort((a: any, b: any) => {
      const aTime = new Date(a?.createdAt || 0).getTime();
      const bTime = new Date(b?.createdAt || 0).getTime();
      return aTime - bTime;
    });

    return sortedMessages.map((item: any) => ({
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
      }));
  }, [messages, user?.id]);

  const scrollToBottom = useCallback((animated: boolean) => {
    const list = listRef.current;
    if (!list) return;
    requestAnimationFrame(() => {
      try {
        list.scrollToEnd({ animated });
      } catch {
        // Ignore transient layout timing errors.
      }
    });
  }, []);

  React.useEffect(() => {
    if (!mappedMessages.length) {
      previousMessageCountRef.current = 0;
      didInitialScrollRef.current = false;
      if (initialAutoScrollTimerRef.current) {
        clearInterval(initialAutoScrollTimerRef.current);
        initialAutoScrollTimerRef.current = null;
      }
      return;
    }

    const hasNewMessage = mappedMessages.length > previousMessageCountRef.current;
    if (hasNewMessage) {
      scrollToBottom(previousMessageCountRef.current > 0);
    }

    previousMessageCountRef.current = mappedMessages.length;
  }, [mappedMessages.length, scrollToBottom]);

  React.useEffect(() => {
    if (loading || !mappedMessages.length || didInitialScrollRef.current) return;

    let attempts = 0;
    if (initialAutoScrollTimerRef.current) {
      clearInterval(initialAutoScrollTimerRef.current);
      initialAutoScrollTimerRef.current = null;
    }

    initialAutoScrollTimerRef.current = setInterval(() => {
      scrollToBottom(false);
      attempts += 1;
      if (attempts >= 8) {
        if (initialAutoScrollTimerRef.current) {
          clearInterval(initialAutoScrollTimerRef.current);
          initialAutoScrollTimerRef.current = null;
        }
        didInitialScrollRef.current = true;
      }
    }, 120);

    return () => {
      if (initialAutoScrollTimerRef.current) {
        clearInterval(initialAutoScrollTimerRef.current);
        initialAutoScrollTimerRef.current = null;
      }
    };
  }, [loading, mappedMessages.length, scrollToBottom]);

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
              ref={listRef}
              data={mappedMessages}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                if (!mappedMessages.length || didInitialScrollRef.current) return;
                scrollToBottom(false);
              }}
              onLayout={() => {
                if (!mappedMessages.length || didInitialScrollRef.current) return;
                scrollToBottom(false);
              }}
              renderItem={({ item }) => (
                <RenderMessage
                  msg={item}
                  onRetryMediaUpload={(messageId) => {
                    retryFailedMessage(String(messageId)).catch(() => null);
                  }}
                />
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}

          <View style={{ marginBottom: Platform.OS === "android" ? androidKeyboardOffset : 0 }}>
            <TypingIndicator isTyping={isTyping} userName={typingUser || undefined} />
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

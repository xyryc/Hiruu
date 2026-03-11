import ScreenHeader from "@/components/header/ScreenHeader";
import NoMessages from "@/components/ui/cards/NoMessages";
import RenderMessage from "@/components/ui/cards/RenderMessage";
import ChatInput from "@/components/ui/inputs/ChatInput";
import TypingIndicator from "@/components/ui/inputs/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import type { ChatUploadMedia } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
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

type SelectedMedia = ChatUploadMedia & {
  previewType: "image" | "video";
};

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
  const params = useLocalSearchParams<{
    roomId?: string | string[];
    chatRoomName?: string | string[];
  }>();
  const roomId = useMemo(() => {
    const candidate = params.roomId;
    if (typeof candidate === "string") return candidate.trim();
    if (Array.isArray(candidate) && typeof candidate[0] === "string") {
      return candidate[0].trim();
    }
    return "";
  }, [params.roomId]);
  const chatRoomName = useMemo(() => {
    const candidate = params.chatRoomName;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate;
    }
    if (Array.isArray(candidate) && typeof candidate[0] === "string") {
      return candidate[0].trim() || "Support Chat";
    }
    return "Support Chat";
  }, [params.chatRoomName]);
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [androidKeyboardOffset, setAndroidKeyboardOffset] = useState(0);
  const listRef = useRef<FlatList<any> | null>(null);
  const previousMessageCountRef = useRef(0);
  const didInitialScrollRef = useRef(false);
  const initialAutoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    messages,
    loading,
    connected,
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

  useFocusEffect(
    useCallback(() => {
      if (!roomId) return () => {};
      refreshMessages().catch(() => null);
      return () => {};
    }, [roomId, refreshMessages])
  );

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

  React.useEffect(() => {
    console.log("support chat data:", messages);
  }, [messages]);

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

  const handlePickMedia = useCallback(async () => {
    if (sending) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      toast.error("Permission to access media library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (result.canceled) return;

    const pickedMedia: SelectedMedia[] = result.assets
      .map((asset, index) => {
        const previewType =
          asset.type === "video" ? "video" : asset.type === "image" ? "image" : null;

        if (!previewType) return null;

        const extension = previewType === "video" ? "mp4" : "jpg";
        const fallbackName = `upload-${Date.now()}-${index}.${extension}`;

        return {
          uri: asset.uri,
          type: asset.mimeType || (previewType === "video" ? "video/mp4" : "image/jpeg"),
          name: asset.fileName || fallbackName,
          previewType,
        };
      })
      .filter((item): item is SelectedMedia => Boolean(item));

    if (!pickedMedia.length) {
      toast.error("Only images and videos are supported right now.");
      return;
    }

    setSelectedMedia((prev) => {
      const existingUris = new Set(prev.map((item) => item.uri));
      const uniqueNew = pickedMedia.filter((item) => !existingUris.has(item.uri));
      return [...prev, ...uniqueNew];
    });
  }, [sending]);

  const handleRemoveSelectedMedia = useCallback((uri: string) => {
    setSelectedMedia((prev) => prev.filter((item) => item.uri !== uri));
  }, []);

  const handleSend = useCallback(async () => {
    if (sending) return;

    const content = message.trim();
    const media = selectedMedia.map(({ previewType, ...file }) => file);

    if (!content && media.length === 0) return;

    setMessage("");
    setSelectedMedia([]);

    const success = await sendMessage({
      content: content || undefined,
      media,
    });

    if (!success) {
      setMessage(content);
      setSelectedMedia((prev) => (prev.length ? prev : selectedMedia));
    }
  }, [message, selectedMedia, sending, sendMessage]);

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
              attachments={selectedMedia}
              onPickMedia={handlePickMedia}
              onRemoveMedia={handleRemoveSelectedMedia}
              onTyping={startTyping}
              onStopTyping={stopTyping}
              isSending={sending}
              disabled={!roomId || (!connected && loading)}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HelpChat;

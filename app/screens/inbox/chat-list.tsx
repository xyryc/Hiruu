import ScreenHeader from "@/components/header/ScreenHeader";
import ChatListItem from "@/components/ui/cards/ChatListItem";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { chatService } from "@/services/chatService";
import { socketService } from "@/services/socketService";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ChatList = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: "group", label: t("common.chat.groupTab") },
    { key: "chat", label: t("common.chat.chatTab") },
  ];
  const [isActive, setIsActive] = useState("group");
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [typingByRoom, setTypingByRoom] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const typingTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const hasLoadedOnceRef = useRef(false);

  const loadRooms = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const result = await chatService.getChatRooms();
        console.log("[CHAT_LIST_DEBUG] getChatRooms raw:", JSON.stringify(result, null, 2));
        const data = result?.data || [];
        const snapshot = Array.isArray(data)
          ? data.map((room: any, index: number) => ({
              index,
              id: room?.id,
              type: room?.type,
              unreadCount: room?.unreadCount,
              updatedAt: room?.updatedAt,
              lastMessageAt: room?.lastMessageAt,
              lastMessageId: room?.lastMessage?.id,
              lastMessageCreatedAt: room?.lastMessage?.createdAt,
              lastMessageText:
                room?.lastMessage?.content ||
                room?.lastMessage?.text ||
                room?.lastMessage?.message ||
                null,
            }))
          : [];
        console.log("[CHAT_LIST_DEBUG] parsed rooms snapshot:", JSON.stringify(snapshot, null, 2));
        setRooms(Array.isArray(data) ? data : []);
      } catch (error: any) {
        toast.error(error?.message || t("common.chat.failedToLoadChats"));
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [t]
  );

  useEffect(() => {
    loadRooms().catch(() => undefined);
    hasLoadedOnceRef.current = true;
  }, [loadRooms]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedOnceRef.current) return;
      loadRooms(true).catch(() => undefined);
    }, [loadRooms])
  );

  useEffect(() => {
    const unsubscribe = chatService.onRoomDeleted((deletedRoomId) => {
      setRooms((prev) => prev.filter((room) => room?.id !== deletedRoomId));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isMounted = true;
    let handlers: any = null;

    const setupRealtime = async () => {
      try {
        const socket = await socketService.connect();
        if (!socket || !isMounted) return;

        const handleNewMessage = (data: any) => {
          const incomingMessage = data?.message || data;
          const roomId =
            data?.chatRoomId ||
            data?.roomId ||
            data?.chatId ||
            incomingMessage?.chatRoomId ||
            incomingMessage?.chatRoom?.id ||
            incomingMessage?.roomId;
          if (!roomId) return;

          setTypingByRoom((prev) => {
            if (!prev[roomId]) return prev;
            const next = { ...prev };
            delete next[roomId];
            return next;
          });

          setRooms((prev) => {
            const index = prev.findIndex((room) => room?.id === roomId);
            if (index < 0) {
              return prev;
            }

            const room = prev[index];
            const isOwnMessage = incomingMessage?.senderId === user?.id;
            const nextUnread = isOwnMessage
              ? Number(room?.unreadCount || 0)
              : Number(room?.unreadCount || 0) + 1;

            const updatedRoom = {
              ...room,
              lastMessage: {
                ...(room?.lastMessage || {}),
                ...(incomingMessage || {}),
              },
              lastMessageAt:
                incomingMessage?.createdAt ||
                incomingMessage?.updatedAt ||
                room?.lastMessageAt,
              updatedAt:
                incomingMessage?.createdAt ||
                incomingMessage?.updatedAt ||
                room?.updatedAt,
              unreadCount: nextUnread,
            };

            const next = [...prev];
            next.splice(index, 1);
            next.unshift(updatedRoom);
            return next;
          });
        };

        const handleMessageRead = (data: any) => {
          const payload = data || {};
          const roomId = payload.chatRoomId || payload.roomId || payload.chatId;
          if (!roomId) return;

          const readMessageId =
            payload.messageId ||
            payload.lastReadMessageId ||
            payload?.message?.id ||
            payload?.data?.messageId ||
            null;

          setRooms((prev) =>
            prev.map((room) => {
              if (room?.id !== roomId) return room;
              if (!room?.lastMessage) return room;
              if (room?.lastMessage?.senderId !== user?.id) return room;
              if (readMessageId && String(room?.lastMessage?.id) !== String(readMessageId)) {
                return room;
              }
              return {
                ...room,
                lastMessage: {
                  ...room.lastMessage,
                  status: "read",
                },
              };
            })
          );
        };

        const clearTyping = (roomId: string) => {
          setTypingByRoom((prev) => {
            if (!prev[roomId]) return prev;
            const next = { ...prev };
            delete next[roomId];
            return next;
          });
          const timeout = typingTimeoutsRef.current[roomId];
          if (timeout) {
            clearTimeout(timeout);
            delete typingTimeoutsRef.current[roomId];
          }
        };

        const handleUserTyping = (data: any) => {
          const payload = data || {};
          const roomId = payload.chatRoomId || payload.roomId || payload.chatId;
          if (!roomId) return;
          const typingUserId =
            payload.userId ||
            payload.senderId ||
            payload.user?.id ||
            payload.sender?.id;
          if (typingUserId && typingUserId === user?.id) return;

          const isTyping =
            payload.isTyping !== false &&
            payload.typing !== false;
          if (!isTyping) {
            clearTyping(roomId);
            return;
          }

          const typingName =
            payload.userName ||
            payload.name ||
            payload.user?.name ||
            payload.sender?.name ||
            "Typing...";

          setTypingByRoom((prev) => ({ ...prev, [roomId]: typingName }));
          const existingTimeout = typingTimeoutsRef.current[roomId];
          if (existingTimeout) clearTimeout(existingTimeout);
          typingTimeoutsRef.current[roomId] = setTimeout(() => {
            clearTyping(roomId);
          }, 2200);
        };

        const handleTypingStop = (data: any) => {
          const payload = data || {};
          const roomId = payload.chatRoomId || payload.roomId || payload.chatId;
          if (!roomId) return;
          clearTyping(roomId);
        };

        socketService.onNewMessage(handleNewMessage);
        socketService.onMessageRead(handleMessageRead);
        socketService.onUserTyping(handleUserTyping);
        socket.on("typing_stop", handleTypingStop);

        handlers = {
          handleNewMessage,
          handleMessageRead,
          handleUserTyping,
          handleTypingStop,
        };
      } catch {
        // Ignore realtime setup failures in list view
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (handlers) {
        socketService.offNewMessage(handlers.handleNewMessage);
        socketService.offMessageRead(handlers.handleMessageRead);
        socketService.offUserTyping(handlers.handleUserTyping);
        socketService.getSocket()?.off("typing_stop", handlers.handleTypingStop);
      }
      Object.values(typingTimeoutsRef.current).forEach((timeout) =>
        clearTimeout(timeout)
      );
      typingTimeoutsRef.current = {};
    };
  }, [loadRooms, user?.id]);

  const getDirectUser = useCallback(
    (room: any) => {
      const currentUserId = user?.id;
      const participant = room?.participants?.find(
        (p: any) => p?.userId && p?.userId !== currentUserId
      );
      return participant?.user || room?.participants?.[0]?.user;
    },
    [user?.id]
  );

  const filteredRooms = useMemo(() => {
    const tabFiltered = rooms.filter((room) =>
      isActive === "group" ? room.type !== "direct" : room.type === "direct"
    );

    const query = searchQuery.trim().toLowerCase();
    if (!query) return tabFiltered;

    return tabFiltered.filter((room) => {
      const directUser = room.type === "direct" ? getDirectUser(room) : null;
      const title =
        room.type === "direct"
          ? directUser?.name || t("common.chat.directChat")
          : room.name || t("common.chat.groupChat");
      const subtitle =
        room.lastMessage?.content ||
        room.lastMessage?.text ||
        t("common.chat.noMessagesYet");

      const searchableText = [
        title,
        subtitle,
        room?.name,
        directUser?.name,
        directUser?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [rooms, isActive, searchQuery, t, getDirectUser]);
  const skeletonItems = useMemo(
    () => Array.from({ length: 7 }, (_, index) => ({ id: `chat-skeleton-${index}` })),
    []
  );

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleRefresh = useCallback(() => {
    loadRooms(true).catch(() => undefined);
  }, [loadRooms]);

  const handleOpenRoom = useCallback((room: any) => {
    const roomId = String(room?.id || "");
    if (!roomId) return;

    router.push({
      pathname: "/screens/inbox/chat-screen",
      params: { roomId },
    });
  }, [router]);

  const handleBackNavigation = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background" edges={["left", "right", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor="#E5F4FD" translucent={false} />

      {/* Header */}
      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          onPressBack={handleBackNavigation}
          className="px-5 pt-2.5 pb-4"
          title={t("common.chat.messagesTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        {/* tabs */}
        <View className="flex-row justify-center mx-5">
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className={`w-1/2 border-b pb-3 ${isActive === tab.key && "border-[#11293A] border-b-2"}`}
              onPress={() => setIsActive(tab.key)}
            >
              <Text
                className={`text-center ${isActive === tab.key ? "font-proximanova-semibold text-base text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"} `}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-white px-5"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <SearchBar
          className="mt-5 mb-4"
          value={searchQuery}
          onSearch={setSearchQuery}
        />

        {loading ? (
          <View className="pb-3">
            {skeletonItems.map((item) => (
              <View key={item.id} className="flex-row items-center gap-2.5 py-4 border-b border-[#EEEEEE]">
                <View className="h-[50px] w-[50px] rounded-full bg-[#E8EEF3]" />

                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <View className="h-5 w-32 rounded-full bg-[#E8EEF3]" />
                    <View className="h-4 w-12 rounded-full bg-[#E8EEF3]" />
                  </View>

                  <View className="mt-2 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                      <View className="h-3.5 w-3.5 rounded-full bg-[#E8EEF3]" />
                      <View className="h-4 w-44 rounded-full bg-[#E8EEF3]" />
                    </View>
                    <View className="h-6 w-6 rounded-full bg-[#D5E9F7]" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : filteredRooms.length === 0 ? (
          <Text className="text-center text-sm text-gray-500 py-6">
            {t("common.chat.noChatsFound")}
          </Text>
        ) : (
          filteredRooms.map((room) => {
            const directUser = room.type === "direct" ? getDirectUser(room) : null;
            const title =
              room.type === "direct"
                ? directUser?.name || t("common.chat.directChat")
                : room.name || t("common.chat.groupChat");
            const avatar =
              room.type === "direct"
                ? directUser?.avatar
                : room.avatar || room?.business?.logo;
            const time = formatTime(room.lastMessageAt || room.updatedAt);
            const subtitle =
              typingByRoom[room.id]
                ? t("common.chat.typing")
                : room.lastMessage?.content ||
                  room.lastMessage?.text ||
                  t("common.chat.noMessagesYet");
            const lastMessageSenderId =
              room?.lastMessage?.senderId ||
              room?.lastMessage?.sender?.id ||
              room?.lastMessage?.userId ||
              null;
            const isOwnLastMessage = Boolean(lastMessageSenderId && lastMessageSenderId === user?.id);
            const messageStatus = room?.lastMessage?.status;

            return (
              <ChatListItem
                key={room.id}
                onPress={() => handleOpenRoom(room)}
                title={title}
                subtitle={subtitle}
                time={time}
                avatar={avatar}
                unreadCount={room.unreadCount || 0}
                messageStatus={messageStatus}
                isOwnMessage={isOwnLastMessage}
              />

            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatList;

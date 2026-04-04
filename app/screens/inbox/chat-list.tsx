import ScreenHeader from "@/components/header/ScreenHeader";
import ChatListItem from "@/components/ui/cards/ChatListItem";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ChatList = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();
  const tabs = ["group", "chat"];
  const [isActive, setIsActive] = useState("group");
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    let isMounted = true;
    const loadRooms = async () => {
      try {
        setLoading(true);
        const result = await chatService.getChatRooms();
        const data = result?.data || [];
        if (isMounted) {
          setRooms(Array.isArray(data) ? data : []);
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to load chats");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = chatService.onRoomDeleted((deletedRoomId) => {
      setRooms((prev) => prev.filter((room) => room?.id !== deletedRoomId));
    });

    return unsubscribe;
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) =>
      isActive === "group" ? room.type !== "direct" : room.type === "direct"
    );
  }, [rooms, isActive]);

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getDirectUser = (room: any) => {
    const currentUserId = user?.id;
    const participant = room?.participants?.find(
      (p: any) => p?.userId && p?.userId !== currentUserId
    );
    return participant?.user || room?.participants?.[0]?.user;
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-background" edges={["left", "right", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} backgroundColor="#E5F4FD" translucent={false} />

      {/* Header */}
      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          onPressBack={() => router.back()}
          className="px-5 pt-2.5 pb-4"
          title="Messages"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111111"}
        />

        {/* tabs */}
        <View className="flex-row justify-center mx-5">
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className={`w-1/2 border-b pb-3 ${isActive === tab && "border-[#11293A] border-b-2"}`}
              onPress={() => setIsActive(tab)}
            >
              <Text
                className={`text-center ${isActive === tab ? "font-proximanova-semibold text-base text-primary dark:text-dark-primary" : "font-proximanova-regular text-secondary dark:text-dark-secondary"} `}
              >
                <Text className="capitalize">{tab}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-white px-5"
      >
        <SearchBar className="mt-5 mb-4" />

        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : filteredRooms.length === 0 ? (
          <Text className="text-center text-sm text-gray-500 py-6">
            No chats found.
          </Text>
        ) : (
          filteredRooms.map((room) => {
            const directUser = room.type === "direct" ? getDirectUser(room) : null;
            const title =
              room.type === "direct"
                ? directUser?.name || "Direct Chat"
                : room.name || "Group Chat";
            const avatar =
              room.type === "direct"
                ? directUser?.avatar
                : room.avatar || room?.business?.logo;
            const time = formatTime(room.lastMessageAt || room.updatedAt);
            const subtitle =
              room.lastMessage?.content || room.lastMessage?.text || "No messages yet.";

            return (
              <ChatListItem
                key={room.id}
                onPress={() =>
                  router.push({
                    pathname: "/screens/inbox/chat-screen",
                    params: { roomId: room.id },
                  })
                }
                title={title}
                subtitle={subtitle}
                time={time}
                avatar={avatar}
                unreadCount={room.unreadCount || 0}
              />

            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatList;

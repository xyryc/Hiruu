import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import ScreenHeader from "@/components/header/ScreenHeader";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import RenderMessage from "@/components/ui/cards/RenderMessage";
import TypingIndicator from "@/components/ui/inputs/TypingIndicator";
import NoMessages from "@/components/ui/cards/NoMessages";
import ChatInput from "@/components/ui/inputs/ChatInput";

const HelpChat = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const [message, setMessage] = useState("");
  const insets = useSafeAreaInsets();

  const messages = [
    {
      id: 1,
      text: "Hi, I just applied for the bartender position",
      time: "1:44 PM",
      isSent: true,
      isRead: true,
      avatar:
        "https://i0.wp.com/www.splento.com/blog/wp-content/uploads/2024/10/confident-young-african-american-business-woman-in-2024-04-26-18-20-12-utc-scaled.jpg?ssl=1",
    },
    {
      id: 2,
      text: "Yes, we're still hiring",
      time: "1:44 PM",
      isSent: false,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    {
      id: 3,
      text: "I've worked 2 years at The Lounge Bar",
      time: "1:44 PM",
      isSent: true,
      isRead: true,
      avatar:
        "https://i0.wp.com/www.splento.com/blog/wp-content/uploads/2024/10/confident-young-african-american-business-woman-in-2024-04-26-18-20-12-utc-scaled.jpg?ssl=1",
    },
    {
      id: 4,
      text: "Thank You andrew",
      time: "1:44 PM",
      isSent: false,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    {
      id: 5,
      text: "Wow that's great, andrew",
      time: "1:44 PM",
      isSent: false,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
  ];

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{ paddingTop: insets.top + 10 }}
        className="pb-6 bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        onPressBack={() => router.back()}
        title="Help and Chat"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />
      <Text className="text-sm font-proximanova-semibold bg-[#11293A] text-white px-5 py-2.5">
        Please wait.! You're <Text className="text-[#4FB2F3]">#7</Text> in line
      </Text>

      {/* chat */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* message content */}
        <View className="bg-white flex-1">
          {/* Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            inverted={true}
            renderItem={({ item: msg }) => <RenderMessage msg={msg} />}
            ListHeaderComponent={<TypingIndicator />}
            ListEmptyComponent={<NoMessages />}
            ListFooterComponent={
              <View className="flex-row items-center justify-center pb-10">
                <View className="h-[1px] w-36 bg-[#111111]"></View>
                <Text className="font-proximanova-regular text-xs text-primary">
                  Today
                </Text>
                <View className="h-[1px] w-36 bg-[#111111]"></View>
              </View>
            }
          />

          {/* Input Bar */}
          <ChatInput message={message} setMessage={setMessage} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default HelpChat;

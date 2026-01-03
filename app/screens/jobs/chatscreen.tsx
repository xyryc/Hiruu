import ChatScreenHeader from "@/components/header/ChatScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import NoMessages from "@/components/ui/cards/NoMessages";
import RenderMessage from "@/components/ui/cards/RenderMessage";
import ChatInput from "@/components/ui/inputs/ChatInput";
import TypingIndicator from "@/components/ui/inputs/TypingIndicator";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatScreen = () => {
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      text: "Hi, I just applied for the bartender position",
      time: "1:44 PM",
      isSent: true,
      isRead: true,
      avatar:
        "https://www.denverheadshotco.com/wp-content/uploads/2023/06/Company-Headshots-scaled.jpg",
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
        "https://media.licdn.com/dms/image/v2/D5603AQFMeZ7i9ybZgw/profile-displayphoto-shrink_200_200/B56ZS29wLQHwAY-/0/1738236429558?e=2147483647&v=beta&t=RTX-UGEWSzuEb-Gv2bqXqREzQX15FMKi0TK1HJBAKuE",
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
      className="flex-1 bg-white"
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* message content */}
        <View className="bg-[#E5F4FD80] flex-1">
          {/* Header */}
          <ChatScreenHeader />

          {/* Job Card */}
          <JobCard
            status="chatscreen"
            className="mx-5 bg-white border border-[#EEEEEE] mt-4"
          />

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
              <View className="flex-row items-center justify-center my-6">
                <LinearGradient
                  colors={["transparent", "#D1D5DB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-[1px] flex-1"
                />
                <Text className="mx-4 text-xs font-proximanova-regular text-primary">
                  Today
                </Text>
                <LinearGradient
                  colors={["#D1D5DB", "transparent"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-[1px] flex-1"
                />
              </View>
            }
          />
        </View>

        {/* Input Bar */}
        <ChatInput message={message} setMessage={setMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

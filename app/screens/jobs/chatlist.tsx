import ScreenHeader from "@/components/header/ScreenHeader";
import ChatListItem from "@/components/ui/cards/ChatListItem";
import SearchBar from "@/components/ui/inputs/SearchBar";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatList = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const tabs = ["group", "chat"];
  const [isActive, setIsActive] = useState("group");

  return (
    <SafeAreaView className="flex-1 bg-[#E5F4FD] dark:bg-dark-background">
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-4 pt-2.5 rounded-b-3xl bg-[#E5F4FD] overflow-hidden"
        title="Messages"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111111"}
      />

      {/* tabs */}
      <View className="flex-row justify-center mx-5">
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            className={`w-1/2 border-b  pb-2 ${isActive === tab && "border-[#11293A] border-b-2"}`}
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

      {/* content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-white px-5"
      >
        {isActive === "group" ? (
          <>
            <SearchBar className="mt-5 mb-4" />

            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
          </>
        ) : (
          <>
            <SearchBar className="mt-5 mb-4" />

            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
            <ChatListItem
              isActive={isActive}
              onPress={() => router.push("/screens/jobs/chatscreen")}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChatList;

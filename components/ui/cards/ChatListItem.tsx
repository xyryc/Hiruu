import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ChatListItem = ({ onPress, isActive }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-2.5 py-4 border-b border-[#EEEEEE]"
    >
      {/* left */}
      <View>
        <Image
          source="https://media.licdn.com/dms/image/v2/D5603AQFMeZ7i9ybZgw/profile-displayphoto-shrink_200_200/B56ZS29wLQHwAY-/0/1738236429558?e=2147483647&v=beta&t=RTX-UGEWSzuEb-Gv2bqXqREzQX15FMKi0TK1HJBAKuE"
          style={{
            width: 50,
            height: 50,
            borderRadius: 999,
          }}
          contentFit="cover"
        />
        {isActive === "chat" && (
          <Image
            source="https://images-platform.99static.com//XA86QPjmKC7CdDnzMsNPiEH5O-Y=/63x55:1588x1580/fit-in/500x500/projects-files/66/6611/661127/3fcadb3b-493d-4b86-8b30-3d38007c3a79.png"
            style={{
              width: 25,
              height: 25,
              borderRadius: 999,
              position: "absolute",
              bottom: -5,
              right: -5,
            }}
            contentFit="cover"
          />
        )}
      </View>

      {/* right */}
      <View className="flex-1">
        {/* top */}
        <View className="flex-row justify-between items-center">
          <Text className="font-proximanova-semibold text-primary">
            Farout Beach Club
          </Text>
          <Text className="font-proximanova-regular text-primary">12:00PM</Text>
        </View>

        {/* bottom */}
        <View className="flex-1 flex-row justify-between items-center">
          <View className="flex-row gap-1.5 items-center">
            <Text className="font-proximanova-semibold text-sm text-[#4FB2F3]">
              You:
            </Text>
            <Text
              className="text-sm font-proximanova-regular text-primary w-4/5"
              numberOfLines={1}
            >
              Hi, I just applied for the bartender position
            </Text>
          </View>

          <View className="w-6 h-6 bg-[#4FB2F3] rounded-full items-center justify-center">
            <Text className="font-proximanova-semibold text-sm text-white">
              1
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatListItem;

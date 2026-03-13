import { LeaveItem } from "@/app/screens/home/leave/history";
import RejectionReasonModal from "@/components/ui/modals/RejectionReasonModal";
import { chatService } from "@/services/chatService";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";
import StatusBadge from "../badges/StatusBadge";

// Render badge group dynamically

const SickLeaveCard = ({
  item,
  selectedCategory,
}: {
  item: LeaveItem;
  selectedCategory: any;
}) => {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleMessagePress = async () => {
    if (!item?.userId) {
      toast.error("User information is unavailable");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(item.userId);
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error("Chat room id is missing");
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to start chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <View className="p-4 mx-5 mb-3 border border-gray-200 rounded-xl bg-gray-50">
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <Image
            source={item.img}
            contentFit="contain"
            style={{ width: 30, height: 30 }}
          />
          <Text className="text-[#7A7A7A]">{item.name}</Text>
        </View>
        {selectedCategory === "all" && (
          <View className="flex-row gap-3 items-center">
            {["pending", "rejected"].includes(item.status) && (
              <TouchableOpacity
                onPress={handleMessagePress}
                disabled={!item?.userId || isCreatingChat}
                className={`p-2 rounded-full ${item?.userId ? "bg-[#E5F4FD]" : "bg-[#F5F5F5]"}`}
              >
                {isCreatingChat ? (
                  <ActivityIndicator size="small" color="#4FB2F3" />
                ) : (
                  <Image
                    source={require("@/assets/images/messages-fill.svg")}
                    contentFit="contain"
                    style={{ height: 22, width: 22 }}
                  />
                )}
              </TouchableOpacity>
            )}
            <StatusBadge status={item.status} />
          </View>
        )}
      </View>

      <View className="border-b-2 border-dashed border-gray-300/30 mt-4" />

      <View className="flex-row justify-between items-center mt-3">
        <View>
          <Text className="font-bold">{item.date}</Text>
          {item.duration && (
            <Text className="font-bold text-sm">{item.duration}</Text>
          )}
        </View>
        <Text className="px-3 py-1 bg-[#E5F4FD] rounded-3xl text-black">
          {item.coses}
        </Text>
      </View>

      <Text className="mt-3 text-[#7A7A7A] leading-5">{item.details}</Text>
      {item.status === "rejected" && (
        <View className="flex-row gap-1 mt-2.5">
          <RejectionReasonModal />
        </View>
      )}
    </View>
  );
};

export default SickLeaveCard;

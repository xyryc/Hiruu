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
    <View className="p-3.5 mx-5 mb-7 border border-gray-200 rounded-xl">
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <Image
            source={item.img}
            contentFit="contain"
            style={{ width: 30, height: 30, borderRadius: 999 }}
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

      <Image
        source={require("@/assets/images/dotted-line.svg")}
        style={{
          width: "100%",
          height: 1,
          marginVertical: 14
        }}
        contentFit='contain'
      />

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-proximanova-semibold text-sm">{item.date}</Text>
          {item.duration && (
            <Text className="font-proximanova-semibold text-sm">{item.duration}</Text>
          )}
        </View>

        <Text className="px-4 py-1 bg-[#E5F4FD] font-proximanova-regular text-sm rounded-3xl text-black">
          {item.coses}
        </Text>
      </View>

      <Text className="mt-3 text-secondary font-proximanova-regular">{item.details}</Text>

      {item.status === "rejected" && (
        <View className="flex-row gap-1 mt-2.5">
          <RejectionReasonModal />
        </View>
      )}
    </View>
  );
};

export default SickLeaveCard;

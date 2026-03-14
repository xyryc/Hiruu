import { chatService } from "@/services/chatService";
import { EvilIcons, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";

type TeamShiftRequestCardProps = {
  title?: string;
  status?: string;
  isHistory?: boolean;
  userId?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

const TeamShiftRequestCard = ({
  title,
  status,
  isHistory,
  userId,
  onApprove,
  onReject,
}: TeamShiftRequestCardProps) => {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleMessageClick = async () => {
    if (!userId) {
      toast.error("User information is unavailable");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(userId);
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
    <View>
      {title ? (
        <Text className="text-xl font-proximanova-bold text-primary dark:text-dark-primary mt-5">
          {title}
        </Text>
      ) : null}
      <View className="border border-[#eeeeee] rounded-xl p-2.5 mt-2.5">
        <View className="flex-row justify-between">
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary ">
            June 09, 2025
          </Text>
          <Text
            className={`font-proximanova-regular text-sm text-primary dark:text-dark-primary py-0.5 px-3 rounded-full ${status === "Missed Clock-out" ? "bg-[#F34F4F4D]" : "bg-[#E5F4FD]"} `}
          >
            {status}
          </Text>
        </View>
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-1">
          09:00 AM to 1:00 PM
        </Text>
        <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2.5">
          Fever and body ache Medical checkup and recovery at home Fever and body ache Medical
        </Text>
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ height: 2, width: 352, marginTop: 15 }}
        />
        <View className="flex-row justify-between items-center mt-2.5">
          <View className="flex-row gap-2 items-center">
            <Image
              source={require("@/assets/images/adaptive-icon.png")}
              contentFit="contain"
              style={{ height: 40, width: 40 }}
            />
            <View>
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                Rohan Mehta
              </Text>
              <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                IT Support
              </Text>
            </View>
          </View>
          {isHistory ? (
            <Pressable
              onPress={handleMessageClick}
              disabled={isCreatingChat}
              className="h-10 w-10 bg-[#E5F4FD] rounded-full flex-row justify-center items-center"
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
            </Pressable>
          ) : (
            <View className="flex-row gap-1.5">
              <TouchableOpacity
                onPress={onApprove}
                className="h-10 w-10 bg-[#292D32] rounded-full flex-row justify-center items-center"
              >
                <Feather name="check" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onReject}
                className="h-10 w-10 bg-[#F34F4F] rounded-full flex-row justify-center items-center"
              >
                <EvilIcons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default TeamShiftRequestCard;

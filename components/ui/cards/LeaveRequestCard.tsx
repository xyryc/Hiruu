import { chatService } from "@/services/chatService";
import { formatShortDateInTimezone } from "@/utils/date";
import { EvilIcons, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

const resolveMediaUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return value;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
};

type LeaveRequestCardProps = {
  title?: string;
  status?: string;
  approved?: boolean;
  showReviewActions?: boolean;
  userId?: string;
  onAccept?: () => void;
  onReject?: () => void;
  onPressCard?: () => void;
  request?: any;
};

const LeaveRequestCard = ({
  title,
  status,
  approved,
  showReviewActions,
  userId,
  onAccept,
  onReject,
  onPressCard,
  request,
}: LeaveRequestCardProps) => {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const requestUserId = request?.employment?.user?.id || userId;
  const leaveType = request?.leaveType || status;
  const startDate = request?.startDate
    ? formatShortDateInTimezone(request.startDate)
    : "Jun 09, 2025";
  const endDate = request?.endDate
    ? formatShortDateInTimezone(request.endDate)
    : null;
  const dateLabel =
    endDate && endDate !== startDate ? `${startDate} - ${endDate}` : startDate;
  const reason =
    request?.reason ||
    (approved
      ? "Fever and body ache Medical checkup and recovery at home Fever and body ache Medical  "
      : " Unable to clock in due to poor internet connectivity at location.");
  const address =
    request?.employment?.user?.address?.address || "New York, North Bergen";
  const role = request?.employment?.role?.name || "Unassigned";
  const requester = request?.employment?.user || {};
  const avatarSource = resolveMediaUrl(requester?.avatar)
    ? { uri: resolveMediaUrl(requester?.avatar) as string }
    : require("@/assets/images/placeholder.png");

  const handleMessageClick = async () => {
    if (!requestUserId) {
      toast.error("User information is unavailable");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(requestUserId);
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
      <TouchableOpacity
        activeOpacity={onPressCard ? 0.85 : 1}
        onPress={onPressCard}
        disabled={!onPressCard}
        className="border border-[#eeeeee] rounded-xl p-2.5 mt-2.5"
      >
        <View className="flex-row justify-between">
          {/* time label */}
          <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-1">
            {dateLabel}
          </Text>

          <Text
            className={`capitalize font-proximanova-regular text-sm text-primary dark:text-dark-primary py-0.5 px-3 rounded-full ${status === "Missed Clock-out" ? "bg-[#F34F4F4D]" : "bg-[#E5F4FD]"} `}
          >
            {leaveType}{" "}
          </Text>
        </View>

        {!approved ? (
          <View className="flex-row gap-1 mt-2.5">
            <EvilIcons name="location" size={20} color="black" />
            <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
              {address}
            </Text>
          </View>
        ) : null}
        <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2.5">
          {!approved ? <Text className="text-[#4FB2F3]">Reason{" :  "}</Text> : null}
          {reason}
        </Text>
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ height: 2, width: 352, marginTop: 15 }}
        />
        <View className="flex-row justify-between items-center mt-2.5">
          <View className="flex-row gap-2 items-center">
            <Image source={avatarSource} contentFit="cover" style={{ height: 40, width: 40, borderRadius: 999 }} />
            <View>
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                {requester?.name || "Unknown User"}
              </Text>
              <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                {role}
              </Text>
            </View>
          </View>

          {showReviewActions ? (
            <View className="flex-row gap-1.5">
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
              <TouchableOpacity
                onPress={onAccept}
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
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LeaveRequestCard;

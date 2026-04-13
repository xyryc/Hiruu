import { chatService } from "@/services/chatService";
import { formatDate, formatTimeInTimezone } from "@/utils/date";
import { EvilIcons, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { toast } from "sonner-native";
import ShiftRequestModal from "../modals/ShiftRequestModal";

type TeamShiftRequestCardProps = {
  title?: string;
  status?: string;
  isHistory?: boolean;
  request?: any;
  showActions?: boolean;
  hideAddRequest?: boolean;
  userId?: string;
  onApprove?: () => void;
  onReject?: () => void;
};

const manualAttendanceLabelMap: Record<string, string> = {
  missed_punch: "Missed Punch",
  late_arrival: "Late Arrival",
  early_departure: "Early Departure",
  forgot_to_tap: "Forgot to Tap",
  network_issues: "Network Issues",
  other: "Other",
};

const TeamShiftRequestCard = ({
  title,
  status,
  isHistory,
  request,
  showActions,
  hideAddRequest,
  userId,
  onApprove,
  onReject,
}: TeamShiftRequestCardProps) => {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isFilterModal, setIsFilterModal] = useState(false);

  const resolvedStatus = useMemo(() => {
    const backendType = String(request?.type || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return (
      status ||
      manualAttendanceLabelMap[
        String(request?.manualAttendanceReasonType || "").toLowerCase()
      ] ||
      backendType ||
      "Request"
    );
  }, [request?.manualAttendanceReasonType, request?.type, status]);

  const resolvedDate = formatDate(
    request?.attendanceDate || request?.requestedDate || request?.createdAt,
    "June 09, 2025"
  );

  const startTime = request?.clockInTime || request?.originalShift?.startsAt || null;
  const endTime = request?.clockOutTime || request?.originalShift?.endsAt || null;
  const resolvedTimeRange =
    startTime || endTime
      ? `${formatTimeInTimezone(startTime)} to ${formatTimeInTimezone(endTime)}`
      : "09:00 AM to 1:00 PM";

  const resolvedNotes = request?.attendanceNotes || request?.reason || "-";
  const resolvedUserName = request?.employment?.user?.name || "Rohan Mehta";
  const resolvedRoleName = request?.employment?.role?.role?.name || "IT Support";
  const resolvedAvatar =
    request?.employment?.user?.avatar ||
    require("@/assets/images/adaptive-icon.png");
  const resolvedUserId = userId || request?.employment?.user?.id;
  const shouldShowActions = Boolean(showActions ?? isHistory);
  const statusText = String(request?.status || "").toLowerCase();

  const statusBadgeClass = (() => {
    if (statusText === "approved") return "bg-[#4FB2F34D]";
    if (statusText === "rejected") return "bg-[#F34F4F4D]";
    if (statusText === "pending") return "bg-[#F4B7404D]";
    if (resolvedStatus === "Missed Clock-out") return "bg-[#F34F4F4D]";
    return "bg-[#E5F4FD]";
  })();

  const handleMessageClick = async () => {
    if (!resolvedUserId) {
      toast.error("User information is unavailable");
      return;
    }

    try {
      setIsCreatingChat(true);
      const result = await chatService.createDirectChat(resolvedUserId);
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
            {resolvedDate}
          </Text>
          <Text
            className={`font-proximanova-regular text-sm text-primary dark:text-dark-primary py-0.5 px-3 rounded-full ${statusBadgeClass} `}
          >
            {resolvedStatus}
          </Text>
        </View>
        <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-1">
          {resolvedTimeRange}
        </Text>
        <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2.5">
          {resolvedNotes}
        </Text>
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          contentFit="contain"
          style={{ height: 2, width: 352, marginTop: 15 }}
        />
        <View className="flex-row justify-between items-center mt-2.5">
          <View className="flex-row gap-2 items-center">
            <Image
              source={resolvedAvatar}
              contentFit="cover"
              style={{ height: 40, width: 40, borderRadius: 999 }}
            />
            <View>
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                {resolvedUserName}
              </Text>
              <Text className="font-proximanova-regular text-secondary text-sm dark:text-dark-secondary">
                {resolvedRoleName}
              </Text>
            </View>
          </View>
          {shouldShowActions ? (
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
                onPress={onReject}
                className="h-10 w-10 bg-[#F34F4F] rounded-full flex-row justify-center items-center"
              >
                <EvilIcons name="close" size={22} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onApprove}
                className="h-10 w-10 bg-[#292D32] rounded-full flex-row justify-center items-center"
              >
                <Feather name="check" size={22} color="white" />
              </TouchableOpacity>
            </View>
          ) : !hideAddRequest ? (
            <TouchableOpacity
              onPress={() => setIsFilterModal(true)}
              className="py-2.5 px-3 rounded-full bg-[#11293A]"
            >
              <Text className="font-proximanova-semibold text-sm text-white">
                Add Request
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {!hideAddRequest ? (
          <ShiftRequestModal
            onClose={() => setIsFilterModal(false)}
            visible={isFilterModal}
          />
        ) : null}
      </View>
    </View>
  );
};

export default TeamShiftRequestCard;

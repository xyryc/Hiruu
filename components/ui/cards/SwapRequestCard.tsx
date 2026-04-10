import StatusBadge from "@/components/ui/badges/StatusBadge";
import { formatDate } from "@/utils/date";
import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

type SwapRequestCardProps = {
  item: any;
  showActions?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  actionLoading?: "approve" | "reject" | null;
};

const formatIsoTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const SwapRequestCard = ({
  item,
  showActions = false,
  onAccept,
  onReject,
  actionLoading = null,
}: SwapRequestCardProps) => {
  const roleName = item?.employment?.role?.role?.name || "-";
  const startTime = formatIsoTime(item?.originalShift?.startsAt);
  const endTime = formatIsoTime(item?.originalShift?.endsAt);
  const breakDuration = Array.isArray(item?.originalShift?.shiftTemplate?.breakDuration)
    ? item.originalShift.shiftTemplate.breakDuration
    : [];
  const firstBreak = breakDuration[0];
  const breakLabel =
    firstBreak?.startTime && firstBreak?.endTime
      ? `${firstBreak.startTime} - ${firstBreak.endTime}`
      : "-";
  const location = item?.business?.address?.city || "-";
  const status = item?.status || "pending";
  const businessName = item?.business?.name || "-";
  const businessLogo = item?.business?.logo || null;

  return (
    <View className="mx-5 border border-[#EEEEEE] mb-3 rounded-2xl p-4">
      <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
        {roleName}
      </Text>

      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Date:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {formatDate(item?.createdAt)}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Time:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {startTime} - {endTime}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Break:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {breakLabel}
        </Text>
      </View>

      <View className="flex-row justify-between">
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          Location:
        </Text>
        <Text className="text-primary dark:text-dark-primary font-proximanova-regular text-sm">
          {location}
        </Text>
      </View>


      <Image
        source={require("@/assets/images/dotted-line.svg")}
        contentFit="fill"
        style={{ height: 1, width: "100%", marginVertical: 10 }}
      />


      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-4 items-center">
          <Image
            source={businessLogo || require("@/assets/images/placeholder.png")}
            contentFit="cover"
            style={{ height: 30, width: 30, borderRadius: 15 }}
          />
          <Text className="font-proximanova-regular text-placeholder dark:text-dark-placeholder">
            {businessName}
          </Text>
        </View>

        {showActions ? (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={onReject}
              disabled={actionLoading !== null}
              className={`bg-[#F34F4F] px-3 py-2 rounded-3xl ${actionLoading !== null ? "opacity-70" : ""}`}
            >
              <Text className="text-white font-proximanova-semibold text-sm">
                {actionLoading === "reject" ? "Rejecting..." : "Reject"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAccept}
              disabled={actionLoading !== null}
              className={`bg-[#11293A] px-3 py-2 rounded-3xl ${actionLoading !== null ? "opacity-70" : ""}`}
            >
              {actionLoading === "approve" ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-proximanova-semibold text-sm">
                  Accept
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <StatusBadge status={status as any} label={status} />
        )}
      </View>
    </View>
  );
};

export default SwapRequestCard;

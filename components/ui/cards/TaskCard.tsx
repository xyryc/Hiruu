import { WorkShiftCardProps } from "@/types";
import {
  AntDesign,
  Feather,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";
import SmallButton from "../buttons/SmallButton";

const TaskCard = ({
  shiftId,
  className = "",
  fullWidth = false,
  shiftTitle,
  startTime,
  endTime,
  startsAt,
  endsAt,
  startDateTime,
  endDateTime,
  shiftImage,
  teamMembers,
  totalMembers,
  city,
  onLoginPress,
  onLogoutPress,
  presentStatus = "logged_out",
  status = "ongoing",
  requestLog = false,
}: WorkShiftCardProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const [nowMs, setNowMs] = useState(() => Date.now());
  const startRaw = startsAt || startDateTime;
  const endRaw = endsAt || endDateTime;
  const shiftStartMs = startRaw ? new Date(startRaw).getTime() : NaN;
  const shiftEndMs = endRaw ? new Date(endRaw).getTime() : NaN;

  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const liveStatus = useMemo(() => {
    if (status === "early_leave") {
      return "early_leave";
    }

    const hasValidRange =
      !Number.isNaN(shiftStartMs) &&
      !Number.isNaN(shiftEndMs) &&
      shiftEndMs >= shiftStartMs;

    if (!hasValidRange) {
      return status;
    }

    if (nowMs < shiftStartMs) return "upcoming";
    if (nowMs <= shiftEndMs) return "ongoing";
    if (status === "missed") return "missed";
    return "completed";
  }, [nowMs, shiftEndMs, shiftStartMs, status]);

  const hasLiveTimer = liveStatus === "ongoing" || liveStatus === "upcoming";
  const isStaticStatus = liveStatus === "completed" || liveStatus === "missed";

  const formatDuration = useCallback((totalSeconds: number) => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const elapsedTime = useMemo(() => {
    if (!hasLiveTimer) {
      return "00:00:00";
    }

    const targetRaw =
      liveStatus === "upcoming"
        ? startsAt || startDateTime
        : endsAt || endDateTime;
    const target = targetRaw ? new Date(targetRaw).getTime() : NaN;
    if (Number.isNaN(target)) {
      return "00:00:00";
    }
    return formatDuration((target - nowMs) / 1000);
  }, [
    endDateTime,
    endsAt,
    formatDuration,
    hasLiveTimer,
    liveStatus,
    nowMs,
    startDateTime,
    startsAt,
  ]);

  const isUpcomingLoginWindow = useMemo(() => {
    if (liveStatus !== "upcoming" || Number.isNaN(shiftStartMs)) return false;
    const preLoginWindowStart = shiftStartMs - 15 * 60 * 1000;
    return nowMs >= preLoginWindowStart && nowMs < shiftStartMs;
  }, [liveStatus, nowMs, shiftStartMs]);

  const isOngoingLoginWindow = useMemo(() => {
    if (liveStatus !== "ongoing" || Number.isNaN(shiftStartMs)) return false;
    const postStartLoginWindowEnd = shiftStartMs + 15 * 60 * 1000;
    return nowMs <= postStartLoginWindowEnd;
  }, [liveStatus, nowMs, shiftStartMs]);

  const isLoggedIn = presentStatus === "logged_in";

  const getStatusColor = () => {
    switch (liveStatus) {
      case "ongoing":
        return "#3EBF5A";
      case "upcoming":
        return "#4FB2F3";
      case "completed":
        return "#6B7280";
      case "missed":
        return "#EF4444";
      default:
        return "#10B981";
    }
  };

  const getStatusText = () => {
    switch (liveStatus) {
      case "ongoing":
        return t("user.jobs.schedule.taskCard.ongoingLabel");
      case "upcoming":
        return t("user.jobs.schedule.taskCard.shiftStartsInLabel");
      case "missed":
        return t("user.jobs.schedule.taskCard.missedLabel");

      default:
        return t("user.jobs.schedule.taskCard.ongoingLabel");
    }
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (!shiftId) return;
        router.push({
          pathname: "/screens/schedule/shift/[id]",
          params: { id: String(shiftId) },
        });
      }}
      className={`${fullWidth ? "w-full mr-0" : "w-[320px] shrink-0 mr-4"} rounded-[14px] px-4 pb-4 bg-[#e5f4fd83] border border-[#4fb1f359] ${isStaticStatus && "pt-4"} ${className}`}
    >
      {/* Status Timer */}
      {hasLiveTimer && (
        <View className="absolute top-0 inset-x-0 items-center">
          <Image
            className="absolute top-0 inset-x-0 items-center"
            source={require("@/assets/images/timer-bg.svg")}
            style={{
              width: 244,
              height: 34
            }}
          />

          <View className="absolute top-0 inset-x-0 items-center">
            <View className="flex-row items-center gap-1.5 py-2">
              <Text className="text-sm font-proximanova-regular">
                {getStatusText()}
              </Text>

              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="timer-sand"
                  size={16}
                  color={getStatusColor()}
                />

                <Text
                  className="font-proximanova-bold text-[#4FB2F3]"
                  style={{ color: getStatusColor() }}
                >
                  {elapsedTime}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View
        className={`flex-row items-center gap-3 ${hasLiveTimer && "mt-[50px]"}`}
      >
        {/* Left Side - Image */}
        <View>
          <Image
            source={shiftImage}
            style={{
              width: 80,
              height: 80,
              borderRadius: 10,
            }}
            contentFit="cover"
          />
        </View>

        {/* Right Side - Content */}
        <View className="flex-1">
          {/* Shift Title */}
          <Text className="font-proximanova-semibold text-primary mb-2.5">
            {shiftTitle}
          </Text>

          {/* Time */}
          <View className="flex-row items-center gap-1.5 mb-3">
            <AntDesign name="clock-circle" size={14} color="#7A7A7A" />

            <Text className="text-secondary text-sm font-proximanova-regular">
              {startTime} - {endTime}
            </Text>
          </View>

          {/* Team Members */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {/* Avatar Stack */}
              <View className="flex-row">
                {teamMembers.length === 0 ? (
                  <View className="w-8 h-8 rounded-full border border-white bg-gray-300 justify-center items-center">
                    <Image
                      source={require("@/assets/images/placeholder.png")}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 999,
                      }}
                      contentFit="cover"
                    />
                  </View>
                ) : (
                  teamMembers.slice(0, 3).map((member, index) => (
                    <View
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 justify-center items-center"
                      style={{
                        marginLeft: index > 0 ? -8 : 0,
                        zIndex: 10 - index,
                      }}
                    >
                      {typeof member === "string" &&
                        (member.startsWith("http://") || member.startsWith("https://")) ? (
                        <Image
                          source={member}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                          }}
                          contentFit="cover"
                        />
                      ) : (
                        <Text className="text-xs font-proximanova-medium text-gray-600">
                          {String(member || "?").charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                  ))
                )}

                {teamMembers.length > 3 && (
                  <View
                    className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 justify-center items-center"
                    style={{ marginLeft: -8, zIndex: 7 }}
                  >
                    <Text className="text-xs font-proximanova-bold text-white">
                      +{teamMembers.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Member Count */}
            <View className="flex-row items-center gap-1">
              <Feather name="user" size={12} color="#7A7A7A" />
              <Text className="text-sm font-proximanova-regular text-secondary">
                {teamMembers.length}/{totalMembers}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* dotted line in center */}
      <View className="items-center my-4">
        <Image
          source={require("@/assets/images/dotted-line.svg")}
          style={{
            width: "100%",
            height: 1,
          }}
        />
      </View>

      {/* Location & Login */}
      <View className="flex-row justify-between items-center gap-4">
        {/* Location */}
        <View className="flex-row items-center flex-1">
          <View className="mr-2 bg-white rounded-md">
            <Image
              source={require("@/assets/images/location.png")}
              style={{
                width: 34,
                height: 34,
              }}
              contentFit="contain"
            />
          </View>

          <Text
            className="font-proximanova-regular text-sm text-primary"
            numberOfLines={2}
          >
            {city || t("common.cityUnavailable")}
          </Text>
        </View>

        {/* Button */}
        {requestLog ? (
          <SmallButton title={t("user.jobs.schedule.requestLog")} onPress={onLoginPress} />
        ) : (
          <>
            {liveStatus === "upcoming" &&
              (isUpcomingLoginWindow ? (
                <SmallButton
                  title={isLoggedIn ? t("common.logout") : t("common.login")}
                  className={isLoggedIn ? "px-8 bg-[#EF4444]" : "px-8"}
                  onPress={isLoggedIn ? onLogoutPress || onLoginPress : onLoginPress}
                />
              ) : (
                <StatusBadge status={liveStatus} />
              ))}
            {liveStatus === "ongoing" && (
              isLoggedIn ? (
                <SmallButton
                  title={t("common.logout")}
                  className="px-8 bg-[#EF4444]"
                  onPress={onLogoutPress || onLoginPress}
                />
              ) : isOngoingLoginWindow ? (
                <SmallButton title={t("common.login")} className="px-8" onPress={onLoginPress} />
              ) : (
                <SmallButton title={t("user.jobs.schedule.requestLog")} onPress={onLoginPress} />
              )
            )}
            {liveStatus === "completed" && <StatusBadge status={liveStatus} />}
            {liveStatus === "missed" && <StatusBadge status={liveStatus} />}
            {liveStatus === "early_leave" && <StatusBadge status={liveStatus} />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;

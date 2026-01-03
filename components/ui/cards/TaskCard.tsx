import { WorkShiftCardProps } from "@/types";
import {
  AntDesign,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import StatusBadge from "../badges/StatusBadge";
import SmallButton from "../buttons/SmallButton";

const TaskCard = ({
  shiftTitle,
  startTime,
  endTime,
  shiftImage,
  teamMembers,
  totalMembers,
  address,
  city,
  onLoginPress,
  status = "ongoing",
  requestLog = false,
}: WorkShiftCardProps) => {
  const [elapsedTime, setElapsedTime] = useState("00:00:05");

  // Timer effect for ongoing shifts
  useEffect(() => {
    if (status === "ongoing") {
      const interval = setInterval(() => {
        // Simulate timer increment
        setElapsedTime((prev) => {
          const [hours, minutes, seconds] = prev.split(":").map(Number);
          let newSeconds = seconds + 1;
          let newMinutes = minutes;
          let newHours = hours;

          if (newSeconds >= 60) {
            newSeconds = 0;
            newMinutes += 1;
          }
          if (newMinutes >= 60) {
            newMinutes = 0;
            newHours += 1;
          }

          return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:${String(newSeconds).padStart(2, "0")}`;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case "ongoing":
        return "#4FB2F3";
      case "upcoming":
        return "#4FB2F3";
      case "completed":
        return "#6B7280";
      default:
        return "#10B981";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "ongoing":
        return "Ongoing:";
      case "upcoming":
        return "Shift starts in:";

      default:
        return "Ongoing:";
    }
  };

  return (
    <View
      className={`flex-1 mr-4 rounded-[14px] px-4 pb-4 bg-[#E5F4FD] border border-[#4fb1f333] ${status === "completed" && "pt-4"}`}
    >
      {/* Status Timer */}
      {status !== "completed" && (
        <View className="absolute top-0 inset-x-0 items-center">
          <Image
            className="absolute top-0 inset-x-0 items-center"
            source={require("@/assets/images/timer-bg.svg")}
            style={{
              width: 244,
              height: 34,
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
                  color="#4FB2F3"
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
        className={`flex-row items-center gap-3 ${status !== "completed" && "mt-[50px]"}`}
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
            contentFit="contain"
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
                {teamMembers.slice(0, 3).map((member, index) => (
                  <View
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 justify-center items-center"
                    style={{
                      marginLeft: index > 0 ? -8 : 0,
                      zIndex: 10 - index,
                    }}
                  >
                    <Text className="text-xs font-proximanova-medium text-gray-600">
                      {member.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                ))}

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
              <FontAwesome5 name="user" size={14} color="#7A7A7A" />
              <Text className="text-sm font-proximanova-regular">
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

          <View className="w-36">
            <Text
              className="font-proximanova-regular text-sm text-primary"
              numberOfLines={1}
            >
              {address}
            </Text>
            <Text
              className="font-proximanova-regular text-sm text-primary"
              numberOfLines={1}
            >
              {city}
            </Text>
          </View>
        </View>

        {/* Button */}
        {requestLog ? (
          <SmallButton title="Request Log" onPress={onLoginPress} />
        ) : (
          <>
            {status === "upcoming" && <StatusBadge status={status} />}
            {status === "ongoing" && (
              <SmallButton title="Login" className="px-8" />
            )}
            {status === "completed" && <StatusBadge status={status} />}
          </>
        )}
      </View>
    </View>
  );
};

export default TaskCard;

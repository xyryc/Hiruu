import { getCountdownLabel } from "@/utils/date";
import { Ionicons, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import HolidayCard from "../ui/cards/HolidayCard";
import LeaveCard from "../ui/cards/LeaveCard";
import RegularShiftCard from "../ui/cards/RegularShiftCard";

// Countdown Component
const Countdown = ({ shift, countdown }) =>
  countdown && (
    <View className="px-4">
      <Text className="text-sm font-proximanova-regular text-primary">
        {shift.type === "ongoing" ? "Shift ends in: " : "Shift starts in: "}
        <Text
          className={`font-proximanova-bold ${shift.type === "ongoing" ? "text-orange-600" : "text-blue-600"
            }`}
        >
          {countdown}
        </Text>
      </Text>
    </View>
  );

const ShiftItem = ({ shift, index, shiftsLength }) => {
  const router = useRouter();
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  const canOpenDetails = Boolean(shift?.id) && shift?.type !== "empty_day";

  useEffect(() => {
    if (!shift?.countdownTargetAt) return;
    if (shift.type !== "ongoing" && shift.type !== "upcoming") return;

    const interval = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [shift?.countdownTargetAt, shift?.type]);

  const liveCountdown = useMemo(() => {
    if (!shift?.countdownTargetAt) return shift?.countdown;
    return getCountdownLabel(shift.countdownTargetAt, nowTimestamp) || shift?.countdown;
  }, [nowTimestamp, shift?.countdown, shift?.countdownTargetAt]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (!canOpenDetails) return;
        router.push("/screens/schedule/shift/[id]");
      }}
      disabled={!canOpenDetails}
      className="flex-row mb-4 overflow-hidden relative"
    >
      {/* Time Column */}
      <View className="mr-5 relative">
        <Text
          className={`font-proximanova-regular w-10 text-center
        ${shift.type === "ongoing" ? "text-[#F3934F] font-proximanova-semibold" : " text-secondary dark:text-dark-secondary"}
        `}
        >
          {shift.time}
        </Text>

        <View className="absolute top-12 left-5 items-center">
          {index < shiftsLength && (
            <Image
              source={require("@/assets/images/vertical-dotted-line.svg")}
              style={{
                width: 1,
                height: 175,
              }}
            />
          )}
        </View>
      </View>

      {/* Content Column */}
      <View className="flex-1 relative">
        {/* shift status */}
        <View className="absolute top-0 inset-x-0 items-center z-20">
          {shift.type === "completed" && (
            <View className="py-2">
              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                {shift.message}
              </Text>
            </View>
          )}

          {shift.type === "missed" && (
            <View className="py-2">
              <Text className="text-sm font-proximanova-regular text-[#F34F4F]">
                {shift.message}
              </Text>
            </View>
          )}
          {shift.type === "empty_day" && (
            <View className="py-2">
              <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
                {shift.title}
              </Text>
            </View>
          )}

          {shift.type === "leave" && shift.status === "pending" && (
            <View className="py-2 flex-row items-center gap-2">
              <Text className="font-bold capitalize text-[#F1C400]">
                {shift.title}{" "}
              </Text>
              <MaterialCommunityIcons
                name="timer-sand"
                size={20}
                color="#F1C400"
              />
            </View>
          )}

          {shift.type === "leave" && shift.status === "approved" && (
            <View className="py-2 flex-row items-center gap-2">
              <Text className="font-bold capitalize text-[#3EBF5A]">
                {shift.title}{" "}
              </Text>
              <Octicons name="check-circle" size={20} color="#3EBF5A" />
            </View>
          )}

          {shift.type === "holiday" && (
            <View className="py-2">
              <Text className="font-bold text-primary">{shift.title}</Text>
            </View>
          )}

          {shift.type === "ongoing" && (
            <View className="py-2">
              <Countdown shift={shift} countdown={liveCountdown} />
            </View>
          )}

          {shift.type === "upcoming" && (
            <View className="py-2">
              <Countdown shift={shift} countdown={liveCountdown} />
            </View>
          )}
        </View>

        {/* background */}
        <View className="absolute top-0 inset-x-0 items-center z-10">
          {shift.type === "completed" && (
            <Image
              source={require("@/assets/images/shift-completed-bg.svg")}
              style={{
                width: 244,
                height: 34,
              }}
            />
          )}
          {shift.type === "missed" && (
            <Image
              source={require("@/assets/images/shift-missed-bg.svg")}
              style={{
                width: 244,
                height: 34,
              }}
            />
          )}
          {shift.type === "ongoing" && (
            <Image
              source={require("@/assets/images/shift-ongoing-bg.svg")}
              style={{
                width: 244,
                height: 34,
              }}
            />
          )}
          {(shift.type === "upcoming" || shift.type === "holiday" || shift.type === "empty_day") && (
            <Image
              source={require("@/assets/images/shift-upcoming-bg.svg")}
              style={{ width: 244, height: 34 }}
            />
          )}
          {shift.type === "leave" && shift.status === "pending" && (
            <Image
              source={require("@/assets/images/leave-pending-bg.svg")}
              style={{
                width: 244,
                height: 34,
              }}
            />
          )}
          {shift.type === "leave" && shift.status === "approved" && (
            <Image
              source={require("@/assets/images/leave-approved-bg.svg")}
              style={{
                width: 244,
                height: 34,
              }}
            />
          )}
        </View>

        <View
          className={`px-4 pb-4 pt-12 rounded-2xl dark:bg-dark-surface border
                ${(shift.type === "leave" &&
              shift.status === "pending" &&
              "border-[#F1C400]") ||
            (shift.type === "leave" &&
              shift.status === "approved" &&
              "border-[#3EBF5A]") ||
            "border-[#EEEEEE]"
            }
        `}
        >
          {shift.type === "holiday" ? (
            <HolidayCard shift={shift} />
          ) : shift.type === "empty_day" ? (
            <View>
              <View className="flex-row items-center justify-center gap-5">
                <Image
                  source={require("@/assets/images/holiday2.svg")}
                  style={{
                    width: 128,
                    height: 110,
                  }}
                  contentFit="contain"
                />

                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary w-1/2">
                  {shift.subtitle}
                </Text>
              </View>

              <View className="py-3 w-full">
                <Image
                  source={require("@/assets/images/dotted-line.svg")}
                  style={{ width: "100%", height: 1 }}
                />
              </View>

              <View className="flex-row items-center gap-2">
                <Image
                  source={
                    shift.companyLogo
                      ? { uri: shift.companyLogo }
                      : require("@/assets/images/placeholder.png")
                  }
                  style={{ width: 30, height: 30, borderRadius: 999 }}
                  contentFit="cover"
                />

                <View className="flex-row items-center gap-1">
                  <Ionicons
                    className="bg-white border border-[#4FB2F3] p-1.5 rounded-full z-20"
                    name="calendar-outline"
                    size={16}
                    color="#4FB2F3"
                  />

                  <View className="flex-row gap-1">
                    <Text
                      className="text-xs font-proximanova-semibold text-primary dark:text-dark-primary"
                      numberOfLines={1}
                    >
                      {shift.nextShiftText || "No upcoming shifts"}
                    </Text>
                  </View>

                  {shift.nextShiftText?.startsWith("Next shift:") ? (
                    <View className="absolute top-0.5 left-4 z-0">
                      <Image
                        source={require("@/assets/images/gradient-time-bg.svg")}
                        style={{
                          width: 212,
                          height: 25,
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          ) : shift.type === "leave" ? (
            <LeaveCard shift={shift} />
          ) : (
            <RegularShiftCard shift={shift} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ShiftItem;

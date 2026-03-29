import ScreenHeader from "@/components/header/ScreenHeader";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ActionIconCard from "@/components/ui/cards/ActionIconCard";
import CountdownTimer from "@/components/ui/timer/CountdownTimer";
import { useShiftStore } from "@/stores/shiftStore";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ShiftDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const shiftId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const {
    shiftAssignmentDetails,
    shiftAssignmentDetailsLoading,
    getShiftAssignmentDetails,
  } = useShiftStore();

  useEffect(() => {
    if (!shiftId) return;
    getShiftAssignmentDetails(shiftId).catch(() => undefined);
  }, [getShiftAssignmentDetails, shiftId]);

  const details = shiftAssignmentDetails;

  const badge = useMemo(() => {
    const raw = String(details?.status || "").toLowerCase();
    const label = raw ? raw.replace(/_/g, " ") : "Unknown";
    const known = new Set([
      "upcoming",
      "completed",
      "early_leave",
      "missed",
      "ongoing",
      "pending",
      "approved",
      "rejected",
      "cancelled",
      "expired",
      "accepted",
      "submitted",
      "available",
      "unavailable",
    ]);
    if (known.has(raw)) {
      return { status: raw as any, label };
    }
    if (raw === "leave_requested") {
      return { status: "pending" as const, label };
    }
    return { status: "upcoming" as const, label };
  }, [details?.status]);

  const shiftTitle = details?.shiftTemplate?.name || "Shift";
  const shiftStartIso = details?.startsAt;
  const shiftEndIso = details?.endsAt;
  const showCountdown = Boolean(
    shiftStartIso && new Date(shiftStartIso).getTime() > Date.now()
  );

  const timeRange = useMemo(() => {
    if (!shiftStartIso || !shiftEndIso) return "-";
    const start = new Date(shiftStartIso);
    const end = new Date(shiftEndIso);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
    const format = (value: Date) =>
      value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    return `${format(start)} - ${format(end)}`;
  }, [shiftEndIso, shiftStartIso]);

  const breakTime = useMemo(() => {
    const breaks = Array.isArray(details?.shiftTemplate?.breakDuration)
      ? details.shiftTemplate.breakDuration
      : [];
    if (!breaks.length) return "-";

    const to12Hour = (value?: string) => {
      if (!value) return "--:--";
      const [rawHour = "0", rawMinute = "0"] = value.split(":");
      const hour = Number(rawHour);
      const minute = Number(rawMinute);
      if (Number.isNaN(hour) || Number.isNaN(minute)) return value;
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 === 0 ? 12 : hour % 12;
      return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
    };

    return breaks
      .map((item: any) => `${to12Hour(item?.startTime)} - ${to12Hour(item?.endTime)}`)
      .join(", ");
  }, [details?.shiftTemplate?.breakDuration]);

  const locationText = details?.business?.address?.address || "-";
  const assignedByName = details?.assignedBy?.name || "-";
  const assignedByAvatar = details?.assignedBy?.avatar;
  const noteText = details?.notes;

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="dark" backgroundColor="#BDE4F9" />

      {/* Custom Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-4 pt-4"
        title="Detail"
        components={
          <View className="flex-row items-center gap-2.5">
            <StatusBadge status={badge.status} label={badge.label} />

            <TouchableOpacity
              onPress={() => router.push("/screens/home/qr/scan")}
              className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] w-10 h-10 justify-center items-center rounded-full"
            >
              <Ionicons name="qr-code-outline" size={16} color="black" />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        className="mt-2.5 mx-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {shiftAssignmentDetailsLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : null}

        {/* timer */}
        {showCountdown && shiftStartIso && (
          <>
            <Text className="text-center text-secondary dark:text-dark-secondary font-proximanova-regular mb-2.5">
              Shift starts in
            </Text>
            <CountdownTimer targetTime={shiftStartIso} className="mb-8" />
          </>
        )}

        {/* time location */}
        <View>
          <Text className="text-lg font-proximanova-bold text-primary dark:text-dark-primary mb-4">
            {shiftTitle}
          </Text>

          <View className="flex-row items-center gap-2.5">
            {/* left */}
            <View>
              {/* time */}
              <View className="flex-row items-center gap-2 border border-[#EEEEEE] rounded-[14px] p-3 mb-2.5">
                <TouchableOpacity className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full p-2">
                  <AntDesign name="clock-circle" size={18} color="#7A7A7A" />
                </TouchableOpacity>

                <View>
                  <Text className="text-secondary dark:text-dark-secondary text-sm pb-3">
                    Time:
                  </Text>
                  <Text className="text-primary dark:text-dark-primary text-sm">
                    {timeRange}
                  </Text>
                </View>
              </View>

              {/* break */}
              <View className="flex-row items-center gap-2 border border-[#EEEEEE] rounded-[14px] p-3">
                <TouchableOpacity className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full p-2">
                  <Image
                    source={require("@/assets/images/coffee-time.svg")}
                    style={{
                      width: 18,
                      height: 18,
                    }}
                    contentFit="contain"
                  />
                </TouchableOpacity>

                <View>
                  <Text className="text-secondary dark:text-dark-secondary text-sm pb-3">
                    Break:
                  </Text>
                  <Text className="text-primary dark:text-dark-primary text-sm">
                    {breakTime}
                  </Text>
                </View>
              </View>
            </View>

            {/* right - location */}
            <View className="border border-[#EEEEEE] rounded-[14px] p-3 w-1/2">
              <View className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full p-2 mb-1 w-[34px]">
                <Image
                  source={require("@/assets/images/location-icon.svg")}
                  style={{
                    width: 18,
                    height: 18,
                  }}
                  contentFit="contain"
                />
              </View>

              <View className="w-2/3">
                <Text className="text-secondary dark:text-dark-secondary text-sm pb-3">
                  Location:
                </Text>
                <Text className="text-primary dark:text-dark-primary text-sm">
                  {locationText}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* quick actions */}
        <View className="mt-6">
          <Text className="text-lg font-proximanova-semibold mb-4 text-primary dark:text-dark-primary">
            Quick Actions
          </Text>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <ActionIconCard
              icon={
                <FontAwesome6 name="calendar-times" size={24} color="#4FB2F3" />
              }
              title="Sick Leave"
              onPress={() =>
                // router.push("/(user)/schedule/shift/request-leave")
                router.push("/screens/schedule/shift/request-leave")
              }
            />

            <ActionIconCard
              icon={
                <MaterialCommunityIcons
                  name="clock-plus"
                  size={24}
                  color="#4FB2F3"
                />
              }
              title="Overwork"
              onPress={() =>
                router.push({
                  pathname: "/screens/schedule/shift/request-overtime",
                  params: {
                    shiftAssignmentId: shiftId || details?.id,
                    employmentId: details?.employmentId,
                  },
                })
              }
            />

            <ActionIconCard
              icon={<Feather name="repeat" size={24} color="#4FB2F3" />}
              title="Swap Shift"
              onPress={() =>
                router.push({
                  pathname: "/screens/schedule/shift/swap",
                  params: {
                    businessId: details?.business?.id,
                  },
                })
              }
            // onPress={() => router.push("/(user)/schedule/shift/swap")}
            />

            <ActionIconCard
              icon={<Ionicons name="document-text" size={24} color="#4FB2F3" />}
              title="Report Issue"
              onPress={() =>
                router.push({
                  pathname: "/screens/schedule/shift/report",
                  params: {
                    shiftAssignmentId: shiftId || details?.id,
                    employmentId: details?.employmentId,
                  },
                })
              }
            />
          </ScrollView>
        </View>

        {/* assigned by */}
        <View className="mt-6">
          <Text className="text-lg font-proximanova-semibold mb-4 text-primary dark:text-dark-primary">
            Assigned by
          </Text>

          <View className="flex-row justify-between bg-[#4FB2F3] p-2.5 rounded-[10px]">
            <View className="flex-row items-center gap-2.5">
              <Image
                source={assignedByAvatar || require("@/assets/images/placeholder.png")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                }}
                contentFit="cover"
              />
              <Text className="font-proximanova-bold text-white dark:text-dark-secondary">
                {assignedByName}
              </Text>
            </View>

            <View className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full p-2">
              <Ionicons name="chatbubbles" size={22} color="#4FB2F3" />
            </View>
          </View>
        </View>

        {/* description */}
        <View className="mt-6">
          <Text className="text-lg font-proximanova-semibold mb-4 text-primary dark:text-dark-primary">
            Description
          </Text>

          <View>
            <View className="flex-row mb-4">
              <Entypo
                name="dot-single"
                size={18}
                color={isDark ? "#FFFFFF" : "#7A7A7A"}
              />
              <Text className="text-sm text-secondary dark:text-white">
                A Kitchen Helper / Dishwasher plays a vital role in the smooth
                operation of a kitchen by ensuring that cleanliness, hygiene,
                and basic support tasks are handled efficiently.
              </Text>
            </View>

            <View className="flex-row">
              <Entypo
                name="dot-single"
                size={18}
                color={isDark ? "#FFFFFF" : "#7A7A7A"}
              />
              <Text className="text-sm text-secondary dark:text-white">
                This position supports chefs and kitchen staff by maintaining a
                clean work environment, preparing ingredients, and washing
                dishes, tools, and equipment.
              </Text>
            </View>
          </View>
        </View>

        {/* important note */}
        <View className="p-4 rounded-[14px] bg-[#E5F4FD] mt-6">
          <Text className="text-primary text-lg font-proximanova-semibold">
            Important Notes
          </Text>

          <View className="mt-4">
            <Text className="text-secondary text-sm font-proximanova-regular">
              1. Physical stamina is required.
            </Text>
            <Text className="text-secondary text-sm font-proximanova-regular">
              2. Cleanliness and hygiene are non-negotiable.
            </Text>
            <Text className="text-secondary text-sm font-proximanova-regular">
              3. Willingness to assist in multiple tasks.
            </Text>
          </View>
        </View>

        <PrimaryButton
          className='my-10'
          title="Submit Shift Summary"
          onPress={() => router.push("./summary")}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftDetails;

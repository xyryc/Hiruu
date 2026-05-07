import ScreenHeader from "@/components/header/ScreenHeader";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import ActionIconCard from "@/components/ui/cards/ActionIconCard";
import CountdownTimer from "@/components/ui/timer/CountdownTimer";
import { chatService } from "@/services/chatService";
import { useShiftStore } from "@/stores/shiftStore";
import {
  AntDesign,
  Feather,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons
} from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const ShiftDetails = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const shiftId = Array.isArray(params.id) ? params.id[0] : params.id;
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
  const resolvedEmploymentId =
    details?.employmentId ||
    details?.employment?.employmentId ||
    undefined;

  const badge = useMemo(() => {
    const raw = String(details?.status || "").toLowerCase();
    const label = raw ? raw.replace(/_/g, " ") : t("common.unknown", { defaultValue: "Unknown" });
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
  }, [details?.status, t]);

  const shiftTitle = details?.shiftTemplate?.name || t("common.shift", { defaultValue: "Shift" });
  const isCompletedShift = String(details?.status || "").toLowerCase() === "completed";
  const shiftStartIso = details?.startsAt;
  const shiftEndIso = details?.endsAt;
  const showCountdown = Boolean(
    shiftStartIso && new Date(shiftStartIso).getTime() > Date.now()
  );
  const isShiftFinished = useMemo(() => {
    if (isCompletedShift) return true;
    if (!shiftEndIso) return false;
    const endMs = new Date(shiftEndIso).getTime();
    if (Number.isNaN(endMs)) return false;
    return Date.now() >= endMs;
  }, [isCompletedShift, shiftEndIso]);

  const timeRange = useMemo(() => {
    if (!shiftStartIso || !shiftEndIso) return t("common.notAvailableShort", { defaultValue: "-" });
    const start = new Date(shiftStartIso);
    const end = new Date(shiftEndIso);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return t("common.notAvailableShort", { defaultValue: "-" });
    const format = (value: Date) =>
      value.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    return `${format(start)} - ${format(end)}`;
  }, [shiftEndIso, shiftStartIso, t]);

  const breakTime = useMemo(() => {
    const breaks = Array.isArray(details?.shiftTemplate?.breakDuration)
      ? details.shiftTemplate.breakDuration
      : [];
    if (!breaks.length) return t("user.jobs.schedule.noBreak", { defaultValue: "No break" });

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
  }, [details?.shiftTemplate?.breakDuration, t]);

  const locationText = details?.business?.address?.address || t("common.notAvailableShort", { defaultValue: "-" });
  const assignedByName = details?.assignedBy?.name || t("common.notAvailableShort", { defaultValue: "-" });
  const assignedByAvatar = details?.assignedBy?.avatar;
  const assignedById = details?.assignedBy?.id;
  const assignedBusinessId = details?.business?.id;
  const employeeDescription = String(
    details?.assignedEmployee?.description || ""
  ).trim();

  const handleOpenAssignedByProfile = () => {
    if (!assignedById) {
      toast.error(t("user.jobs.schedule.assignedUserProfileUnavailable", { defaultValue: "Assigned user profile is unavailable" }));
      return;
    }

    router.push({
      pathname: "/screens/jobs/business/user-profile-preview",
      params: {
        userId: assignedById,
        ...(assignedBusinessId ? { businessId: assignedBusinessId } : {}),
        canRate: assignedBusinessId ? "true" : "false",
      },
    });
  };

  const handleOpenAssignedByChat = async () => {
    if (!assignedById) {
      toast.error(t("common.chat.userInfoUnavailable", { defaultValue: "Assigned user is unavailable for chat" }));
      return;
    }

    try {
      const result = await chatService.createDirectChat(assignedById);
      const roomId = result?.data?.id;

      if (!roomId) {
        throw new Error(t("common.chat.missingRoomId", { defaultValue: "Chat room id is missing" }));
      }

      router.push({
        pathname: "/screens/inbox/chat-screen",
        params: { roomId },
      });
    } catch (error: any) {
      toast.error(error?.message || t("common.failedToStartChat", { defaultValue: "Failed to start chat" }));
    }
  };

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
        title={t("common.details", { defaultValue: "Detail" })}
        components={
          <View className="flex-row items-center gap-2.5">
            <StatusBadge status={badge.status} label={badge.label} />
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
              {t("user.jobs.schedule.shiftStartsIn", { defaultValue: "Shift starts in" })}
            </Text>
            <CountdownTimer targetTime={shiftStartIso} className="mb-8" />
          </>
        )}

        {/* time location */}
        <View>
          <Text className="text-lg font-proximanova-bold text-primary dark:text-dark-primary mb-4">
            {shiftTitle}
          </Text>

          <View className="flex-row gap-2.5">
            {/* left */}
            <View>
              {/* time */}
              <View className="flex-row items-center gap-2 border border-[#EEEEEE] rounded-[14px] p-3 mb-2.5">
                <TouchableOpacity className="bg-[#f5f5f5] border-[0.5px] border-[#FFFFFF00] rounded-full p-2">
                  <AntDesign name="clock-circle" size={18} color="#7A7A7A" />
                </TouchableOpacity>

                <View>
                  <Text className="text-secondary dark:text-dark-secondary text-sm pb-3">
                    {t("common.time", { defaultValue: "Time" })}:
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
                    {t("common.break", { defaultValue: "Break" })}:
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
                  {t("common.location", { defaultValue: "Location" })}:
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
            {t("common.quickActions", { defaultValue: "Quick Actions" })}
          </Text>

          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <ActionIconCard
              icon={
                <FontAwesome6 name="calendar-times" size={24} color="#4FB2F3" />
              }
              title={t("user.jobs.schedule.sickLeave", { defaultValue: "Sick Leave" })}
              onPress={() =>
                // router.push("/(user)/schedule/shift/request-leave")
                router.push("/screens/schedule/shift/request-leave")
              }
            />

            <View style={{ opacity: isShiftFinished ? 1 : 0.5 }}>
              <ActionIconCard
                icon={
                  <MaterialCommunityIcons
                    name="clock-plus"
                    size={24}
                    color={isShiftFinished ? "#4FB2F3" : "#9CA3AF"}
                  />
                }
                title={t("user.jobs.schedule.overwork", { defaultValue: "Overwork" })}
                onPress={() => {
                  if (!isShiftFinished) return;
                  router.push({
                    pathname: "/screens/schedule/shift/request-overtime",
                    params: {
                      shiftAssignmentId: shiftId || details?.id,
                      employmentId: resolvedEmploymentId,
                      shiftEndAt: shiftEndIso,
                    },
                  });
                }}
              />
            </View>

            {!isCompletedShift ? (
              <ActionIconCard
                icon={<Feather name="repeat" size={24} color="#4FB2F3" />}
                title={t("user.jobs.schedule.swapShift", { defaultValue: "Swap Shift" })}
                onPress={() =>
                  router.push({
                    pathname: "/screens/schedule/shift/swap",
                    params: {
                      businessId: details?.business?.id,
                      shiftAssignmentId: shiftId || details?.id,
                      employmentId: resolvedEmploymentId,
                    },
                  })
                }
              // onPress={() => router.push("/(user)/schedule/shift/swap")}
              />
            ) : null}

            <ActionIconCard
              icon={<Ionicons name="document-text" size={24} color="#4FB2F3" />}
              title={t("user.jobs.schedule.reportIssue", { defaultValue: "Report Issue" })}
              onPress={() =>
                router.push({
                  pathname: "/screens/schedule/shift/submit-shift-report",
                  params: {
                    shiftAssignmentId: shiftId || details?.id,
                    employmentId: resolvedEmploymentId,
                  },
                })
              }
            />
          </ScrollView>
        </View>

        {/* assigned by */}
        <View className="mt-6">
          <Text className="text-lg font-proximanova-semibold mb-4 text-primary dark:text-dark-primary">
            {t("user.jobs.schedule.assignedBy", { defaultValue: "Assigned by" })}
          </Text>

          <View className="flex-row justify-between bg-[#4FB2F3] p-2.5 rounded-[10px]">
            <TouchableOpacity
              className="flex-row items-center gap-2.5"
              onPress={handleOpenAssignedByProfile}
              activeOpacity={0.8}
            >
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
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenAssignedByChat}
              className="w-10 h-10 bg-[#f5f5f5] items-center justify-center rounded-full"
            >
              <Ionicons name="chatbubbles" size={18} color="#4FB2F3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* description */}
        {employeeDescription ? (
          <View className="mt-6">
            <Text className="text-lg font-proximanova-semibold mb-4 text-primary dark:text-dark-primary">
              {t("common.description", { defaultValue: "Description" })}
            </Text>

            <Text className="text-sm text-secondary dark:text-white">
              {employeeDescription}
            </Text>
          </View>
        ) : null}

        {/* important note */}
        <View className="p-4 rounded-[14px] bg-[#E5F4FD] mt-6">
          <Text className="text-primary text-lg font-proximanova-semibold">
            {t("common.importantNotes", { defaultValue: "Important Notes" })}
          </Text>

          <View className="mt-4">
            <Text className="text-secondary text-sm font-proximanova-regular">
              {t("user.jobs.schedule.importantNote1", { defaultValue: "1. Physical stamina is required." })}
            </Text>
            <Text className="text-secondary text-sm font-proximanova-regular">
              {t("user.jobs.schedule.importantNote2", { defaultValue: "2. Cleanliness and hygiene are non-negotiable." })}
            </Text>
            <Text className="text-secondary text-sm font-proximanova-regular">
              {t("user.jobs.schedule.importantNote3", { defaultValue: "3. Willingness to assist in multiple tasks." })}
            </Text>
          </View>
        </View>

        <PrimaryButton
          className='my-10'
          title={t("user.jobs.schedule.submitShiftSummary", { defaultValue: "Submit Shift Summary" })}
          onPress={() =>
            router.push({
              pathname: "./summary",
              params: {
                shiftAssignmentId: shiftId || details?.id,
                employmentId: resolvedEmploymentId,
              },
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShiftDetails;

import { useBusinessStore } from "@/stores/businessStore";
import { useBusinessPermission } from "@/hooks/useBusinessPermission";
import { t } from "i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

const AttendanceSummary = ({ className }: { className: string }) => {
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const myEmployments = useBusinessStore((state) => state.myEmployments);
  const getBusinessOverview = useBusinessStore((state) => state.getBusinessOverview);
  const { canRead: canReadBusinessOverview } = useBusinessPermission(
    "business.overview",
    { employments: myEmployments }
  );
  const [attendance, setAttendance] = useState({
    arrivedOnTime: 0,
    arrivedOnLate: 0,
    absent: 0,
  });
  const selectedBusinessId = selectedBusinesses?.[0] || "";
  const isExpectedAuthError = (error: any) => {
    if (error?.isAuthSessionExpired) return true;
    const status = error?.response?.status;
    if (status === 401) return true;
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("unauthorized") ||
      message.includes("status code 401") ||
      message.includes("insufficient_permissions") ||
      message.includes("no refresh token available") ||
      message.includes("token_revoked_or_not_found")
    );
  };

  useEffect(() => {
    let mounted = true;

    const loadAttendance = async () => {
      try {
        if (!selectedBusinessId) {
          if (!mounted) return;
          setAttendance({
            arrivedOnTime: 0,
            arrivedOnLate: 0,
            absent: 0,
          });
          return;
        }
        if (!canReadBusinessOverview) {
          if (!mounted) return;
          setAttendance({
            arrivedOnTime: 0,
            arrivedOnLate: 0,
            absent: 0,
          });
          return;
        }

        const data = await getBusinessOverview(selectedBusinessId);
        if (!mounted || !data) return;

        const todaysAttendance = data?.todaysAttendance;

        setAttendance({
          arrivedOnTime:
            typeof todaysAttendance?.arrivedOnTime === "number"
              ? todaysAttendance.arrivedOnTime
              : 0,
          arrivedOnLate:
            typeof todaysAttendance?.arrivedOnLate === "number"
              ? todaysAttendance.arrivedOnLate
              : 0,
          absent:
            typeof todaysAttendance?.absent === "number"
              ? todaysAttendance.absent
              : 0,
        });
      } catch (error: any) {
        if (!mounted) return;
        if (isExpectedAuthError(error)) return;
        toast.error(error?.message || t("common.failedToLoadAttendanceSummary"));
      }
    };

    void loadAttendance();

    return () => {
      mounted = false;
    };
  }, [canReadBusinessOverview, getBusinessOverview, selectedBusinessId]);

  return (
    <View className={className}>
      <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
        {t("user.profile.attendanceSummary.title")}
      </Text>

      <View className="relative mt-4 overflow-hidden">
        {/* background */}
        <Image
          source={require("@/assets/images/AttendanceSummary.svg")}
          style={{
            width: "100%",
            height: 141,
          }}
          contentFit="fill"
        />

        {/* content */}
        <View className="absolute top-0 left-0 w-full px-3">
          <TouchableOpacity className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center  gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#3EBF5A]" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {t("user.profile.attendanceSummary.arrivedOnTime")}
              </Text>
            </View>
            <View className="flex-row gap-2.5 items-center">
              <Text className="font-proximanova-bold text-primary dark:text-dark-primary">
                {attendance.arrivedOnTime}
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={10}
                color="#11293A33"
              />
            </View>
          </TouchableOpacity>

          <Image
            source={require("@/assets/images/dotted-line.svg")}
            style={{
              width: "100%",
              height: 1,
            }}
            contentFit="contain"
          />

          <TouchableOpacity className="flex-row justify-between items-center p-4">
            <View className="flex-row items-center  gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#F3934F]" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {t("user.profile.attendanceSummary.lateComers")}
              </Text>
            </View>
            <View className="flex-row gap-2.5 items-center">
              <Text className="font-proximanova-bold text-primary dark:text-dark-primary">
                {attendance.arrivedOnLate}
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={10}
                color="#11293A33"
              />
            </View>
          </TouchableOpacity>

          <Image
            source={require("@/assets/images/dotted-line.svg")}
            style={{
              width: "100%",
              height: 1,
            }}
            contentFit="contain"
          />

          <TouchableOpacity className="flex-row justify-between items-center p-4 ">
            <View className="flex-row items-center  gap-1.5">
              <View className="h-2 w-2 rounded-full bg-[#F34F4F]" />
              <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                {t("user.profile.attendanceSummary.absent")}
              </Text>
            </View>
            <View className="flex-row gap-2.5 items-center">
              <Text className="font-proximanova-bold text-primary dark:text-dark-primary">
                {attendance.absent}
              </Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={10}
                color="#11293A33"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AttendanceSummary;

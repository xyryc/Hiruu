import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useBusinessStore } from "@/stores/businessStore";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import ShiftsSummaryCard from "../ui/cards/ShiftsSummaryCard";

const TodayShiftsSummary = ({ className }: any) => {
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const getBusinessOverview = useBusinessStore((state) => state.getBusinessOverview);
  const [summary, setSummary] = useState<{
    totalScheduled: number;
    lateArrivals: number;
    currentlyWorkingCount: number;
    avatars: string[];
  }>({
    totalScheduled: 0,
    lateArrivals: 0,
    currentlyWorkingCount: 0,
    avatars: [],
  });
  const selectedBusinessId = selectedBusinesses?.[0] || "";
  const visibleAvatars =
    summary.avatars.length > 0 ? summary.avatars.slice(0, 3) : [null];

  useEffect(() => {
    let mounted = true;

    const loadTodaySummary = async () => {
      try {
        if (!selectedBusinessId) {
          if (!mounted) return;
          setSummary({
            totalScheduled: 0,
            lateArrivals: 0,
            currentlyWorkingCount: 0,
            avatars: [],
          });
          return;
        }

        const data = await getBusinessOverview(selectedBusinessId);
        if (!mounted || !data) return;

        const todaysShiftSummary = data?.todaysShiftSummary;
        const currentlyWorking = todaysShiftSummary?.currentlyWorking;

        setSummary({
          totalScheduled:
            typeof todaysShiftSummary?.totalScheduled === "number"
              ? todaysShiftSummary.totalScheduled
              : 0,
          lateArrivals:
            typeof todaysShiftSummary?.lateArrivals === "number"
              ? todaysShiftSummary.lateArrivals
              : 0,
          currentlyWorkingCount:
            typeof currentlyWorking?.count === "number"
              ? currentlyWorking.count
              : 0,
          avatars: Array.isArray(currentlyWorking?.avatars)
            ? currentlyWorking.avatars.filter((item: unknown) => typeof item === "string")
            : [],
        });
      } catch (error: any) {
        toast.error(error?.message || "Failed to load today's shifts summary");
      }
    };

    void loadTodaySummary();

    return () => {
      mounted = false;
    };
  }, [getBusinessOverview, selectedBusinessId]);

  return (
    <LinearGradient
      colors={["#4FB2F320", "#4FB2F310"]}
      style={{
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 15,
        overflow: "hidden",
      }}
      className="border border-[#4FB2F350] mx-5"
    >
      <View className={className}>
        <Text className="text-xl font-proximanova-semibold text-black">
          Today’s Shifts Summary
        </Text>
        <ShiftsSummaryCard
          icon={<Ionicons name="calendar" size={20} color="#4FB2F3" />}
          title="Total scheduled shifts"
          endItem={summary.totalScheduled}
          className="mt-2.5"
        />
        <ShiftsSummaryCard
          className="mt-2.5"
          icon={
            <MaterialCommunityIcons
              name="clock-alert"
              size={20}
              color="#4FB2F3"
            />
          }
          title="Late arrivals"
          endItem={summary.lateArrivals}
        />
        <ShiftsSummaryCard
          className="mt-2.5"
          icon={<FontAwesome6 name="user-group" size={17} color="#4FB2F3" />}
          title="Currently working"
          endItem={
            <View className="flex-row items-center">
              <View className="flex-row">
                {visibleAvatars.map((avatar, index) => (
                  <View
                    key={`${avatar || "placeholder"}-${index}`}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 justify-center items-center overflow-hidden"
                    style={{
                      marginLeft: index > 0 ? -8 : 0,
                      zIndex: 10 - index,
                    }}
                  >
                    <Image
                      source={
                        avatar
                          ? avatar.startsWith("http")
                            ? { uri: avatar }
                            : `${process.env.EXPO_PUBLIC_API_URL}${avatar.startsWith("/") ? avatar : `/${avatar}`}`
                          : require("@/assets/images/placeholder.png")
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      contentFit="cover"
                    />
                  </View>
                ))}

                {(summary.currentlyWorkingCount === 0 ||
                  summary.currentlyWorkingCount > 3) && (
                  <View
                    className="w-8 h-8 rounded-full border-2 border-white bg-blue-500 justify-center items-center"
                    style={{ marginLeft: -8, zIndex: 7 }}
                  >
                    <Text className="text-xs font-proximanova-bold text-white">
                      {summary.currentlyWorkingCount === 0
                        ? "+0"
                        : `+${summary.currentlyWorkingCount - 3}`}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          }
        />

        <Image
          source={require("@/assets/images/dotted-line.svg")}
          style={{ height: 1, width: "100%", marginVertical: 10 }}
          contentFit="cover"
        />

        <PrimaryButton title="View Shift Report" />
      </View>
    </LinearGradient>
  );
};

export default TodayShiftsSummary;

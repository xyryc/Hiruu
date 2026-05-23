import { useBusinessStore } from "@/stores/businessStore";
import { useShiftStore } from "@/stores/shiftStore";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons
} from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";
import ActionIconCard from "../ui/cards/ActionIconCard";

type QuickActionUserProps = {
  className?: string;
};

const QuickActionUser = ({ className }: QuickActionUserProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const getUnresolvedShiftRequestCount = useShiftStore(
    (state) => state.getUnresolvedShiftRequestCount
  );
  const [counts, setCounts] = useState<{
    overtime_request: number;
    shift_swap: number;
  }>({
    overtime_request: 0,
    shift_swap: 0,
  });
  const isUserProfile = selectedBusinesses.length === 0;

  useFocusEffect(
    useCallback(() => {
      if (!isUserProfile) return;

      let mounted = true;

      const loadCounts = async () => {
        try {
          const data = await getUnresolvedShiftRequestCount();
          if (!mounted) return;

          setCounts({
            overtime_request:
              typeof data?.overtime_request === "number"
                ? data.overtime_request
                : 0,
            shift_swap:
              typeof data?.shift_swap === "number" ? data.shift_swap : 0,
          });
        } catch {
          if (!mounted) return;
          setCounts({
            overtime_request: 0,
            shift_swap: 0,
          });
        }
      };

      void loadCounts();

      return () => {
        mounted = false;
      };
    }, [getUnresolvedShiftRequestCount, isUserProfile])
  );

  if (!isUserProfile) {
    return null;
  }

  return (
    <View className={`${className} px-4`}>
      <Text className="text-xl font-proximanova-semibold mb-4">
        {t("user.jobs.quickActions.title")}
      </Text>

      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <ActionIconCard
          icon={<Ionicons name="time" size={24} color="#4FB2F3" />}
          title={t("user.jobs.quickActions.trackHours")}
          onPress={() => router.push("/screens/home/shift/track-hours")}
        />

        <ActionIconCard
          icon={<MaterialIcons name="timer" size={24} color="#4FB2F3" />}
          title={t("user.jobs.quickActions.otRequest")}
          count={counts.overtime_request}
          onPress={() => router.push("/screens/home/shift/overtime-history")}
        />

        <ActionIconCard
          icon={<FontAwesome name="users" size={20} color="#4FB2F3" />}
          title={t("user.jobs.quickActions.leave")}
          onPress={() => router.push("/screens/home/leave/history")}
        />

        <ActionIconCard
          icon={
            <AntDesign
              name="swap"
              size={16}
              color="white"
              className="bg-[#4FB2F3] rounded-full p-1"
            />
          }
          title={t("user.jobs.quickActions.swapRequest")}
          count={counts.shift_swap}
          onPress={() => router.push("/screens/home/shift/swap-request")}
        />
      </ScrollView>
    </View>
  );
};

export default QuickActionUser;

import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { toast } from "sonner-native";
import { useTranslation } from "react-i18next";
import PerformerCard from "../ui/cards/PerformerCard";

type LeaderboardTopItem = {
  userId: string;
  userName?: string;
  avatar?: string | null;
  isPremium?: boolean;
  rank: number;
  points: number;
  counts?: {
    onTime?: number;
    early?: number;
    shiftCover?: number;
    late?: number;
    missed?: number;
  };
};

const TopPerformer = ({ className }: any) => {
  const { t } = useTranslation();
  const router = useRouter();
  const myEmployments = useBusinessStore((state) => state.myEmployments);
  const getMyEmployments = useBusinessStore((state) => state.getMyEmployments);
  const getMonthlyLeaderboard = useBusinessStore((state) => state.getMonthlyLeaderboard);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const selectedBusinessId = selectedBusinesses?.[0];
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [items, setItems] = useState<LeaderboardTopItem[]>([]);

  const activeBusinessIds = useMemo(() => {
    return (Array.isArray(myEmployments) ? myEmployments : [])
      .filter((employment: any) => {
        const employmentStatus = String(employment?.status || "").toLowerCase();
        const businessStatus = String(employment?.business?.status || "").toLowerCase();
        return employmentStatus === "active" && businessStatus === "active";
      })
      .map((employment: any) => employment?.business?.id || employment?.businessId)
      .filter(Boolean);
  }, [myEmployments]);

  useEffect(() => {
    getMyEmployments(true).catch(() => undefined);
  }, [getMyEmployments]);

  const fetchTopPerformer = useCallback(async () => {
    if (!selectedBusinessId) {
      setItems([]);
      setHasLoadedOnce(true);
      return;
    }
    if (!activeBusinessIds.includes(selectedBusinessId)) {
      setItems([]);
      setHasLoadedOnce(true);
      return;
    }

    try {
      setLoading(true);
      const result = await getMonthlyLeaderboard(selectedBusinessId, { limit: 10 });
      const top = Array.isArray(result?.top) ? result.top : [];
      setItems(top);
    } catch (error: any) {
      setItems([]);
      toast.error(
        translateApiMessage(
          error?.message || "Failed to load top performer data"
        )
      );
    } finally {
      setLoading(false);
      setHasLoadedOnce(true);
    }
  }, [activeBusinessIds, getMonthlyLeaderboard, selectedBusinessId]);

  useEffect(() => {
    fetchTopPerformer();
  }, [fetchTopPerformer]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a?.rank ?? 0) - (b?.rank ?? 0)),
    [items]
  );

  if (hasLoadedOnce && !loading && sortedItems.length === 0) {
    return null;
  }

  return (
    <View className={`${className}`}>
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
          {t("user.profile.leaderboard.topPerformer")}
        </Text>

        <Text
          onPress={() => router.push("/screens/home/leaderboard")}
          className="text-sm font-proximanova-semibold text-[#4FB2F3] p-1"
        >
          {t("common.seeAll")}
        </Text>
      </View>

      {/* main content */}
      <ScrollView
        className="pl-5"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {loading ? (
          <View className="py-8 pr-6 items-center justify-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : (
          sortedItems.map((item) => (
            <PerformerCard
              key={item.userId}
              userName={item.userName || "User"}
              avatar={item.avatar || null}
              isPremium={item.isPremium === true}
              points={Number(item.points || 0)}
              counts={item.counts}
              onPressSeeProfile={() =>
                router.push({
                  pathname: "/screens/jobs/business/user-profile-preview",
                  params: {
                    userId: item.userId,
                    ...(selectedBusinessId
                      ? { businessId: selectedBusinessId, canRate: "true" }
                      : {}),
                  },
                })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default TopPerformer;

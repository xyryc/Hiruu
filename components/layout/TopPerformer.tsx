import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { toast } from "sonner-native";
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
  const router = useRouter();
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const selectedBusinessId = selectedBusinesses?.[0];
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<LeaderboardTopItem[]>([]);

  const fetchTopPerformer = useCallback(async () => {
    if (!selectedBusinessId) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/analytics/leaderboard/monthly/${selectedBusinessId}`
      );
      const result = response?.data;
      const top = Array.isArray(result?.data?.top) ? result.data.top : [];
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
    }
  }, [selectedBusinessId]);

  useEffect(() => {
    fetchTopPerformer();
  }, [fetchTopPerformer]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => (a?.rank ?? 0) - (b?.rank ?? 0)),
    [items]
  );

  return (
    <View className={`${className}`}>
      <View className="flex-row items-center justify-between px-5">
        <Text className="text-xl font-proximanova-semibold text-primary dark:text-dark-primary">
          Top Performer
        </Text>

        <Text
          onPress={() => router.push("/screens/home/leaderboard")}
          className="text-sm font-proximanova-semibold text-[#4FB2F3] p-1"
        >
          See All
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

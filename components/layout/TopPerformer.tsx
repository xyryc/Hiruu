import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const router = useRouter();
  const myEmployments = useBusinessStore((state) => state.myEmployments);
  const authUser = useAuthStore((state) => state.user as any);
  const getMyEmployments = useBusinessStore((state) => state.getMyEmployments);
  const getMonthlyLeaderboard = useBusinessStore((state) => state.getMonthlyLeaderboard);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const selectedBusinessId = selectedBusinesses?.[0];
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [items, setItems] = useState<LeaderboardTopItem[]>([]);

  const premiumBusinessIds = useMemo(() => {
    const ids = new Set<string>();

    (Array.isArray(myEmployments) ? myEmployments : []).forEach((employment: any) => {
      const employmentStatus = String(employment?.status || "").toLowerCase();
      const businessStatus = String(employment?.business?.status || "").toLowerCase();
      const businessId = employment?.business?.id || employment?.businessId;
      const isPremium = employment?.business?.isPremium === true;
      if (
        businessId &&
        employmentStatus === "active" &&
        businessStatus === "active" &&
        isPremium
      ) {
        ids.add(String(businessId));
      }
    });

    (Array.isArray(authUser?.employments) ? authUser.employments : []).forEach(
      (employment: any) => {
        const employmentStatus = String(employment?.status || "").toLowerCase();
        const businessStatus = String(employment?.business?.status || "").toLowerCase();
        const businessId = employment?.business?.id || employment?.businessId;
        const isPremium = employment?.business?.isPremium === true;
        if (
          businessId &&
          employmentStatus === "active" &&
          businessStatus === "active" &&
          isPremium
        ) {
          ids.add(String(businessId));
        }
      }
    );

    (Array.isArray(authUser?.ownedBusinesses) ? authUser.ownedBusinesses : []).forEach(
      (business: any) => {
        if (business?.id && business?.status === "active" && business?.isPremium === true) {
          ids.add(String(business.id));
        }
      }
    );

    return Array.from(ids);
  }, [authUser?.employments, authUser?.ownedBusinesses, myEmployments]);

  useEffect(() => {
    getMyEmployments(true).catch(() => undefined);
  }, [getMyEmployments]);

  const fetchTopPerformer = useCallback(async () => {
    if (!selectedBusinessId) {
      setItems([]);
      setHasLoadedOnce(true);
      return;
    }
    if (!premiumBusinessIds.includes(selectedBusinessId)) {
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
  }, [getMonthlyLeaderboard, premiumBusinessIds, selectedBusinessId]);

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

        {/* <Text
          onPress={() => router.push("/screens/home/leaderboard")}
          className="text-sm font-proximanova-semibold text-[#4FB2F3] p-1"
        >
          {t("common.seeAll")}
        </Text> */}
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

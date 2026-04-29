import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RatingBanner from "@/components/ui/cards/RatingBanner";
import RatingCard from "@/components/ui/cards/RatingCard";
import RatingBar from "@/components/ui/inputs/RatingBar";
import RatingStarModal from "@/components/ui/modals/RatingStarModal";
import { useBusinessStore } from "@/stores/businessStore";
import { useProfileStore } from "@/stores/profileStore";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const Rating = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const params = useLocalSearchParams<{
    userId?: string;
    businessId?: string;
    canRate?: string;
    openAddRating?: string;
  }>();
  const isLoading = useProfileStore((state) => state.isLoading);
  const isSubmittingRating = useProfileStore((state) => state.isSubmittingRating);
  const ratingsResponse = useProfileStore((state) => state.ratingsResponse);
  const businessRatingSummary = useProfileStore((state) => state.businessRatingSummary);
  const getMyRatings = useProfileStore((state) => state.getMyRatings);
  const getRatingsByUserId = useProfileStore((state) => state.getRatingsByUserId);
  const getRatingsByBusinessId = useProfileStore(
    (state) => state.getRatingsByBusinessId
  );
  const getBusinessRatingSummary = useProfileStore(
    (state) => state.getBusinessRatingSummary
  );
  const createUserBusinessRating = useProfileStore(
    (state) => state.createUserBusinessRating
  );
  const createBusinessEmployeeRating = useProfileStore(
    (state) => state.createBusinessEmployeeRating
  );
  const targetUserId = typeof params.userId === "string" ? params.userId : "";
  const businessId = typeof params.businessId === "string" ? params.businessId : "";
  const requestKey = businessId
    ? `business:${businessId}:${targetUserId || "none"}`
    : targetUserId
      ? `user:${targetUserId}`
      : "me";
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const isBusinessRatingView = Boolean(businessId) && !targetUserId;
  const isOwnBusinessRatingView =
    isBusinessRatingView &&
    Boolean(selectedBusinesses?.[0]) &&
    selectedBusinesses[0] === businessId;
  const canRate = params.canRate === "true" && Boolean(targetUserId && businessId);
  const shouldOpenAddRating = params.openAddRating === "true";
  const [resolvedRequestKey, setResolvedRequestKey] = useState("");
  const [resolvedSummaryKey, setResolvedSummaryKey] = useState("");

  const loadRatings = useCallback(async () => {
    setResolvedRequestKey("");
    setResolvedSummaryKey("");
    try {
      if (isBusinessRatingView) {
        await Promise.all([
          getRatingsByBusinessId(businessId),
          getBusinessRatingSummary(businessId),
        ]);
        return;
      }

      if (targetUserId) {
        await getRatingsByUserId(targetUserId);
        return;
      }

      await getMyRatings();
    } catch (error: any) {
      console.error("user rating screen api error:", error?.message || error);
    } finally {
      setResolvedRequestKey(requestKey);
      if (isBusinessRatingView) {
        setResolvedSummaryKey(requestKey);
      }
    }
  }, [
    businessId,
    getBusinessRatingSummary,
    getRatingsByBusinessId,
    getMyRatings,
    getRatingsByUserId,
    isBusinessRatingView,
    requestKey,
    targetUserId,
  ]);

  useEffect(() => {
    setResolvedRequestKey("");
    setResolvedSummaryKey("");
  }, [requestKey]);

  useFocusEffect(
    useCallback(() => {
      loadRatings();
      return () => { };
    }, [loadRatings])
  );

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const canUseRatingsResponse = resolvedRequestKey === requestKey;
  const canUseBusinessSummary =
    isBusinessRatingView && resolvedSummaryKey === requestKey;
  const ratingItems = useMemo(
    () =>
      canUseRatingsResponse && Array.isArray(ratingsResponse?.data)
        ? ratingsResponse.data
        : [],
    [canUseRatingsResponse, ratingsResponse?.data]
  );

  const summaryBars = useMemo(() => {
    const labels = isBusinessRatingView
      ? {
        onTime: t("user.profile.businessProfile.payOnTime"),
        trustWorthy: t("user.profile.businessProfile.workEnvironment"),
        communication: t("user.profile.businessProfile.communication"),
      }
      : {
        onTime: t("user.profile.rating.onTime"),
        trustWorthy: t("user.profile.rating.trustWorthy"),
        communication: t("user.profile.rating.communication"),
      };

    if (isBusinessRatingView) {
      const breakdown = businessRatingSummary?.ratingBreakdown;
      return [
        {
          label: labels.onTime,
          value: Number(breakdown?.payOnTime?.average ?? 0),
          max: 5,
        },
        {
          label: labels.trustWorthy,
          value: Number(breakdown?.workEnvironment?.average ?? 0),
          max: 5,
        },
        {
          label: labels.communication,
          value: Number(breakdown?.communication?.average ?? 0),
          max: 5,
        },
      ];
    }

    if (!ratingItems.length) {
      return [
        { label: labels.onTime, value: 0, max: 5 },
        { label: labels.trustWorthy, value: 0, max: 5 },
        { label: labels.communication, value: 0, max: 5 },
      ];
    }

    const total = ratingItems.length;
    const totals = ratingItems.reduce(
      (acc: { onTime: number; trustWorthy: number; communication: number }, item: any) => ({
        onTime: acc.onTime + Number(item?.ratings?.onTime || 0),
        trustWorthy: acc.trustWorthy + Number(item?.ratings?.trustWorthy || 0),
        communication: acc.communication + Number(item?.ratings?.communication || 0),
      }),
      { onTime: 0, trustWorthy: 0, communication: 0 }
    );

    return [
      { label: labels.onTime, value: totals.onTime / total, max: 5 },
      { label: labels.trustWorthy, value: totals.trustWorthy / total, max: 5 },
      { label: labels.communication, value: totals.communication / total, max: 5 },
    ];
  }, [businessRatingSummary?.ratingBreakdown, isBusinessRatingView, ratingItems, t]);

  const averageRating = useMemo(() => {
    if (isBusinessRatingView) {
      return canUseBusinessSummary
        ? Number(businessRatingSummary?.averageRating ?? 0)
        : 0;
    }
    if (!ratingItems.length) return 0;
    const total = ratingItems.reduce(
      (sum: number, item: any) => sum + Number(item?.overallRating ?? item?.rating ?? 0),
      0
    );
    return Number((total / ratingItems.length).toFixed(1));
  }, [businessRatingSummary?.averageRating, canUseBusinessSummary, isBusinessRatingView, ratingItems]);

  const totalRatings = useMemo(() => {
    if (isBusinessRatingView) {
      return canUseBusinessSummary
        ? Number(businessRatingSummary?.totalRatings ?? 0)
        : 0;
    }
    if (!canUseRatingsResponse) return 0;
    const paginationTotal = Number(ratingsResponse?.pagination?.total);
    if (Number.isFinite(paginationTotal) && paginationTotal >= 0) {
      return paginationTotal;
    }
    return ratingItems.length;
  }, [
    businessRatingSummary?.totalRatings,
    canUseBusinessSummary,
    canUseRatingsResponse,
    isBusinessRatingView,
    ratingItems.length,
    ratingsResponse?.pagination?.total,
  ]);



  const formatRelativeTime = useCallback((value?: string) => {
    if (!value) return t("user.profile.rating.justNow");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("user.profile.rating.justNow");

    const diffMs = Date.now() - date.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days >= 30) {
      return t("user.profile.rating.monthAgo", { count: Math.floor(days / 30) });
    }
    if (days >= 7) {
      return t("user.profile.rating.weekAgo", { count: Math.floor(days / 7) });
    }
    if (days >= 1) {
      return t("user.profile.rating.daysAgo", { count: days });
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours >= 1) {
      return t("user.profile.rating.hourAgo", { count: hours });
    }

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes >= 1) {
      return t("user.profile.rating.minAgo", { count: minutes });
    }

    return t("user.profile.rating.justNow");
  }, [t]);

  const canSubmitRating = canRate || (isBusinessRatingView && !isOwnBusinessRatingView);

  useEffect(() => {
    if (shouldOpenAddRating && canSubmitRating) {
      setIsVisible(true);
    }
  }, [canSubmitRating, shouldOpenAddRating]);

  const handleSubmitRating = useCallback(
    async (payload: {
      ratings: { onTime: number; trustWorthy: number; communication: number };
      comment: string;
    }) => {
      if (!targetUserId || !businessId) {
        if (!isBusinessRatingView || !businessId) {
          toast.error(t("user.profile.rating.businessOrUserInfoMissing"));
          return;
        }
      }

        try {
          if (isBusinessRatingView) {
            await createUserBusinessRating({
              businessId,
              ratings: {
                payOnTime: payload.ratings.onTime,
                workEnvironment: payload.ratings.trustWorthy,
                communication: payload.ratings.communication,
              },
            });
          } else {
            await createBusinessEmployeeRating({
            businessId,
            userId: targetUserId,
            ratings: payload.ratings,
            comment: payload.comment,
          });
        }
        toast.success(t("user.profile.rating.ratingSubmittedSuccessfully"));
        setIsVisible(false);
        await loadRatings();
      } catch (error: any) {
        toast.error(error?.message || t("user.profile.rating.failedToSubmitRating"));
      }
    },
    [
      businessId,
      createBusinessEmployeeRating,
      createUserBusinessRating,
      isBusinessRatingView,
      loadRatings,
      t,
      targetUserId,
    ]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* Header */}
        <ScreenHeader
          onPressBack={() => router.back()}
          className="px-5 pb-6 rounded-b-3xl mt-4 overflow-hidden"
          title={t("user.profile.rating.title")}
          titleClass="text-primary "
          iconColor={isDark ? "#fff" : "#111111"}
        />
        <RatingBanner averageRating={averageRating} totalRatings={totalRatings} />


        {/* Ratings and star */}
        <View className="mx-5 mt-8 rounded-[28px] bg-[#DCECF9] px-6 py-7">
          {summaryBars.map((rating, index) => (
            <RatingBar
              key={index}
              label={rating.label}
              value={rating.value}
              max={rating.max}
            />
          ))}
        </View>
        <View className="mx-5">
          {isLoading ? (
            <View className="py-8 items-center">
              <ActivityIndicator color={isDark ? "#fff" : "#111"} />
            </View>
          ) : ratingItems.length ? (
            ratingItems.map((item: any) => (
              <RatingCard
                key={item.id}
                className="mt-8"
                image={
                  isBusinessRatingView
                    ? item?.raterUser?.avatar || item?.business?.logo || null
                    : item?.business?.logo || item?.raterUser?.avatar || null
                }
                name={
                  isBusinessRatingView
                    ? item?.raterUser?.name || item?.business?.name || t("user.profile.rating.unknown")
                    : item?.business?.name || item?.raterUser?.name || t("user.profile.rating.unknown")
                }
                time={formatRelativeTime(item?.createdAt)}
                rating={Math.max(
                  0,
                  Math.min(
                    5,
                    Number(Number(item?.overallRating ?? item?.rating ?? 0).toFixed(1))
                  )
                )}
              />
            ))
          ) : (
            <Text className="mt-8 text-center text-sm text-secondary dark:text-dark-secondary">
              {t("user.profile.rating.noRatingsFound")}
            </Text>
          )}
        </View>

        <RatingStarModal
          visible={isVisible}
          onClose={() => setIsVisible(false)}
          onSubmit={handleSubmitRating}
          loading={isSubmittingRating}
        />
      </ScrollView>

      {canSubmitRating ? (
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <PrimaryButton
            title={t("user.profile.rating.addRating")}
            onPress={() => setIsVisible(true)}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default Rating;

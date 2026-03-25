import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RatingBanner from "@/components/ui/cards/RatingBanner";
import RatingCard from "@/components/ui/cards/RatingCard";
import RatingBar from "@/components/ui/inputs/RatingBar";
import RatingStarModal from "@/components/ui/modals/RatingStarModal";
import { useProfileStore } from "@/stores/profileStore";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const formatRelativeTime = (value?: string) => {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days >= 30) return `${Math.floor(days / 30)} Month ago`;
  if (days >= 7) return `${Math.floor(days / 7)} Week ago`;
  if (days >= 1) return `${days} Days ago`;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return `${hours} Hour ago`;

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes >= 1) return `${minutes} Min ago`;

  return "Just now";
};

const Rating = () => {
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
  const getMyRatings = useProfileStore((state) => state.getMyRatings);
  const getRatingsByUserId = useProfileStore((state) => state.getRatingsByUserId);
  const getRatingsByBusinessId = useProfileStore(
    (state) => state.getRatingsByBusinessId
  );
  const createUserBusinessRating = useProfileStore(
    (state) => state.createUserBusinessRating
  );
  const createBusinessEmployeeRating = useProfileStore(
    (state) => state.createBusinessEmployeeRating
  );
  const targetUserId = typeof params.userId === "string" ? params.userId : "";
  const businessId = typeof params.businessId === "string" ? params.businessId : "";
  const isBusinessRatingView = Boolean(businessId) && !targetUserId;
  const canRate = params.canRate === "true" && Boolean(targetUserId && businessId);
  const shouldOpenAddRating = params.openAddRating === "true";

  const loadRatings = useCallback(async () => {
    try {
      if (isBusinessRatingView) {
        await getRatingsByBusinessId(businessId);
        return;
      }

      if (targetUserId) {
        await getRatingsByUserId(targetUserId);
        return;
      }

      await getMyRatings();
    } catch (error: any) {
      console.log("user rating screen api error:", error?.message || error);
    }
  }, [
    businessId,
    getRatingsByBusinessId,
    getMyRatings,
    getRatingsByUserId,
    isBusinessRatingView,
    targetUserId,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadRatings();
      return () => { };
    }, [loadRatings])
  );

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const ratingItems = useMemo(
    () => (Array.isArray(ratingsResponse?.data) ? ratingsResponse.data : []),
    [ratingsResponse?.data]
  );

  const summaryBars = useMemo(() => {
    if (!ratingItems.length) {
      return [
        { label: "Pay On Time", value: 0, max: 5 },
        { label: "Trust Worthy", value: 0, max: 5 },
        { label: "Communication", value: 0, max: 5 },
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
      { label: "Pay On Time", value: totals.onTime / total, max: 5 },
      { label: "Trust Worthy", value: totals.trustWorthy / total, max: 5 },
      { label: "Communication", value: totals.communication / total, max: 5 },
    ];
  }, [ratingItems]);

  const averageRating = useMemo(() => {
    if (!ratingItems.length) return 0;
    const total = ratingItems.reduce(
      (sum: number, item: any) => sum + Number(item?.overallRating ?? item?.rating ?? 0),
      0
    );
    return Number((total / ratingItems.length).toFixed(1));
  }, [ratingItems]);

  const canSubmitRating = canRate || isBusinessRatingView;

  useEffect(() => {
    if (shouldOpenAddRating && canSubmitRating) {
      setIsVisible(true);
    }
  }, [canSubmitRating, shouldOpenAddRating]);

  useEffect(() => {
    console.log(
      "[RatingScreen] route context:",
      JSON.stringify(
        {
          businessId,
          targetUserId,
          isBusinessRatingView,
          canRate,
        },
        null,
        2
      )
    );
  }, [businessId, canRate, isBusinessRatingView, targetUserId]);

  useEffect(() => {
    if (ratingsResponse) {
      console.log(
        "[RatingScreen] ratings response:",
        JSON.stringify(ratingsResponse, null, 2)
      );
    }
  }, [ratingsResponse]);

  const handleSubmitRating = useCallback(
    async (payload: {
      ratings: { onTime: number; trustWorthy: number; communication: number };
      comment: string;
    }) => {
      console.log(
        "[RatingScreen] submitted rating payload:",
        JSON.stringify(
          {
            businessId,
            targetUserId,
            isBusinessRatingView,
            payload,
          },
          null,
          2
        )
      );

      if (!targetUserId || !businessId) {
        if (!isBusinessRatingView || !businessId) {
          toast.error("Business or user information is missing");
          return;
        }
      }

      try {
        if (isBusinessRatingView) {
          await createUserBusinessRating({
            businessId,
            ratings: payload.ratings,
          });
        } else {
          await createBusinessEmployeeRating({
            businessId,
            userId: targetUserId,
            ratings: payload.ratings,
            comment: payload.comment,
          });
        }
        toast.success("Rating submitted successfully");
        setIsVisible(false);
        await loadRatings();
      } catch (error: any) {
        toast.error(error?.message || "Failed to submit rating");
      }
    },
    [
      businessId,
      createBusinessEmployeeRating,
      createUserBusinessRating,
      isBusinessRatingView,
      loadRatings,
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
          title="Rating"
          titleClass="text-primary "
          iconColor={isDark ? "#fff" : "#111111"}
        />
        <RatingBanner averageRating={averageRating} />


        {/* Ratings and star */}
        <View className=" mx-5 bg-[#E5F4FD] mt-8 rounded-2xl p-5 shadow-lg">
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
                      ? item?.raterUser?.name || item?.business?.name || "Unknown"
                    : item?.business?.name || item?.raterUser?.name || "Unknown"
                }
                time={formatRelativeTime(item?.createdAt)}
                rating={Math.max(
                  0,
                  Math.min(5, Math.round(Number(item?.overallRating ?? item?.rating ?? 0)))
                )}
              />
            ))
          ) : (
            <Text className="mt-8 text-center text-sm text-secondary dark:text-dark-secondary">
              No ratings found.
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
            title="Add Rating"
            onPress={() => setIsVisible(true)}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default Rating;

import { useBusinessStore } from "@/stores/businessStore";
import { useRatingStore } from "@/stores/ratingStore";
import { useAuthStore } from "@/stores/authStore";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

type RatingRouteParams = {
  businessId?: string;
  userId?: string;
  direction?: "business_to_user" | "user_to_business";
  ratingType?: "onTime" | "trustWorthy" | "communication";
  page?: string;
  limit?: string;
};

export const useRatings = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const myBusinesses = useBusinessStore((state) => state.myBusinesses);
  const getRatingsFromStore = useRatingStore((state) => state.getRatings);
  const params = useLocalSearchParams<RatingRouteParams>();
  const businessIdFromParams =
    typeof params.businessId === "string" ? params.businessId : "";
  const userIdFromParams =
    typeof params.userId === "string" ? params.userId : "";
  const directionFromParams =
    typeof params.direction === "string" ? params.direction : "";
  const ratingTypeFromParams =
    typeof params.ratingType === "string" ? params.ratingType : "";
  const pageFromParams =
    typeof params.page === "string" ? Number(params.page) : 1;
  const limitFromParams =
    typeof params.limit === "string" ? Number(params.limit) : 10;
  const fallbackBusinessIdFromStore =
    selectedBusinesses[0] || myBusinesses?.[0]?.id || "";
  const fallbackUserId = userIdFromParams || userId || "";
  const safeDirection =
    directionFromParams === "business_to_user" ||
    directionFromParams === "user_to_business"
      ? directionFromParams
      : "business_to_user";
  const safeRatingType =
    ratingTypeFromParams === "onTime" ||
    ratingTypeFromParams === "trustWorthy" ||
    ratingTypeFromParams === "communication"
      ? ratingTypeFromParams
      : undefined;
  const safePage = Number.isFinite(pageFromParams) && pageFromParams > 0 ? pageFromParams : 1;
  const safeLimit = Number.isFinite(limitFromParams) && limitFromParams > 0 ? limitFromParams : 10;

  useFocusEffect(
    useCallback(() => {
      const fetchRatings = async () => {
        const businessId = businessIdFromParams || fallbackBusinessIdFromStore || undefined;
        const userIdForQuery = fallbackUserId || undefined;

        if (!businessId && !userIdForQuery) {
          console.log("user rating screen skipped: no userId/businessId");
          return;
        }

        try {
          const result = await getRatingsFromStore({
            businessId,
            userId: userIdForQuery,
            direction: safeDirection,
            ratingType: safeRatingType,
            page: safePage,
            limit: safeLimit,
          });
          console.log("user rating screen data:", result);
        } catch (error: any) {
          console.log("user rating screen api error:", error?.message || error);
        }
      };

      fetchRatings();
      return () => {};
    }, [
      businessIdFromParams,
      fallbackBusinessIdFromStore,
      fallbackUserId,
      getRatingsFromStore,
      safeDirection,
      safeRatingType,
      safePage,
      safeLimit,
    ])
  );
};

import { useBusinessStore } from "@/stores/businessStore";
import { useRatingStore } from "@/stores/ratingStore";
import { useAuthStore } from "@/stores/authStore";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

type RatingRouteParams = {
  businessId?: string;
  userId?: string;
};

export const useRatings = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const myBusinesses = useBusinessStore((state) => state.myBusinesses);
  const getMyBusinesses = useBusinessStore((state) => state.getMyBusinesses);
  const getBusinessRatings = useRatingStore((state) => state.getBusinessRatings);
  const params = useLocalSearchParams<RatingRouteParams>();
  const businessIdFromParams =
    typeof params.businessId === "string" ? params.businessId : "";
  const userIdFromParams =
    typeof params.userId === "string" ? params.userId : "";
  const fallbackBusinessIdFromStore =
    selectedBusinesses[0] || myBusinesses?.[0]?.id || "";
  const fallbackUserId = userIdFromParams || userId || "";

  useFocusEffect(
    useCallback(() => {
      const getRatings = async () => {
        let businessId = businessIdFromParams || fallbackBusinessIdFromStore;

        if (!businessId) {
          try {
            const businesses = await getMyBusinesses();
            const firstBusinessId = Array.isArray(businesses)
              ? businesses?.[0]?.id
              : "";
            businessId = firstBusinessId || "";
          } catch (error) {
            console.log("ratings list business fetch error:", error);
          }
        }

        if (!businessId) {
          console.log("ratings list skipped: no businessId");
          return;
        }

        try {
          const result = await getBusinessRatings({
            businessId,
            userId: fallbackUserId || undefined,
            page: 1,
            limit: 10,
          });
          console.log("ratings list api response:", result);
        } catch (error: any) {
          console.log("ratings list api error:", error?.message || error);
        }
      };

      getRatings();
      return () => {};
    }, [
      businessIdFromParams,
      fallbackBusinessIdFromStore,
      fallbackUserId,
      getBusinessRatings,
      getMyBusinesses,
    ])
  );
};

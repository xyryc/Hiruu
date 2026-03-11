import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

interface GetRatingsParams {
  businessId?: string;
  userId?: string;
  direction?: "business_to_user" | "user_to_business";
  ratingType?: "onTime" | "trustWorthy" | "communication";
  page?: number;
  limit?: number;
}

interface RatingState {
  ratingsResponse: any | null;
  isLoadingRatings: boolean;
  error: Error | null;
  getRatings: (params: GetRatingsParams) => Promise<any>;
  clearError: () => void;
}

export const useRatingStore = create<RatingState>((set) => ({
  ratingsResponse: null,
  isLoadingRatings: false,
  error: null,

  getRatings: async ({
    businessId,
    userId,
    direction,
    ratingType,
    page = 1,
    limit = 10,
  }: GetRatingsParams) => {
    set({ isLoadingRatings: true, error: null });

    try {
      const response = await axiosInstance.get("/ratings", {
        params: {
          ...(businessId ? { businessId } : {}),
          ...(userId ? { userId } : {}),
          ...(direction ? { direction } : {}),
          ...(ratingType ? { ratingType } : {}),
          page,
          limit,
        },
      });

      const result = response.data;
      set({
        ratingsResponse: result,
        isLoadingRatings: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load ratings";
      const finalError = new Error(message);
      set({ isLoadingRatings: false, error: finalError });
      throw finalError;
    }
  },

  clearError: () => set({ error: null }),
}));

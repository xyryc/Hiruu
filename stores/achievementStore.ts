import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

export type AchievementCondition = {
  type?: string;
  target?: number;
};

export type AchievementProgress = {
  progress?: number;
  completedAt?: string | null;
  isClaimed?: boolean;
  claimedAt?: string | null;
  canClaim?: boolean;
};

export type AchievementItem = {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  rewardCoins?: number;
  rewardCosmeticId?: string | null;
  conditions?: AchievementCondition | null;
  isActive?: boolean;
  isHidden?: boolean;
  displayOrder?: number;
  rewardCosmetic?: any;
  userProgress?: AchievementProgress | null;
};

interface AchievementState {
  achievements: AchievementItem[];
  isLoadingAchievements: boolean;
  error: Error | null;
  getAchievements: () => Promise<AchievementItem[]>;
  clearError: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  isLoadingAchievements: false,
  error: null,

  getAchievements: async () => {
    set({ isLoadingAchievements: true, error: null });

    try {
      const response = await axiosInstance.get("/achievements");
      const result = response.data;

      if (!result?.success) {
        throw new Error(
          translateApiMessage(result?.message) || "Failed to load achievements"
        );
      }

      const achievements = Array.isArray(result?.data)
        ? (result.data as AchievementItem[])
        : [];

      set({ achievements, isLoadingAchievements: false });
      return achievements;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load achievements";
      const finalError = new Error(message);
      set({ isLoadingAchievements: false, error: finalError });
      throw finalError;
    }
  },

  clearError: () => set({ error: null }),
}));

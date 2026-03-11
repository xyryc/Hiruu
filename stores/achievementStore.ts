import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

export type AchievementCondition = {
  type?: string;
  target?: number;
};

export type AchievementType = "onetime" | "repeat";

export type AchievementProgress = {
  progress?: number;
  completedAt?: string | null;
  isClaimed?: boolean;
  claimedAt?: string | null;
  canClaim?: boolean;
  periodStart?: string | null;
  periodEnd?: string | null;
  resetAt?: string | null;
};

export type AchievementItem = {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  type?: AchievementType;
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
  claimingAchievementId: string | null;
  error: Error | null;
  getAchievements: (type: AchievementType) => Promise<AchievementItem[]>;
  claimAchievement: (id: string) => Promise<any>;
  clearError: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  isLoadingAchievements: false,
  claimingAchievementId: null,
  error: null,

  getAchievements: async (type) => {
    set({ isLoadingAchievements: true, error: null });

    try {
      const response = await axiosInstance.get("/achievements", {
        params: { type },
      });
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

  claimAchievement: async (id) => {
    set({ claimingAchievementId: id, error: null });

    try {
      const response = await axiosInstance.post(`/achievements/${id}/claim`);
      const result = response.data;

      if (result?.success === false) {
        throw new Error(
          translateApiMessage(result?.message) || "Failed to claim achievement"
        );
      }

      set({ claimingAchievementId: null });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to claim achievement";
      const finalError = new Error(message);
      set({ claimingAchievementId: null, error: finalError });
      throw finalError;
    }
  },

  clearError: () => set({ error: null }),
}));

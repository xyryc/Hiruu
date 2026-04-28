import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

export type AchievementCondition = {
  type?: string;
  target?: number;
};

export type AchievementType = "onetime" | "repeat";

export type AchievementReward = {
  id?: string;
  type?: string;
  coins?: number;
  cosmeticId?: string | null;
  badgeConfig?: any;
  metadata?: any;
  isActive?: boolean;
};

export type AchievementProgress = {
  progress?: number;
  completedAt?: string | null;
  isClaimed?: boolean;
  claimedAt?: string | null;
  canClaim?: boolean;
  periodStart?: string | null;
  periodEnd?: string | null;
  resetAt?: string | null;
  progressPercent?: number;
};

export type AchievementItem = {
  id: string;
  key: string;
  icon?: string | null;
  title: string;
  description?: string | null;
  type?: AchievementType;
  category?: string | null;
  rewardType?: string;
  rewardCoins?: number;
  rewardCosmeticId?: string | null;
  rewards?: AchievementReward[];
  conditions?: AchievementCondition | null;
  isActive?: boolean;
  isHidden?: boolean;
  displayOrder?: number;
  rewardCosmetic?: any;
  userProgress?: AchievementProgress | null;
};

export type AchievementBoardItem = {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  rewardTokens?: number;
  type?: AchievementType;
  target?: number;
  userProgress?: AchievementProgress | null;
};

export type AchievementBoardData = {
  recentAchievement?: AchievementBoardItem | null;
  standardChallenges?: AchievementBoardItem[];
};

interface AchievementState {
  achievements: AchievementItem[];
  achievementsPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  board: AchievementBoardData | null;
  isLoadingAchievements: boolean;
  isLoadingMoreAchievements: boolean;
  isLoadingBoard: boolean;
  claimingAchievementId: string | null;
  error: Error | null;
  getAchievements: (
    type: AchievementType,
    page?: number,
    limit?: number,
    append?: boolean
  ) => Promise<AchievementItem[]>;
  getBoard: () => Promise<AchievementBoardData | null>;
  claimAchievement: (id: string) => Promise<any>;
  clearError: () => void;
}

export const useAchievementStore = create<AchievementState>((set) => ({
  achievements: [],
  achievementsPagination: null,
  board: null,
  isLoadingAchievements: false,
  isLoadingMoreAchievements: false,
  isLoadingBoard: false,
  claimingAchievementId: null,
  error: null,

  getAchievements: async (type, page = 1, limit = 5, append = false) => {
    set({
      isLoadingAchievements: append ? false : true,
      isLoadingMoreAchievements: append,
      error: null,
    });

    try {
      const response = await axiosInstance.get("/achievements", {
        params: { type, page, limit },
      });
      const result = response.data;

      if (!result?.success) {
        throw new Error(
          translateApiMessage(result?.message) || "Failed to load achievements"
        );
      }

        const nextPageItems: AchievementItem[] = Array.isArray(result?.data)
          ? (result.data as AchievementItem[]).map((item) => ({
              ...item,
              rewardCoins:
                typeof item?.rewardCoins === "number"
                  ? item.rewardCoins
              : typeof item?.rewards?.[0]?.coins === "number"
                ? item.rewards[0].coins
                : 0,
        }))
        : [];
      const pagination = result?.pagination || null;
        let mergedItems: AchievementItem[] = nextPageItems;

      set((state) => {
        mergedItems = append
          ? [
            ...state.achievements,
            ...nextPageItems.filter(
              (item) => !state.achievements.some((prev) => prev.id === item.id)
            ),
          ]
          : nextPageItems;

        return {
          achievements: mergedItems,
          achievementsPagination: pagination,
          isLoadingAchievements: false,
          isLoadingMoreAchievements: false,
        };
      });

      return mergedItems;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load achievements";
      const finalError = new Error(message);
      set({
        isLoadingAchievements: false,
        isLoadingMoreAchievements: false,
        error: finalError,
      });
      throw finalError;
    }
  },

  getBoard: async () => {
    set({ isLoadingBoard: true, error: null });

    try {
      const response = await axiosInstance.get("/achievements/board");
      const result = response.data;

      if (!result?.success) {
        throw new Error(
          translateApiMessage(result?.message) || "Failed to load achievements board"
        );
      }

      const boardData: AchievementBoardData | null =
        result?.data && typeof result.data === "object" ? result.data : null;

      set({ board: boardData, isLoadingBoard: false });
      return boardData;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load achievements board";
      const finalError = new Error(message);
      set({ isLoadingBoard: false, error: finalError });
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

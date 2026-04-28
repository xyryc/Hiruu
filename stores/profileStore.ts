import { profileService } from "@/services/profileService";
import { UpdatePreferencesData, UpdateProfileData } from "@/types";
import axiosInstance from "@/utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { create } from "zustand";
import { useAuthStore, type User } from "./authStore";

const STORAGE_KEYS = {
  USER: "auth_user",
  PROFILE_COMPLETE: "profile_complete",
};

const DEFAULT_PROFILE_COLOR = "#E5F4FD";
const DEFAULT_GRADIENT_COLORS: [string, string] = ["#E5F4FD", "#FFFFFF"];

const resolveProfileAppearance = (profileData: any, currentUser: any) => {
  const serverAppearance = profileData?.appearance;
  const profileTheme = serverAppearance?.profileTheme;

  if (profileTheme && typeof profileTheme === "object") {
    const type =
      profileTheme?.type === "gradient" ? "gradient" : "solid";
    const gradient =
      Array.isArray(profileTheme?.gradientColors) &&
        profileTheme.gradientColors.length >= 2
        ? [
          String(profileTheme.gradientColors[0] || DEFAULT_GRADIENT_COLORS[0]),
          String(profileTheme.gradientColors[1] || DEFAULT_GRADIENT_COLORS[1]),
        ]
        : DEFAULT_GRADIENT_COLORS;

    return {
      pickerType: type,
      profileColor: String(profileTheme?.solidColor || DEFAULT_PROFILE_COLOR),
      gradientColors: gradient as [string, string],
    };
  }

  return currentUser?.profileAppearance ?? undefined;
};

const CV_POLL_INTERVAL_MS = 5000;
const CV_POLL_TIMEOUT_MS = 180000;

let cvPollInterval: ReturnType<typeof setInterval> | null = null;
let cvPollTimeout: ReturnType<typeof setTimeout> | null = null;

const clearCvPollers = () => {
  if (cvPollInterval) {
    clearInterval(cvPollInterval);
    cvPollInterval = null;
  }
  if (cvPollTimeout) {
    clearTimeout(cvPollTimeout);
    cvPollTimeout = null;
  }
};

const getApiMessageKey = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const apiMessage = (error.response?.data as any)?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export type CvLayoutStyle = "traditional" | "sidebar-left" | "sidebar-right";
export type CvBuildStatus = "idle" | "pending" | "completed" | "cancelled" | "timeout" | "failed";

export interface BuildCvPayload {
  language: string;
  templateStyle: string;
  layout: CvLayoutStyle;
  demo: false;
}

export interface CvBuildResult {
  status: "pending" | "completed" | "cancelled";
  preview?: string;
  pdf?: string;
  image?: string;
}

interface ProfileState {
  isLoading: boolean;
  isLoadingRatingSummary: boolean;
  isLoadingAnalyticsSummary: boolean;
  isSubmittingRating: boolean;
  error: Error | null;
  isProfileComplete: boolean;
  isGeneratingCv: boolean;
  isPollingCv: boolean;
  cvBuildStatus: CvBuildStatus;
  cvResult: CvBuildResult | null;
  analyticsSummary: {
    period?: {
      type?: string;
      from?: string;
      to?: string;
    };
    metrics?: {
      onTimeArrivalPercent?: number;
      taskCompletionPercent?: number;
      positiveFeedbackPercent?: number;
      growthScorePercent?: number;
    };
    counts?: {
      onTimeArrival?: { numerator?: number; denominator?: number };
      taskCompletion?: { numerator?: number; denominator?: number };
      positiveFeedback?: { numerator?: number; denominator?: number };
    };
  } | null;
  ratingsResponse: any | null;
  ratingSummary: {
    averageRating: number;
    totalRatings: number;
    ratingBreakdown: {
      onTime?: { average: number; count: number };
      trustWorthy?: { average: number; count: number };
      communication?: { average: number; count: number };
    };
  } | null;
  businessRatingSummary: {
    averageRating: number;
    totalRatings: number;
    ratingBreakdown: {
      onTime?: { average: number; count: number };
      trustWorthy?: { average: number; count: number };
      communication?: { average: number; count: number };
    };
  } | null;

  updateProfile: (profileData: UpdateProfileData) => Promise<any>;
  updatePreferences: (payload: UpdatePreferencesData) => Promise<any>;
  deleteMe: (password: string) => Promise<any>;
  startCvBuild: (payload: BuildCvPayload) => Promise<CvBuildResult | null>;
  pollCvBuildStatus: () => Promise<CvBuildResult | null>;
  cancelCvBuild: () => Promise<CvBuildResult | null>;
  resetCvBuildState: () => void;
  getProfile: () => Promise<any>;
  getAnalyticsSummary: () => Promise<any>;
  getMyRatings: () => Promise<any>;
  getRatingsByUserId: (userId: string) => Promise<any>;
  getRatingsByBusinessId: (businessId: string) => Promise<any>;
  getUserRatingSummary: (userId: string) => Promise<any>;
  getBusinessRatingSummary: (businessId: string) => Promise<any>;
  createUserBusinessRating: (payload: {
    businessId: string;
    ratings: {
      onTime: number;
      trustWorthy: number;
      communication: number;
    };
  }) => Promise<any>;
  createBusinessEmployeeRating: (payload: {
    businessId: string;
    userId: string;
    ratings: {
      onTime: number;
      trustWorthy: number;
      communication: number;
    };
    comment: string;
  }) => Promise<any>;
  syncExperiences: (experiences: any[], existingExperiences?: any[]) => Promise<void>;
  setLocalProfileAppearance: (appearance: NonNullable<User["profileAppearance"]>) => Promise<void>;
  setProfileComplete: (isComplete: boolean) => Promise<void>;
  loadProfileComplete: () => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  isLoading: false,
  isLoadingRatingSummary: false,
  isLoadingAnalyticsSummary: false,
  isSubmittingRating: false,
  error: null,
  isProfileComplete: false,
  isGeneratingCv: false,
  isPollingCv: false,
  cvBuildStatus: "idle",
  cvResult: null,
  analyticsSummary: null,
  ratingsResponse: null,
  ratingSummary: null,
  businessRatingSummary: null,

  updateProfile: async (profileData: UpdateProfileData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await profileService.updateProfile(profileData);

      const currentUser = useAuthStore.getState().user;
      const resolvedProfileAppearance = resolveProfileAppearance(
        response?.data,
        currentUser
      );
      const updatedUser = {
        ...currentUser,
        ...response.data,
        ...(resolvedProfileAppearance
          ? { profileAppearance: resolvedProfileAppearance }
          : {}),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      useAuthStore.getState().setUser(updatedUser as any);

      set({
        isLoading: false,
      });

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Profile update failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  updatePreferences: async (payload: UpdatePreferencesData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await profileService.updatePreferences(payload);

      const currentUser = useAuthStore.getState().user;
      const updatedUser = {
        ...currentUser,
        ...response.data,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      useAuthStore.getState().setUser(updatedUser as any);

      set({
        isLoading: false,
      });

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Failed to update preferences");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  deleteMe: async (password: string) => {
    set({ isLoading: true, error: null });

    try {
      const accessToken = useAuthStore.getState().accessToken;

      const response = await axiosInstance.delete("/auth/delete-me", {
        data: { password },
        headers: accessToken
          ? {
            Authorization: `Bearer ${accessToken}`,
          }
          : undefined,
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "auth_invalid_credentials");
      }


      set({ isLoading: false });
      return result;
    } catch (error: any) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message;



      const messageKey =
        status === 401 || apiMessage === "unauthorized"
          ? "auth_invalid_credentials"
          : getApiMessageKey(error, "UNKNOWN_ERROR");

      const finalError = new Error(messageKey);
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  startCvBuild: async (payload: BuildCvPayload) => {
    clearCvPollers();
    set({
      isGeneratingCv: true,
      isPollingCv: false,
      cvBuildStatus: "pending",
      cvResult: null,
      error: null,
    });

    try {
      const response = await axiosInstance.post("/ai-engine/build-cv", payload);
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to start CV generation");
      }

      const status = String(result?.data?.status || "pending").toLowerCase();
      const normalizedStatus =
        status === "completed"
          ? "completed"
          : status === "cancelled"
            ? "cancelled"
            : "pending";

      const cvResult: CvBuildResult = {
        status: normalizedStatus as CvBuildResult["status"],
        preview: result?.data?.preview,
        pdf: result?.data?.pdf,
        image: result?.data?.image,
      };

      set({
        isGeneratingCv: normalizedStatus === "pending",
        cvBuildStatus: normalizedStatus as CvBuildStatus,
        cvResult:
          normalizedStatus === "completed" || normalizedStatus === "cancelled"
            ? cvResult
            : null,
      });

      return cvResult;
    } catch (error) {
      const finalError = new Error(
        getApiMessageKey(error, "Failed to start CV generation")
      );
      set({
        isGeneratingCv: false,
        isPollingCv: false,
        cvBuildStatus: "failed",
        error: finalError,
      });
      throw finalError;
    }
  },

  pollCvBuildStatus: async (): Promise<CvBuildResult | null> => {
    const currentState = get();
    if (currentState.isPollingCv) {
      return currentState.cvResult;
    }

    set({ isPollingCv: true, error: null });

    return new Promise<CvBuildResult | null>((resolve, reject) => {
      const finish = (nextState: Partial<ProfileState>, result?: CvBuildResult | null) => {
        clearCvPollers();
        set({
          isPollingCv: false,
          isGeneratingCv: false,
          ...nextState,
        });
        resolve(result ?? null);
      };

      const fail = (error: Error) => {
        clearCvPollers();
        set({
          isPollingCv: false,
          isGeneratingCv: false,
          cvBuildStatus: "failed",
          error,
        });
        reject(error);
      };

      const checkStatus = async () => {
        try {
          const response = await axiosInstance.get("/ai-engine/build-cv");
          const result = response?.data;

          if (!result?.success) {
            throw new Error(result?.message || "Failed to fetch CV status");
          }

          const status = String(result?.data?.status || "pending").toLowerCase();
          const cvResult: CvBuildResult = {
            status:
              status === "completed"
                ? "completed"
                : status === "cancelled"
                  ? "cancelled"
                  : "pending",
            preview: result?.data?.preview,
            pdf: result?.data?.pdf,
            image: result?.data?.image,
          };

          if (cvResult.status === "completed") {
            finish({ cvBuildStatus: "completed", cvResult }, cvResult);
            return;
          }

          if (cvResult.status === "cancelled") {
            finish({ cvBuildStatus: "cancelled", cvResult }, cvResult);
            return;
          }

          set({
            cvBuildStatus: "pending",
            cvResult: null,
          });
        } catch (error) {
          const finalError = new Error(
            getApiMessageKey(error, "Failed to fetch CV status")
          );
          fail(finalError);
        }
      };

      cvPollTimeout = setTimeout(() => {
        clearCvPollers();
        set({
          isPollingCv: false,
          isGeneratingCv: false,
          cvBuildStatus: "timeout",
        });
        resolve(null);
      }, CV_POLL_TIMEOUT_MS);

      void checkStatus();
      cvPollInterval = setInterval(() => {
        void checkStatus();
      }, CV_POLL_INTERVAL_MS);
    });
  },

  cancelCvBuild: async () => {
    clearCvPollers();
    set({ isPollingCv: false, isGeneratingCv: false, error: null });

    try {
      const response = await axiosInstance.delete("/ai-engine/build-cv");
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to cancel CV generation");
      }

      const cvResult: CvBuildResult = {
        status: "cancelled",
      };

      set({
        cvBuildStatus: "cancelled",
        cvResult,
      });

      return cvResult;
    } catch (error) {
      const finalError = new Error(
        getApiMessageKey(error, "Failed to cancel CV generation")
      );
      set({
        cvBuildStatus: "failed",
        error: finalError,
      });
      throw finalError;
    }
  },

  resetCvBuildState: () => {
    clearCvPollers();
    set({
      isGeneratingCv: false,
      isPollingCv: false,
      cvBuildStatus: "idle",
      cvResult: null,
    });
  },

  getProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await profileService.getProfile();
      const currentUser = useAuthStore.getState().user;
      const resolvedProfileAppearance = resolveProfileAppearance(
        response?.data,
        currentUser
      );
      const updatedUser = {
        ...currentUser,
        ...response.data,
        ...(resolvedProfileAppearance
          ? { profileAppearance: resolvedProfileAppearance }
          : {}),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      useAuthStore.getState().setUser(updatedUser as any);

      set({
        isLoading: false,
      });

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Failed to fetch profile");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  setLocalProfileAppearance: async (appearance) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      profileAppearance: appearance,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    useAuthStore.getState().setUser(updatedUser as any);
  },

  getAnalyticsSummary: async () => {
    set({ isLoadingAnalyticsSummary: true, error: null });

    try {
      const response = await axiosInstance.get("/analytics/summary");
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        throw new Error(result?.message || "Failed to load analytics summary");
      }

      set({
        analyticsSummary: result?.data ?? null,
        isLoadingAnalyticsSummary: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load analytics summary"
      );
      set({ isLoadingAnalyticsSummary: false, error: finalError });
      throw finalError;
    }
  },

  getMyRatings: async () => {
    set({ isLoading: true, error: null, ratingsResponse: null });

    try {
      const response = await axiosInstance.get("/ratings/users/me");
      const result = response.data;
      set({
        ratingsResponse: result,
        isLoading: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load my ratings"
      );
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  getRatingsByUserId: async (userId: string) => {
    if (!userId) {
      const finalError = new Error("User id is required");
      set({ error: finalError });
      throw finalError;
    }

    set({ isLoading: true, error: null, ratingsResponse: null });

    try {
      const response = await axiosInstance.get(`/ratings/users/${userId}`);
      const result = response.data;
      set({
        ratingsResponse: result,
        isLoading: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load user ratings"
      );
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  getRatingsByBusinessId: async (businessId: string) => {
    if (!businessId) {
      const finalError = new Error("Business id is required");
      set({ error: finalError });
      throw finalError;
    }

    set({ isLoading: true, error: null, ratingsResponse: null });

    try {
      const response = await axiosInstance.get(`/ratings/businesses/${businessId}`);
      const result = response.data;
      set({
        ratingsResponse: result,
        isLoading: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load business ratings"
      );
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  getUserRatingSummary: async (userId: string) => {
    if (!userId) {
      const finalError = new Error("User id is required");
      set({ error: finalError });
      throw finalError;
    }

    set({ isLoadingRatingSummary: true, error: null });

    try {
      const response = await axiosInstance.get(`/ratings/users/${userId}/summary`);
      const result = response.data;
      set({
        ratingSummary: result?.data ?? null,
        isLoadingRatingSummary: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load user rating summary"
      );
      set({ isLoadingRatingSummary: false, error: finalError });
      throw finalError;
    }
  },

  getBusinessRatingSummary: async (businessId: string) => {
    if (!businessId) {
      const finalError = new Error("Business id is required");
      set({ error: finalError });
      throw finalError;
    }

    set({ isLoadingRatingSummary: true, error: null });

    try {
      const response = await axiosInstance.get(
        `/ratings/businesses/${businessId}/summary`
      );
      const result = response.data;
      set({
        businessRatingSummary: result?.data ?? null,
        isLoadingRatingSummary: false,
      });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to load business rating summary"
      );
      set({ isLoadingRatingSummary: false, error: finalError });
      throw finalError;
    }
  },

  createUserBusinessRating: async (payload) => {
    if (!payload.businessId) {
      const finalError = new Error("Business id is required");
      set({ error: finalError });
      throw finalError;
    }

    set({ isSubmittingRating: true, error: null });

    try {
      const response = await axiosInstance.post(
        `/ratings/businesses/${payload.businessId}`,
        {
          ratings: payload.ratings,
        }
      );
      const result = response.data;
      set({ isSubmittingRating: false });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to submit business rating"
      );
      set({ isSubmittingRating: false, error: finalError });
      throw finalError;
    }
  },

  createBusinessEmployeeRating: async (payload) => {
    if (!payload.businessId || !payload.userId) {
      const finalError = new Error("Business id and user id are required");
      set({ error: finalError });
      throw finalError;
    }

    set({ isSubmittingRating: true, error: null });

    try {
      const response = await axiosInstance.post(
        `/ratings/businesses/${payload.businessId}/users/${payload.userId}`,
        {
          ratings: payload.ratings,
          comment: payload.comment,
        }
      );
      const result = response.data;
      set({ isSubmittingRating: false });
      return result;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const finalError = new Error(
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to submit rating"
      );
      set({ isSubmittingRating: false, error: finalError });
      throw finalError;
    }
  },

  syncExperiences: async (experiences, existingExperiences = []) => {
    set({ isLoading: true, error: null });

    try {
      await profileService.syncExperiences(experiences, existingExperiences);
      set({ isLoading: false });
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Failed to sync experiences");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  setProfileComplete: async (isComplete: boolean) => {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PROFILE_COMPLETE,
      isComplete ? "true" : "false"
    );
    set({ isProfileComplete: isComplete });
  },

  loadProfileComplete: async () => {
    const profileCompleteStr = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE_COMPLETE);
    const profileComplete =
      profileCompleteStr !== null ? profileCompleteStr === "true" : false;
    set({ isProfileComplete: profileComplete });
  },

  clearError: () => set({ error: null }),
}));

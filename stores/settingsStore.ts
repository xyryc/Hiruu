import { translateApiMessage } from "@/utils/apiMessages";
import axiosInstance from "@/utils/axios";
import { AxiosError } from "axios";
import { create } from "zustand";

export type SettingsContentData = {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyAvailabilityItem = {
  day: string;
  isOpen: boolean;
  startTime?: string;
  endTime?: string;
};

export type JobProfileData = {
  id: string;
  userId: string;
  headline?: string | null;
  about?: string | null;
  isOpenToWork?: boolean;
  preferredRoleIds?: string[];
  highlightedExperience?: string | null;
  preferredSalaryType?: string | null;
  expectedSalaryMin?: number | string | null;
  expectedSalaryMax?: number | string | null;
  weeklyAvailability?: WeeklyAvailabilityItem[];
  skills?: string[];
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name?: string | null;
    avatar?: string | null;
    isOnline?: boolean;
  } | null;
};

interface SettingsState {
  termsAndConditions: SettingsContentData | null;
  privacyPolicy: SettingsContentData | null;
  faqItems: FaqItem[];
  jobProfile: JobProfileData | null;
  isLoadingTermsAndConditions: boolean;
  isLoadingPrivacyPolicy: boolean;
  isLoadingFaq: boolean;
  isLoadingJobProfile: boolean;
  error: Error | null;
  getTermsAndConditions: () => Promise<SettingsContentData | null>;
  getPrivacyPolicy: () => Promise<SettingsContentData | null>;
  getFaq: () => Promise<FaqItem[]>;
  getMyJobProfile: () => Promise<JobProfileData | null>;
  updateMyJobProfile: (
    payload: Partial<JobProfileData>
  ) => Promise<JobProfileData | null>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  termsAndConditions: null,
  privacyPolicy: null,
  faqItems: [],
  jobProfile: null,
  isLoadingTermsAndConditions: false,
  isLoadingPrivacyPolicy: false,
  isLoadingFaq: false,
  isLoadingJobProfile: false,
  error: null,

  getTermsAndConditions: async () => {
    set({ isLoadingTermsAndConditions: true, error: null });

    try {
      const response = await axiosInstance.get("/settings/terms-and-conditions");
      const result = response.data;

      if (!result?.success) {
        const message =
          translateApiMessage(result?.message) ||
          "Failed to load terms and conditions";
        throw new Error(message);
      }

      const data = result?.data ?? null;
      set({
        termsAndConditions: data,
        isLoadingTermsAndConditions: false,
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load terms and conditions";
      const finalError = new Error(message);
      set({ isLoadingTermsAndConditions: false, error: finalError });
      throw finalError;
    }
  },

  getPrivacyPolicy: async () => {
    set({ isLoadingPrivacyPolicy: true, error: null });

    try {
      const response = await axiosInstance.get("/settings/privacy-policy");
      const result = response.data;

      if (!result?.success) {
        const message =
          translateApiMessage(result?.message) ||
          "Failed to load privacy policy";
        throw new Error(message);
      }

      const data = result?.data ?? null;
      set({
        privacyPolicy: data,
        isLoadingPrivacyPolicy: false,
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load privacy policy";
      const finalError = new Error(message);
      set({ isLoadingPrivacyPolicy: false, error: finalError });
      throw finalError;
    }
  },

  getFaq: async () => {
    set({ isLoadingFaq: true, error: null });

    try {
      const response = await axiosInstance.get("/settings/faq");
      const result = response.data;

      if (!result?.success) {
        const message =
          translateApiMessage(result?.message) || "Failed to load FAQ";
        throw new Error(message);
      }

      const data = Array.isArray(result?.data)
        ? [...result.data].sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
        : [];
      set({
        faqItems: data,
        isLoadingFaq: false,
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load FAQ";
      const finalError = new Error(message);
      set({ isLoadingFaq: false, error: finalError });
      throw finalError;
    }
  },

  getMyJobProfile: async () => {
    set({ isLoadingJobProfile: true, error: null });

    try {
      const response = await axiosInstance.get("/job-profile/me");
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        const message =
          translateApiMessage(result?.message) || "Failed to load job profile";
        throw new Error(message);
      }

      const data = (result?.data ?? null) as JobProfileData | null;
      set({
        jobProfile: data,
        isLoadingJobProfile: false,
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to load job profile";
      const finalError = new Error(message);
      set({ isLoadingJobProfile: false, error: finalError });
      throw finalError;
    }
  },

  updateMyJobProfile: async (payload) => {
    set({ isLoadingJobProfile: true, error: null });

    try {
      const response = await axiosInstance.patch("/job-profile/me", payload);
      const result = response.data;

      if (
        result?.success === false ||
        (typeof result?.statusCode === "number" && result.statusCode >= 400)
      ) {
        const message =
          translateApiMessage(result?.message) || "Failed to update job profile";
        throw new Error(message);
      }

      const data = (result?.data ?? null) as JobProfileData | null;
      set((state) => ({
        jobProfile: data
          ? data
          : state.jobProfile
            ? { ...state.jobProfile, ...payload }
            : null,
        isLoadingJobProfile: false,
      }));
      return data;
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      const message =
        translateApiMessage(axiosError.response?.data?.message) ||
        axiosError.message ||
        "Failed to update job profile";
      const finalError = new Error(message);
      set({ isLoadingJobProfile: false, error: finalError });
      throw finalError;
    }
  },

  clearError: () => set({ error: null }),
}));

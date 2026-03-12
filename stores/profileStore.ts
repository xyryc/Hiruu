import { profileService } from "@/services/profileService";
import axiosInstance from "@/utils/axios";
import { UpdatePreferencesData, UpdateProfileData } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import { create } from "zustand";
import { useAuthStore } from "./authStore";

const STORAGE_KEYS = {
  USER: "auth_user",
  PROFILE_COMPLETE: "profile_complete",
};

interface ProfileState {
  isLoading: boolean;
  error: Error | null;
  isProfileComplete: boolean;
  ratingsResponse: any | null;

  updateProfile: (profileData: UpdateProfileData) => Promise<any>;
  updatePreferences: (payload: UpdatePreferencesData) => Promise<any>;
  getProfile: (forceRefresh?: boolean) => Promise<any>;
  getMyRatings: () => Promise<any>;
  syncExperiences: (experiences: any[], existingExperiences?: any[]) => Promise<void>;
  setProfileComplete: (isComplete: boolean) => Promise<void>;
  loadProfileComplete: () => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isLoading: false,
  error: null,
  isProfileComplete: false,
  ratingsResponse: null,

  updateProfile: async (profileData: UpdateProfileData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await profileService.updateProfile(profileData);

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

  getProfile: async (forceRefresh = false) => {
    set({ isLoading: true, error: null });

    try {
      const response = await profileService.getProfile({ forceRefresh });
      const updatedUser = response.data;

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

  getMyRatings: async () => {
    set({ isLoading: true, error: null });

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

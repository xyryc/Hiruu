import { authService } from "@/services/authService";
import { useBusinessStore } from "@/stores/businessStore";
import {
  AddContactData,
  ChangePasswordData,
  ForgotPasswordData,
  LoginData,
  OAuthData,
  RequestVerifyAccountData,
  RegisterData,
  ResendOTPData,
  ResetPasswordData,
  VerifyAccountData,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const STORAGE_KEYS = {
  USER: "auth_user",
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar: string;
  isEmailVerified: boolean;
  isNumberVerified?: boolean;
  fcmToken?: string;
  phoneNumber?: string;
  countryCode?: string;
  isRestricted: boolean;
  restrictionReason?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  onboarding?: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: Error | null;
  isInitialized: boolean;

  initializeAuth: () => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  login: (data: LoginData) => Promise<any>;
  oauthLogin: (data: OAuthData) => Promise<any>;
  verifyAccount: (data: VerifyAccountData) => Promise<any>;
  forgotPassword: (data: ForgotPasswordData) => Promise<any>;
  resetPassword: (data: ResetPasswordData) => Promise<any>;
  changePassword: (data: ChangePasswordData) => Promise<any>;
  requestVerifyAccount: (data: RequestVerifyAccountData) => Promise<any>;
  resendOTP: (data: ResendOTPData) => Promise<any>;
  addContact: (data: AddContactData) => Promise<any>;
  logout: () => Promise<void>;

  clearError: () => void;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  initializeAuth: async () => {
    try {
      const authData = await authService.getStoredAuthData();

      if (authData.user && authData.accessToken) {
        set({
          user: authData.user,
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          isInitialized: true,
        });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({ isInitialized: true });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.register(data);

      if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        set({
          user: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      if (response.tokens) {
        await authService.storeAuthData(response);
        set({
          accessToken: response.tokens.access.token,
          refreshToken: response.tokens.refresh.token,
        });
      }

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Registration failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login(data);

      if (response.data && response.tokens) {
        await authService.storeAuthData(response);

        set({
          user: response.data,
          accessToken: response.tokens.access.token,
          refreshToken: response.tokens.refresh.token,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Login failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  oauthLogin: async (data: OAuthData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.oauthLogin(data);

      if (response.data && response.tokens) {
        await authService.storeAuthData(response);

        set({
          user: response.data,
          accessToken: response.tokens.access.token,
          refreshToken: response.tokens.refresh.token,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("OAuth login failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  verifyAccount: async (data: VerifyAccountData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.verifyAccount(data);

      if (response.data && response.tokens) {
        await authService.storeAuthData(response);

        set({
          user: response.data,
          accessToken: response.tokens.access.token,
          refreshToken: response.tokens.refresh.token,
          isLoading: false,
        });
      } else if (response.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
        set({
          user: response.data,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Account verification failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.forgotPassword(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Password reset request failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  resetPassword: async (data: ResetPasswordData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.resetPassword(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Password reset failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  changePassword: async (data: ChangePasswordData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.changePassword(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Password change failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  requestVerifyAccount: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.requestVerifyAccount(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("Verification request failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  resendOTP: async (data: ResendOTPData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.resendOTP(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const finalError = error instanceof Error ? error : new Error("OTP resend failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  addContact: async (data: AddContactData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.addContact(data);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const finalError =
        error instanceof Error ? error : new Error("Add contact failed");
      set({ isLoading: false, error: finalError });
      throw finalError;
    }
  },

  logout: async () => {
    try {
      const { refreshToken } = get();

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      await authService.clearAuthData();
      useBusinessStore.getState().resetBusinessSession();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    } catch (error) {
      console.error("Failed to logout:", error);
      await authService.clearAuthData();
      useBusinessStore.getState().resetBusinessSession();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
}));

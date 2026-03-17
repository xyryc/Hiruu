import axiosInstance from "@/utils/axios";
import { create } from "zustand";

type NotificationStoreState = {
  unreadCount: number;
  unreadCountLoading: boolean;
  unreadCountError: string | null;
  fetchUnreadCount: () => Promise<number>;
  setUnreadCount: (count: number) => void;
  clearUnreadCountError: () => void;
};

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: 0,
  unreadCountLoading: false,
  unreadCountError: null,

  fetchUnreadCount: async () => {
    try {
      set({ unreadCountLoading: true, unreadCountError: null });
      const response = await axiosInstance.get("/notifications/unread-count");
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to fetch unread count");
      }

      const count = Number(result?.data?.count || 0);
      const normalizedCount = Number.isFinite(count) ? count : 0;
      set({ unreadCount: normalizedCount, unreadCountLoading: false });
      return normalizedCount;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch unread count";
      set({ unreadCountLoading: false, unreadCountError: message });
      throw new Error(message);
    }
  },

  setUnreadCount: (count) => {
    const normalizedCount = Number.isFinite(count) ? Math.max(0, count) : 0;
    set({ unreadCount: normalizedCount });
  },

  clearUnreadCountError: () => set({ unreadCountError: null }),
}));


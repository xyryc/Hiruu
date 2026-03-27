import axiosInstance from "@/utils/axios";
import { create } from "zustand";

export type NotificationSort = "createdAt:asc" | "createdAt:desc";

export type NotificationItem = {
  id: string;
  userId: string;
  businessId: string | null;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  deliveryChannels: string[];
  actions: Array<{
    key: string;
    label: string;
    targetType: string;
    targetId: string | null;
    payload?: Record<string, unknown>;
  }>;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  scheduledFor: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationPagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type NotificationStoreState = {
  unreadCount: number;
  unreadCountLoading: boolean;
  unreadCountError: string | null;
  notifications: NotificationItem[];
  notificationsLoading: boolean;
  notificationsRefreshing: boolean;
  notificationsLoadingMore: boolean;
  notificationsError: string | null;
  notificationsSort: NotificationSort;
  notificationsPagination: NotificationPagination;
  fetchUnreadCount: () => Promise<number>;
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    sort?: NotificationSort;
    append?: boolean;
  }) => Promise<NotificationItem[]>;
  markNotificationAsRead: (notificationId: string) => Promise<NotificationItem>;
  markAllNotificationsAsRead: () => Promise<{
    message: string;
    updatedCount: number;
  }>;
  setUnreadCount: (count: number) => void;
  clearUnreadCountError: () => void;
  clearNotificationsError: () => void;
};

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  unreadCount: 0,
  unreadCountLoading: false,
  unreadCountError: null,
  notifications: [],
  notificationsLoading: false,
  notificationsRefreshing: false,
  notificationsLoadingMore: false,
  notificationsError: null,
  notificationsSort: "createdAt:desc",
  notificationsPagination: {
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },

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

  fetchNotifications: async (params) => {
    const page = Number(params?.page ?? 1);
    const limit = Number(params?.limit ?? 5);
    const sort: NotificationSort = params?.sort || "createdAt:desc";
    const append = Boolean(params?.append);

    try {
      if (append) {
        set({ notificationsLoadingMore: true, notificationsError: null });
      } else if (page > 1) {
        set({ notificationsRefreshing: true, notificationsError: null });
      } else {
        set({ notificationsLoading: true, notificationsError: null });
      }

      const response = await axiosInstance.get("/notifications", {
        params: {
          sort,
          page,
          limit,
        },
      });
      const result = response?.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to fetch notifications");
      }

      const fetched: NotificationItem[] = Array.isArray(result?.data)
        ? result.data
        : [];
      const pagination = result?.pagination || {};

      set((state) => {
        const merged = append
          ? Array.from(
              new Map(
                [...state.notifications, ...fetched].map((item) => [item.id, item])
              ).values()
            )
          : fetched;

        return {
          notifications: merged,
          notificationsSort: sort,
          notificationsPagination: {
            total: Number(pagination?.total || merged.length || 0),
            page: Number(pagination?.page || page),
            limit: Number(pagination?.limit || limit),
            totalPages: Number(pagination?.totalPages || 1),
            hasNext: Boolean(pagination?.hasNext),
            hasPrev: Boolean(pagination?.hasPrev),
          },
          notificationsLoading: false,
          notificationsRefreshing: false,
          notificationsLoadingMore: false,
          notificationsError: null,
        };
      });

      return fetched;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch notifications";

      set({
        notificationsLoading: false,
        notificationsRefreshing: false,
        notificationsLoadingMore: false,
        notificationsError: message,
      });
      throw new Error(message);
    }
  },

  markNotificationAsRead: async (notificationId) => {
    try {
      const id = String(notificationId || "").trim();
      if (!id) throw new Error("Invalid notification id");

      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      const result = response?.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to mark notification as read");
      }

      const updated: NotificationItem = result?.data;
      const nowIso = new Date().toISOString();

      set((state) => {
        const wasUnread = state.notifications.some(
          (item) => item.id === id && !item.isRead
        );

        const nextUnread = wasUnread
          ? Math.max(0, Number(state.unreadCount || 0) - 1)
          : Number(state.unreadCount || 0);

        return {
          unreadCount: nextUnread,
          notifications: state.notifications.map((item) => {
            if (item.id !== id) return item;
            if (updated && typeof updated === "object") return updated;
            return {
              ...item,
              isRead: true,
              readAt: item.readAt || nowIso,
              updatedAt: nowIso,
            };
          }),
        };
      });

      return updated;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to mark notification as read";
      throw new Error(message);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const response = await axiosInstance.patch("/notifications/read-all");
      const result = response?.data;
      if (!result?.success) {
        throw new Error(result?.message || "Failed to mark all notifications as read");
      }
      const message = String(result?.message || "all_notifications_marked_as_read_successfully");
      const updatedCount = Number(result?.data?.updatedCount || 0);

      const nowIso = new Date().toISOString();
      set((state) => ({
        unreadCount: 0,
        notifications: state.notifications.map((item) =>
          item.isRead
            ? item
            : {
                ...item,
                isRead: true,
                readAt: item.readAt || nowIso,
                updatedAt: nowIso,
              }
        ),
      }));

      return {
        message,
        updatedCount: Number.isFinite(updatedCount) ? updatedCount : 0,
      };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to mark all notifications as read";
      throw new Error(message);
    }
  },

  setUnreadCount: (count) => {
    const normalizedCount = Number.isFinite(count) ? Math.max(0, count) : 0;
    set({ unreadCount: normalizedCount });
  },

  clearUnreadCountError: () => set({ unreadCountError: null }),
  clearNotificationsError: () => set({ notificationsError: null }),
}));


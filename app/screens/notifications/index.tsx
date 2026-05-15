import ScreenHeader from "@/components/header/ScreenHeader";
import NotificationCard from "@/components/ui/cards/NotificationCard";
import NotificationModal from "@/components/ui/modals/NotificationModal";
import {
  NotificationItem,
  useNotificationStore,
} from "@/stores/notificationStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { resolveNotificationText } from "@/utils/notificationEventLocalization";
import { Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type NotificationListItem = {
  item: NotificationItem;
  timeTitle?: string;
};

const getPrimaryNotificationAction = (item: NotificationItem) =>
  Array.isArray(item.actions) && item.actions.length > 0 ? item.actions[0] : null;

const toNonEmptyString = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized : undefined;
};

const getActionPayloadValue = (
  action: ReturnType<typeof getPrimaryNotificationAction>,
  key: string
) => {
  const payload = action?.payload;
  if (!payload || typeof payload !== "object") return undefined;
  return toNonEmptyString((payload as Record<string, unknown>)[key]);
};

const formatRelativeTime = (
  value: string | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (mins < 1) return t("notificationsScreen.time.justNow");
  if (mins < 60) return t("notificationsScreen.time.minutesAgo", { count: mins });
  if (hours < 24) return t("notificationsScreen.time.hoursAgo", { count: hours });
  if (days < 7) return t("notificationsScreen.time.daysAgo", { count: days });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getSectionLabel = (
  value: string | null | undefined,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return t("notificationsScreen.time.today");
  if (isSameDay(date, yesterday)) return t("notificationsScreen.time.yesterday");
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const resolveNotificationVisual = (type: string) => {
  const normalized = String(type || "").toLowerCase();

  if (normalized.includes("chat")) {
    return {
      icon: <Ionicons name="chatbubble-ellipses-outline" size={20} color="#3EBF5A" />,
      iconBackgroundColor: "#3EBF5A26",
    };
  }

  if (normalized.includes("call")) {
    return {
      icon: <Ionicons name="call-outline" size={20} color="#4FB2F3" />,
      iconBackgroundColor: "#E5F4FD",
    };
  }

  if (normalized.includes("achievement")) {
    return {
      icon: <Ionicons name="trophy-outline" size={20} color="#F1C400" />,
      iconBackgroundColor: "#F1C40026",
    };
  }

  if (normalized.includes("cancel")) {
    return {
      icon: <EvilIcons name="close-o" size={22} color="#F34F4F" />,
      iconBackgroundColor: "#F34F4F4D",
    };
  }

  if (normalized.includes("shift")) {
    return {
      icon: <Ionicons name="calendar-outline" size={20} color="#4FB2F3" />,
      iconBackgroundColor: "#E5F4FD",
    };
  }

  if (normalized.includes("clock") || normalized.includes("reminder")) {
    return {
      icon: <Ionicons name="calendar-outline" size={20} color="#4FB2F3" />,
      iconBackgroundColor: "#E5F4FD",
    };
  }

  return {
    icon: <Ionicons name="notifications-outline" size={20} color="#3EBF5A" />,
    iconBackgroundColor: "#E5F4FD",
  };
};

const resolveNotificationCopy = (
  item: NotificationItem,
  t: (key: string, options?: Record<string, unknown>) => string
) =>
  resolveNotificationText(
    {
      type: item.type,
      event: item.event,
      title: item.title,
      message: item.message,
      metadata: item.metadata,
      actions: item.actions,
      relatedEntityType: item.relatedEntityType,
      relatedEntityId: item.relatedEntityId,
    },
    t
  );

const NotificationScreen = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAllNotificationsAsRead = useNotificationStore(
    (state) => state.markAllNotificationsAsRead
  );
  const markNotificationAsRead = useNotificationStore(
    (state) => state.markNotificationAsRead
  );
  const notifications = useNotificationStore((state) => state.notifications);
  const notificationsLoading = useNotificationStore((state) => state.notificationsLoading);
  const notificationsRefreshing = useNotificationStore((state) => state.notificationsRefreshing);
  const notificationsLoadingMore = useNotificationStore((state) => state.notificationsLoadingMore);
  const pagination = useNotificationStore((state) => state.notificationsPagination);

  const loadNotifications = useCallback(
    async (page = 1, append = false) => {
      try {
        await fetchNotifications({
          page,
          limit: 10,
          sort: "createdAt:desc",
          append,
        });
      } catch (error: any) {
        toast.error(
          translateApiMessage(
            error?.message || t("notificationsScreen.error.failedToFetch")
          )
        );
      }
    },
    [fetchNotifications, t]
  );

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount().catch(() => undefined);
      void loadNotifications(1, false);
      return () => { };
    }, [fetchUnreadCount, loadNotifications])
  );

  const listData = useMemo<NotificationListItem[]>(() => {
    let previousLabel = "";
    return notifications.map((item) => {
      const currentLabel = getSectionLabel(item.createdAt, t);
      const showLabel = currentLabel && currentLabel !== previousLabel ? currentLabel : undefined;
      previousLabel = currentLabel;
      return {
        item,
        timeTitle: showLabel,
      };
    });
  }, [notifications, t]);
  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        id: `notification-skeleton-${index}`,
      })),
    []
  );

  const onRefresh = useCallback(async () => {
    await loadNotifications(1, false);
  }, [loadNotifications]);

  const onEndReached = useCallback(async () => {
    if (!pagination.hasNext || notificationsLoadingMore || notificationsLoading) return;
    await loadNotifications(pagination.page + 1, true);
  }, [
    loadNotifications,
    notificationsLoading,
    notificationsLoadingMore,
    pagination.hasNext,
    pagination.page,
  ]);

  const handleNotificationPress = useCallback(
    async (item: NotificationItem) => {
      if (!item.isRead) {
        try {
          await markNotificationAsRead(item.id);
        } catch (error: any) {
          toast.error(
            translateApiMessage(
              error?.message || "Failed to mark notification as read"
            )
          );
        }
      }

      const action = getPrimaryNotificationAction(item);
      const actionKey = String(action?.key || "").toLowerCase();
      const targetType = String(
        action?.targetType || item.relatedEntityType || ""
      ).toLowerCase();
      const metadata =
        item.metadata && typeof item.metadata === "object"
          ? (item.metadata as Record<string, unknown>)
          : {};

      const targetId =
        toNonEmptyString(action?.targetId) || toNonEmptyString(item.relatedEntityId);

      const chatRoomId =
        getActionPayloadValue(action, "chatRoomId") ||
        toNonEmptyString(metadata.chatRoomId);

      const shiftAssignmentId =
        getActionPayloadValue(action, "shiftAssignmentId") ||
        toNonEmptyString(metadata.shiftAssignmentId) ||
        targetId;
      const achievementId =
        getActionPayloadValue(action, "achievementId") ||
        toNonEmptyString(metadata.achievementId) ||
        targetId;

      const callTypeRaw =
        getActionPayloadValue(action, "callType") ||
        toNonEmptyString(metadata.callType);
      const callType = callTypeRaw?.toLowerCase() === "video" ? "video" : "audio";

      if (
        actionKey === "open_chat" ||
        item.type === "chat_message" ||
        targetType === "chat_message"
      ) {
        if (!chatRoomId) {
          toast.error(t("notificationsScreen.error.unableToOpenChat"));
          return;
        }
        router.push({
          pathname: "/screens/inbox/chat-screen",
          params: { roomId: chatRoomId },
        });
        return;
      }

      if (actionKey === "join_call" || item.type === "call_incoming" || targetType === "call") {
        if (!targetId) {
          toast.error(t("notificationsScreen.error.unableToOpenCall"));
          return;
        }
        router.push({
          pathname: "/screens/inbox/call-screen",
          params: {
            callId: targetId,
            roomId: chatRoomId || "",
            mode: "incoming",
            callType,
          },
        });
        return;
      }

      if (
        actionKey === "view_shift_assignment" ||
        actionKey === "view_shift_swap" ||
        actionKey === "review_shift_request" ||
        item.type === "shift_swap_requested" ||
        item.type === "shift_swap_approved" ||
        item.type === "shift_changed" ||
        targetType === "shift_assignment" ||
        targetType === "shift_request" ||
        item.relatedEntityType === "shift_assignment"
      ) {
        if (!shiftAssignmentId) {
          toast.error(t("notificationsScreen.error.unableToOpenShiftDetails"));
          return;
        }
        router.push({
          pathname: "/screens/schedule/shift/[id]",
          params: { id: shiftAssignmentId },
        });
        return;
      }

      if (
        actionKey === "view_achievement" ||
        item.type === "achievement_unlocked" ||
        targetType === "achievement_unlock"
      ) {
        if (achievementId) {
          router.push({
            pathname: "/screens/rewards/challenges",
            params: { highlight: achievementId },
          });
        } else {
          router.push("/screens/rewards/challenges");
        }
        return;
      }

      if (actionKey === "view_business_update" || actionKey === "view_system_notice") {
        router.push("/screens/notifications");
      }
    },
    [markNotificationAsRead, t]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await markAllNotificationsAsRead();
      toast.success(
        translateApiMessage(
          result?.message || "all_notifications_marked_as_read_successfully"
        )
      );
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.message || t("notificationsScreen.error.failedToMarkAllAsRead")
        )
      );
    }
  }, [markAllNotificationsAsRead, t]);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-14 px-5 pb-4">
        <ScreenHeader
          onPressBack={() => router.back()}
          title={t("notificationsScreen.headerTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Entypo name="dots-three-vertical" size={20} color="black" />
            </TouchableOpacity>
          }
        />
      </View>

      <FlatList
        data={listData}
        keyExtractor={(entry) => entry.item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={notificationsRefreshing}
            onRefresh={onRefresh}
            tintColor="#4FB2F3"
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        renderItem={({ item: entry, index }) => {
          const { item, timeTitle } = entry;
          const visual = resolveNotificationVisual(item.type);
          const resolvedCopy = resolveNotificationCopy(item, t);
          return (
            <NotificationCard
              timeTitle={timeTitle}
              title={resolvedCopy.title}
              details={resolvedCopy.body}
              time={formatRelativeTime(item.createdAt, t)}
              onPress={() => handleNotificationPress(item)}
              isUnread={!item.isRead}
              border
              icon={visual.icon}
              iconBackgroundColor={visual.iconBackgroundColor}
            />
          );
        }}
        ListEmptyComponent={
          notificationsLoading ? (
            <View className="pt-2">
              {skeletonRows.map((row, index) => (
                <View key={row.id}>
                  {index === 0 || index === 3 ? (
                    <View className="px-6 pt-3 pb-1">
                      <View className="h-3 w-20 rounded-full bg-[#E5E7EB]" />
                    </View>
                  ) : null}
                  <View className="w-full flex-row gap-3 px-6 py-4 bg-white">
                    <View className="h-10 w-10 rounded-full bg-[#E5E7EB]" />

                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <View className="h-3.5 w-44 rounded-md bg-[#E5E7EB]" />
                        <View className="h-3 w-12 rounded-md bg-[#E5E7EB]" />
                      </View>
                      <View className="h-3 w-full rounded-md bg-[#E5E7EB] mt-3" />
                      <View className="h-3 w-3/4 rounded-md bg-[#E5E7EB] mt-2" />
                    </View>
                  </View>
                  <View className="border-b border-[#eeeeee]" />
                </View>
              ))}
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                {t("notificationsScreen.empty")}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          notificationsLoadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#4FB2F3" />
            </View>
          ) : null
        }
      />

      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

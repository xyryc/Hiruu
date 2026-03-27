import ScreenHeader from "@/components/header/ScreenHeader";
import NotificationCard from "@/components/ui/cards/NotificationCard";
import NotificationModal from "@/components/ui/modals/NotificationModal";
import {
  NotificationItem,
  useNotificationStore,
} from "@/stores/notificationStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Entypo, EvilIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
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

const formatRelativeTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getSectionLabel = (value?: string | null) => {
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

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
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

const resolveNotificationTitle = (item: NotificationItem) => {
  const metadata = item.metadata || {};

  if (item.type === "chat_message") {
    const senderName = String((metadata as any)?.senderName || "").trim();
    const roomName = String((metadata as any)?.roomName || "").trim();

    if (senderName) {
      return roomName ? `Message from ${senderName} (${roomName})` : `Message from ${senderName}`;
    }
  }

  if (item.type === "call_incoming") {
    const callTypeRaw = String((metadata as any)?.callType || "").trim().toLowerCase();
    const callType = callTypeRaw === "video" ? "Video" : "Audio";
    return `Incoming ${callType} Call`;
  }

  if (item.type === "business_announcement") {
    return "Employee Joined Business";
  }

  if (item.type === "clock_in_reminder") {
    const rawTitle = String(item.title || "").trim();
    return rawTitle || "Shift reminder";
  }

  const raw = String(item.title || "").trim();
  if (!raw) return "Notification";

  const translated = translateApiMessage(raw);
  return translated || raw;
};

const resolveNotificationBody = (item: NotificationItem) => {
  const metadata = item.metadata || {};
  const raw = String(item.message || "").trim();
  const translated = raw ? translateApiMessage(raw) : "";

  // Show actual preview for chat notifications when available.
  if (item.type === "chat_message") {
    const preview = String((metadata as any)?.messagePreview || "").trim();
    if (preview) return preview;
  }

  if (item.type === "call_incoming") {
    const callerName = String((metadata as any)?.callerName || "").trim();
    if (callerName) return `${callerName} is calling you`;
    return "You have an incoming call.";
  }

  if (item.type === "business_announcement") {
    const employeeName = String((metadata as any)?.joinedEmployeeName || "").trim();
    if (employeeName) return `${employeeName} joined your business.`;
    return "A new employee joined your business.";
  }

  if (item.type === "clock_in_reminder") {
    const rawMessage = String(item.message || "").trim();
    if (rawMessage) return rawMessage;

    const smartAlertMinutes = Number((metadata as any)?.smartAlertMinutes);
    if (Number.isFinite(smartAlertMinutes) && smartAlertMinutes > 0) {
      return `Your shift starts in ${smartAlertMinutes} minutes.`;
    }
    return "Your shift starts soon.";
  }

  if (translated) return translated;
  if (raw) return raw;
  return "You have a new notification.";
};

const NotificationScreen = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
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
        toast.error(translateApiMessage(error?.message || "Failed to fetch notifications"));
      }
    },
    [fetchNotifications]
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
      const currentLabel = getSectionLabel(item.createdAt);
      const showLabel = currentLabel && currentLabel !== previousLabel ? currentLabel : undefined;
      previousLabel = currentLabel;
      return {
        item,
        timeTitle: showLabel,
      };
    });
  }, [notifications]);

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
          toast.error("Unable to open chat for this notification.");
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
          toast.error("Unable to open call for this notification.");
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
        targetType === "shift_assignment" ||
        item.relatedEntityType === "shift_assignment"
      ) {
        if (!shiftAssignmentId) {
          toast.error("Unable to open shift details for this notification.");
          return;
        }
        router.push({
          pathname: "/screens/schedule/shift/[id]",
          params: { id: shiftAssignmentId },
        });
        return;
      }
    },
    [markNotificationAsRead]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-14 px-5 pb-4">
        <ScreenHeader
          onPressBack={() => router.back()}
          title="Notifications"
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
          return (
            <NotificationCard
              className={index === 0 ? "mt-8" : ""}
              timeTitle={timeTitle}
              title={resolveNotificationTitle(item)}
              details={resolveNotificationBody(item)}
              time={formatRelativeTime(item.createdAt)}
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
            <View className="py-10 items-center">
              <ActivityIndicator size="small" color="#4FB2F3" />
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-sm text-secondary dark:text-dark-secondary">
                No notifications yet.
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
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;

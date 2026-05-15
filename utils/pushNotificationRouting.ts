import { resolveNotificationText, parseNotificationInput } from "@/utils/notificationEventLocalization";
import { t } from "i18next";

export type NotificationRoutePayload = {
  pathname: string;
  params?: Record<string, string>;
};

const toNonEmptyString = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

export const extractChatNotificationPayload = (rawData: any) => {
  const normalized = parseNotificationInput(rawData);
  const firstAction = normalized.actions[0];

  const payload =
    firstAction?.payload && typeof firstAction.payload === "object"
      ? firstAction.payload
      : null;

  const chatRoomId =
    toNonEmptyString(payload?.chatRoomId) ||
    toNonEmptyString(normalized.metadata?.chatRoomId);
  const messageId = toNonEmptyString((rawData as any)?.messageId);

  if (normalized.type !== "chat_message" || !chatRoomId) return null;

  return {
    chatRoomId,
    ...(messageId ? { messageId } : {}),
  };
};

export const extractNotificationRoutePayload = (
  rawData: any
): NotificationRoutePayload | null => {
  const normalized = parseNotificationInput(rawData);
  const firstAction = normalized.actions[0] || null;
  const actionKey = toNonEmptyString(firstAction?.key).toLowerCase();
  const targetType = toNonEmptyString(firstAction?.targetType).toLowerCase();
  const targetId =
    toNonEmptyString(firstAction?.targetId) || normalized.relatedEntityId || "";
  const payload =
    firstAction?.payload && typeof firstAction.payload === "object"
      ? firstAction.payload
      : null;

  const chatRoomId =
    toNonEmptyString(payload?.chatRoomId) ||
    toNonEmptyString(normalized.metadata?.chatRoomId);
  const callTypeRaw =
    toNonEmptyString(payload?.callType) ||
    toNonEmptyString(normalized.metadata?.callType);
  const callType = callTypeRaw.toLowerCase() === "video" ? "video" : "audio";
  const shiftAssignmentId =
    toNonEmptyString(payload?.shiftAssignmentId) ||
    toNonEmptyString(normalized.metadata?.shiftAssignmentId) ||
    targetId;
  const achievementId =
    toNonEmptyString(payload?.achievementId) ||
    toNonEmptyString(normalized.metadata?.achievementId) ||
    targetId;

  if (
    actionKey === "open_chat" ||
    normalized.type === "chat_message" ||
    targetType === "chat_message" ||
    normalized.relatedEntityType === "chat_message"
  ) {
    if (!chatRoomId) return null;
    return {
      pathname: "/screens/inbox/chat-screen",
      params: { roomId: chatRoomId },
    };
  }

  if (
    actionKey === "join_call" ||
    normalized.type === "call_incoming" ||
    targetType === "call" ||
    normalized.relatedEntityType === "call"
  ) {
    if (!targetId) return null;
    return {
      pathname: "/screens/inbox/call-screen",
      params: {
        callId: targetId,
        roomId: chatRoomId || "",
        mode: "incoming",
        callType,
      },
    };
  }

  if (
    actionKey === "view_shift_assignment" ||
    actionKey === "view_shift_swap" ||
    actionKey === "review_shift_request" ||
    normalized.type === "shift_swap_requested" ||
    normalized.type === "shift_swap_approved" ||
    normalized.type === "shift_cancelled" ||
    normalized.type === "shift_changed" ||
    targetType === "shift_assignment" ||
    normalized.relatedEntityType === "shift_assignment" ||
    normalized.type === "shift_assigned"
  ) {
    if (!shiftAssignmentId) return null;
    return {
      pathname: "/screens/schedule/shift/[id]",
      params: { id: shiftAssignmentId },
    };
  }

  if (
    actionKey === "view_achievement" ||
    targetType === "achievement_unlock" ||
    normalized.relatedEntityType === "achievement_unlock" ||
    normalized.type === "achievement_unlocked"
  ) {
    return {
      pathname: "/screens/rewards/challenges",
      params: achievementId ? { highlight: achievementId } : undefined,
    };
  }

  if (actionKey === "view_business_update") {
    return {
      pathname: "/screens/notifications",
    };
  }

  if (actionKey === "view_system_notice") {
    return {
      pathname: "/screens/notifications",
    };
  }

  return null;
};

export const resolveFcmDisplayText = (remoteMessage: any) => {
  const data = remoteMessage?.data || {};

  const { title, body } = resolveNotificationText(
    {
      type: data?.type,
      event: data?.event,
      metadata: data?.metadata,
      actions: data?.actions,
      relatedEntityType: data?.relatedEntityType,
      relatedEntityId: data?.relatedEntityId,
      title: data?.title || remoteMessage?.notification?.title,
      message: data?.message || data?.body || remoteMessage?.notification?.body,
    },
    t
  );

  return {
    title,
    body,
  };
};

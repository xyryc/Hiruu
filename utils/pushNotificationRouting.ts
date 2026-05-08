import { translateApiMessage } from "@/utils/apiMessages";
import { t } from "i18next";

export type NotificationRoutePayload = {
  pathname: string;
  params?: Record<string, string>;
};

const toNonEmptyString = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const parseJsonField = (value: unknown) => {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
};

export const extractChatNotificationPayload = (rawData: any) => {
  if (!rawData || typeof rawData !== "object") return null;

  const type = toNonEmptyString(rawData?.type).toLowerCase();
  const metadata =
    (parseJsonField(rawData?.metadata) as Record<string, any> | null) || null;
  const actionsParsed = parseJsonField(rawData?.actions);
  const actions = Array.isArray(actionsParsed)
    ? (actionsParsed as Record<string, any>[])
    : [];
  const firstAction = actions.length > 0 ? actions[0] : null;
  const payload =
    firstAction?.payload && typeof firstAction.payload === "object"
      ? firstAction.payload
      : null;

  const chatRoomId =
    toNonEmptyString(payload?.chatRoomId) ||
    toNonEmptyString(metadata?.chatRoomId);
  const messageId = toNonEmptyString(rawData?.messageId);

  if (type !== "chat_message" || !chatRoomId) return null;

  return {
    chatRoomId,
    ...(messageId ? { messageId } : {}),
  };
};

export const extractNotificationRoutePayload = (
  rawData: any
): NotificationRoutePayload | null => {
  if (!rawData || typeof rawData !== "object") return null;

  const type = toNonEmptyString(rawData?.type).toLowerCase();
  const relatedEntityType = toNonEmptyString(rawData?.relatedEntityType).toLowerCase();
  const relatedEntityId = toNonEmptyString(rawData?.relatedEntityId);
  const metadata =
    (parseJsonField(rawData?.metadata) as Record<string, any> | null) || null;
  const actionsParsed = parseJsonField(rawData?.actions);
  const actions = Array.isArray(actionsParsed)
    ? (actionsParsed as Record<string, any>[])
    : [];
  const firstAction = actions.length > 0 ? actions[0] : null;
  const actionKey = toNonEmptyString(firstAction?.key).toLowerCase();
  const targetType = toNonEmptyString(firstAction?.targetType).toLowerCase();
  const targetId = toNonEmptyString(firstAction?.targetId) || relatedEntityId;
  const payload =
    firstAction?.payload && typeof firstAction.payload === "object"
      ? firstAction.payload
      : null;

  const chatRoomId =
    toNonEmptyString(payload?.chatRoomId) ||
    toNonEmptyString(metadata?.chatRoomId);
  const callTypeRaw =
    toNonEmptyString(payload?.callType) ||
    toNonEmptyString(metadata?.callType);
  const callType = callTypeRaw.toLowerCase() === "video" ? "video" : "audio";
  const shiftAssignmentId =
    toNonEmptyString(payload?.shiftAssignmentId) ||
    toNonEmptyString(metadata?.shiftAssignmentId) ||
    targetId;
  const achievementId =
    toNonEmptyString(payload?.achievementId) ||
    toNonEmptyString(metadata?.achievementId) ||
    targetId;

  if (
    actionKey === "open_chat" ||
    type === "chat_message" ||
    targetType === "chat_message" ||
    relatedEntityType === "chat_message"
  ) {
    if (!chatRoomId) return null;
    return {
      pathname: "/screens/inbox/chat-screen",
      params: { roomId: chatRoomId },
    };
  }

  if (
    actionKey === "join_call" ||
    type === "call_incoming" ||
    targetType === "call" ||
    relatedEntityType === "call"
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
    type === "shift_swap_requested" ||
    type === "shift_swap_approved" ||
    targetType === "shift_assignment" ||
    relatedEntityType === "shift_assignment" ||
    type === "shift_assigned"
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
    relatedEntityType === "achievement_unlock" ||
    type === "achievement_unlocked"
  ) {
    return {
      pathname: "/screens/rewards/challenges",
      params: achievementId ? { highlight: achievementId } : undefined,
    };
  }

  return null;
};

export const resolveFcmDisplayText = (remoteMessage: any) => {
  const data = remoteMessage?.data || {};
  const type = toNonEmptyString(data?.type).toLowerCase();
  const metadata =
    (parseJsonField(data?.metadata) as Record<string, any> | null) || {};

  const fallbackTitleRaw = String(
    remoteMessage?.notification?.title ||
      data?.title ||
      data?.titleKey ||
      "Notification"
  ).trim();
  const fallbackBodyRaw = String(
    remoteMessage?.notification?.body ||
      data?.body ||
      data?.message ||
      data?.bodyKey ||
      "You have a new message"
  ).trim();
  const fallbackTitle = translateApiMessage(fallbackTitleRaw) || fallbackTitleRaw;
  const fallbackBody = translateApiMessage(fallbackBodyRaw) || fallbackBodyRaw;

  let title = fallbackTitle;
  let body = fallbackBody;

  if (type === "chat_message") {
    const senderName = toNonEmptyString(metadata?.senderName);
    const roomName = toNonEmptyString(metadata?.roomName);
    const preview = toNonEmptyString(metadata?.messagePreview);

    if (senderName) {
      title = roomName
        ? t("notificationsScreen.title.messageFromWithRoom", {
            senderName,
            roomName,
          })
        : t("notificationsScreen.title.messageFrom", { senderName });
    }
    if (preview) body = preview;
  } else if (type === "call_incoming") {
    const callTypeRaw = toNonEmptyString(metadata?.callType).toLowerCase();
    const callType =
      callTypeRaw === "video"
        ? t("notificationsScreen.callType.video")
        : t("notificationsScreen.callType.audio");
    const callerName = toNonEmptyString(metadata?.callerName);

    title = t("notificationsScreen.title.incomingCall", { callType });
    body = callerName
      ? t("notificationsScreen.body.callerIsCalling", { callerName })
      : t("notificationsScreen.body.incomingCall");
  } else if (type === "business_announcement") {
    const employeeName = toNonEmptyString(metadata?.joinedEmployeeName);
    title = t("notificationsScreen.title.employeeJoinedBusiness");
    body = employeeName
      ? t("notificationsScreen.body.employeeJoinedWithName", { employeeName })
      : t("notificationsScreen.body.employeeJoined");
  } else if (type === "clock_in_reminder") {
    title = fallbackTitle || t("notificationsScreen.title.shiftReminder");
    if (!fallbackBodyRaw) {
      const smartAlertMinutes = Number(metadata?.smartAlertMinutes);
      body =
        Number.isFinite(smartAlertMinutes) && smartAlertMinutes > 0
          ? t("notificationsScreen.body.shiftStartsInMinutes", {
              smartAlertMinutes,
            })
          : t("notificationsScreen.body.shiftStartsSoon");
    }
  } else if (type === "coins_earned") {
    const rewardCoins = Number(metadata?.rewardCoins);
    const rank = Number(metadata?.rank);
    const periodType = toNonEmptyString(metadata?.periodType).toLowerCase();
    const periodLabel =
      periodType === "monthly"
        ? "monthly"
        : periodType === "weekly"
        ? "weekly"
        : periodType === "daily"
        ? "daily"
        : "leaderboard";

    if (Number.isFinite(rewardCoins) && rewardCoins > 0) {
      title =
        Number.isFinite(rank) && rank > 0
          ? t("notificationsScreen.title.coinsEarnedWithRank", {
              rewardCoins,
              rank,
            })
          : t("notificationsScreen.title.coinsEarned", { rewardCoins });

      body =
        Number.isFinite(rank) && rank > 0
          ? t("notificationsScreen.body.coinsEarnedWithRank", {
              rank,
              periodLabel,
              rewardCoins,
            })
          : t("notificationsScreen.body.coinsEarnedLeaderboard", {
              rewardCoins,
              periodLabel,
            });
    }
  } else if (type === "shift_assigned") {
    const businessName = toNonEmptyString(metadata?.businessName);
    const shiftDateRaw = toNonEmptyString(metadata?.shiftDate);
    const shiftDate = shiftDateRaw ? new Date(shiftDateRaw) : null;
    const formattedShiftDate =
      shiftDate && !Number.isNaN(shiftDate.getTime())
        ? shiftDate.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : shiftDateRaw;

    title = businessName
      ? t("notificationsScreen.title.newShiftAssignedAt", { businessName })
      : t("notificationsScreen.title.newShiftAssigned");

    body =
      businessName && formattedShiftDate
        ? t("notificationsScreen.body.shiftAssignedByBusinessOnDate", {
            businessName,
            formattedShiftDate,
          })
        : formattedShiftDate
        ? t("notificationsScreen.body.shiftAssignedOnDate", {
            formattedShiftDate,
          })
        : t("notificationsScreen.body.shiftAssigned");
  } else if (type === "shift_swap_requested") {
    const requesterName = toNonEmptyString(metadata?.requesterName);
    const shiftDateRaw = toNonEmptyString(metadata?.shiftDate);
    const shiftDate = shiftDateRaw ? new Date(shiftDateRaw) : null;
    const formattedShiftDate =
      shiftDate && !Number.isNaN(shiftDate.getTime())
        ? shiftDate.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : shiftDateRaw;

    title = requesterName
      ? t("notificationsScreen.title.shiftSwapRequestedBy", { requesterName })
      : t("notificationsScreen.title.shiftSwapRequested");

    body =
      requesterName && formattedShiftDate
        ? t("notificationsScreen.body.shiftSwapRequestedByOnDate", {
            requesterName,
            formattedShiftDate,
          })
        : requesterName
        ? t("notificationsScreen.body.shiftSwapRequestedBy", { requesterName })
        : t("notificationsScreen.body.shiftSwapRequested");
  } else if (type === "shift_swap_approved") {
    const acceptedByName = toNonEmptyString(metadata?.acceptedByName);
    const shiftDateRaw = toNonEmptyString(metadata?.shiftDate);
    const shiftDate = shiftDateRaw ? new Date(shiftDateRaw) : null;
    const formattedShiftDate =
      shiftDate && !Number.isNaN(shiftDate.getTime())
        ? shiftDate.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : shiftDateRaw;

    title = acceptedByName
      ? t("notificationsScreen.title.shiftSwapApprovedBy", { acceptedByName })
      : t("notificationsScreen.title.shiftSwapApproved");

    body =
      acceptedByName && formattedShiftDate
        ? t("notificationsScreen.body.shiftSwapApprovedByOnDate", {
            acceptedByName,
            formattedShiftDate,
          })
        : acceptedByName
        ? t("notificationsScreen.body.shiftSwapApprovedBy", { acceptedByName })
        : t("notificationsScreen.body.shiftSwapApproved");
  } else if (type === "achievement_unlocked") {
    const achievementTitle = toNonEmptyString(metadata?.achievementTitle);
    const rewardCoins = Number(metadata?.rewardCoins);

    title = achievementTitle
      ? t("notificationsScreen.title.achievementUnlockedWithTitle", {
          achievementTitle,
        })
      : t("notificationsScreen.title.achievementUnlocked");

    body =
      Number.isFinite(rewardCoins) && rewardCoins > 0
        ? t("notificationsScreen.body.achievementCompletedWithReward", {
            achievementTitle:
              achievementTitle || t("notificationsScreen.title.achievementUnlocked"),
            rewardCoins,
          })
        : achievementTitle
        ? t("notificationsScreen.body.achievementCompleted", {
            achievementTitle,
          })
        : t("notificationsScreen.body.achievementUnlocked");
  }

  return {
    title: title || fallbackTitle,
    body: body || fallbackBody,
  };
};

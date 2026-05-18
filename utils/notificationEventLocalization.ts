import { translateApiMessage } from "@/utils/apiMessages";
import i18n from "@/utils/i18n";

export type ParsedNotificationAction = {
  key: string;
  label?: string;
  targetType?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown>;
};

export type NormalizedNotificationPayload = {
  type: string;
  event: string;
  renderKey: string;
  title?: string;
  message?: string;
  metadata: Record<string, unknown>;
  actions: ParsedNotificationAction[];
  relatedEntityType?: string;
  relatedEntityId?: string;
};

type ResolveLocalizedNotificationTextInput = {
  type?: unknown;
  event?: unknown;
  title?: unknown;
  message?: unknown;
  metadata?: unknown;
  actions?: unknown;
  relatedEntityType?: unknown;
  relatedEntityId?: unknown;
};

const warnedMissingMetadataKeys = new Set<string>();

const REQUIRED_METADATA_BY_TYPE: Record<string, readonly string[]> = {
  achievement_unlocked: ["achievementId"],
  call_incoming: ["chatRoomId", "callType", "callerId", "callerName"],
  chat_message: ["chatRoomId", "senderId", "senderName"],
  clock_in_reminder: ["shiftAssignmentId", "startsAt", "smartAlertMinutes"],
  coins_earned: ["businessId", "rank", "rewardCoins", "periodStart", "periodEnd", "periodType"],
  leave_approved: ["requestType"],
  leave_rejected: ["requestType"],
  shift_cancelled: ["shiftDate"],
  shift_swap_approved: ["requestType"],
  shift_swap_rejected: ["requestType"],
  shift_swap_requested: ["requestType", "requesterUserId", "requesterName"],
};

const REQUIRED_METADATA_PRESENCE_BY_TYPE: Record<string, readonly string[]> = {
  call_incoming: ["callerAvatar"],
  chat_message: ["senderAvatar"],
};

const REQUIRED_METADATA_BY_RENDER_KEY: Record<string, readonly string[]> = {
  "business_announcement.employee_joined_business": ["joinedUserId", "joinedEmployeeName", "businessName"],
  "business_announcement.employee_terminated_business": ["terminatedUserId", "terminatedEmployeeName", "businessName"],
  "business_announcement.recruitment_application_received": ["recruitmentId", "applicantUserId", "applicantName"],
  "business_announcement.recruitment_offer_received": ["businessId", "businessName", "invitedByUserId", "invitedByName"],
  "coins_earned.monthly_leaderboard_reward": ["businessId", "rank", "rewardCoins", "periodStart", "periodEnd", "periodType"],
  "shift_changed.shift_request_created": ["requestType", "requesterUserId", "requesterName"],
  "shift_changed.shift_request_approved": ["requestType"],
  "shift_changed.shift_request_rejected": ["requestType"],
  "shift_assigned.shift_assigned": ["shiftDate"],
  "achievement_unlocked.badge_tier_unlocked": ["achievementId", "achievementRewardId", "tier", "threshold"],
  "support_ticket_update.support_started": ["starterUserId", "chatRoomId"],
  "system_maintenance.manual_test": ["source", "requestedBy"],
  "system_maintenance.subscription_purchased": ["actorUserId", "ownerType", "ownerId", "planTier", "billingCycle"],
};

const toNonEmptyString = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const toPlainObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
};

const safeParseJson = <T = unknown>(value: unknown): T | null => {
  if (value == null) return null;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return null;
  }
};

const parseMetadata = (value: unknown): Record<string, unknown> => {
  const parsed = safeParseJson(value);
  return toPlainObject(parsed);
};

const parseActions = (value: unknown): ParsedNotificationAction[] => {
  const parsed = safeParseJson(value);
  if (!Array.isArray(parsed)) return [];

  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const action = item as Record<string, unknown>;
      const key = toNonEmptyString(action.key);
      if (!key) return null;

      const payload = toPlainObject(action.payload);

      return {
        key,
        label: toNonEmptyString(action.label),
        targetType: toNonEmptyString(action.targetType) || null,
        targetId: toNonEmptyString(action.targetId) || null,
        payload: Object.keys(payload).length > 0 ? payload : undefined,
      } satisfies ParsedNotificationAction;
    })
    .filter((item): item is ParsedNotificationAction => Boolean(item));
};

const hasRequiredValue = (metadata: Record<string, unknown>, key: string) => {
  const value = metadata[key];
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

const hasRequiredPresence = (metadata: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(metadata, key);

const maybeWarnMissingMetadata = (normalized: NormalizedNotificationPayload) => {
  const requiredByType = REQUIRED_METADATA_BY_TYPE[normalized.type] || [];
  const requiredByRenderKey = REQUIRED_METADATA_BY_RENDER_KEY[normalized.renderKey] || [];
  const requiredPresence = REQUIRED_METADATA_PRESENCE_BY_TYPE[normalized.type] || [];

  const missingValueKeys = [...requiredByType, ...requiredByRenderKey].filter(
    (key) => !hasRequiredValue(normalized.metadata, key)
  );
  const missingPresenceKeys = requiredPresence.filter(
    (key) => !hasRequiredPresence(normalized.metadata, key)
  );

  if (missingValueKeys.length === 0 && missingPresenceKeys.length === 0) return;

  const dedupeKey = `${normalized.renderKey}:${missingValueKeys.join("|")}:${missingPresenceKeys.join("|")}`;
  if (warnedMissingMetadataKeys.has(dedupeKey)) return;
  warnedMissingMetadataKeys.add(dedupeKey);

  console.warn("[NotificationResolver] missing required metadata", {
    renderKey: normalized.renderKey,
    missingValueKeys,
    missingPresenceKeys,
    metadata: normalized.metadata,
  });
};

const getPeriodLabel = (periodType: string | undefined) => {
  if (!periodType) return "leaderboard";
  const normalized = periodType.toLowerCase();
  if (normalized === "monthly" || normalized === "weekly" || normalized === "daily") {
    return normalized;
  }
  return "leaderboard";
};

const formatDate = (raw: unknown) => {
  const value = toNonEmptyString(raw);
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const resolveLegacyTitle = (
  normalized: NormalizedNotificationPayload,
  fallbackTitle: string,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const metadata = normalized.metadata;

  if (normalized.type === "chat_message") {
    const senderName = toNonEmptyString(metadata.senderName);
    const roomName = toNonEmptyString(metadata.roomName);
    if (senderName) {
      return roomName
        ? t("notificationsScreen.title.messageFromWithRoom", { senderName, roomName })
        : t("notificationsScreen.title.messageFrom", { senderName });
    }
  }

  if (normalized.type === "call_incoming") {
    const callType =
      toNonEmptyString(metadata.callType)?.toLowerCase() === "video"
        ? t("notificationsScreen.callType.video")
        : t("notificationsScreen.callType.audio");
    return t("notificationsScreen.title.incomingCall", { callType });
  }

  if (normalized.type === "business_announcement") {
    if (normalized.event === "recruitment_application_received") {
      return t("api.recruitment_application_received_title");
    }
    if (normalized.event === "recruitment_offer_received") {
      return t("notifications.events.business_announcement.recruitment_offer_received.title");
    }
    if (normalized.event === "employee_terminated_business") {
      return t("notifications.events.business_announcement.employee_terminated_business.title");
    }
    return t("notificationsScreen.title.employeeJoinedBusiness");
  }

  if (normalized.type === "clock_in_reminder") {
    return fallbackTitle || t("notificationsScreen.title.shiftReminder");
  }

  if (normalized.type === "coins_earned") {
    const rewardCoins = Number(metadata.rewardCoins);
    const rank = Number(metadata.rank);
    if (Number.isFinite(rewardCoins) && rewardCoins > 0) {
      return Number.isFinite(rank) && rank > 0
        ? t("notificationsScreen.title.coinsEarnedWithRank", { rewardCoins, rank })
        : t("notificationsScreen.title.coinsEarned", { rewardCoins });
    }
  }

  if (normalized.type === "shift_assigned") {
    const businessName = toNonEmptyString(metadata.businessName);
    return businessName
      ? t("notificationsScreen.title.newShiftAssignedAt", { businessName })
      : t("notificationsScreen.title.newShiftAssigned");
  }

  if (normalized.type === "shift_cancelled") {
    const businessName = toNonEmptyString(metadata.businessName);
    return businessName
      ? t("notificationsScreen.title.shiftCancelledAt", { businessName })
      : t("notificationsScreen.title.shiftCancelled");
  }

  if (normalized.type === "shift_swap_requested") {
    const requesterName = toNonEmptyString(metadata.requesterName);
    return requesterName
      ? t("notificationsScreen.title.shiftSwapRequestedBy", { requesterName })
      : t("notificationsScreen.title.shiftSwapRequested");
  }

  if (normalized.type === "shift_swap_approved") {
    const acceptedByName = toNonEmptyString(metadata.acceptedByName);
    return acceptedByName
      ? t("notificationsScreen.title.shiftSwapApprovedBy", { acceptedByName })
      : t("notificationsScreen.title.shiftSwapApproved");
  }

  if (normalized.type === "achievement_unlocked") {
    const achievementTitle = toNonEmptyString(metadata.achievementTitle);
    return achievementTitle
      ? t("notificationsScreen.title.achievementUnlockedWithTitle", { achievementTitle })
      : t("notificationsScreen.title.achievementUnlocked");
  }

  if (normalized.type === "leave_approved") {
    return t("api.leave_approved_title");
  }

  if (normalized.type === "leave_rejected") {
    return t("api.leave_rejected_title");
  }

  if (normalized.type === "system_maintenance") {
    if (normalized.event === "subscription_purchased") {
      return t("notifications.events.system_maintenance.subscription_purchased.title");
    }
    return t("notifications.events.system_maintenance.manual_test.title");
  }

  if (normalized.type === "support_ticket_update") {
    return t("notifications.events.support_ticket_update.support_started.title");
  }

  return "";
};

const resolveLegacyBody = (
  normalized: NormalizedNotificationPayload,
  fallbackBody: string,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const metadata = normalized.metadata;

  if (normalized.type === "chat_message") {
    const preview = toNonEmptyString(metadata.messagePreview);
    if (preview) return preview;
    const senderName = toNonEmptyString(metadata.senderName) || t("api.chat_message_unknown_sender");
    return t("notifications.events.chat_message.chat_message.body", {
      senderName,
      messagePreview: preview || "",
    });
  }

  if (normalized.type === "call_incoming") {
    const callerName = toNonEmptyString(metadata.callerName);
    return callerName
      ? t("notificationsScreen.body.callerIsCalling", { callerName })
      : t("notificationsScreen.body.incomingCall");
  }

  if (normalized.type === "business_announcement") {
    if (normalized.event === "employee_terminated_business") {
      const terminatedEmployeeName = toNonEmptyString(metadata.terminatedEmployeeName);
      const businessName = toNonEmptyString(metadata.businessName);
      return t("notifications.events.business_announcement.employee_terminated_business.body", {
        terminatedEmployeeName,
        businessName,
      });
    }

    if (normalized.event === "recruitment_application_received") {
      const applicantName = toNonEmptyString(metadata.applicantName);
      return applicantName
        ? t("api.recruitment_application_received_body", { applicantName })
        : t("notifications.events.business_announcement.recruitment_application_received.body");
    }

    if (normalized.event === "recruitment_offer_received") {
      const businessName = toNonEmptyString(metadata.businessName);
      const invitedByName = toNonEmptyString(metadata.invitedByName);
      return t("notifications.events.business_announcement.recruitment_offer_received.body", {
        businessName,
        invitedByName,
      });
    }

    const employeeName = toNonEmptyString(metadata.joinedEmployeeName);
    return employeeName
      ? t("notificationsScreen.body.employeeJoinedWithName", { employeeName })
      : t("notificationsScreen.body.employeeJoined");
  }

  if (normalized.type === "clock_in_reminder") {
    const minutes = Number(metadata.smartAlertMinutes);
    return Number.isFinite(minutes) && minutes > 0
      ? t("notificationsScreen.body.shiftStartsInMinutes", {
          smartAlertMinutes: minutes,
        })
      : t("notificationsScreen.body.shiftStartsSoon");
  }

  if (normalized.type === "coins_earned") {
    const rewardCoins = Number(metadata.rewardCoins);
    const rank = Number(metadata.rank);
    const periodLabel = getPeriodLabel(toNonEmptyString(metadata.periodType));

    if (Number.isFinite(rewardCoins) && rewardCoins > 0) {
      return Number.isFinite(rank) && rank > 0
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
  }

  if (normalized.type === "shift_assigned") {
    const businessName = toNonEmptyString(metadata.businessName);
    const formattedShiftDate = formatDate(metadata.shiftDate);

    if (businessName && formattedShiftDate) {
      return t("notificationsScreen.body.shiftAssignedByBusinessOnDate", {
        businessName,
        formattedShiftDate,
      });
    }
    if (formattedShiftDate) {
      return t("notificationsScreen.body.shiftAssignedOnDate", {
        formattedShiftDate,
      });
    }
    return t("notificationsScreen.body.shiftAssigned");
  }

  if (normalized.type === "shift_cancelled") {
    const businessName = toNonEmptyString(metadata.businessName);
    const formattedShiftDate = formatDate(metadata.shiftDate);

    if (businessName && formattedShiftDate) {
      return t("notificationsScreen.body.shiftCancelledByBusinessOnDate", {
        businessName,
        formattedShiftDate,
      });
    }
    if (formattedShiftDate) {
      return t("notificationsScreen.body.shiftCancelledOnDate", {
        formattedShiftDate,
      });
    }
    return t("notificationsScreen.body.shiftCancelled");
  }

  if (normalized.type === "shift_swap_requested") {
    const requesterName = toNonEmptyString(metadata.requesterName);
    const formattedShiftDate = formatDate(metadata.shiftDate);

    if (requesterName && formattedShiftDate) {
      return t("notificationsScreen.body.shiftSwapRequestedByOnDate", {
        requesterName,
        formattedShiftDate,
      });
    }
    if (requesterName) {
      return t("notificationsScreen.body.shiftSwapRequestedBy", {
        requesterName,
      });
    }
    return t("notificationsScreen.body.shiftSwapRequested");
  }

  if (normalized.type === "shift_swap_approved") {
    const acceptedByName = toNonEmptyString(metadata.acceptedByName);
    const formattedShiftDate = formatDate(metadata.shiftDate);

    if (acceptedByName && formattedShiftDate) {
      return t("notificationsScreen.body.shiftSwapApprovedByOnDate", {
        acceptedByName,
        formattedShiftDate,
      });
    }
    if (acceptedByName) {
      return t("notificationsScreen.body.shiftSwapApprovedBy", {
        acceptedByName,
      });
    }
    return t("notificationsScreen.body.shiftSwapApproved");
  }

  if (normalized.type === "achievement_unlocked") {
    const achievementTitle = toNonEmptyString(metadata.achievementTitle);
    const rewardCoins = Number(metadata.rewardCoins);
    if (achievementTitle && Number.isFinite(rewardCoins) && rewardCoins > 0) {
      return t("notificationsScreen.body.achievementCompletedWithReward", {
        achievementTitle,
        rewardCoins,
      });
    }
    if (achievementTitle) {
      return t("notificationsScreen.body.achievementCompleted", {
        achievementTitle,
      });
    }
    return t("notificationsScreen.body.achievementUnlocked");
  }

  if (normalized.type === "shift_changed") {
    if (normalized.event === "shift_request_created") {
      const requesterName = toNonEmptyString(metadata.requesterName);
      const requestType = toNonEmptyString(metadata.requestType) || "request";
      return requesterName
        ? t("notifications.events.shift_changed.shift_request_created.body", {
            requesterName,
            requestType,
          })
        : t("api.shift_changed_body");
    }
    if (normalized.event === "shift_request_approved") {
      return t("notifications.events.shift_changed.shift_request_approved.body", {
        requestType: toNonEmptyString(metadata.requestType) || "request",
      });
    }
    if (normalized.event === "shift_request_rejected") {
      return t("notifications.events.shift_changed.shift_request_rejected.body", {
        requestType: toNonEmptyString(metadata.requestType) || "request",
      });
    }
  }

  if (normalized.type === "leave_approved") {
    return t("api.leave_approved_body");
  }

  if (normalized.type === "leave_rejected") {
    return t("api.leave_rejected_body");
  }

  if (normalized.type === "support_ticket_update") {
    return t("notifications.events.support_ticket_update.support_started.body", {
      starterName: toNonEmptyString(metadata.starterName) || t("api.chat_message_unknown_sender"),
    });
  }

  if (normalized.type === "system_maintenance") {
    if (normalized.event === "subscription_purchased") {
      return t("notifications.events.system_maintenance.subscription_purchased.body", {
        planTier: toNonEmptyString(metadata.planTier),
        billingCycle: toNonEmptyString(metadata.billingCycle),
      });
    }
    return t("notifications.events.system_maintenance.manual_test.body", {
      source: toNonEmptyString(metadata.source),
      requestedBy: toNonEmptyString(metadata.requestedBy),
    });
  }

  return fallbackBody;
};

export const normalizeNotificationPayload = (
  input: ResolveLocalizedNotificationTextInput
): NormalizedNotificationPayload => {
  const type = toNonEmptyString(input.type)?.toLowerCase() || "unknown";
  const event = toNonEmptyString(input.event)?.toLowerCase() || type;

  return {
    type,
    event,
    renderKey: `${type}.${event}`,
    title: toNonEmptyString(input.title),
    message: toNonEmptyString(input.message),
    metadata: parseMetadata(input.metadata),
    actions: parseActions(input.actions),
    relatedEntityType: toNonEmptyString(input.relatedEntityType)?.toLowerCase(),
    relatedEntityId: toNonEmptyString(input.relatedEntityId),
  };
};

export const resolveNotificationText = (
  input: ResolveLocalizedNotificationTextInput,
  t: (key: string, options?: Record<string, unknown>) => string
) => {
  const normalized = normalizeNotificationPayload(input);
  maybeWarnMissingMetadata(normalized);

  const rawTitle = toNonEmptyString(normalized.title);
  const rawMessage = toNonEmptyString(normalized.message);
  const backendTitle = rawTitle ? translateApiMessage(rawTitle) : "";
  const backendMessage = rawMessage ? translateApiMessage(rawMessage) : "";

  const interpolation = {
    ...normalized.metadata,
    formattedShiftDate: formatDate(normalized.metadata.shiftDate),
    senderName:
      toNonEmptyString(normalized.metadata.senderName) ||
      t("api.chat_message_unknown_sender"),
    callerName: toNonEmptyString(normalized.metadata.callerName) || "",
    businessName: toNonEmptyString(normalized.metadata.businessName) || "",
    requestType: toNonEmptyString(normalized.metadata.requestType) || "",
    rank: normalized.metadata.rank,
    rewardCoins: normalized.metadata.rewardCoins,
    periodType: getPeriodLabel(toNonEmptyString(normalized.metadata.periodType)),
    callType:
      toNonEmptyString(normalized.metadata.callType)?.toLowerCase() === "video"
        ? t("notificationsScreen.callType.video")
        : t("notificationsScreen.callType.audio"),
  };

  const eventTitleKey = `notifications.events.${normalized.type}.${normalized.event}.title`;
  const eventBodyKey = `notifications.events.${normalized.type}.${normalized.event}.body`;

  const eventTitle = i18n.exists(eventTitleKey)
    ? t(eventTitleKey, { ...interpolation })
    : "";
  const eventBody = i18n.exists(eventBodyKey)
    ? t(eventBodyKey, { ...interpolation })
    : "";

  const legacyTitle = resolveLegacyTitle(normalized, backendTitle, t);
  const legacyBody = resolveLegacyBody(normalized, backendMessage, t);

  const title =
    eventTitle ||
    legacyTitle ||
    backendTitle ||
    rawTitle ||
    t("notificationsScreen.title.notification");

  const body =
    eventBody ||
    legacyBody ||
    backendMessage ||
    rawMessage ||
    t("notificationsScreen.body.newNotification");

  return {
    normalized,
    title,
    body,
  };
};

export const parseFcmDataPayload = (data: unknown) =>
  normalizeNotificationPayload(toPlainObject(data));

export const parseNotificationInput = (input: unknown) =>
  normalizeNotificationPayload(toPlainObject(input));

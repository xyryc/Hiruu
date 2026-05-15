import { NotificationType, Prisma } from '@prisma-client';

type MetadataRecord = Record<string, unknown>;

type ContractInput = {
  type: NotificationType;
  event: string;
  metadata?: Prisma.InputJsonValue;
};

type ContractOutput = {
  event: string;
  metadata: Prisma.InputJsonValue;
};

const REQUIRED_METADATA_BY_TYPE: Partial<
  Record<NotificationType, readonly string[]>
> = {
  [NotificationType.achievement_unlocked]: ['achievementId'],
  [NotificationType.call_incoming]: [
    'chatRoomId',
    'callType',
    'callerId',
    'callerName',
  ],
  [NotificationType.chat_message]: ['chatRoomId', 'senderId', 'senderName'],
  [NotificationType.clock_in_reminder]: [
    'shiftAssignmentId',
    'startsAt',
    'smartAlertMinutes',
  ],
  [NotificationType.coins_earned]: [
    'businessId',
    'rank',
    'rewardCoins',
    'periodStart',
    'periodEnd',
    'periodType',
  ],
  [NotificationType.leave_approved]: ['requestType'],
  [NotificationType.leave_rejected]: ['requestType'],
  [NotificationType.shift_cancelled]: ['shiftDate'],
  [NotificationType.shift_swap_approved]: ['requestType'],
  [NotificationType.shift_swap_rejected]: ['requestType'],
  [NotificationType.shift_swap_requested]: [
    'requestType',
    'requesterUserId',
    'requesterName',
  ],
};

const REQUIRED_METADATA_PRESENCE_BY_TYPE: Partial<
  Record<NotificationType, readonly string[]>
> = {
  [NotificationType.call_incoming]: ['callerAvatar'],
  [NotificationType.chat_message]: ['senderAvatar'],
};

const REQUIRED_METADATA_BY_RENDER_KEY: Record<string, readonly string[]> = {
  'business_announcement.employee_joined_business': [
    'joinedUserId',
    'joinedEmployeeName',
    'businessName',
  ],
  'business_announcement.employee_terminated_business': [
    'terminatedUserId',
    'terminatedEmployeeName',
    'businessName',
  ],
  'business_announcement.recruitment_application_received': [
    'recruitmentId',
    'applicantUserId',
    'applicantName',
  ],
  'business_announcement.recruitment_offer_received': [
    'businessId',
    'businessName',
    'invitedByUserId',
    'invitedByName',
  ],
  'coins_earned.monthly_leaderboard_reward': [
    'businessId',
    'rank',
    'rewardCoins',
    'periodStart',
    'periodEnd',
    'periodType',
  ],
  'shift_changed.shift_request_created': [
    'requestType',
    'requesterUserId',
    'requesterName',
  ],
  'shift_changed.shift_request_approved': ['requestType'],
  'shift_changed.shift_request_rejected': ['requestType'],
  'shift_assigned.shift_assigned': ['shiftDate'],
  'achievement_unlocked.badge_tier_unlocked': [
    'achievementId',
    'achievementRewardId',
    'tier',
    'threshold',
  ],
  'support_ticket_update.support_started': ['starterUserId', 'chatRoomId'],
  'system_maintenance.manual_test': ['source', 'requestedBy'],
  'system_maintenance.subscription_purchased': [
    'actorUserId',
    'ownerType',
    'ownerId',
    'planTier',
    'billingCycle',
  ],
};

function toMetadataRecord(
  value: Prisma.InputJsonValue | undefined,
): MetadataRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return { ...(value as MetadataRecord) };
}

function hasRequiredKey(metadata: MetadataRecord, key: string): boolean {
  const value = metadata[key];
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return true;
}

function hasMetadataPresence(metadata: MetadataRecord, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(metadata, key);
}

function getRenderKeyFromEvent(type: NotificationType, event: string): string {
  return `${type}.${event}`;
}

export function enforceNotificationRenderContract(
  input: ContractInput,
): ContractOutput {
  const metadata = toMetadataRecord(input.metadata);

  const validationKey = getRenderKeyFromEvent(input.type, input.event);
  const typeRequiredKeys = REQUIRED_METADATA_BY_TYPE[input.type] ?? [];
  const typePresenceRequiredKeys =
    REQUIRED_METADATA_PRESENCE_BY_TYPE[input.type] ?? [];
  const renderRequiredKeys =
    REQUIRED_METADATA_BY_RENDER_KEY[validationKey] ?? [];
  const requiredKeys = [...typeRequiredKeys, ...renderRequiredKeys];

  for (const key of requiredKeys) {
    if (!hasRequiredKey(metadata, key)) {
      throw new Error(
        `metadata.${key} is required for notification render key "${validationKey}"`,
      );
    }
  }

  for (const key of typePresenceRequiredKeys) {
    if (!hasMetadataPresence(metadata, key)) {
      throw new Error(
        `metadata.${key} must be present for notification render key "${validationKey}"`,
      );
    }
  }

  return {
    event: input.event,
    metadata: {
      ...metadata,
    } as Prisma.InputJsonValue,
  };
}

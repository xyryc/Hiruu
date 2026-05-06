# React Native Notification Types and Payload Bodies

This is the source-of-truth doc for frontend dynamic notification rendering.

It is based on:
- `Notification.type`
- `Notification.event`
- `Notification.metadata`
- `Notification.actions`

Use `type + event` as the primary render key.

## 1) Universal Payload Shape

From `GET /notifications` and socket `notification` event:

```ts
type NotificationItem = {
  id: string;
  userId: string;
  businessId: string | null;
  type: string;          // NotificationType enum
  event: string;         // event key
  title: string;         // fallback
  message: string;       // fallback
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryChannels: Array<'in_app' | 'email' | 'push' | 'sms'>;
  actions: NotificationAction[];
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  isRead: boolean;
  readAt: string | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  scheduledFor: string | null;
  expiresAt: string | null;
  metadata: Record<string, unknown> | null; // jobId stripped in API response
  createdAt: string;
  updatedAt: string;
};
```

Action shape:

```ts
type NotificationAction = {
  key: string;
  label: string;
  targetType?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown>;
};
```

Push payload (`FCM data`) includes:
- `type`
- `event`
- `relatedEntityType`
- `relatedEntityId`
- `metadata` as JSON string
- `actions` as JSON string

So RN must parse:

```ts
const metadata = JSON.parse(data.metadata ?? '{}');
const actions = JSON.parse(data.actions ?? '[]');
```

## 2) Render Key Rule

Use:

```ts
const renderKey = `${type}.${event}`;
```

Recommended i18n keys:
- title: `notifications.events.<type>.<event>.title`
- body: `notifications.events.<type>.<event>.body`

## 3) Active Notification Catalog (Used in Backend)

Format:
- `type.event`
- Metadata body
- Related entity
- Default action behavior

## 3.1 Chat and Calls

### `chat_message.chat_message`

Metadata:
```json
{
  "chatRoomId": "string",
  "senderId": "string",
  "senderName": "string",
  "senderAvatar": "string|null",
  "roomName": "string|null",
  "messagePreview": "string|null"
}
```

Required by contract:
- `chatRoomId`, `senderId`, `senderName`
- `senderAvatar` key must exist (can be `null`)

Related:
- `relatedEntityType: "chat_message"`
- `relatedEntityId: "<messageId>"`

Default action:
- `open_chat`
- payload includes `chatRoomId`, `senderId`

Note:
- When marked read, chat notifications are deleted (not just flagged read).

### `call_incoming.call_incoming`

Metadata:
```json
{
  "chatRoomId": "string",
  "callType": "audio|video|string",
  "callerId": "string",
  "callerName": "string",
  "callerAvatar": "string|null"
}
```

Required by contract:
- `chatRoomId`, `callType`, `callerId`, `callerName`
- `callerAvatar` key must exist (can be `null`)

Related:
- `relatedEntityType: "call"`
- `relatedEntityId: "<callId>"`

Default action:
- `join_call`
- payload includes `chatRoomId`, `callType`

## 3.2 Shift and Schedule

### `shift_assigned.shift_assigned`

Metadata:
```json
{
  "shiftDate": "YYYY-MM-DD",
  "businessName": "string|null",
  "businessAvatar": "string|null"
}
```

Related:
- `relatedEntityType: "shift_assignment"`
- `relatedEntityId: "<assignmentId>"`

Default action:
- `view_shift_assignment`

### `shift_cancelled.shift_cancelled`

Metadata:
```json
{
  "shiftDate": "YYYY-MM-DD",
  "businessName": "string|null",
  "businessAvatar": "string|null"
}
```

Required by contract:
- `shiftDate`

Related:
- `relatedEntityType: "shift_assignment"`
- `relatedEntityId: "<assignmentId>"`

Default action:
- `view_shift_assignment`

### `clock_in_reminder.clock_in_reminder`

Metadata:
```json
{
  "shiftAssignmentId": "string",
  "startsAt": "ISO datetime string",
  "smartAlertMinutes": 3,
  "businessName": "string|null",
  "businessAvatar": "string|null"
}
```

Required by contract:
- `shiftAssignmentId`, `startsAt`, `smartAlertMinutes`

Related:
- `relatedEntityType: "shift_assignment"`
- `relatedEntityId: "<assignmentId>"`

Default action:
- `view_shift_assignment`
- payload includes `shiftAssignmentId`, `startsAt`

### `shift_changed.shift_request_created`

Metadata:
```json
{
  "requestType": "leave_request|shift_swap|manual_attendance|overtime_request|string",
  "requesterUserId": "string",
  "requesterName": "string"
}
```

Required by contract:
- `requestType`, `requesterUserId`, `requesterName`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `view_shift_assignment` for generic `shift_changed` type in action builder

### `shift_changed.shift_request_approved`

Metadata:
```json
{
  "requestType": "string"
}
```

Required by contract:
- `requestType`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `view_shift_assignment` (type-based default for `shift_changed`)

### `shift_changed.shift_request_rejected`

Metadata:
```json
{
  "requestType": "string"
}
```

Required by contract:
- `requestType`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `view_shift_assignment` (type-based default for `shift_changed`)

### `shift_swap_requested.shift_swap_requested`

Metadata:
```json
{
  "requestType": "shift_swap|string",
  "requesterUserId": "string",
  "requesterName": "string"
}
```

Required by contract:
- `requestType`, `requesterUserId`, `requesterName`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `review_shift_request`

### `shift_swap_approved.shift_swap_approved`

Metadata:
```json
{
  "requestType": "string"
}
```

Required by contract:
- `requestType`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `review_shift_request`

### `shift_swap_rejected.shift_swap_rejected`

Metadata:
```json
{
  "requestType": "string"
}
```

Required by contract:
- `requestType`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `review_shift_request`

### `leave_approved.leave_approved`

Metadata:
```json
{
  "requestType": "leave_request|string"
}
```

Required by contract:
- `requestType`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `review_shift_request`

### `leave_rejected.leave_rejected`

Metadata:
```json
{
  "requestType": "leave_request|string"
}
```

Required by contract:
- `requestType`

Related:
- `relatedEntityType: "shift_request"`
- `relatedEntityId: "<shiftRequestId>"`

Default action:
- `review_shift_request`

## 3.3 Achievements and Rewards

### `achievement_unlocked.achievement_unlocked`

Metadata:
```json
{
  "achievementId": "string",
  "achievementTitle": "string",
  "achievementIcon": "string|null",
  "rewardCoins": 0,
  "hasCosmeticReward": true,
  "rewardType": "string|null",
  "periodStart": "ISO datetime string|null"
}
```

Required by contract:
- `achievementId`

Related:
- `relatedEntityType: "achievement_unlock"`
- `relatedEntityId: "<achievementId>:<periodStart|onetime>"`

Default action:
- `view_achievement`
- payload includes `achievementId`, `periodStart`

### `achievement_unlocked.badge_tier_unlocked`

Metadata:
```json
{
  "achievementId": "string",
  "achievementTitle": "string",
  "achievementIcon": "string|null",
  "rewardCoins": 0,
  "rewardCosmeticId": "string|null",
  "achievementRewardId": "string",
  "tier": "string|number",
  "threshold": "number",
  "assetKey": "string|null"
}
```

Required by contract:
- `achievementId` (type-level requirement)

Related:
- `relatedEntityType: "badge_tier_unlocked"`
- `relatedEntityId: "<achievementId>:<achievementRewardId>"`

Default action:
- `view_achievement`

## 3.4 Business and Recruitment

### `business_announcement.employee_joined_business`

Metadata:
```json
{
  "joinedUserId": "string",
  "joinedEmployeeName": "string",
  "businessName": "string"
}
```

Required by contract:
- `joinedUserId`, `joinedEmployeeName`, `businessName`

Related:
- `relatedEntityType: "employment"`
- `relatedEntityId: "<employmentId>"`

Default action:
- `view_business_update`

### `business_announcement.employee_terminated_business`

Metadata:
```json
{
  "terminatedUserId": "string",
  "terminatedEmployeeName": "string",
  "businessName": "string",
  "effectiveDate": "ISO datetime string|null",
  "reason": "string|null"
}
```

Required by contract:
- `terminatedUserId`, `terminatedEmployeeName`, `businessName`

Related:
- `relatedEntityType: "employment"`
- `relatedEntityId: "<employmentId>"`

Default action:
- `view_business_update`

### `business_announcement.recruitment_application_received`

Metadata:
```json
{
  "recruitmentId": "string",
  "applicantUserId": "string",
  "applicantName": "string"
}
```

Required by contract:
- `recruitmentId`, `applicantUserId`, `applicantName`

Related:
- `relatedEntityType: "recruitment_application"`
- `relatedEntityId: "<applicationId>"`

Default action:
- `view_business_update`

### `business_announcement.recruitment_offer_received`

Metadata:
```json
{
  "businessId": "string",
  "businessName": "string",
  "invitedByUserId": "string",
  "invitedByName": "string",
  "recruitmentId": "string|null",
  "roleId": "string|null",
  "roleName": "string|null",
  "minSalary": "number|null",
  "maxSalary": "number|null"
}
```

Required by contract:
- `businessId`, `businessName`, `invitedByUserId`, `invitedByName`

Related:
- `relatedEntityType: "recruitment_application"`
- `relatedEntityId: "<invitationId>"`

Default action:
- `view_business_update`

## 3.5 Admin / System

### `system_maintenance.subscription_purchased`

Metadata:
```json
{
  "audience": "admin",
  "actorUserId": "string",
  "ownerType": "user|business",
  "ownerId": "string",
  "planTier": "string",
  "billingCycle": "string"
}
```

Required by contract:
- `actorUserId`, `ownerType`, `ownerId`, `planTier`, `billingCycle`

Related:
- `relatedEntityType: "subscription"`
- `relatedEntityId: "<subscriptionId>"`

Action:
- explicit `view_subscription` action sent by backend

### `support_ticket_update.support_started`

Metadata:
```json
{
  "audience": "admin",
  "starterUserId": "string",
  "chatRoomId": "string"
}
```

Required by contract:
- `starterUserId`, `chatRoomId`

Related:
- `relatedEntityType: "chat_room"`
- `relatedEntityId: "<chatRoomId>"`

Action:
- explicit `open_chat` action with payload `{ chatRoomId }`

### `system_maintenance.manual_test`

Metadata:
```json
{
  "source": "notification_test_endpoint",
  "requestedBy": "string"
}
```

Required by contract:
- `source`, `requestedBy`

Related:
- `relatedEntityType: "manual_test"`

Default action:
- `view_system_notice`

## 3.6 Leaderboard Coins

### `coins_earned.monthly_leaderboard_reward`

Metadata:
```json
{
  "businessId": "string",
  "rank": 1,
  "rewardCoins": 100,
  "periodStart": "ISO datetime string",
  "periodEnd": "ISO datetime string",
  "periodType": "monthly"
}
```

Required by contract:
- `businessId`, `rank`, `rewardCoins`, `periodStart`, `periodEnd`, `periodType`

Related:
- `relatedEntityType: "business_leaderboard"`
- `relatedEntityId: "<businessId>"`

Default action:
- no default action generated for this type

## 4) Notification Types in Enum but Currently Not Emitted

These exist in Prisma enum but no current create flow was found:
- `attendance_reminder`
- `clock_out_reminder`
- `salary_updated`
- `rating_received`
- `chat_mention`
- `admin_support_started`

Keep frontend fallback for unknown future `type.event`.

## 5) Dynamic Frontend Renderer (Recommended)

1. Build primary key as `${type}.${event}`.
2. Render localized text from key + metadata interpolation.
3. If key not found, fallback to backend `title/message`.
4. Route by `actions[0]?.key` first; fallback by `relatedEntityType`.
5. Parse push `metadata/actions` safely with try/catch.

## 6) Important Backend Behaviors for RN

- `chat_message` is deleted when marked as read (not kept in read state).
- `metadata.jobId` is removed before API response.
- Some metadata keys are required even if nullable; backend validates presence for:
1. `chat_message.senderAvatar`
2. `call_incoming.callerAvatar`

## 7) Suggested Frontend Type Skeleton

```ts
export type NotificationRenderModel = {
  key: string; // `${type}.${event}`
  title: string;
  body: string;
  avatarUrl?: string | null;
  businessName?: string | null;
  createdAt: string;
  actions: Array<{
    key: string;
    label: string;
    targetType?: string | null;
    targetId?: string | null;
    payload?: Record<string, unknown>;
  }>;
};
```


# React Native Notification Integration (Event-first)

This guide is based on the current backend implementation (`Notification.type + Notification.event + metadata`) and is meant for React Native frontend integration with translation.

## 1) Backend Contract (What RN receives)

### REST feed payload (`GET /notifications`)
Each notification item now includes:
- `id`
- `type` (enum)
- `event` (string, required)
- `metadata` (object)
- `actions` (array)
- `businessId`, `relatedEntityType`, `relatedEntityId`
- `isRead`, `createdAt`, etc.

Note:
- `metadata.jobId` is stripped in DTO.
- `chat_message` notifications are deleted when marked read.

### Push payload (FCM data)
Processor sends:
- `type`
- `event`
- `metadata` (JSON string)
- `actions` (JSON string)
- ids (`notificationId`, `userId`, `relatedEntityType`, `relatedEntityId`)

RN must `JSON.parse` `metadata` and `actions` from push `data`.

## 2) Event-first Rendering Rule

Frontend should **not** depend on backend `title/message` for final UI text.
Use this key:

`notificationKey = `${type}.${event}``

Render from i18n using `type + event + metadata`.

## 3) Translation Strategy (RN)

Use a deterministic translation key pattern:
- Title: `notifications.events.<type>.<event>.title`
- Body: `notifications.events.<type>.<event>.body`

Example helper:

```ts
export function resolveNotificationText(n: {
  type: string;
  event: string;
  metadata?: Record<string, unknown> | null;
  title?: string;
  message?: string;
}, t: (k: string, opts?: any) => string) {
  const titleKey = `notifications.events.${n.type}.${n.event}.title`;
  const bodyKey = `notifications.events.${n.type}.${n.event}.body`;

  const params = n.metadata ?? {};

  const title = t(titleKey, { ...params, defaultValue: n.title ?? '' });
  const body = t(bodyKey, { ...params, defaultValue: n.message ?? '' });

  return {
    title,
    body,
  };
}
```

Recommended fallback order:
1. `notifications.events.<type>.<event>.*`
2. existing legacy key mapping
3. backend `title/message`

## 4) Current Event Catalog

- `business_announcement.employee_joined_business`
- `business_announcement.recruitment_application_received`
- `business_announcement.recruitment_offer_received`
- `support_ticket_update.support_started`
- `system_maintenance.subscription_purchased`
- `system_maintenance.manual_test`
- `chat_message.chat_message`
- `call_incoming.call_incoming`
- `clock_in_reminder.clock_in_reminder`
- `coins_earned.monthly_leaderboard_reward`
- `achievement_unlocked.achievement_unlocked`
- `achievement_unlocked.badge_tier_unlocked`
- `shift_assigned.shift_assigned`
- `shift_cancelled.shift_cancelled`
- `shift_changed.shift_request_created`
- `shift_changed.shift_request_approved`
- `shift_changed.shift_request_rejected`
- `shift_swap_requested.shift_swap_requested`
- `shift_swap_approved.shift_swap_approved`
- `shift_swap_rejected.shift_swap_rejected`
- `leave_approved.leave_approved`
- `leave_rejected.leave_rejected`

## 5) Metadata You Should Use in Templates

Common useful fields:
- `businessName`, `businessAvatar` (important for multi-business employees)
- `shiftDate`, `startsAt`
- `requestType`, `requesterName`
- `applicantName`, `invitedByName`
- `rewardCoins`, `rank`
- `callerName`, `callerAvatar`

## 6) Action Handling

Backend action keys you should route in RN:
- `open_chat`
- `join_call`
- `view_shift_assignment`
- `review_shift_request`
- `view_achievement`
- `view_business_update`
- `view_system_notice`

Use `targetType`, `targetId`, and optional `payload` for deep-link navigation.

## 7) RN Implementation Checklist

1. Always store/use `type` + `event` in notification state.
2. Parse `metadata/actions` JSON for push notifications.
3. Render translated title/body from i18n event keys.
4. Show `businessName/businessAvatar` badge/chip in list items.
5. Handle `chat_message` read behavior (item may disappear after read).
6. Route action buttons by `action.key` and `payload`.

## 8) Suggested i18n Namespace Shape

```json
{
  "notifications": {
    "events": {
      "shift_assigned": {
        "shift_assigned": {
          "title": "Shift assigned",
          "body": "You have a new shift at {{businessName}} on {{shiftDate}}."
        }
      }
    }
  }
}
```

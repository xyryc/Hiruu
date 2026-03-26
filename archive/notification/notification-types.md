# Notification Types Reference

This document lists all backend notification types and example payloads for frontend integration.

## Response Shape (API)

`GET /notifications` returns items in this shape:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "businessId": "uuid-or-null",
  "type": "chat_message",
  "title": "string",
  "message": "string",
  "priority": "low|medium|high|urgent",
  "deliveryChannels": ["in_app", "push"],
  "actions": [
    {
      "key": "open_chat",
      "label": "chat_open_chat",
      "targetType": "chat_message",
      "targetId": "uuid",
      "payload": {
        "chatRoomId": "uuid",
        "senderId": "uuid"
      }
    }
  ],
  "relatedEntityType": "chat_message",
  "relatedEntityId": "uuid",
  "isRead": false,
  "readAt": null,
  "isDelivered": false,
  "deliveredAt": null,
  "scheduledFor": null,
  "expiresAt": null,
  "metadata": {},
  "createdAt": "2026-03-27T00:00:00.000Z",
  "updatedAt": "2026-03-27T00:00:00.000Z"
}
```

## All Notification Types (Prisma Enum)

| Type | Currently Produced by Backend | Notes |
|---|---|---|
| `shift_assigned` | No | Action mapping exists (`view_shift_assignment`) |
| `shift_changed` | Yes | Created when employee submits shift request |
| `shift_cancelled` | Yes | Created when assignment is removed/cancelled |
| `shift_swap_requested` | Yes | Created for targeted users of swap request |
| `shift_swap_approved` | Yes | Created when swap target accepts |
| `shift_swap_rejected` | No | Enum exists; no producer currently |
| `attendance_reminder` | No | Enum exists; no producer currently |
| `clock_in_reminder` | Yes | Scheduled smart alert before shift start |
| `clock_out_reminder` | No | Enum exists; no producer currently |
| `leave_approved` | Yes | Used for request approval notification |
| `leave_rejected` | Yes | Used for request rejection notification |
| `salary_updated` | No | Enum exists; no producer currently |
| `coins_earned` | No | Enum exists; no producer currently |
| `rating_received` | No | Enum exists; no producer currently |
| `achievement_unlocked` | Yes | Created on achievement unlock sync |
| `chat_message` | Yes | Created on new message for room participants |
| `chat_mention` | No | Enum exists; no producer currently |
| `call_incoming` | Yes | Created for invited call participants |
| `support_ticket_update` | No | Enum exists; no producer currently |
| `business_announcement` | Yes | Used when employee joins business |
| `system_maintenance` | Yes (manual/test endpoint) | Default in test notification endpoint |

## Type Examples (Currently Produced)

### `chat_message`

```json
{
  "type": "chat_message",
  "title": "New message",
  "message": "John sent you a message",
  "deliveryChannels": ["in_app", "push"],
  "relatedEntityType": "chat_message",
  "relatedEntityId": "msg_123",
  "actions": [
    {
      "key": "open_chat",
      "label": "chat_open_chat",
      "targetType": "chat_message",
      "targetId": "msg_123",
      "payload": {
        "chatRoomId": "room_123",
        "senderId": "user_abc"
      }
    }
  ],
  "metadata": {
    "chatRoomId": "room_123",
    "senderId": "user_abc",
    "senderName": "John",
    "roomName": "Ops Team",
    "messagePreview": "Can you cover this shift?"
  }
}
```

### `call_incoming`

```json
{
  "type": "call_incoming",
  "title": "Incoming call",
  "message": "John is calling you",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "call",
  "relatedEntityId": "call_123",
  "expiresAt": "2026-03-27T10:00:30.000Z",
  "actions": [
    {
      "key": "join_call",
      "label": "notifications_join_call",
      "targetType": "call",
      "targetId": "call_123",
      "payload": {
        "chatRoomId": "room_123",
        "callType": "audio"
      }
    }
  ],
  "metadata": {
    "chatRoomId": "room_123",
    "callType": "audio",
    "callerId": "user_abc",
    "callerName": "John",
    "callerAvatar": "https://cdn.example.com/avatar.jpg"
  }
}
```

### `clock_in_reminder`

```json
{
  "type": "clock_in_reminder",
  "title": "Shift reminder",
  "message": "Your shift starts in 30 minutes.",
  "deliveryChannels": ["in_app", "push"],
  "relatedEntityType": "shift_assignment",
  "relatedEntityId": "shift_assignment_123",
  "scheduledFor": "2026-03-27T09:30:00.000Z",
  "actions": [
    {
      "key": "view_shift_assignment",
      "label": "notifications_view_shift",
      "targetType": "shift_assignment",
      "targetId": "shift_assignment_123",
      "payload": {
        "shiftAssignmentId": "shift_assignment_123",
        "startsAt": "2026-03-27T10:00:00.000Z"
      }
    }
  ],
  "metadata": {
    "shiftAssignmentId": "shift_assignment_123",
    "startsAt": "2026-03-27T10:00:00.000Z",
    "smartAlertMinutes": 30
  }
}
```

### `shift_changed`

```json
{
  "type": "shift_changed",
  "title": "New shift request",
  "message": "An employee submitted a shift_swap request.",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "shift_request",
  "relatedEntityId": "shift_request_123",
  "actions": [
    {
      "key": "view_shift_assignment",
      "label": "notifications_view_shift",
      "targetType": "shift_request",
      "targetId": "shift_request_123"
    }
  ],
  "metadata": null
}
```

### `shift_cancelled`

```json
{
  "type": "shift_cancelled",
  "title": "Shift cancelled",
  "message": "Your shift for 2026-03-28 has been cancelled.",
  "deliveryChannels": ["in_app", "push"],
  "relatedEntityType": "shift_assignment",
  "relatedEntityId": "shift_assignment_123",
  "actions": [
    {
      "key": "view_shift_assignment",
      "label": "notifications_view_shift",
      "targetType": "shift_assignment",
      "targetId": "shift_assignment_123"
    }
  ],
  "metadata": null
}
```

### `shift_swap_requested`

```json
{
  "type": "shift_swap_requested",
  "title": "Shift swap request",
  "message": "John requested a shift swap.",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "shift_request",
  "relatedEntityId": "shift_request_123",
  "actions": [
    {
      "key": "review_shift_request",
      "label": "notifications_view_request",
      "targetType": "shift_request",
      "targetId": "shift_request_123"
    }
  ],
  "metadata": null
}
```

### `shift_swap_approved`

```json
{
  "type": "shift_swap_approved",
  "title": "Shift swap accepted",
  "message": "Your shift swap request has been accepted.",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "shift_request",
  "relatedEntityId": "shift_request_123",
  "actions": [
    {
      "key": "review_shift_request",
      "label": "notifications_view_request",
      "targetType": "shift_request",
      "targetId": "shift_request_123"
    }
  ],
  "metadata": null
}
```

### `leave_approved`

```json
{
  "type": "leave_approved",
  "title": "Request approved",
  "message": "Your shift request has been approved.",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "shift_request",
  "relatedEntityId": "shift_request_123",
  "actions": [
    {
      "key": "review_shift_request",
      "label": "notifications_view_request",
      "targetType": "shift_request",
      "targetId": "shift_request_123"
    }
  ],
  "metadata": null
}
```

### `leave_rejected`

```json
{
  "type": "leave_rejected",
  "title": "Request rejected",
  "message": "Your shift request has been rejected.",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "shift_request",
  "relatedEntityId": "shift_request_123",
  "actions": [
    {
      "key": "review_shift_request",
      "label": "notifications_view_request",
      "targetType": "shift_request",
      "targetId": "shift_request_123"
    }
  ],
  "metadata": null
}
```

### `achievement_unlocked`

```json
{
  "type": "achievement_unlocked",
  "title": "Achievement unlocked",
  "message": "You unlocked Perfect Attendance!",
  "deliveryChannels": ["in_app", "push"],
  "relatedEntityType": "achievement_unlock",
  "relatedEntityId": "achievement_123:2026-03-01T00:00:00.000Z",
  "actions": [
    {
      "key": "view_achievement",
      "label": "notifications_view_achievement",
      "targetType": "achievement_unlock",
      "targetId": "achievement_123:2026-03-01T00:00:00.000Z",
      "payload": {
        "achievementId": "achievement_123",
        "periodStart": "2026-03-01T00:00:00.000Z"
      }
    }
  ],
  "metadata": {
    "achievementId": "achievement_123",
    "periodStart": "2026-03-01T00:00:00.000Z"
  }
}
```

### `business_announcement`

```json
{
  "type": "business_announcement",
  "title": "Employee joined business",
  "message": "A new employee joined your business.",
  "deliveryChannels": ["in_app"],
  "relatedEntityType": "employment",
  "relatedEntityId": "employment_123",
  "actions": [
    {
      "key": "view_business_update",
      "label": "notifications_view_update",
      "targetType": "employment",
      "targetId": "employment_123"
    }
  ],
  "metadata": {
    "joinedUserId": "user_123",
    "joinedEmployeeName": "Jane Doe"
  }
}
```

### `system_maintenance` (manual/test endpoint)

```json
{
  "type": "system_maintenance",
  "title": "Test notification",
  "message": "This is a backend test notification.",
  "deliveryChannels": ["in_app", "push"],
  "relatedEntityType": "manual_test",
  "relatedEntityId": null,
  "actions": [
    {
      "key": "view_system_notice",
      "label": "notifications_view_notice",
      "targetType": "manual_test",
      "targetId": null
    }
  ],
  "metadata": {
    "source": "notification_test_endpoint",
    "requestedBy": "user_123"
  }
}
```

## Integration Notes

- `actions` are generated server-side from `type`, `relatedEntityType`, `relatedEntityId`, and `metadata`.
- `metadata.jobId` is removed from API response by DTO sanitizer.
- In `mark as read`, `chat_message` notifications are deleted (not just marked read).
- `priority` currently defaults to `medium` unless explicitly set.

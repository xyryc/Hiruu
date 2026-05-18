# React Native Event-First Notification Localization

## Payload contract (backend -> app)

The app expects push/API/socket notifications to carry:

- `type`
- `event`
- `metadata` (object for API/socket, JSON string for FCM data payload)
- `actions` (array for API/socket, JSON string for FCM data payload)
- `relatedEntityType`, `relatedEntityId`
- `title`, `message` (fallback only)

Render key is always:

`<type>.<event>`

## FCM example

```json
{
  "data": {
    "type": "chat_message",
    "event": "chat_message",
    "metadata": "{\"senderName\":\"User aa\",\"messagePreview\":\"Hello\",\"chatRoomId\":\"room-1\",\"senderId\":\"user-2\",\"senderAvatar\":null}",
    "actions": "[{\"key\":\"open_chat\",\"targetType\":\"chat_message\",\"targetId\":\"msg-1\",\"payload\":{\"chatRoomId\":\"room-1\"}}]",
    "relatedEntityType": "chat_message",
    "relatedEntityId": "msg-1"
  }
}
```

## Resolution order

For both list UI and push display, the app resolves title/body in this order:

1. `notifications.events.<type>.<event>.title/body`
2. Legacy resolver mapping (existing `notificationsScreen`/`api` keys)
3. Backend `title/message`
4. Safe generic fallback

## Safety behavior

- Malformed `metadata/actions` JSON never crashes the app.
- Invalid JSON falls back to `{}` / `[]`.
- Missing contract-required metadata logs a warning and falls back gracefully.

## Duplicate prevention

Background handler behavior:

- If incoming FCM has `notification.title/body`, OS handles rendering, and local scheduling is skipped (avoids duplicate banners).
- If incoming FCM is data-only, app resolves localized text and schedules a local notification.

## Action routing keys supported

- `open_chat`
- `join_call`
- `view_shift_assignment`
- `review_shift_request`
- `view_achievement`
- `view_business_update`
- `view_system_notice`

## Test checklist

1. Foreground push: verify localized text from `type+event+metadata`.
2. Background push with `notification` payload: verify no duplicate local banner.
3. Background push data-only: verify localized local notification appears.
4. Killed Android data-only: verify handler localization path.
5. Malformed JSON in `metadata/actions`: verify no crash and fallback text.
6. Missing required metadata keys: verify warning log + fallback text.
7. Tap notification action routing for each supported action key.
8. Notification list rendering matches push rendering for same payload.

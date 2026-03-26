# React Native Notification i18n Guide

This guide shows how to handle multilingual notifications for both:
- in-app notification list
- push notifications (banner/tray)

It is aligned with your backend notification payload shape in `notification-types.md`.

## 1) Recommended Strategy

Use `notification.type` as the base translation key and use `metadata` as interpolation params.

- In-app: translate on frontend when rendering.
- Push: localize before display (in app handler), or send pre-localized text from backend.

## 2) Suggested Translation Key Pattern

Use one consistent namespace in frontend:

- `notifications.type.<type>.title`
- `notifications.type.<type>.body`

Examples:
- `notifications.type.shift_cancelled.title`
- `notifications.type.shift_cancelled.body`
- `notifications.type.chat_message.title`
- `notifications.type.chat_message.body`

## 3) Example Translation JSON

```json
{
  "notifications": {
    "type": {
      "shift_cancelled": {
        "title": "Shift cancelled",
        "body": "Your shift for {{shiftDate}} has been cancelled."
      },
      "chat_message": {
        "title": "New message",
        "body": "{{senderName}} sent you a message"
      },
      "call_incoming": {
        "title": "Incoming call",
        "body": "{{callerName}} is calling you"
      }
    }
  }
}
```

## 4) In-App Rendering (React Native)

```ts
type NotificationItem = {
  type: string;
  title?: string;
  message?: string;
  metadata?: Record<string, unknown> | null;
};

function getLocalizedNotificationText(
  item: NotificationItem,
  t: (key: string, params?: Record<string, unknown>) => string,
) {
  const params = item.metadata ?? {};

  const titleKey = `notifications.type.${item.type}.title`;
  const bodyKey = `notifications.type.${item.type}.body`;

  const title = t(titleKey, params);
  const body = t(bodyKey, params);

  return {
    title: title === titleKey ? item.title ?? '' : title,
    body: body === bodyKey ? item.message ?? '' : body,
  };
}
```

## 5) Push Handling in React Native

For push payload, include at least:
- `type`
- `metadata` (JSON string or flat fields)

When push is received:
1. parse payload
2. localize using same key pattern
3. show local notification (Notifee / RN Push Notification)

```ts
import notifee from '@notifee/react-native';

async function showLocalizedPush(remoteData: Record<string, string>, t: any) {
  const type = remoteData.type;
  const metadata = remoteData.metadata ? JSON.parse(remoteData.metadata) : {};

  const titleKey = `notifications.type.${type}.title`;
  const bodyKey = `notifications.type.${type}.body`;

  const title = t(titleKey, metadata);
  const body = t(bodyKey, metadata);

  await notifee.displayNotification({
    title: title === titleKey ? remoteData.title ?? 'Notification' : title,
    body: body === bodyKey ? remoteData.message ?? '' : body,
    android: { channelId: 'default' },
  });
}
```

## 6) Action Buttons i18n

Backend `actions[].label` already looks like i18n keys (example: `notifications_view_shift`).
Map them in frontend translation files and render button label via `t(action.label)`.

## 7) Fallback Rules (Important)

- If translation key is missing, use backend `title`/`message`.
- If interpolation field is missing, render safe fallback text.
- Keep `type` stable; frontend translation depends on it.

## 8) Backend + Frontend Contract

To keep localization reliable, backend should always send:
- `type`
- `metadata` with interpolation values used by templates
- fallback `title` and `message`

This gives you safe behavior in all cases (missing keys, stale app versions, etc.).

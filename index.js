import { getApp } from "@react-native-firebase/app";
import {
  getMessaging,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { resolveFcmDisplayText } from "./utils/pushNotificationRouting";

const messagingInstance = getMessaging(getApp());

setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
  const hasSystemNotificationPayload = Boolean(
    remoteMessage?.notification?.title || remoteMessage?.notification?.body
  );

  // If the backend sends notification.title/body, OS will render it.
  // Skip local scheduling to avoid duplicate banners.
  if (hasSystemNotificationPayload) return;

  const { title, body } = resolveFcmDisplayText(remoteMessage);
  if (!title && !body) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || "Notification",
      body: body || "You have a new notification.",
      data: remoteMessage?.data || {},
    },
    trigger: null,
  });
});

import "expo-router/entry";

import OfflineScreen from "@/components/ui/states/OfflineScreen";
import ServerStatusScreen from "@/components/ui/states/ServerStatusScreen";
import { useIncomingCallListener } from "@/hooks/useIncomingCallListener";
import { useSocketLifecycle } from "@/hooks/useSocketLifecycle";
import { registerForFcmToken } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useProfileStore } from "@/stores/profileStore";
import { useServerStatusStore } from "@/stores/serverStatusStore";
import { translateApiMessage } from "@/utils/apiMessages";
import {
  setPendingChatNavigation,
} from "@/utils/notificationNavigation";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { getApp } from "@react-native-firebase/app";
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import SplashScreen from "./splash";


const AppBootstrap = () => {
  const messaging = getMessaging(getApp());
  const router = useRouter();
  const fcmSetupDoneForUserRef = useRef<string | null>(null);

  const [fontsLoaded] = useFonts({
    "ProximaNova-Thin": require("../assets/fonts/ProximaNova-Thin.ttf"),
    "ProximaNova-Light": require("../assets/fonts/ProximaNova-Light.ttf"),
    "ProximaNova-Regular": require("../assets/fonts/ProximaNova-Regular.ttf"),
    "ProximaNova-Medium": require("../assets/fonts/ProximaNova-Medium.ttf"),
    "ProximaNova-Semibold": require("../assets/fonts/ProximaNova-Semibold.ttf"),
    "ProximaNova-Bold": require("../assets/fonts/ProximaNova-Bold.ttf"),
    "ProximaNova-Black": require("../assets/fonts/ProximaNova-Black.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const { initializeAuth, user } = useAuthStore();
  const setFcmToken = useAuthStore((state) => state.setFcmToken);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const netInfo = useNetInfo();
  const { isServerDown, message, checkHealthNow } = useServerStatusStore();
  const isExpectedAuthBootstrapError = useCallback((error: any) => {
    const message = String(error?.message || "").toLowerCase();
    return (
      error?.isServerUnavailable ||
      message.includes("server_unavailable") ||
      message.includes("token_revoked_or_not_found") ||
      message.includes("no refresh token available") ||
      message.includes("unauthorized")
    );
  }, []);

  const parseJsonField = useCallback((value: unknown) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }, []);

  const extractChatNotificationPayload = useCallback((rawData: any) => {
    // console.log("[NotifDebug] extractChatNotificationPayload:input", rawData);
    if (!rawData || typeof rawData !== "object") return null;

    const type = typeof rawData.type === "string" ? rawData.type : "";
    const metadata =
      (parseJsonField(rawData?.metadata) as Record<string, any> | null) ||
      null;
    const actions =
      (parseJsonField(rawData?.actions) as Record<string, any>[] | null) ||
      null;
    const firstAction = Array.isArray(actions) && actions.length > 0 ? actions[0] : null;
    const actionPayload =
      firstAction?.payload && typeof firstAction.payload === "object"
        ? firstAction.payload
        : null;
    const chatRoomIdFromMetadata =
      typeof metadata?.chatRoomId === "string" ? metadata.chatRoomId : "";
    const chatRoomIdFromAction =
      typeof actionPayload?.chatRoomId === "string" ? actionPayload.chatRoomId : "";
    const chatRoomId = chatRoomIdFromMetadata || chatRoomIdFromAction;
    const messageId =
      typeof rawData.messageId === "string" ? rawData.messageId : undefined;

    if (type !== "chat_message" || !chatRoomId) {
      // console.log("[NotifDebug] extractChatNotificationPayload:ignored", {
      //   type,
      //   chatRoomId,
      // });
      return null;
    }

    // console.log("[NotifDebug] extractChatNotificationPayload:resolved", {
    //   chatRoomId,
    //   hasMessageId: Boolean(messageId),
    // });
    return { chatRoomId, messageId };
  }, [parseJsonField]);

  const resolveFcmDisplayText = useCallback((remoteMessage: any) => {
    const notificationTitle = String(remoteMessage?.notification?.title || "").trim();
    const notificationBody = String(remoteMessage?.notification?.body || "").trim();
    const dataTitle = String(
      remoteMessage?.data?.title ||
      remoteMessage?.data?.titleKey ||
      ""
    ).trim();
    const dataBody = String(
      remoteMessage?.data?.body ||
      remoteMessage?.data?.message ||
      remoteMessage?.data?.bodyKey ||
      ""
    ).trim();

    const rawTitle = notificationTitle || dataTitle || "Notification";
    const rawBody = notificationBody || dataBody || "You have a new message";

    return {
      title: translateApiMessage(rawTitle),
      body: translateApiMessage(rawBody),
    };
  }, []);

  const navigateToChatRoom = useCallback((payload: { chatRoomId: string; messageId?: string }) => {
    // console.log("[NotifDebug] navigateToChatRoom:attempt", {
    //   payload,
    //   appIsReady,
    //   hasUser: Boolean(user),
    // });
    if (!appIsReady || !user) {
      setPendingChatNavigation(payload);
      // console.log("[NotifDebug] navigateToChatRoom:deferred");
      return;
    }

    router.push({
      pathname: "/screens/inbox/chat-screen",
      params: {
        roomId: payload.chatRoomId,
        ...(payload.messageId ? { messageId: payload.messageId } : {}),
      },
    });
    // console.log("[NotifDebug] navigateToChatRoom:pushed", {
    //   roomId: payload.chatRoomId,
    // });
  }, [appIsReady, router, user]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const init = async () => {
      await initializeAuth();
      const { user: authUser, accessToken, refreshToken } = useAuthStore.getState();

      if (authUser && accessToken && refreshToken) {
        void useProfileStore
          .getState()
          .getProfile()
          .catch((error) => {
            if (!isExpectedAuthBootstrapError(error)) {
              console.error("Failed to refresh profile on app launch:", error);
            }
          });
      }

      if (fontsLoaded) {
        timer = setTimeout(() => {
          setAppIsReady(true);
        }, 500);
      }
    };

    init();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [fontsLoaded, initializeAuth, isExpectedAuthBootstrapError]);

  useSocketLifecycle(Boolean(user && appIsReady));
  useIncomingCallListener(Boolean(user && appIsReady));

  useEffect(() => {
    if (Platform.OS !== "android") return;

    Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    })
      .then(() => {
        // console.log("[NotifDebug] android-notification-channel:created");
      })
      .catch((error) => {
        // console.log("[NotifDebug] android-notification-channel:error", {
        //   message: error?.message,
        // });
      });
  }, []);

  useEffect(() => {
    const setupFcm = async () => {
      if (!user?.id) return;
      if (fcmSetupDoneForUserRef.current === user.id) return;
      fcmSetupDoneForUserRef.current = user.id;
      // console.log("[NotifDebug] setupFcm:start", { userId: user?.id });
      try {
        const token = await registerForFcmToken();
        if (token) {
          setFcmToken(token);
        }
        // console.log("[NotifDebug] setupFcm:token-ready", {
        //   hasToken: Boolean(token),
        // });
      } catch (e) {
        console.error("FCM setup error:", e);
      }
    };

    setupFcm();
  }, [setFcmToken, user?.id]);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount().catch(() => undefined);
  }, [fetchUnreadCount, user]);

  useEffect(() => {
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      // console.log("[NotifDebug] onMessage:foreground", {
      //   messageId: remoteMessage?.messageId,
      //   data: remoteMessage?.data,
      //   title: remoteMessage?.notification?.title,
      // });
      const { title, body } = resolveFcmDisplayText(remoteMessage);

      // Show a visible banner while app is foregrounded.
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: "default",
          data: remoteMessage.data,
        },
        trigger: null,
      });
      // console.log("[NotifDebug] onMessage:local-notification-scheduled", {
      //   title,
      // });
    });

    const unsubscribeOnOpen = onNotificationOpenedApp(messaging, (remoteMessage) => {
      // console.log("[NotifDebug] onNotificationOpenedApp", {
      //   messageId: remoteMessage?.messageId,
      //   data: remoteMessage?.data,
      // });
      const payload = extractChatNotificationPayload(remoteMessage?.data);
      if (payload) {
        navigateToChatRoom(payload);
      }
    });

    getInitialNotification(messaging)
      .then((remoteMessage) => {
        if (remoteMessage) {
          // console.log("[NotifDebug] getInitialNotification:hit", {
          //   messageId: remoteMessage?.messageId,
          //   data: remoteMessage?.data,
          // });
          const payload = extractChatNotificationPayload(remoteMessage?.data);
          if (payload) {
            navigateToChatRoom(payload);
          }
        } else {
          // console.log("[NotifDebug] getInitialNotification:empty");
        }
      })
      .catch((error) => {
        // console.log("[NotifDebug] getInitialNotification:error", {
        //   message: error?.message,
        // });
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        // console.log("[NotifDebug] addNotificationResponseReceivedListener", {
        //   identifier: response?.notification?.request?.identifier,
        //   data: response?.notification?.request?.content?.data,
        // });
        const payload = extractChatNotificationPayload(
          response.notification.request.content.data
        );
        if (payload) {
          navigateToChatRoom(payload);
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpen();
      notificationResponseSubscription.remove();
    };
  }, [
    appIsReady,
    extractChatNotificationPayload,
    messaging,
    navigateToChatRoom,
    resolveFcmDisplayText,
    user,
  ]);



  if (!appIsReady) {
    return <SplashScreen />;
  }

  const isOffline =
    netInfo.isConnected === false || netInfo.isInternetReachable === false;

  if (isOffline) {
    return (
      <OfflineScreen
        onReload={() => {
          void NetInfo.refresh();
        }}
      />
    );
  }

  if (isServerDown) {
    return (
      <ServerStatusScreen
        message={message}
        onReload={async () => {
          await checkHealthNow();
        }}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

export default AppBootstrap;

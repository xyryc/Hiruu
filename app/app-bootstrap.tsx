import OfflineScreen from "@/components/ui/states/OfflineScreen";
import ServerStatusScreen from "@/components/ui/states/ServerStatusScreen";
import { useIncomingCallListener } from "@/hooks/useIncomingCallListener";
import { useSocketLifecycle } from "@/hooks/useSocketLifecycle";
import { registerForFcmToken } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useProfileStore } from "@/stores/profileStore";
import { useServerStatusStore } from "@/stores/serverStatusStore";
import {
  setPendingRouteNavigation,
  setPendingChatNavigation,
} from "@/utils/notificationNavigation";
import {
  extractChatNotificationPayload,
  extractNotificationRoutePayload,
  resolveFcmDisplayText,
} from "@/utils/pushNotificationRouting";
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
import { toast } from "sonner-native";
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

  const navigateFromNotificationData = useCallback((rawData: any) => {
    const routePayload = extractNotificationRoutePayload(rawData);
    if (!routePayload) return;

    if (!appIsReady || !user) {
      if (routePayload.pathname === "/screens/inbox/chat-screen") {
        const roomId = routePayload.params?.roomId;
        if (roomId) {
          setPendingChatNavigation({ chatRoomId: roomId });
          return;
        }
      }
      setPendingRouteNavigation({
        pathname: routePayload.pathname,
        params: routePayload.params,
      });
      return;
    }

    router.push({
      pathname: routePayload.pathname as any,
      params: routePayload.params,
    });
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
    const logNotificationPermissions = async () => {
      try {
        await Notifications.getPermissionsAsync();
      } catch (_error: any) {}
    };

    logNotificationPermissions();
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
      const { title, body } = resolveFcmDisplayText(remoteMessage);
      toast(title || "Notification", {
        description: body || "",
      });
    });

    const unsubscribeOnOpen = onNotificationOpenedApp(messaging, (remoteMessage) => {
      // console.log("[NotifDebug] onNotificationOpenedApp", {
      //   messageId: remoteMessage?.messageId,
      //   data: remoteMessage?.data,
      // });
      navigateFromNotificationData(remoteMessage?.data);
    });

    getInitialNotification(messaging)
      .then((remoteMessage) => {
        if (remoteMessage) {
          // console.log("[NotifDebug] getInitialNotification:hit", {
          //   messageId: remoteMessage?.messageId,
          //   data: remoteMessage?.data,
          // });
          navigateFromNotificationData(remoteMessage?.data);
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
        if (payload) navigateToChatRoom(payload);
        else navigateFromNotificationData(response.notification.request.content.data);
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpen();
      notificationResponseSubscription.remove();
    };
  }, [
    appIsReady,
    messaging,
    navigateFromNotificationData,
    navigateToChatRoom,
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

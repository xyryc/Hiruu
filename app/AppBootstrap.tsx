import OfflineScreen from "@/components/ui/states/OfflineScreen";
import ServerStatusScreen from "@/components/ui/states/ServerStatusScreen";
import { useIncomingCallListener } from "@/hooks/useIncomingCallListener";
import { useSocketLifecycle } from "@/hooks/useSocketLifecycle";
import { registerForFcmToken } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { useServerStatusStore } from "@/stores/serverStatusStore";
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
import { useCallback, useEffect, useState } from "react";
import SplashScreen from "./splash";


const AppBootstrap = () => {
  const messaging = getMessaging(getApp());
  const router = useRouter();

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
  const netInfo = useNetInfo();
  const { isServerDown, message, checkHealthNow } = useServerStatusStore();

  const extractChatNotificationPayload = useCallback((rawData: any) => {
    if (!rawData || typeof rawData !== "object") return null;

    const type = typeof rawData.type === "string" ? rawData.type : "";
    const chatRoomId =
      typeof rawData.chatRoomId === "string" ? rawData.chatRoomId : "";
    const messageId =
      typeof rawData.messageId === "string" ? rawData.messageId : undefined;

    if (type !== "chat_message" || !chatRoomId) {
      return null;
    }

    return { chatRoomId, messageId };
  }, []);

  const navigateToChatRoom = useCallback((payload: { chatRoomId: string; messageId?: string }) => {
    if (!appIsReady || !user) {
      setPendingChatNavigation(payload);
      return;
    }

    router.push({
      pathname: "/screens/jobs/chatscreen",
      params: {
        roomId: payload.chatRoomId,
        ...(payload.messageId ? { messageId: payload.messageId } : {}),
      },
    });
  }, [appIsReady, router, user]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const init = async () => {
      await initializeAuth();
      const { user: authUser, accessToken } = useAuthStore.getState();

      if (authUser && accessToken) {
        void useProfileStore
          .getState()
          .getProfile()
          .catch((error) => {
            console.error("Failed to refresh profile on app launch:", error);
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
  }, [fontsLoaded, initializeAuth]);

  useSocketLifecycle(Boolean(user && appIsReady));
  useIncomingCallListener(Boolean(user && appIsReady));

  useEffect(() => {
    if (Platform.OS !== "android") return;

    Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const setupFcm = async () => {
      if (!user) return;
      try {
        const token = await registerForFcmToken();
        console.log("FCM_TOKEN =>", token);
      } catch (e) {
        console.log("FCM setup error:", e);
      }
    };

    setupFcm();
  }, [user]);

  useEffect(() => {
    const unsubscribeOnMessage = onMessage(messaging, async (remoteMessage) => {
      console.log("FCM foreground =>", remoteMessage);

      // Show a visible banner while app is foregrounded.
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.notification?.title || "Notification",
          body: remoteMessage.notification?.body || "You have a new message",
          sound: "default",
          data: remoteMessage.data,
        },
        trigger: null,
      });
    });

    const unsubscribeOnOpen = onNotificationOpenedApp(messaging, (remoteMessage) => {
      console.log("FCM opened from background =>", remoteMessage);
      const payload = extractChatNotificationPayload(remoteMessage?.data);
      if (payload) {
        navigateToChatRoom(payload);
      }
    });

    getInitialNotification(messaging)
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("FCM opened from quit =>", remoteMessage);
          const payload = extractChatNotificationPayload(remoteMessage?.data);
          if (payload) {
            navigateToChatRoom(payload);
          }
        }
      })
      .catch(() => undefined);

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
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
        onReload={() => {
          void checkHealthNow();
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


import { useAuthStore } from "@/stores/authStore";
import {
  consumePendingChatNavigation,
  consumePendingRouteNavigation,
} from "@/utils/notificationNavigation";
import { Redirect } from "expo-router";
import type { Href } from "expo-router";

export default function Index() {
  const { user, isInitialized, sessionExpired } = useAuthStore();

  // Root layout already shows splash + initializes auth.
  // Avoid rendering a second splash here to prevent flicker.
  if (!isInitialized) return null;

  // User is logged in
  if (user) {
    if (user.email && user.isEmailVerified === false) {
      return (
        <Redirect
          href={{
            pathname: "/(auth)/verify",
            params: {
              email: user.email,
              source: "login",
            },
          }}
        />
      );
    }

    const pendingChat = consumePendingChatNavigation();
    if (pendingChat?.chatRoomId) {
      return (
        <Redirect
          href={{
            pathname: "/screens/inbox/chat-screen",
            params: {
              roomId: pendingChat.chatRoomId,
              ...(pendingChat.messageId
                ? { messageId: pendingChat.messageId }
                : {}),
            },
          }}
        />
      );
    }

    const pendingRoute = consumePendingRouteNavigation();
    if (pendingRoute?.pathname) {
      return (
        <Redirect
          href={{
            pathname: pendingRoute.pathname as Href["pathname"],
            params: pendingRoute.params || {},
          }}
        />
      );
    }

    return <Redirect href="/(tabs)/home" />;
  }

  // Not logged in, show welcome screen
  if (sessionExpired) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/welcome" />;
}

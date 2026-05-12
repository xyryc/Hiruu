import ErrorBoundary from "@/components/ui/error/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/utils/i18n";
import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Toaster } from "sonner-native";
import AppBootstrap from "./app-bootstrap";
import "./global.css";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <ThemeProvider>
            <AppBootstrap />
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}

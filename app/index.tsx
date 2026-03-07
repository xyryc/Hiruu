import { useAuthStore } from "@/stores/authStore";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isInitialized } = useAuthStore();

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

    return <Redirect href="/(tabs)/home" />;
  }

  // Not logged in, show welcome screen
  return <Redirect href="/welcome" />;
}

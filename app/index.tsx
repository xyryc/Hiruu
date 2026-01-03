import userData from "@/assets/data/user.json";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = false;
  const user = userData.user;

  if (isAuthenticated && user.role === "user") {
    return <Redirect href="/(tabs)/user-home" />;
  } else if (isAuthenticated && user.role === "user") {
    return <Redirect href="/(tabs)/business-home" />;
  }

  return <Redirect href="/welcome" />;
}

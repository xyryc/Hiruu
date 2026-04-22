import { Redirect, useLocalSearchParams } from "expo-router";

export default function UserProfileShareRoute() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();

  if (!userId) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Redirect
      href={{
        pathname: "/screens/jobs/business/user-profile-preview",
        params: { userId: String(userId) },
      }}
    />
  );
}

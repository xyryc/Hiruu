import { registerForFcmToken } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { Image } from "expo-image";
import { getCalendars } from "expo-localization";
import { router } from "expo-router";
import { useEffect } from 'react';
import { Platform, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

const SocialAuth = () => {
  const oauthLogin = useAuthStore((state) => state.oauthLogin);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    })
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      console.log("[GOOGLE_LOGIN] Play services available");
      const result = await GoogleSignin.signIn();
      console.log("[GOOGLE_LOGIN] Google signIn result:", result);
      if (result?.type !== "success") {
        console.error("[GOOGLE_LOGIN] Google signIn not successful:", result?.type);
        return;
      }

      const oAuthToken = result?.data?.idToken!;

      if (!oAuthToken) {
        console.error("[GOOGLE_LOGIN] No oAuthToken returned");
        return;
      }
      console.log("[GOOGLE_LOGIN] oauthId:", oAuthToken);

      const fcmToken = await registerForFcmToken().catch(() => undefined);
      const timeZone = getCalendars()[0]?.timeZone || "UTC";
      console.log("[GOOGLE_LOGIN] oauth payload:", {
        provider: "google",
        hasFcmToken: Boolean(fcmToken),
        timeZone,
      });

      const response = await oauthLogin({
        provider: "google",
        oAuthToken,
        fcmToken,
        timeZone,
      });

      console.log("[GOOGLE_LOGIN] Backend oauth login success:", response);
      toast.success(translateApiMessage(response?.message || "auth_login_success"));
      router.replace("/(tabs)/home");

    } catch (e) {
      console.error("GOOGLE_SIGNIN_ERROR:", e);
      toast.error(
        translateApiMessage((e as any)?.message || "auth_oauth_login_failed")
      );
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== "ios") return;

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential?.identityToken) {
        toast.error(translateApiMessage("auth_oauth_login_failed"));
        return;
      }

      const oAuthToken = credential.identityToken;
      const fcmToken = await registerForFcmToken().catch(() => undefined);
      const timeZone = getCalendars()[0]?.timeZone || "UTC";

      console.log("[APPLE_LOGIN] credential:", {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        hasIdentityToken: Boolean(credential.identityToken),
        authorizationCode: credential.authorizationCode,
        realUserStatus: credential.realUserStatus,
        state: credential.state,
      });
      console.log("[APPLE_LOGIN] oauth payload:", {
        provider: "apple",
        hasFcmToken: Boolean(fcmToken),
        timeZone,
      });

      const response = await oauthLogin({
        provider: "apple",
        oAuthToken,
        fcmToken,
        timeZone,
      });

      console.log("[APPLE_LOGIN] Backend oauth login success:", response);
      toast.success(translateApiMessage(response?.message || "auth_login_success"));
      router.replace("/(tabs)/home");
    } catch (e: any) {
      if (e?.code === "ERR_REQUEST_CANCELED") return;

      console.error("APPLE_SIGNIN_ERROR:", e);
      toast.error(translateApiMessage(e?.message || "auth_oauth_login_failed"));
    }
  };

  return (
    <View className="flex-row justify-center gap-4">
      {/* Google */}
      <TouchableOpacity
        onPress={() => handleGoogleSignIn()}
        className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-sm border border-gray-100">
        <Image
          source={require("@/assets/images/google.svg")}
          style={{
            width: 50,
            height: 50,
          }}
        />
      </TouchableOpacity>

      {/* Facebook */}
      {/* <TouchableOpacity className="w-12 h-12 bg-blue-600 rounded-full justify-center items-center mx-4">
        <Image
          source={require("@/assets/images/facebook.svg")}
          style={{
            width: 50,
            height: 50,
          }}
        />
      </TouchableOpacity> */}

      {/* Apple */}
      {Platform.OS === "ios" ? (
        <TouchableOpacity
          onPress={handleAppleSignIn}
          className="w-12 h-12 bg-black rounded-full justify-center items-center"
        >
          <Image
            source={require("@/assets/images/apple.svg")}
            style={{
              width: 50,
              height: 50,
            }}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SocialAuth;

import { registerForFcmToken } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import { getCalendars } from "expo-localization";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
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

      const oauthId = result?.data?.user?.id;
      if (!oauthId) {
        console.error("[GOOGLE_LOGIN] No oauthId returned");
        return;
      }
      console.log("[GOOGLE_LOGIN] oauthId:", oauthId);

      const fcmToken = await registerForFcmToken().catch(() => undefined);
      const timeZone = getCalendars()[0]?.timeZone || "UTC";
      console.log("[GOOGLE_LOGIN] oauth payload:", {
        provider: "google",
        oauthId,
        hasFcmToken: Boolean(fcmToken),
        timeZone,
      });

      const response = await oauthLogin({
        provider: "google",
        oauthId,
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
      <TouchableOpacity className="w-12 h-12 bg-black rounded-full justify-center items-center">
        <Image
          source={require("@/assets/images/apple.svg")}
          style={{
            width: 50,
            height: 50,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SocialAuth;

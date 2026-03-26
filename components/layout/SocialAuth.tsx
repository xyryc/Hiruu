import { getApp } from "@react-native-firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";



const SocialAuth = () => {
  const auth = getAuth(getApp());

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
    })
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;

      if (!idToken) {
        console.error("No idToken returned");
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);

    } catch (e) {
      console.error("GOOGLE_SIGNIN_ERROR:", e);
    }
  };

  return (
    <View className="flex-row justify-center">
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
      <TouchableOpacity className="w-12 h-12 bg-blue-600 rounded-full justify-center items-center mx-4">
        <Image
          source={require("@/assets/images/facebook.svg")}
          style={{
            width: 50,
            height: 50,
          }}
        />
      </TouchableOpacity>

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

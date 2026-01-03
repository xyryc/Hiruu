import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const SocialAuth = () => {
  return (
    <View className="flex-row justify-center">
      {/* Google */}
      <TouchableOpacity className="w-12 h-12 bg-white rounded-full justify-center items-center shadow-sm border border-gray-100">
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

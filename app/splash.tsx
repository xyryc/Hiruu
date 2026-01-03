import { Image } from "expo-image";
import React from "react";
import { Dimensions, View } from "react-native";

const { width, height } = Dimensions.get("window");

const SplashScreen = () => {
  return (
    <View className="flex-1">
      <Image
        style={{
          width: width,
          height: height,
        }}
        source={require("@/assets/images/splash.png")}
        contentFit="fill"
      />
    </View>
  );
};

export default SplashScreen;

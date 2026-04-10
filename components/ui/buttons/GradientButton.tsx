import { GradientButtonProps } from "@/types";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const GradientButton = ({ title, icon, className, disabled, onPress }: GradientButtonProps) => {
  return (
    <TouchableOpacity className={`${className}`}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={["#4FB2F3", "#4E57FF"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingVertical: 10,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 100,
        }}
      >
        <View className="flex-row items-center gap-3">
          <Text className="font-proximanova-bold text-lg text-[#FFFFFF]">
            {title}
          </Text>

          <View>{icon}</View>
        </View>

        <Image
          source={require("@/assets/images/texture_optimized.png")}
          style={{
            width: "100%",
            height: 44,
            position: "absolute",
            top: 0,
            zIndex: 1,
            opacity: 0.35,
          }}
          contentFit="cover"
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default GradientButton;

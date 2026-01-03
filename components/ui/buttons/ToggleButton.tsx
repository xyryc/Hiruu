import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

export const ToggleButton = ({ isOn, setIsOn, title, className }: any) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isOn ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isOn]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#d1d5db", "#4ade80"],
  });

  return (
    <View className={`flex-row items-center gap-4 mb-2 ${className} `}>
      <Text className="text-sm text-[#7A7A7A]">{title ? title : ""}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsOn(!isOn)}
        style={{ width: 44, height: 22 }}
      >
        <Animated.View
          style={{
            flex: 1,
            borderRadius: 77,
            justifyContent: "center",
            paddingHorizontal: 2,
            marginRight: -4,
            backgroundColor,
          }}
        >
          <Animated.View
            style={{
              width: 18,
              height: 18,
              borderRadius: 14,
              backgroundColor: "white",
              transform: [{ translateX }],
              elevation: 3,
            }}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

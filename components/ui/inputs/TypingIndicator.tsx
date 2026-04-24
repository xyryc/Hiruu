import { TypingIndicatorProps } from "@/types";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

const TypingIndicator = ({ isTyping = false, userName }: TypingIndicatorProps) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTyping) {
      const animateDot = (dot: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation = Animated.parallel([
        animateDot(dot1, 0),
        animateDot(dot2, 200),
        animateDot(dot3, 400),
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [isTyping, dot1, dot2, dot3]);

  if (!isTyping) return null;

  return (
    <View className="flex-row items-center pl-4 py-4 gap-2 bg-[#E5F4FD80]">
      <View className="flex-row gap-1.5 bg-white px-3 py-2 rounded-2xl rounded-bl-sm">
        <Animated.View
          className="w-2 h-2 rounded-full bg-gray-400"
          style={{
            opacity: dot1.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
            transform: [
              {
                translateY: dot1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              },
            ],
          }}
        />
        <Animated.View
          className="w-2 h-2 rounded-full bg-gray-400"
          style={{
            opacity: dot2.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
            transform: [
              {
                translateY: dot2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              },
            ],
          }}
        />
        <Animated.View
          className="w-2 h-2 rounded-full bg-gray-400"
          style={{
            opacity: dot3.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
            transform: [
              {
                translateY: dot3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -3],
                }),
              },
            ],
          }}
        />
      </View>
      {userName && (
        <Text className="text-xs text-gray-500 font-proximanova-regular">
          {userName} is typing...
        </Text>
      )}
    </View>
  );
};

export default TypingIndicator;

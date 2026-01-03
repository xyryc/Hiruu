import { useTheme } from "@/contexts/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Animated, TouchableOpacity, View } from "react-native";

export const AnimatedThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const animatedValue = React.useRef(
    new Animated.Value(isDark ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 24], // 4px to 28px (56px width - 24px circle - 4px padding)
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#D1D5DB", "#10B981"], // gray-300 to green-500
  });

  return (
    <View className="flex-row items-center gap-1.5">
      {/* Moon Icon */}
      <Feather name="moon" size={24} color={isDark ? "#9CA3AF" : "#7A7A7A"} />

      {/* Animated Toggle Switch */}
      <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
        <Animated.View
          style={{
            width: 44,
            height: 22,
            borderRadius: 16,
            backgroundColor,
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={{
              width: 18,
              height: 18,
              borderRadius: 14,
              backgroundColor: "white",
              transform: [{ translateX }],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Sun Icon */}
      <Ionicons name="sunny" size={24} color={isDark ? "#9CA3AF" : "#7A7A7A"} />
    </View>
  );
};

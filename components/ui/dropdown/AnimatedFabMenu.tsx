import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

interface MenuItem {
  id: string | number;
  title: string;
  icon: any;
  onPress?: () => void;
}

interface AnimatedFABMenuProps {
  menuItems: MenuItem[];
  fabIcon?: any;
  fabColor?: string;
  menuItemColor?: string;
}

const AnimatedFABMenu: React.FC<AnimatedFABMenuProps> = ({
  menuItems,
  fabIcon = "add",
  fabColor = "#11293A",
  menuItemColor = "#11293A",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.parallel([
      Animated.spring(animation, {
        toValue,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(rotateAnimation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    toggleMenu();
    setTimeout(() => {
      if (item.onPress) {
        item.onPress();
      }
    }, 300);
  };

  const rotation = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      {/* Backdrop with Blur */}
      {isOpen && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: backdropOpacity,
              zIndex: 999,
            },
          ]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={toggleMenu}
            />
          </BlurView>
        </Animated.View>
      )}

      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const itemAnimation = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(index + 1) * 50],
        });

        const opacityAnimation = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        const scaleAnimation = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        });

        return (
          <Animated.View
            key={item.id}
            className="absolute bottom-16 right-5"
            style={{
              transform: [
                { translateY: itemAnimation },
                { scale: scaleAnimation },
              ],
              opacity: opacityAnimation,
              zIndex: 1000,
            }}
          >
            <TouchableOpacity
              className="bg-white flex-row items-center py-1.5 px-4 rounded-full shadow-lg gap-2.5"
              onPress={() => handleMenuItemPress(item)}
              activeOpacity={0.8}
            >
              <Text
                className="text-base font-proximanova-semibold"
                style={{ color: menuItemColor }}
              >
                {item.title}
              </Text>

              <Ionicons name={item.icon} size={20} color={menuItemColor} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* FAB Button */}
      <Animated.View
        className="absolute bottom-10 right-5"
        style={{
          transform: [{ rotate: rotation }],
          zIndex: 1001,
        }}
      >
        <TouchableOpacity
          className="w-16 h-16 rounded-full justify-center items-center shadow-2xl"
          style={{ backgroundColor: fabColor }}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Ionicons name={fabIcon} size={32} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

export default AnimatedFABMenu;

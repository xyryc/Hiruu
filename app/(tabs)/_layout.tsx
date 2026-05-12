import { useBusinessStore } from "@/stores/businessStore";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Octicons from "@expo/vector-icons/Octicons";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export default function TabLayout() {
  const selectedBusinesses = useBusinessStore((s) => s.selectedBusinesses);
  const isBusinessProfile = selectedBusinesses.length > 0;
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 6);
  const tabBarBaseHeight = 58;
  const tabBarHeight = tabBarBaseHeight + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <Image
            source={require("@/assets/images/tabbar-background.png")}
            contentFit="fill"
            style={{
              position: "absolute",
              bottom: 14,
              width: "100%",
              height: tabBarHeight + 4,
            }}
            cachePolicy="memory"
          />
        ),

        tabBarActiveTintColor: "#4FB2F3",
        tabBarInactiveTintColor: "#A0A0A0",

        tabBarStyle: {
          backgroundColor: "transparent",
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          borderTopWidth: 0,
        },
      }}
    >
      {/* home */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",

          tabBarIcon: ({ color }) => (
            <Octicons name="home-fill" size={24} color={color} />
          ),
        }}
      />

      {/* rewards */}
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "gift" : "gift-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* schedule */}
      <Tabs.Screen
        name="user-schedule"
        options={{
          title: "",
          href: isBusinessProfile ? null : undefined,
          tabBarIcon: () => (
            <View className="bg-[#4FB2F3] h-14 w-14 rounded-full items-center justify-center border-2 border-[#4FB2F34D]">
              <Ionicons name="calendar" size={24} color="white" />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="business-schedule"
        options={{
          title: "",
          href: isBusinessProfile ? undefined : null,
          tabBarIcon: () => (
            <View className="bg-[#4FB2F3] h-14 w-14 rounded-full items-center justify-center">
              <Ionicons name="calendar" size={24} color="white" />
            </View>
          ),
        }}
      />

      {/* user jobs */}
      <Tabs.Screen
        name="user-jobs"
        options={{
          title: "Jobs",
          href: isBusinessProfile ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "briefcase" : "briefcase-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* business jobs */}
      <Tabs.Screen
        name="business-jobs"
        options={{
          title: "Jobs",
          href: isBusinessProfile ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "briefcase" : "briefcase-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* profile */}
      <Tabs.Screen
        name="user-profile"
        options={{
          title: "Profile",
          href: isBusinessProfile ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name={focused ? "user" : "user-o"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* profile */}
      <Tabs.Screen
        name="business-profile"
        options={{
          title: "Profile",
          href: isBusinessProfile ? undefined : null,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name={focused ? "user" : "user-o"}
              size={24}
              color={color}
            />
          ),
        }}
      />


      {/*
      <Tabs.Screen
        name="business-profile"
        options={{
          title: "Profile",
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name={focused ? "user" : "user-o"}
              size={24}
              color={color}
            />
          ),
        }}
      />
     */}
    </Tabs>
  );
}

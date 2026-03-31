import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ServerStatusScreenProps = {
  message?: string;
  onReload: () => void | Promise<void>;
};

const ServerStatusScreen = ({ message, onReload }: ServerStatusScreenProps) => {
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = async () => {
    if (isReloading) return;

    try {
      setIsReloading(true);
      await onReload();
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <View className="flex-1 justify-center px-6">
        <StatusStateCard
          image={require("@/assets/images/errors/error.svg")}
          title="Server Unavailable"
          text={
            message ||
            "Our server is currently unavailable. Please try again shortly."
          }
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            void handleReload();
          }}
          disabled={isReloading}
          className="mt-8 self-center flex-row items-center overflow-hidden rounded-full bg-[#0D2B3F]"
        >
          <View className="px-8 py-3">
            <Text className="font-proximanova-semibold text-sm text-white">
              {isReloading ? "Reloading..." : "Reload"}
            </Text>
          </View>
          <View className="m-1 h-9 w-9 items-center justify-center rounded-full bg-white">
            {isReloading ? (
              <ActivityIndicator size="small" color="#0D2B3F" />
            ) : (
              <Ionicons name="arrow-forward" size={18} color="#0D2B3F" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ServerStatusScreen;

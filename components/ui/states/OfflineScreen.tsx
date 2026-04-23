import StatusStateCard from "@/components/ui/states/StatusStateCard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OfflineScreenProps = {
  onReload: () => void;
};

const OfflineScreen = ({ onReload }: OfflineScreenProps) => {
  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <View className="flex-1 justify-center px-6">
        <StatusStateCard
          image={require("@/assets/images/errors/offline.svg")}
          title="You're Offline"
          text="Please check your internet connection and try again later"
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onReload}
          className="mt-8 self-center flex-row items-center overflow-hidden rounded-full bg-[#0D2B3F]"
        >
          <View className="px-8 py-3">
            <Text className="font-proximanova-semibold text-sm text-white">
              Reload
            </Text>
          </View>
          <View className="m-1 h-9 w-9 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-forward" size={18} color="#0D2B3F" />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OfflineScreen;

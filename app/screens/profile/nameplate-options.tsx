import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import { useAuthStore } from "@/stores/authStore";
import { useRewardStore } from "@/stores/rewardStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const YourNamePlates = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const user = useAuthStore((state) => state.user);
  const {
    cosmeticsInventoryItems,
    cosmeticsInventoryLoading,
    isEquippingNameplate,
    fetchCosmeticsInventory,
    equipNameplate,
  } = useRewardStore();
  const [selected, setSelected] = useState("none");

  const profileAddress =
    user?.address?.address ||
    [user?.address?.city, user?.address?.country].filter(Boolean).join(", ");

  const nameplateItems = useMemo(
    () =>
      cosmeticsInventoryItems.filter(
        (item) => item?.cosmetic?.type === "nameplate" && item?.cosmetic?.metadata
      ),
    [cosmeticsInventoryItems]
  );

  useEffect(() => {
    fetchCosmeticsInventory({ type: "nameplate", page: 1 }).catch(() => null);
  }, [fetchCosmeticsInventory]);

  useEffect(() => {
    const equipped = nameplateItems.find((item) => item?.isEquipped);
    setSelected(equipped?.cosmeticId || "none");
  }, [nameplateItems]);

  const handleApply = async () => {
    try {
      await equipNameplate(selected === "none" ? null : selected);
      toast.success(translateApiMessage("appearance_updated_successfully"));
      router.back();
    } catch (error: any) {
      toast.error(translateApiMessage(error?.message || "UNKNOWN_ERROR"));
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{
          paddingTop: insets.top + 10,
        }}
        className="bg-[#E5F4FD] rounded-b-2xl px-4 pb-4"
        onPressBack={() => router.back()}
        title="Your Nameplates"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <TouchableOpacity
            onPress={() => router.push("/screens/rewards/nameplate")}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
          >
            <MaterialIcons name="storefront" size={18} color="black" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        className="pt-6 px-5"
        contentContainerStyle={{
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* none */}
        <TouchableOpacity
          className="p-3 border border-secondary rounded-[10px] flex-row justify-between items-center"
          onPress={() => setSelected("none")}
        >
          <View className="flex-row items-center gap-2.5">
            <Ionicons name="ban-outline" size={24} color="black" />
            <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary">
              None
            </Text>
          </View>

          <Ionicons
            name={selected === "none" ? "radio-button-on" : "radio-button-off"}
            size={20}
            color="#11293A"
          />
        </TouchableOpacity>

        {/* dynamic nameplate cards */}
        {cosmeticsInventoryLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="large" color="#4FB2F3" />
          </View>
        ) : (
          <View className="mt-3 gap-3">
            {nameplateItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="relative"
                onPress={() => setSelected(item.cosmeticId)}
                activeOpacity={0.9}
              >
                <DynamicNameplateCard
                  metadata={item?.cosmetic?.metadata || undefined}
                  mode="redeem"
                  preview={{
                    avatarUrl: user?.avatar || null,
                    name: user?.name || "User",
                    location: profileAddress || "Location unavailable",
                    rating: user?.rating ?? 0,
                    isVerified: Boolean(user?.isEmailVerified),
                  }}
                />

                <View className="absolute top-14 right-3 bg-white/90 rounded-full">
                  <Ionicons
                    name={selected === item.cosmeticId ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color="#11293A"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <PrimaryButton
        title="Apply"
        className="mx-5 mt-3"
        onPress={handleApply}
        loading={isEquippingNameplate}
      />
    </SafeAreaView>
  );
};

export default YourNamePlates;

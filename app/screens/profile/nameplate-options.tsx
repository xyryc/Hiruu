import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import { useAuthStore } from "@/stores/authStore";
import { useRewardStore } from "@/stores/rewardStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
  const { t } = useTranslation();
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

  useFocusEffect(
    useCallback(() => {
      fetchCosmeticsInventory({ type: "nameplate", page: 1, append: false }).catch(
        () => null
      );
      return () => { };
    }, [fetchCosmeticsInventory])
  );

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
        title={t("user.profile.nameplateOptions.yourNameplates")}
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
        components={
          <TouchableOpacity
            onPress={() => router.push("/screens/rewards/nameplate")}
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
          >

            <Feather name="shopping-bag" size={18} color="black" />
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
              {t("user.profile.nameplateOptions.none")}
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
          <View className="mt-4 gap-4" pointerEvents="none">
              {Array.from({ length: 4 }).map((_, index) => (
                <View key={`nameplate-skeleton-${index}`}>
                  <View className="h-5 w-40 rounded-md bg-[#E5E7EB] mb-2.5" />
                  <View className="h-[116px] rounded-[14px] bg-[#E5E7EB] border border-[#EEEEEE]" />
                  <View className="absolute top-12 right-3 h-6 w-6 rounded-full bg-[#D1D5DB]" />
                </View>
              ))}
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {nameplateItems.map((item) => (
              <View key={item?.id || item?.cosmeticId || item?.cosmetic?.id}>
                <Text className='text-base font-proximanova-semibold mb-2.5'>{item?.cosmetic?.name}</Text>


                <TouchableOpacity
                  className="relative"
                  onPress={() => setSelected(item.cosmeticId)}
                  activeOpacity={0.9}
                >
                  <DynamicNameplateCard
                    metadata={item?.cosmetic?.metadata || undefined}
                    mode="redeem"
                    preview={{
                      avatarUrl: user?.avatar || null,
                      name: user?.name || t("user.profile.nameplateOptions.user"),
                      location: profileAddress || t("user.profile.businessProfile.locationUnavailable"),
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

              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <PrimaryButton
        title={t("user.profile.nameplateOptions.apply")}
        className="mx-5 mt-3"
        onPress={handleApply}
        loading={isEquippingNameplate}
      />
    </SafeAreaView>
  );
};

export default YourNamePlates;

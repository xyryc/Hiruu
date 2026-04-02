import ScreenHeader from "@/components/header/ScreenHeader";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import RedeemModal from "@/components/ui/modals/RedeemModal";
import { walletService } from "@/services/walletService";
import { useAuthStore } from "@/stores/authStore";
import { useRewardStore } from "@/stores/rewardStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const tabs = ["limited time", "featured", "all"] as const;
type TabType = (typeof tabs)[number];

const Nameplate = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNameplateIndex, setSelectedNameplateIndex] = useState(0);
  const [selectedCoinPrice, setSelectedCoinPrice] = useState(0);
  const [isActive, setIsActive] = useState<TabType>("limited time");
  const [totalTokens, setTotalTokens] = useState(0);

  const cosmeticsStoreItems = useRewardStore((state) => state.cosmeticsStoreItems);
  const cosmeticsStoreLoading = useRewardStore((state) => state.cosmeticsStoreLoading);
  const fetchCosmeticsStore = useRewardStore((state) => state.fetchCosmeticsStore);
  const user = useAuthStore((state) => state.user as any);

  const highlightParam = useMemo(() => {
    if (isActive === "limited time") return "limited" as const;
    if (isActive === "featured") return "featured" as const;
    return "" as const;
  }, [isActive]);

  const loadWallet = useCallback(async () => {
    try {
      const result = await walletService.getWallet();
      const nextTokens = Number(result?.data?.coins ?? result?.data?.wallet?.coins);
      setTotalTokens(Number.isFinite(nextTokens) ? nextTokens : 0);
    } catch {
      setTotalTokens(0);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadNameplates = async () => {
      try {
        await fetchCosmeticsStore({
          type: "nameplate",
          highlight: highlightParam,
          page: 1,
          limit: 100,
          append: false,
        });
      } catch (error: any) {
        if (active) {
          toast.error(
            translateApiMessage(error?.message || "Failed to load nameplates")
          );
        }
      }
    };

    loadNameplates();

    return () => {
      active = false;
    };
  }, [fetchCosmeticsStore, highlightParam]);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  const modalHandle = (item: any, index: number) => {
    const coinPrice =
      typeof item?.coinPrice === "number" && Number.isFinite(item.coinPrice)
        ? item.coinPrice
        : 0;

    setSelectedCoinPrice(coinPrice);
    setSelectedNameplateIndex(index);
    setModalVisible(true);
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const profilePreviewData = useMemo(() => {
    const location =
      user?.address?.address ||
      user?.address?.city ||
      user?.address?.state ||
      user?.address?.country ||
      "Location unavailable";

    const numericRating = Number(user?.rating ?? 0);
    const safeRating = Number.isFinite(numericRating) ? numericRating.toFixed(1) : "0.0";

    return {
      avatarUrl: user?.avatar || null,
      name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User",
      location,
      rating: safeRating,
      isVerified: true,
      coins: "05",
      locked: true,
      availabilityLabel: "Available for",
      remainingTime: "1d, 10h",
    };
  }, [user]);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["left", "right", "bottom"]}
    >
      <View className="bg-[#E5F4FD] rounded-b-2xl pt-10 px-5 -z-30">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="Buy Nameplate"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <View className="flex-row items-center -z-20">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 32,
                  height: 32,
                }}
                contentFit="contain"
              />
              <View className="px-4 py-2 bg-white -ml-3 -z-10 rounded-r-[40px]">
                <Text className="text-sm font-proximanova-semibold">{totalTokens}</Text>
              </View>
            </View>
          }
        />
        <View className="flex-row mx-5">
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className={`w-1/3 pb-2 ${isActive === tab ? "border-[#11293A] border-b-2" : "border-b-hairline"
                }`}
              onPress={() => setIsActive(tab)}
            >
              <Text
                className={`text-center ${isActive === tab
                  ? "font-proximanova-semibold text-base text-primary dark:text-dark-primary"
                  : "font-proximanova-regular text-secondary dark:text-dark-secondary"
                  }`}
              >
                <Text className="capitalize">{tab}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="bg-white px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary mt-8">
          Note: Premium Required: Only premium users can use nameplates.
        </Text>

        {cosmeticsStoreLoading ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
          </View>
        ) : cosmeticsStoreItems.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-secondary dark:text-dark-secondary">
              No nameplates found.
            </Text>
          </View>
        ) : (
          cosmeticsStoreItems.map((item, index) => (
            <TouchableOpacity
              key={item?.id || String(index)}
              onPress={() => modalHandle(item, index)}
              className={index === 0 ? "mt-8" : "mt-5"}
            >
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
                {item?.name || "Nameplate"}
              </Text>

              <DynamicNameplateCard
                metadata={item?.metadata}
                preview={{
                  coins:
                    typeof item?.coinPrice === "number" && Number.isFinite(item.coinPrice)
                      ? item.coinPrice
                      : 0,
                }}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <RedeemModal
        namePlate={
          <DynamicNameplateCard
            metadata={cosmeticsStoreItems[selectedNameplateIndex]?.metadata}
            mode="redeem"
            preview={profilePreviewData}
          />
        }
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        coinPrice={selectedCoinPrice}
        totalTokens={totalTokens}
      />
    </SafeAreaView>
  );
};

export default Nameplate;

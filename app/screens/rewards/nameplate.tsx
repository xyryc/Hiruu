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
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const tabs = ["limited time", "featured", "all"] as const;
type TabType = (typeof tabs)[number];

const NameplateRowSkeleton = ({ isFirst }: { isFirst?: boolean }) => (
  <View className={isFirst ? "mt-8" : "mt-5"}>
    <View className="flex-row items-center justify-between mb-2.5">
      <View className="h-4 w-36 rounded-md bg-[#E5E7EB]" />
      <View className="h-3 w-24 rounded-md bg-[#E5E7EB]" />
    </View>
    <View className="border border-[#EEEEEE] rounded-[14px] p-4 bg-white">
      <View className="h-5 w-32 rounded-md bg-[#E5E7EB]" />
      <View className="mt-4 h-16 rounded-xl bg-[#F3F4F6]" />
      <View className="mt-4 h-10 rounded-full bg-[#E5E7EB]" />
    </View>
  </View>
);

const Nameplate = () => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNameplateIndex, setSelectedNameplateIndex] = useState(0);
  const [selectedNameplateId, setSelectedNameplateId] = useState("");
  const [selectedCoinPrice, setSelectedCoinPrice] = useState(0);
  const [isActive, setIsActive] = useState<TabType>("limited time");
  const [totalTokens, setTotalTokens] = useState(0);
  const insets = useSafeAreaInsets();

  const cosmeticsStoreItems = useRewardStore((state) => state.cosmeticsStoreItems);
  const cosmeticsStoreLoading = useRewardStore((state) => state.cosmeticsStoreLoading);
  const isPurchasingCosmetic = useRewardStore((state) => state.isPurchasingCosmetic);
  const isEquippingNameplate = useRewardStore((state) => state.isEquippingNameplate);
  const fetchCosmeticsStore = useRewardStore((state) => state.fetchCosmeticsStore);
  const fetchCosmeticsInventory = useRewardStore((state) => state.fetchCosmeticsInventory);
  const purchaseCosmetic = useRewardStore((state) => state.purchaseCosmetic);
  const equipNameplate = useRewardStore((state) => state.equipNameplate);
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

  const localizedExpiryLabel = useCallback(
    (expiresAt?: string | null) => {
      if (!expiresAt) return t("user.profile.nameplateStore.owned");
      const date = new Date(expiresAt);
      if (Number.isNaN(date.getTime())) return t("user.profile.nameplateStore.owned");
      return t("user.profile.nameplateStore.ownedExpires", {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      });
    },
    [t]
  );

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
            translateApiMessage(error?.message || t("user.profile.nameplateStore.failedToLoadNameplates"))
          );
        }
      }
    };

    loadNameplates();

    return () => {
      active = false;
    };
  }, [fetchCosmeticsStore, highlightParam, t]);

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

    setSelectedNameplateId(item?.id || "");
    setSelectedCoinPrice(coinPrice);
    setSelectedNameplateIndex(index);
    setModalVisible(true);
  };

  const handleConfirmAction = useCallback(async () => {
    const selectedItem = cosmeticsStoreItems[selectedNameplateIndex];
    if (!selectedNameplateId || !selectedItem) return;

    try {
      if (selectedItem?.isOwnedActive) {
        if (selectedItem?.isEquipped) {
          toast.success(t("user.profile.nameplateStore.alreadyEquipped"));
          setModalVisible(false);
          return;
        }

        const result = await equipNameplate(selectedNameplateId);
        toast.success(
          translateApiMessage(result?.message || t("user.profile.nameplateStore.equippedSuccessfully"))
        );
      } else {
        const result = await purchaseCosmetic(selectedNameplateId);
        const nextBalance = Number(result?.newBalance ?? 0);
        if (Number.isFinite(nextBalance)) {
          setTotalTokens(nextBalance);
        }
        toast.success(
          translateApiMessage(result?.message || t("user.profile.nameplateStore.purchaseSuccessful"))
        );
      }

      setModalVisible(false);

      await fetchCosmeticsStore({
        type: "nameplate",
        highlight: highlightParam,
        page: 1,
        limit: 100,
        append: false,
      });
      await fetchCosmeticsInventory({
        type: "nameplate",
        page: 1,
        limit: 100,
        append: false,
      });
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || t("user.profile.nameplateStore.failedToUpdateNameplate"))
      );
    }
  }, [
    cosmeticsStoreItems,
    equipNameplate,
    fetchCosmeticsStore,
    fetchCosmeticsInventory,
    highlightParam,
    purchaseCosmetic,
    selectedNameplateId,
    selectedNameplateIndex,
    t,
  ]);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const profilePreviewData = useMemo(() => {
    const location =
      user?.address?.address ||
      user?.address?.city ||
      user?.address?.state ||
      user?.address?.country ||
      t("user.profile.businessProfile.locationUnavailable");

    const numericRating = Number(user?.rating ?? 0);
    const safeRating = Number.isFinite(numericRating) ? numericRating.toFixed(1) : "0.0";

    return {
      avatarUrl: user?.avatar || null,
      name:
        user?.name ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        t("user.profile.nameplateOptions.user"),
      location,
      rating: safeRating,
      isVerified: true,
      coins: "05",
      locked: true,
      availabilityLabel: t("user.profile.nameplateStore.availableFor"),
      remainingTime: "1d, 10h",
    };
  }, [t, user]);

  const selectedItem = cosmeticsStoreItems[selectedNameplateIndex];
  const skeletonRows = useMemo(
    () => Array.from({ length: 5 }, (_, index) => ({ id: `nameplate-skeleton-${index}` })),
    []
  );
  const getTabLabel = (tab: TabType) => {
    if (tab === "limited time") return t("user.profile.nameplateStore.tabs.limitedTime");
    if (tab === "featured") return t("user.profile.nameplateStore.tabs.featured");
    return t("user.profile.nameplateStore.tabs.all");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <StatusBar
        style={isDark ? "light" : "dark"}
        backgroundColor="#E5F4FD"
        translucent={false}
      />
      <View
        className="bg-[#E5F4FD] rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
          onPressBack={() => router.back()}
          title={t("user.profile.nameplateStore.buyNameplate")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
          components={
            <View className="flex-row items-center -z-20">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{ width: 32, height: 32 }}
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
                <Text className="capitalize">{getTabLabel(tab)}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="bg-white px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary mt-8">
          {t("user.profile.nameplateStore.premiumRequiredNote")}
        </Text>

        {cosmeticsStoreLoading ? (
          <View pointerEvents="none">
            {skeletonRows.map((item, index) => (
              <NameplateRowSkeleton key={item.id} isFirst={index === 0} />
            ))}
          </View>
        ) : cosmeticsStoreItems.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-secondary dark:text-dark-secondary">
              {t("user.profile.nameplateStore.noNameplatesFound")}
            </Text>
          </View>
        ) : (
          cosmeticsStoreItems.map((item, index) => (
            <TouchableOpacity
              key={item?.id || String(index)}
              onPress={() => modalHandle(item, index)}
              className={index === 0 ? "mt-8" : "mt-5"}
            >
              <View className="flex-row items-center justify-between mb-2.5">
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  {item?.name || t("user.profile.nameplateStore.nameplate")}
                </Text>

                {item?.isOwnedActive && (
                  <Text className="text-xs text-secondary dark:text-dark-secondary">
                    {localizedExpiryLabel(item?.expiresAt)}
                  </Text>
                )}
              </View>

              <DynamicNameplateCard
                metadata={item?.metadata}
                preview={{
                  coins:
                    typeof item?.coinPrice === "number" && Number.isFinite(item.coinPrice)
                      ? item.coinPrice
                      : 0,
                  locked: !item?.isOwnedActive,
                  isOwnedActive: Boolean(item?.isOwnedActive),
                  isEquipped: Boolean(item?.isEquipped),
                  expiresAt: item?.expiresAt ?? null,
                }}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <RedeemModal
        namePlate={
          <DynamicNameplateCard
            metadata={selectedItem?.metadata}
            mode="redeem"
            preview={profilePreviewData}
          />
        }
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        coinPrice={selectedCoinPrice}
        totalTokens={totalTokens}
        isOwned={Boolean(selectedItem?.isOwnedActive)}
        isEquipped={Boolean(selectedItem?.isEquipped)}
        ownedExpiry={selectedItem?.expiresAt ?? null}
        onConfirm={handleConfirmAction}
        confirming={isPurchasingCosmetic || isEquippingNameplate}
      />
    </SafeAreaView>
  );
};

export default Nameplate;

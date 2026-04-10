import ScreenHeader from "@/components/header/ScreenHeader";
import RedeemModal from "@/components/ui/modals/RedeemModal";
import { walletService } from "@/services/walletService";
import { useBusinessStore } from "@/stores/businessStore";
import { useRewardStore } from "@/stores/rewardStore";
import { useUserSelectionStore } from "@/stores/userSelectionStore";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type RedeemModalData = {
  img: any;
  title: string;
  subtitle: string;
  coin: string;
  detailsTitle: string;
  details: string[];
  confirmTitle?: string;
  cardBgColor?: string;
  options?: { id: string; label: string }[];
  selectedOptionId?: string;
  onSelectOption?: (id: string) => void;
  showSelectUser?: boolean;
  selectUserLabel?: string;
  selectUserAvatar?: string | null;
  onPressSelectUser?: () => void;
};

const premiumConfig = {
  img: require("@/assets/images/reward/premium.svg"),
  title: "Buy 1 Month Premium",
  subtitle: "Unlock premium features for yourself",
  coin: "200",
  detailsTitle: "Premium Benefits Overview",
  details: [
    "Access to nameplate designs",
    "Profile boost",
    "Early access to job listings",
  ],
  confirmTitle: "Confirm Purchase",
  cardBgColor: "#EFF9FF",
};

const giftConfig = {
  img: require("@/assets/images/reward/giftbox.svg"),
  title: "Gift 1 Month Premium",
  subtitle: "Send premium access to a friend",
  coin: "300",
  detailsTitle: "Gift Premium For A Month",
  details: [
    "Send 1 month of premium access to another user. They’ll receive all premium benefits instantly",
  ],
  confirmTitle: "Continue Gift",
  cardBgColor: "#FEEFE5",
  showSelectUser: true,
  selectUserLabel: "Select a user to gift",
};

const featureMeConfig = {
  img: require("@/assets/images/reward/finder.svg"),
  title: "Feature Me",
  subtitle: "Get noticed by top companies faster.",
  coin: "1000",
  detailsTitle: "Be feature profile as user",
  details: [
    "Push your profile higher in discovery results",
    "Increase visibility to hiring businesses",
    "Useful when you want faster attention on your profile",
    "Pricing varies by selected duration",
  ],
  confirmTitle: "Continue Feature",
  cardBgColor: "#E3F6E7",
};

const FEATURE_ME_OPTIONS = [
  { id: "6h", label: "6 hours – 1,000 Tokens" },
  { id: "12h", label: "12 hours – 2,000 Tokens" },
  { id: "24h", label: "24 hours – 3,000 Tokens" },
  { id: "42h", label: "42 hours – 4,200 Tokens" },
] as const;

const featureJobConfig = {
  img: require("@/assets/images/reward/purple-toolbox.svg"),
  title: "Feature Job",
  subtitle: "Boost your job profile visibility.",
  coin: "200",
  detailsTitle: "Feature Job Visibility",
  details: [
    "Highlight your recruitment in listings",
    "Improve discoverability for candidates",
    "Useful for urgent or competitive hiring needs",
    "Visibility boost lasts for the selected duration",
  ],
  confirmTitle: "Continue Feature",
  cardBgColor: "#F7EEFF",
};

const nameplateConfig = {
  img: require("@/assets/images/reward/designs.svg"),
  title: "Unlock Nameplate Designs",
  subtitle: "Choose profile nameplate styles",
  coin: "200",
  detailsTitle: "Nameplate Unlock Details",
  details: [
    "Unlock premium cosmetic nameplate designs",
    "Customize your profile look with more styles",
    "Applies to visual presentation only",
  ],
  confirmTitle: "View Nameplates",
  cardBgColor: "#FFFCEE",
};

const GIFT_PREMIUM_SELECTION_KEY = "gift-premium-user";
type RedeemItemKey =
  | "buy_1_month_premium"
  | "gift_1_month_premium"
  | "feature_job"
  | "feature_me"
  | "unlock_nameplate_designs";

const RedeemTokens = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [selectedFeatureMeOption, setSelectedFeatureMeOption] = useState<string>("6h");
  const [selectedRedeemKey, setSelectedRedeemKey] = useState<RedeemItemKey | null>(null);
  const [data, setData] = useState<RedeemModalData>({
    img: "",
    title: "",
    subtitle: "",
    coin: "",
    detailsTitle: "",
    details: [],
  });
  const selectedUser = useUserSelectionStore(
    (state) => state.selectedUsersByKey[GIFT_PREMIUM_SELECTION_KEY] || null
  );
  const coreRedeemItems = useRewardStore((state) => state.coreRedeemItems);
  const fetchCoreRedeemItems = useRewardStore((state) => state.fetchCoreRedeemItems);
  const redeemCoreItem = useRewardStore((state) => state.redeemCoreItem);
  const isRedeemingCoreItem = useRewardStore((state) => state.isRedeemingCoreItem);
  const selectedBusinessId = useBusinessStore((state) => state.selectedBusinesses?.[0]);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
    let mounted = true;

    const loadRedeemItems = async () => {
      try {
        const items = await fetchCoreRedeemItems();

        if (!mounted) return;
        if (!Array.isArray(items)) return;
      } catch (error: any) {
        toast.error(error?.message || "Failed to load redeem items");
      }
    };

    void loadRedeemItems();

    return () => {
      mounted = false;
    };
  }, [fetchCoreRedeemItems]);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet])
  );

  useEffect(() => {
    if (!modalVisible) return;
    if (selectedRedeemKey !== "gift_1_month_premium") return;

    setData((prev) => ({
      ...prev,
      selectUserLabel: selectedUser?.name || "Select a user to gift",
      selectUserAvatar: selectedUser?.avatar || null,
    }));
  }, [modalVisible, selectedRedeemKey, selectedUser]);

  const getItemPrice = useMemo(() => {
    const priceMap = new Map<string, number>();

    coreRedeemItems.forEach((item) => {
      const firstPrice = Array.isArray(item?.priceRange)
        ? item.priceRange.find((priceItem) => typeof priceItem?.price === "number")
        : null;

      priceMap.set(
        item.key,
        typeof firstPrice?.price === "number" ? firstPrice.price : 0
      );
    });

    return (key: string, fallback: string) => {
      const value = priceMap.get(key);
      return typeof value === "number" && Number.isFinite(value)
        ? String(value)
        : fallback;
    };
  }, [coreRedeemItems]);

  const openRedeemModal = (
    config: Omit<RedeemModalData, "coin" | "details"> & {
      coin: string;
      details: string[];
    },
    key: string,
    priceLabel?: string
  ) => {
    const coin = getItemPrice(key, priceLabel || config.coin);
    setData({
      ...config,
      coin,
      details: [
        ...config.details,
        `Token Cost: ${coin} Tokens`,
        `Current Token Balance: ${totalTokens} Tokens`,
      ],
    });
    setModalVisible(true);
  };

  const getDefaultRedeemTiming = (
    key: RedeemItemKey,
    fallback: { duration: number; unit: "min" | "hr" | "day" | "week" | "month" | "year" }
  ) => {
    const target = coreRedeemItems.find((item) => item?.key === key);
    const firstPrice = Array.isArray(target?.priceRange) ? target?.priceRange[0] : null;

    return {
      duration:
        typeof firstPrice?.duration === "number" ? firstPrice.duration : fallback.duration,
      unit:
        firstPrice?.unit && typeof firstPrice.unit === "string"
          ? firstPrice.unit
          : fallback.unit,
    };
  };

  const buildRedeemPayload = () => {
    if (!selectedRedeemKey) return null;

    if (selectedRedeemKey === "buy_1_month_premium") {
      return getDefaultRedeemTiming(selectedRedeemKey, { duration: 30, unit: "day" });
    }

    if (selectedRedeemKey === "gift_1_month_premium") {
      if (!selectedUser?.id) {
        toast.error("Please select a user to gift");
        return null;
      }
      return {
        ...getDefaultRedeemTiming(selectedRedeemKey, { duration: 30, unit: "day" }),
        targetUserId: selectedUser.id,
      };
    }

    if (selectedRedeemKey === "feature_job") {
      if (!selectedBusinessId) {
        toast.error("Please select a business profile first");
        return null;
      }
      return {
        ...getDefaultRedeemTiming(selectedRedeemKey, { duration: 7, unit: "day" }),
        businessId: selectedBusinessId,
      };
    }

    if (selectedRedeemKey === "feature_me") {
      const optionMap: Record<string, { duration: number; unit: "hr" }> = {
        "6h": { duration: 6, unit: "hr" },
        "12h": { duration: 12, unit: "hr" },
        "24h": { duration: 24, unit: "hr" },
        "42h": { duration: 42, unit: "hr" },
      };

      return optionMap[selectedFeatureMeOption] || optionMap["6h"];
    }

    if (selectedRedeemKey === "unlock_nameplate_designs") {
      return getDefaultRedeemTiming(selectedRedeemKey, { duration: 0, unit: "day" });
    }

    return null;
  };

  const handleRedeem = async () => {
    if (!selectedRedeemKey) return;
    const payload = buildRedeemPayload();
    if (!payload) return;

    try {
      const result = await redeemCoreItem(selectedRedeemKey, payload);
      toast.success(result?.message || "Redeemed successfully");
      setModalVisible(false);
      await loadWallet();
    } catch (error: any) {
      toast.error(error?.message || "Failed to redeem item");
    }
  };

  const handleModal = (key: string) => {
    if (key === "premium") {
      setSelectedRedeemKey("buy_1_month_premium");
      const coin = getItemPrice("buy_1_month_premium", premiumConfig.coin);
      setData({
        ...premiumConfig,
        coin,
        details: [
          "Access to nameplate designs",
          "Profile boost",
          "Early access to job listings",
          `Token Cost: ${coin} Tokens`,
          "Duration: Valid for 1 Month",
          `Current Token Balance: ${totalTokens} Tokens`,
        ],
      });
      setModalVisible(true);
    } else if (key === "gift") {
      setSelectedRedeemKey("gift_1_month_premium");
      const coin = getItemPrice("gift_1_month_premium", giftConfig.coin);
      setData({
        ...giftConfig,
        coin,
        details: [
          "Send 1 month of premium access to another user. They’ll receive all premium benefits instantly",
          `Token Cost: ${coin} Tokens`,
          `Current Token Balance: ${totalTokens} Tokens`,
        ],
        selectUserLabel: selectedUser?.name || "Select a user to gift",
        selectUserAvatar: selectedUser?.avatar || null,
        onPressSelectUser: () =>
          router.push({
            pathname: "/screens/common/select-user",
            params: {
              selectionKey: GIFT_PREMIUM_SELECTION_KEY,
              title: "Select User",
              searchPlaceholder: "Search user...",
            },
          }),
      });
      setModalVisible(true);
    } else if (key === "job") {
      setSelectedRedeemKey("feature_job");
      openRedeemModal(featureJobConfig, "feature_job", featureJobConfig.coin);
    } else if (key === "me") {
      setSelectedRedeemKey("feature_me");
      const handleSelectFeatureMeOption = (id: string) => {
        setSelectedFeatureMeOption(id);
        setData((prev) => ({
          ...prev,
          selectedOptionId: id,
        }));
      };

      setData({
        ...featureMeConfig,
        coin: getItemPrice("feature_me", featureMeConfig.coin),
        details: [
          "Boost your visibility by appearing at the top of the Job Finder page for a selected duration",
          `Current Token Balance: ${totalTokens} Tokens`,
        ],
        options: FEATURE_ME_OPTIONS.map((option) => ({ ...option })),
        selectedOptionId: selectedFeatureMeOption,
        onSelectOption: handleSelectFeatureMeOption,
      });
      setModalVisible(true);
    } else if (key === "nameplate") {
      setSelectedRedeemKey("unlock_nameplate_designs");
      openRedeemModal(
        nameplateConfig,
        "unlock_nameplate_designs",
        nameplateConfig.coin
      );
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-6 rounded-b-3xl pt-2.5 overflow-hidden"
        title="Redeem Tokens"
        titleClass="text-primary "
        iconColor={isDark ? "#fff" : "#111111"}
        components={
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/hiruu-coin.svg")}
              style={{
                width: 32,
                height: 32,
              }}
              contentFit="contain"
            />
            <View className="px-4 py-2 bg-[#DDF1FF] -ml-3 -z-10 rounded-r-[40px]">
              <Text className="text-sm font-proximanova-semibold">{totalTokens}</Text>
            </View>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="flex-row gap-5 justify-between mx-5 mt-5">
          <TouchableOpacity
            className="items-center bg-[#EFF9FF] -z-30 p-4 rounded-xl mx-auto w-[46%] border border-[#4FB2F330]"
            onPress={() => handleModal("premium")}
          >
            <Image
              source={require("@/assets/images/reward/premium.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              Buy 1 Month Premium
            </Text>

            <Text className="font-proximanova-regular text-secondary text-center text-sm mt-2 w-4/5">
              Unlock premium features for yourself
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center justify-between">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10 -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    {getItemPrice("buy_1_month_premium", "200")}
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleModal("gift")}
            className="items-center bg-[#FEEFE5] -z-30 p-4 rounded-xl mx-auto w-[46%] border border-[#F68A2630]"
          >
            <Image
              source={require("@/assets/images/reward/giftbox.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary  mt-2.5 w-2/3 text-center">
              Gift 1 Month Premium
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              Send premium access to a friend
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    {getItemPrice("gift_1_month_premium", "200")}
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-5 justify-between mx-5 mt-5">
          <TouchableOpacity
            onPress={() => handleModal("me")}
            className="items-center bg-[#E3F6E7] -z-30 p-4 rounded-xl mx-auto w-[46%] border border-[#3EBF5A30]"
          >
            <Image
              source={require("@/assets/images/reward/finder.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              Feature Me
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              Get noticed by top companies faster
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center justify-between">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10 -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    {getItemPrice("feature_me", "1000")}
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleModal("job")}
            className="items-center bg-[#F7EEFF] mx-auto -z-30 p-4 rounded-xl w-[46%] border border-[#C583FF30]"
          >
            <Image
              source={require("@/assets/images/reward/purple-toolbox.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              Feature Job
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              Get noticed by top Employees faster
            </Text>

            <View className="flex-row items-center gap-1.5 mt-2.5">
              <View className="flex-row -z-20 items-center">
                <Image
                  source={require("@/assets/images/hiruu-coin.svg")}
                  style={{
                    width: 22,
                    height: 22,
                  }}
                  contentFit="contain"
                />
                <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
                  <Text className="text-xs font-proximanova-semibold text-primary ">
                    {getItemPrice("feature_job", "200")}
                  </Text>
                </View>
              </View>
              <Feather
                name="arrow-right"
                className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE]"
                size={20}
                color="black"
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => handleModal("nameplate")}
          className="bg-[#FFFCEE] mx-5 items-center -z-30 mt-3 rounded-xl border border-[#EEDA8130] p-4"
        >
          <Image
            source={require("@/assets/images/reward/designs.svg")}
            contentFit="contain"
            style={{ width: 60, height: 60 }}
          />
          <Text className="font-proximanova-semibold text-primary  mt-2.5">
            Unlock Nameplate Designs
          </Text>
          <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2">
            Choose profile nameplate styles
          </Text>
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <View className="flex-row -z-20 items-center">
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
              <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
                <Text className="text-xs font-proximanova-semibold text-primary ">
                  {getItemPrice("unlock_nameplate_designs", "200")}
                </Text>
              </View>
            </View>
            <Feather
              name="arrow-right"
              className="bg-white p-1 rounded-full border-hairline border-[#EEEEEE] "
              size={20}
              color="black"
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      <RedeemModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedRedeemKey(null);
        }}
        data={data}
        totalTokens={totalTokens}
        onConfirm={handleRedeem}
        confirming={isRedeemingCoreItem}
      />
    </SafeAreaView>
  );
};

export default RedeemTokens;

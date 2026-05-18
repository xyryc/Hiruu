import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessSelectionTrigger from "@/components/ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import RedeemModal from "@/components/ui/modals/RedeemModal";
import { walletService } from "@/services/walletService";
import { useJobStore } from "@/stores/jobStore";
import { useRewardStore } from "@/stores/rewardStore";
import { useUserSelectionStore } from "@/stores/userSelectionStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { t } from "i18next";
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
  showSelectBusiness?: boolean;
  selectBusinessTrigger?: React.ReactNode;
};

const premiumConfig = {
  img: require("@/assets/images/premium.svg"),
  title: t("user.profile.redeemTokens.buyPremiumTitle"),
  subtitle: t("user.profile.redeemTokens.buyPremiumSubtitle"),
  coin: "200",
  detailsTitle: t("user.profile.redeemTokens.premiumBenefitsTitle"),
  details: [
    t("user.profile.redeemTokens.benefitNameplates"),
    t("user.profile.redeemTokens.benefitProfileBoost"),
    t("user.profile.redeemTokens.benefitEarlyAccess"),
  ],
  confirmTitle: t("user.profile.redeemTokens.confirmPurchase"),
  cardBgColor: "#EFF9FF",
};

const giftConfig = {
  img: require("@/assets/images/giftbox.svg"),
  title: t("user.profile.redeemTokens.giftPremiumTitle"),
  subtitle: t("user.profile.redeemTokens.giftPremiumSubtitle"),
  coin: "300",
  detailsTitle: t("user.profile.redeemTokens.giftPremiumDetailsTitle"),
  details: [
    t("user.profile.redeemTokens.giftPremiumDetails"),
  ],
  confirmTitle: t("user.profile.redeemTokens.continueGift"),
  cardBgColor: "#FEEFE5",
  showSelectUser: true,
  selectUserLabel: t("user.profile.redeemTokens.selectUserToGift"),
};

const featureMeConfig = {
  img: require("@/assets/images/finder.svg"),
  title: t("user.profile.redeemTokens.featureMeTitle"),
  subtitle: t("user.profile.redeemTokens.featureMeSubtitle"),
  coin: "1000",
  detailsTitle: t("user.profile.redeemTokens.featureMeDetailsTitle"),
  details: [
    t("user.profile.redeemTokens.featureMeDetail1"),
    t("user.profile.redeemTokens.featureMeDetail2"),
    t("user.profile.redeemTokens.featureMeDetail3"),
    t("user.profile.redeemTokens.featureMeDetail4"),
  ],
  confirmTitle: t("user.profile.redeemTokens.continueFeature"),
  cardBgColor: "#E3F6E7",
};

const featureJobConfig = {
  img: require("@/assets/images/purple-toolbox.svg"),
  title: t("user.profile.redeemTokens.featureJobTitle"),
  subtitle: t("user.profile.redeemTokens.featureJobSubtitle"),
  coin: "200",
  detailsTitle: t("user.profile.redeemTokens.featureJobDetailsTitle"),
  details: [
    t("user.profile.redeemTokens.featureJobDetail1"),
    t("user.profile.redeemTokens.featureJobDetail2"),
    t("user.profile.redeemTokens.featureJobDetail3"),
    t("user.profile.redeemTokens.featureJobDetail4"),
  ],
  confirmTitle: t("user.profile.redeemTokens.continueFeature"),
  cardBgColor: "#F7EEFF",
};

const GIFT_PREMIUM_SELECTION_KEY = "gift-premium-user";
type RedeemItemKey =
  | "buy_1_month_premium"
  | "gift_1_month_premium"
  | "feature_job"
  | "feature_me"
  | "unlock_nameplate_designs";

type RedeemUnit = "min" | "hr" | "day" | "week" | "month" | "year";

const isRedeemUnit = (value: string): value is RedeemUnit =>
  ["min", "hr", "day", "week", "month", "year"].includes(value);

const RedeemTokens = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [selectedFeatureMeOption, setSelectedFeatureMeOption] = useState<string>("");
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
  const myEmployments = useJobStore((state) => state.myEmployments);
  const getMyEmployments = useJobStore((state) => state.getMyEmployments);
  const [selectedEmploymentBusinessIds, setSelectedEmploymentBusinessIds] = useState<
    string[]
  >([]);
  const selectedBusinessId = selectedEmploymentBusinessIds?.[0];
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  const redeemBusinesses = useMemo(() => {
    const seen = new Set<string>();
    return (Array.isArray(myEmployments) ? myEmployments : [])
      .map((employment: any) => {
        const business = employment?.business;
        if (!business?.id || seen.has(business.id)) return null;
        seen.add(business.id);
        return {
          id: business.id,
          name: business.name || "Business",
          address: "",
          imageUrl: business.logo || "",
          logo: business.logo || "",
          status: business.status,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [myEmployments]);

  const selectedBusiness = useMemo(
    () => redeemBusinesses.find((business) => business.id === selectedBusinessId) || null,
    [redeemBusinesses, selectedBusinessId]
  );

  const businessDisplayContent = useMemo(() => {
    if (!selectedBusiness) {
      return {
        type: "all" as const,
        content: t("common.all"),
      };
    }

    return {
      type: "single" as const,
      content: {
        name: selectedBusiness.name,
        logo: selectedBusiness.logo,
        imageUrl: selectedBusiness.imageUrl,
      },
    };
  }, [selectedBusiness]);

  const businessSelectionTriggerNode = useMemo(
    () => (
      <BusinessSelectionTrigger
        displayContent={businessDisplayContent}
        onPress={() => setShowBusinessModal(true)}
        compact
      />
    ),
    [businessDisplayContent]
  );

  const featureJobModalConfig = useMemo(
    () => ({
      ...featureJobConfig,
      showSelectBusiness: true,
      selectBusinessTrigger: businessSelectionTriggerNode,
    }),
    [businessSelectionTriggerNode]
  );

  const syncBusinessSelectorInModal = useCallback(() => {
    setData((prev) => ({
      ...prev,
      showSelectBusiness: true,
      selectBusinessTrigger: businessSelectionTriggerNode,
    }));
  }, [businessSelectionTriggerNode]);

  const openBusinessSelector = useCallback(async () => {
    try {
      await getMyEmployments();
      setShowBusinessModal(true);
    } catch {
      toast.error(t("common.failedToLoadBusinesses"));
    }
  }, [getMyEmployments]);

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
        toast.error(
          translateApiMessage(error?.message || "Failed to load redeem items")
        );
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
      selectUserLabel: selectedUser?.name || t("user.profile.redeemTokens.selectUserToGift"),
      selectUserAvatar: selectedUser?.avatar || null,
    }));
  }, [modalVisible, selectedRedeemKey, selectedUser]);

  useEffect(() => {
    if (!modalVisible || selectedRedeemKey !== "feature_job") return;
    syncBusinessSelectorInModal();
  }, [modalVisible, selectedRedeemKey, syncBusinessSelectorInModal]);

  useEffect(() => {
    if (selectedRedeemKey !== "feature_job") return;
    if (selectedBusinessId) return;
    if (redeemBusinesses.length === 0) return;

    setSelectedEmploymentBusinessIds([redeemBusinesses[0].id]);
  }, [redeemBusinesses, selectedBusinessId, selectedRedeemKey]);

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

  const featureMeOptions = useMemo(() => {
    const featureMeItem = coreRedeemItems.find((item) => item?.key === "feature_me");
    const ranges = Array.isArray(featureMeItem?.priceRange) ? featureMeItem.priceRange : [];

    return ranges
      .filter(
        (range) =>
          typeof range?.price === "number" &&
          Number.isFinite(range.price) &&
          typeof range?.duration === "number" &&
          Number.isFinite(range.duration) &&
          typeof range?.unit === "string" &&
          isRedeemUnit(range.unit)
      )
      .map((range) => {
        const unit = range.unit as RedeemUnit;
        const unitLabel = range.duration === 1 ? unit : `${unit}s`;
        return {
          id: `${range.duration}-${unit}-${range.price}`,
          label: `${range.duration} ${unitLabel} - ${range.price} ${t("user.profile.rewards.tokens")}`,
          duration: range.duration,
          unit,
        };
      });
  }, [coreRedeemItems]);

  const isItemRedeemed = useCallback(
    (key: RedeemItemKey) => {
      const item = coreRedeemItems.find((entry) => entry?.key === key);
      if (!item) return false;

      // Business rule: if isClaimable is false, item is already redeemed/unavailable.
      return item.isClaimable === false;
    },
    [coreRedeemItems]
  );

  const openRedeemModal = (
    config: Omit<RedeemModalData, "coin" | "details"> & {
      coin: string;
      details: string[];
    },
    key: RedeemItemKey,
    priceLabel?: string
  ) => {
    const coin = getItemPrice(key, priceLabel || config.coin);
    const alreadyRedeemed = isItemRedeemed(key);
    setData({
      ...config,
      coin,
      confirmTitle: alreadyRedeemed ? t("user.profile.redeemTokens.alreadyRedeemed") : config.confirmTitle,
      details: [
        ...config.details,
        t("user.profile.redeemTokens.tokenCost", { cost: coin }),
        t("user.profile.redeemTokens.currentBalance", { balance: totalTokens }),
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
        toast.error(t("user.profile.redeemTokens.selectUserError"));
        return null;
      }
      return {
        ...getDefaultRedeemTiming(selectedRedeemKey, { duration: 30, unit: "day" }),
        targetUserId: selectedUser.id,
      };
    }

    if (selectedRedeemKey === "feature_job") {
      if (!selectedBusinessId) {
        toast.error(t("user.profile.redeemTokens.selectBusinessError"));
        return null;
      }
      return {
        ...getDefaultRedeemTiming(selectedRedeemKey, { duration: 7, unit: "day" }),
        businessId: selectedBusinessId,
      };
    }

    if (selectedRedeemKey === "feature_me") {
      const selectedOption = featureMeOptions.find(
        (option) => option.id === selectedFeatureMeOption
      );
      if (selectedOption) {
        return {
          duration: selectedOption.duration,
          unit: selectedOption.unit,
        };
      }

      return getDefaultRedeemTiming(selectedRedeemKey, { duration: 1, unit: "month" });
    }

    if (selectedRedeemKey === "unlock_nameplate_designs") {
      return getDefaultRedeemTiming(selectedRedeemKey, { duration: 0, unit: "day" });
    }

    return null;
  };

  const isSelectedItemRedeemed = selectedRedeemKey
    ? isItemRedeemed(selectedRedeemKey)
    : false;

  const handleRedeem = async () => {
    if (!selectedRedeemKey) return;
    if (isItemRedeemed(selectedRedeemKey)) {
      toast.info(t("user.profile.redeemTokens.alreadyRedeemed"));
      return;
    }
    const payload = buildRedeemPayload();
    if (!payload) return;

    try {
      const result = await redeemCoreItem(selectedRedeemKey, payload);
      toast.success(
        translateApiMessage(result?.message || "Redeemed successfully")
      );
      setModalVisible(false);
      await fetchCoreRedeemItems();
      await loadWallet();
    } catch (error: any) {
      toast.error(
        translateApiMessage(error?.message || "Failed to redeem item")
      );
    }
  };

  const handleModal = (key: string) => {
    if (key === "premium") {
      setSelectedRedeemKey("buy_1_month_premium");
      const coin = getItemPrice("buy_1_month_premium", premiumConfig.coin);
      setData({
        ...premiumConfig,
        coin,
        confirmTitle: isItemRedeemed("buy_1_month_premium")
          ? t("user.profile.redeemTokens.alreadyRedeemed")
          : premiumConfig.confirmTitle,
        details: [
          t("user.profile.redeemTokens.benefitNameplates"),
          t("user.profile.redeemTokens.benefitProfileBoost"),
          t("user.profile.redeemTokens.benefitEarlyAccess"),
          t("user.profile.redeemTokens.tokenCost", { cost: coin }),
          t("user.profile.redeemTokens.durationValid"),
          t("user.profile.redeemTokens.currentBalance", { balance: totalTokens }),
        ],
      });
      setModalVisible(true);
    } else if (key === "gift") {
      setSelectedRedeemKey("gift_1_month_premium");
      const coin = getItemPrice("gift_1_month_premium", giftConfig.coin);
      setData({
        ...giftConfig,
        coin,
        confirmTitle: isItemRedeemed("gift_1_month_premium")
          ? t("user.profile.redeemTokens.alreadyRedeemed")
          : giftConfig.confirmTitle,
        details: [
          t("user.profile.redeemTokens.giftPremiumDetails"),
          t("user.profile.redeemTokens.tokenCost", { cost: coin }),
          t("user.profile.redeemTokens.currentBalance", { balance: totalTokens }),
        ],
        selectUserLabel: selectedUser?.name || t("user.profile.redeemTokens.selectUserToGift"),
        selectUserAvatar: selectedUser?.avatar || null,
        onPressSelectUser: () =>
          router.push({
            pathname: "/screens/common/select-user",
            params: {
              selectionKey: GIFT_PREMIUM_SELECTION_KEY,
              title: t("user.profile.redeemTokens.selectUserToGift"),
              searchPlaceholder: t("common.searchUser"),
            },
          }),
      });
      setModalVisible(true);
    } else if (key === "job") {
      setSelectedRedeemKey("feature_job");
      openRedeemModal(featureJobModalConfig, "feature_job", featureJobConfig.coin);
      openBusinessSelector();
    } else if (key === "me") {
      setSelectedRedeemKey("feature_me");
      const handleSelectFeatureMeOption = (id: string) => {
        setSelectedFeatureMeOption(id);
        setData((prev) => ({
          ...prev,
          selectedOptionId: id,
        }));
      };
      const fallbackOptionId = featureMeOptions[0]?.id || "";
      const nextSelectedOptionId = featureMeOptions.some(
        (option) => option.id === selectedFeatureMeOption
      )
        ? selectedFeatureMeOption
        : fallbackOptionId;
      setSelectedFeatureMeOption(nextSelectedOptionId);

      setData({
        ...featureMeConfig,
        coin: getItemPrice("feature_me", featureMeConfig.coin),
        confirmTitle: isItemRedeemed("feature_me")
          ? t("user.profile.redeemTokens.alreadyRedeemed")
          : featureMeConfig.confirmTitle,
        details: [
          t("user.profile.redeemTokens.featureMeDetail3"),
          t("user.profile.redeemTokens.currentBalance", { balance: totalTokens }),
        ],
        options: featureMeOptions.map((option) => ({
          id: option.id,
          label: option.label,
        })),
        selectedOptionId: nextSelectedOptionId,
        onSelectOption: handleSelectFeatureMeOption,
      });
      setModalVisible(true);
    } else if (key === "nameplate") {
      router.push("/screens/rewards/nameplate");
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
        title={t("user.profile.redeemTokens.title")}
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
              source={require("@/assets/images/premium.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              {t("user.profile.redeemTokens.buyPremiumTitle")}
            </Text>

            <Text className="font-proximanova-regular text-secondary text-center text-sm mt-2 w-4/5">
              {t("user.profile.redeemTokens.buyPremiumSubtitle")}
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
              source={require("@/assets/images/giftbox.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary  mt-2.5 w-2/3 text-center">
              {t("user.profile.redeemTokens.giftPremiumTitle")}
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              {t("user.profile.redeemTokens.giftPremiumSubtitle")}
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
              source={require("@/assets/images/finder.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              {t("user.profile.redeemTokens.featureMeTitle")}
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              {t("user.profile.redeemTokens.featureMeSubtitle")}
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
              source={require("@/assets/images/purple-toolbox.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60 }}
            />
            <Text className="font-proximanova-semibold text-primary mt-2.5 w-2/3 text-center">
              {t("user.profile.redeemTokens.featureJobTitle")}
            </Text>

            <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2 w-4/5">
              {t("user.profile.redeemTokens.featureJobSubtitle")}
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
            source={require("@/assets/images/designs.svg")}
            contentFit="contain"
            style={{ width: 60, height: 60 }}
          />
          <Text className="font-proximanova-semibold text-primary  mt-2.5">
            {t("user.profile.redeemTokens.unlockNameplateTitle")}
          </Text>
          <Text className="font-proximanova-regular text-secondary  text-center text-sm mt-2">
            {t("user.profile.redeemTokens.unlockNameplateSubtitle")}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-2.5">
            <View className="px-4 py-1 bg-[#ffffff] -z-10  -ml-3 rounded-r-[40px] ">
              <Text className="text-xs font-proximanova-semibold text-primary ">
                {t("user.profile.redeemTokens.seeAll")}
              </Text>
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
        onConfirm={isSelectedItemRedeemed ? undefined : handleRedeem}
        confirming={isRedeemingCoreItem}
      />

      <BusinessSelectionModal
        visible={showBusinessModal}
        onClose={() => setShowBusinessModal(false)}
        businesses={redeemBusinesses}
        disableStoreFallback
        selectedBusinesses={selectedEmploymentBusinessIds}
        onSelectionChange={(ids: string[]) => {
          const nextId = ids[0] ? [ids[0]] : [];
          setSelectedEmploymentBusinessIds(nextId);
        }}
      />
    </SafeAreaView>
  );
};

export default RedeemTokens;

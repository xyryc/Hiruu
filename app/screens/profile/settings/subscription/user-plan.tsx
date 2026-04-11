import ScreenHeader from "@/components/header/ScreenHeader";
import GradientButton from "@/components/ui/buttons/GradientButton";
import { ActiveSubscriptionItem, billingService } from '@/services/billingService';
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";


const UserPlan = () => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const { userPlans, isLoadingUserPlans, getUserPlans } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "annual"
  );

  const paidPlan = useMemo(() => {
    return [...userPlans]
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder)
      .find((item) => item.isActive && Number(item.monthlyPrice) > 0);
  }, [userPlans]);

  const benefits = [
    t("user.profile.userPlanBenefits.customization"),
    t("user.profile.userPlanBenefits.premiumMark"),
    t("user.profile.userPlanBenefits.exportCv"),
  ];

  const capitalizeBenefit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  const monthlyPrice = useMemo(() => Number(paidPlan?.monthlyPrice || 0), [paidPlan]);
  const yearlyBase = useMemo(
    () => Number(paidPlan?.yearlyBasePrice ?? monthlyPrice * 12),
    [monthlyPrice, paidPlan]
  );
  const yearlyDiscounted = useMemo(
    () => Number(paidPlan?.yearlyDiscountedPrice ?? yearlyBase),
    [paidPlan, yearlyBase]
  );
  const yearlyDiscountPercentage = useMemo(
    () => Number(paidPlan?.yearlyDiscountPercentage || 0),
    [paidPlan]
  );

  const formatDollarFromCents = (amountInCents: number) => {
    const dollars = amountInCents / 100;
    return Number.isInteger(dollars) ? `${dollars}` : dollars.toFixed(2);
  };

  // payment
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscriptionItem | null>(null);
  const [loadingActiveSub, setLoadingActiveSub] = useState(false);

  const getSetupIntentId = (clientSecret: string) => {
    return clientSecret.split("_secret")[0];
  };


  const handleSubscribe = async () => {
    if (isAlreadySubscribed) {
      toast.info(t("user.profile.alreadyHaveActiveSubscription"));
      return;
    }

    if (!paidPlan || isSubscribing) return;

    try {
      setIsSubscribing(true);

      const billingCycle = selectedPlan === "annual" ? "yearly" : "monthly";

      // 1) backend creates setup intent
      const intentData = await billingService.createSubscriptionIntent({
        planId: paidPlan.id,
        billingCycle,
      });

      // 2) initialize Stripe sheet with setup intent
      const initResult = await initPaymentSheet({
        merchantDisplayName: "Hiruu",
        customerId: intentData.customerId,
        setupIntentClientSecret: intentData.setupIntentClientSecret,
        allowsDelayedPaymentMethods: false,
      });

      if (initResult.error) {
        toast.error(
          initResult.error.message || t("user.profile.failedToInitializePaymentSheet")
        );
        return;
      }

      // 3) present sheet
      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        toast.error(
          paymentResult.error.message || t("user.profile.paymentWasNotCompleted")
        );
        return;
      }

      // 4) confirm subscription on backend
      await billingService.confirmSubscription({
        planId: paidPlan.id,
        billingCycle,
        setupIntentId: getSetupIntentId(intentData.setupIntentClientSecret),
      });

      toast.success(t("user.profile.subscriptionActivated"));

      await loadActiveSubscription();

      router.back()
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        t("user.profile.subscriptionFailed")
      );
    } finally {
      setIsSubscribing(false);
    }
  };

  const loadActiveSubscription = useCallback(async () => {
    try {
      setLoadingActiveSub(true);
      const [activeSubs, trialingSubs] = await Promise.all([
        billingService.getMyActiveSubscription("active"),
        billingService.getMyActiveSubscription("trialing"),
      ]);
      const data = [...activeSubs, ...trialingSubs].filter(
        (item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index
      );
      const userActive = data.find((item) => item?.plan?.type === "user" || !!item?.userId) || null;
      setActiveSubscription(userActive);
    } catch {
      // no active sub or endpoint returns error; keep null
      setActiveSubscription(null);
    } finally {
      setLoadingActiveSub(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        await Promise.all([getUserPlans(), loadActiveSubscription()]);
      } catch (error: any) {
        if (!mounted) return;
        toast.error(error?.message || t("user.profile.failedToLoadSubscriptionData"));
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [getUserPlans, loadActiveSubscription]);

  useFocusEffect(
    useCallback(() => {
      getUserPlans();
      loadActiveSubscription();
    }, [getUserPlans, loadActiveSubscription])
  );

  const isAlreadySubscribed = !!activeSubscription && ["active", "trialing"].includes(String(activeSubscription?.status || "").toLowerCase());


  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <View
        className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl overflow-hidden"
        style={{ paddingTop: insets.top }}
      >
        <ScreenHeader
          className="px-5 pt-2.5 pb-4"
          onPressBack={() => router.back()}
          title={t("user.profile.userPlanScreenTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>


      <ScrollView className="flex-1 mx-5 mt-8">
        <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
          {t("user.profile.premiumBenefits")}
        </Text>
        <View className="bg-[#F5F6FF] rounded-2xl px-4 py-3 mt-4">
          {benefits.map((item, index) => (
            <View key={`${item}-${index}`} className={`flex-row gap-3 ${index > 0 ? "mt-3" : ""}`}>
              <View className="bg-[#4FB2F3] h-6 w-6 flex-row justify-center items-center rounded-full">
                <Feather name="check" size={14} color="white" />
              </View>
              <Text className="font-proximanova-regular text-sm text-primary dark:text-dark-primary flex-1">
                {capitalizeBenefit(item)}
              </Text>
            </View>
          ))}
        </View>

        <Text className="font-proximanova-semibold text-xl text-primary mt-8 dark:text-dark-primary">
          {t("user.profile.chooseYourPlan")}
        </Text>

        {isLoadingUserPlans ? (
          <View className="mt-8 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
            <Text className="mt-2 text-secondary dark:text-dark-secondary text-sm">
              {t("user.profile.loadingPlans")}
            </Text>
          </View>
        ) : null}

        <View className="mt-4">
          {/* Monthly Plan */}
          <TouchableOpacity
            disabled={!paidPlan}
            onPress={() => setSelectedPlan("monthly")}
            className={`${selectedPlan === "monthly" && "bg-[#4fb1f333] border-[#4E57FF]"} border flex-row justify-between items-center px-4 py-7 rounded-2xl`}
          >
            <View className="flex-row items-center gap-3">
              {selectedPlan === "monthly" ? (
                <Ionicons name="checkmark-circle" size={24} color="#4E57FF" />
              ) : (
                <Ionicons name="radio-button-off" size={24} color="black" />
              )}

              <View>
                <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                  {t("user.profile.monthlyPlan")}
                </Text>
              </View>
            </View>
            <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
              ${formatDollarFromCents(monthlyPrice)}
            </Text>
          </TouchableOpacity>

          {/* Annual Plan */}
          <TouchableOpacity
            disabled={!paidPlan}
            onPress={() => setSelectedPlan("annual")}
            className={`${selectedPlan === "annual" && "border-[#4E57FF] bg-[#4fb1f333]"} flex-row justify-between items-center border px-4 py-7 mt-7 rounded-2xl`}
          >
            <View className="flex-row items-center gap-3">
              {selectedPlan === "annual" ? (
                <Ionicons name="checkmark-circle" size={24} color="#4E57FF" />
              ) : (
                <Ionicons name="radio-button-off" size={24} color="black" />
              )}

              <View>
                <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                  {t("user.profile.annualPlan")}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5">
              <View className="px-2 items-center justify-center bg-yellow-500 rounded-lg">
                <Text className="font-proximanova-semibold text-sm">
                  {yearlyDiscountPercentage}% OFF
                </Text>
              </View>
              <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                <Text className="line-through font-proximanova-regular">
                  ${formatDollarFromCents(yearlyBase)}
                </Text>{" "}
                ${formatDollarFromCents(yearlyDiscounted)}
              </Text>
            </View>

            <View className="absolute -top-4 left-4 py-0.5 px-3 bg-[#4FB2F3] rounded-3xl">
              <Text className="font-proximanova-semibold text-sm text-[#FFFFFF]">
                {paidPlan?.isFeatured
                  ? t("user.profile.featuredPlanBadge")
                  : t("user.profile.planBadge")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Section - Subscription Text and Button */}
      <View className="mx-5 mb-6 mt-4">
        {/* Subscription Text */}
        <Text className="text-center text-secondary dark:text-dark-secondary text-sm mb-4 capitalize">
          {t("user.profile.subscriptionAutoRenew")}
        </Text>

        {/* Subscribe Button */}
        <GradientButton
          title={
            loadingActiveSub
              ? t("user.profile.checking")
              : isAlreadySubscribed
                ? t("user.profile.alreadySubscribed")
                : isSubscribing
                  ? t("user.profile.processing")
                  : t("user.profile.subscribeNow")
          }
          disabled={
            loadingActiveSub ||
            isAlreadySubscribed ||
            !paidPlan ||
            isSubscribing
          }
          onPress={handleSubscribe}
          icon={<MaterialCommunityIcons name="crown" size={18} color="#FFFFFF" />}
        />

      </View>
    </SafeAreaView>
  );
};

export default UserPlan;

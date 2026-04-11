import ScreenHeader from "@/components/header/ScreenHeader";
import GradientButton from "@/components/ui/buttons/GradientButton";
import BusinessSelectionTrigger from "@/components/ui/dropdown/BusinessSelectionTrigger";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import BusinessPlanChart from "@/components/ui/subscription/BusinessPlanChart";
import { ActiveSubscriptionItem, billingService } from "@/services/billingService";
import { useBusinessStore } from "@/stores/businessStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { toast } from "sonner-native";

const BusinessPlan = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const {
    myEmployments,
    selectedBusinesses,
    setSelectedBusinesses,
    getMyEmployments,
  } = useBusinessStore();
  const { businessPlans, isLoadingBusinessPlans, getBusinessPlans } =
    useSubscriptionStore();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscriptionItem[]>([]);
  const [loadingActiveSub, setLoadingActiveSub] = useState(false);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        await getMyEmployments();
      } catch {
        // ignore
      }
    };

    loadBusinesses();
  }, [getMyEmployments]);

  const activeBusinesses = useMemo(() => {
    const activeEmployments = (Array.isArray(myEmployments) ? myEmployments : []).filter(
      (employment: any) => String(employment?.status || "").toLowerCase() === "active"
    );
    const uniqueByBusinessId = new Map<string, any>();

    activeEmployments.forEach((employment: any) => {
      const business = employment?.business;
      const businessId = business?.id || employment?.businessId;
      if (!businessId || uniqueByBusinessId.has(businessId)) return;

      uniqueByBusinessId.set(businessId, {
        id: businessId,
        name: business?.name || "Business",
        address: business?.address,
        imageUrl: business?.logo,
        logo: business?.logo,
      });
    });

    return Array.from(uniqueByBusinessId.values());
  }, [myEmployments]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        await getBusinessPlans();
      } catch (error: any) {
        toast.error(error?.message || t("user.profile.failedToLoadBusinessPlans"));
      }
    };

    loadPlans();
  }, [getBusinessPlans]);

  const loadActiveSubscriptions = useCallback(async () => {
    try {
      setLoadingActiveSub(true);
      const [activeSubs, trialingSubs] = await Promise.all([
        billingService.getMyActiveSubscription("active"),
        billingService.getMyActiveSubscription("trialing"),
      ]);
      const data = [...activeSubs, ...trialingSubs].filter(
        (item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index
      );
      setActiveSubscriptions(data || []);
    } catch {
      setActiveSubscriptions([]);
    } finally {
      setLoadingActiveSub(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActiveSubscriptions();
    }, [loadActiveSubscriptions])
  );

  const paidPlan = useMemo(() => {
    return [...businessPlans]
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder)
      .find((item) => item.isActive && Number(item.monthlyPrice) > 0);
  }, [businessPlans]);

  const selectedBusinessId = useMemo(() => {
    if (selectedBusinesses.length > 0) return selectedBusinesses[0];
    return activeBusinesses[0]?.id ?? null;
  }, [activeBusinesses, selectedBusinesses]);

  const selectedBusiness = useMemo(
    () => activeBusinesses.find((b) => b.id === selectedBusinessId),
    [activeBusinesses, selectedBusinessId]
  );

  const selectedBusinessActiveSubscription = useMemo(() => {
    if (!selectedBusinessId) return null;
    return (
      activeSubscriptions.find(
        (item) =>
          item.businessId === selectedBusinessId &&
          ["active", "trialing"].includes(String(item.status || "").toLowerCase())
      ) || null
    );
  }, [activeSubscriptions, selectedBusinessId]);

  const isAlreadySubscribed = useMemo(() => {
    return !!selectedBusinessActiveSubscription;
  }, [selectedBusinessActiveSubscription]);

  const selectedPlanForCheckout = useMemo(() => {
    if (!selectedPlanId) return null;
    return businessPlans.find((plan) => plan.id === selectedPlanId) || null;
  }, [businessPlans, selectedPlanId]);

  // Get display content for header button
  const getDisplayContent = () => {
    if (!selectedBusiness) {
      return { type: "all", content: t("user.profile.select") };
    }
    return { type: "single", content: selectedBusiness };
  };

  const displayContent = getDisplayContent();

  const handleSubscribe = async () => {
    if (isAlreadySubscribed) {
      toast.info(t("user.profile.alreadySubscribed"));
      return;
    }

    const planForCheckout = selectedPlanForCheckout || paidPlan;

    if (!planForCheckout) {
      toast.error(t("user.profile.noPaidBusinessPlanAvailable"));
      return;
    }

    if (!selectedBusinessId) {
      toast.error(t("user.profile.selectBusinessFirst"));
      return;
    }

    if (isSubscribing) return;

    try {
      setIsSubscribing(true);
      const billingCycle = selectedBillingCycle;

      const intentData = await billingService.createSubscriptionIntent({
        planId: planForCheckout.id,
        billingCycle,
        businessId: selectedBusinessId,
      });

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

      const paymentResult = await presentPaymentSheet();
      if (paymentResult.error) {
        toast.error(
          paymentResult.error.message || t("user.profile.paymentWasNotCompleted")
        );
        return;
      }

      await billingService.confirmSubscription({
        setupIntentId: intentData.setupIntentClientSecret,
        planId: planForCheckout.id,
        billingCycle,
        businessId: selectedBusinessId,
      });


      toast.success(t("user.profile.businessSubscriptionActivated"));
      await Promise.all([getBusinessPlans(), loadActiveSubscriptions()]);
      router.back();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        t("user.profile.businessSubscriptionFailed")
      );
    } finally {
      setIsSubscribing(false);
    }
  };

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
          title={t("user.profile.businessPlanScreenTitle")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
      >
        <View className="mx-5">
          <View className="flex-row justify-between mt-4 items-center">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              {t("user.profile.selectBusiness")}
            </Text>

            <BusinessSelectionTrigger
              displayContent={displayContent as any}
              onPress={() => setShowModal(true)}
              compact
            />
          </View>
        </View>

        {isLoadingBusinessPlans ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="small" color="#4FB2F3" />
            <Text className="mt-2 text-secondary dark:text-dark-secondary text-sm">
              {t("user.profile.loadingPlans")}
            </Text>
          </View>
        ) : (
          <BusinessPlanChart
            key={selectedBusinessId || "no-business"}
            businessPlans={businessPlans}
            initialTier={selectedBusinessActiveSubscription?.plan?.tier ?? null}
            initialBillingCycle={selectedBusinessActiveSubscription?.billingCycle ?? null}
            onSelectionChange={({ planId, billingCycle }) => {
              setSelectedPlanId(planId);
              setSelectedBillingCycle(billingCycle);
            }}
          />
        )}
      </ScrollView>

      <View className="mx-5 mb-6 mt-4">
        <Text className="text-center text-secondary dark:text-dark-secondary text-sm mb-4 capitalize">
          {t("user.profile.subscriptionAutoRenew")}
        </Text>

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
            !selectedBusinessId ||
            !(selectedPlanForCheckout || paidPlan) ||
            isSubscribing
          }
          onPress={handleSubscribe}
          icon={<MaterialCommunityIcons name="crown" size={18} color="#FFFFFF" />}
        />
      </View>

      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={activeBusinesses.map((b) => ({
          id: b.id,
          name: b.name,
          address: b.address,
          imageUrl: b.logo,
          logo: b.logo,
        }))}
        selectedBusinesses={selectedBusinessId ? [selectedBusinessId] : []}
        onSelectionChange={(ids: string[]) => {
          const nextId = ids[0] ? [ids[0]] : [];
          setSelectedBusinesses(nextId);
        }}
      />
    </SafeAreaView>
  );
};

export default BusinessPlan;

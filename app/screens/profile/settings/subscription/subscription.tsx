import ScreenHeader from "@/components/header/ScreenHeader";
import SettingsCard from "@/components/ui/cards/SettingsCard";
import ConfirmActionModal from "@/components/ui/modals/ConfirmActionModal";
import { ActiveSubscriptionItem, billingService } from "@/services/billingService";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { formatDate } from "@/utils/date";
import {
  Entypo,
  Feather,
  MaterialCommunityIcons,
  SimpleLineIcons,
} from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const SubscriptionLoadingState = () => {
  return (
    <View className="border border-[#EEEEEE] rounded-2xl px-4 py-6 mb-3 items-center">
      <ActivityIndicator size="small" color="#4FB2F3" />
      <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-primary mt-3">
        Loading subscription
      </Text>
      <Text className="font-proximanova-regular text-xs text-secondary dark:text-dark-secondary mt-1">
        Please wait a moment...
      </Text>
    </View>
  );
};

const Subscription = () => {
  const CancelImg = require("@/assets/images/cancel.svg");
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { myBusinesses, getMyBusinesses } = useBusinessStore();

  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscriptionItem[]>([]);
  const [isLoadingActiveSubscription, setIsLoadingActiveSubscription] = useState(false);
  const [activeSubError, setActiveSubError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ActiveSubscriptionItem | null>(null);

  const fetchActiveSubscriptions = useCallback(async () => {
    try {
      setIsLoadingActiveSubscription(true);
      setActiveSubError(null);

      const [activeSubs, trialingSubs] = await Promise.all([
        billingService.getMyActiveSubscription("active"),
        billingService.getMyActiveSubscription("trialing"),
        getMyBusinesses(),
      ]);

      const subs = [...activeSubs, ...trialingSubs].filter(
        (item, index, arr) => arr.findIndex((candidate) => candidate.id === item.id) === index
      );

      setActiveSubscriptions(subs ?? []);
    } catch (error: any) {
      setActiveSubscriptions([]);
      setActiveSubError(error?.message || "Failed to load active subscriptions");
    } finally {
      setIsLoadingActiveSubscription(false);
    }
  }, [getMyBusinesses]);

  useFocusEffect(
    useCallback(() => {
      fetchActiveSubscriptions();
    }, [fetchActiveSubscriptions])
  );

  const userSubscription = useMemo(
    () =>
      activeSubscriptions.find(
        (item) => item?.plan?.type === "user" || (!!item.userId && !item.businessId)
      ) || null,
    [activeSubscriptions]
  );

  const businessSubscriptions = useMemo(
    () =>
      activeSubscriptions.filter(
        (item) => item?.plan?.type === "business" || !!item.businessId
      ),
    [activeSubscriptions]
  );

  const providerLabel = userSubscription?.provider
    ? `${userSubscription.provider.charAt(0).toUpperCase()}${userSubscription.provider.slice(1)}`
    : "Unavailable";

  const getBusinessName = (businessId: string | null) => {
    if (!businessId) return "Business";
    return myBusinesses.find((b) => b.id === businessId)?.name || "Business";
  };

  const handleCancelSubscription = async () => {
    if (!cancelTarget?.id || isCancelling) return;

    try {
      setIsCancelling(true);
      setActiveSubError(null);

      await billingService.cancelSubscription(cancelTarget.id);
      toast.success(t("api.subscription_cancelled_successfully"));
      setShowModal(false);
      setCancelTarget(null);
      await fetchActiveSubscriptions();
    } catch (error: any) {
      setActiveSubError(error?.message || "Failed to cancel subscription");
    } finally {
      setIsCancelling(false);
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
          title={t("user.profile.subscription")}
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="m-5">
          {isLoadingActiveSubscription && activeSubscriptions.length === 0 && (
            <SubscriptionLoadingState />
          )}

          {userSubscription && (
            <View className="border border-[#EEEEEE] rounded-2xl">
              <View className="px-2.5 py-5 flex-row gap-3">
                <View className="h-[50px] w-[50px] bg-[#11293A1A] rounded-xl flex-row justify-center items-center">
                  <MaterialCommunityIcons
                    name="receipt-text-outline"
                    size={22}
                    color="black"
                  />
                </View>

                <View>
                  <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary">
                    {t("user.profile.userPlanBilling")}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary mt-3">
                    {user?.email || "-"}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-pritext-primary mt-3">
                    {user?.phoneNumber || t("user.profile.phoneMasked")}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-pritext-primary mt-3">
                    {t("user.profile.activeDateRange")}: {formatDate(userSubscription.currentPeriodEnd)}
                  </Text>
                </View>
              </View>

              <View className="border-b border-[#EEEEEE]" />

              <View className="px-2.5 py-5">
                <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary text-center capitalize">
                  {`Billed through ${providerLabel}`}
                </Text>

                <Text className="capitalize font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary mt-3 px-14 text-center">
                  {`Status: ${userSubscription.status} • ${userSubscription.billingCycle}${userSubscription.cancelAtPeriodEnd ? ` • ${t("user.profile.cancelAtPeriodEnd")}` : ""
                    }`}
                </Text>
                {!!activeSubError && (
                  <Text className="font-proximanova-semibold text-sm text-[#F34F4F] mt-3 text-center">
                    {activeSubError}
                  </Text>
                )}
              </View>

              <View className="border-b border-[#EEEEEE]" />

              <TouchableOpacity
                disabled={isCancelling}
                onPress={() => {
                  setCancelTarget(userSubscription);
                  setShowModal(true);
                }}
                className="my-5"
              >
                <Text className="font-proximanova-bold text-[#F34F4F] text-center">
                  {isCancelling ? t("user.profile.cancelling") : t("user.profile.cancelPlan")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {businessSubscriptions.map((item) => (
            <View key={item.id} className="border border-[#EEEEEE] rounded-2xl mt-4">
              <View className="px-2.5 py-5 flex-row gap-3">
                <View className="h-[50px] w-[50px] bg-[#11293A1A] rounded-xl flex-row justify-center items-center">
                  <MaterialCommunityIcons
                    name="receipt-text-outline"
                    size={22}
                    color="black"
                  />
                </View>
                <View>
                  <Text className="font-proximanova-bold text-xl text-primary dark:text-dark-primary">
                    {t("user.profile.businessPlanBilling")}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary mt-3">
                    {getBusinessName(item.businessId)}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-pritext-primary mt-3 capitalize">
                    Plan: {item.plan?.tier || "-"}
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-primary dark:text-dark-pritext-primary mt-3">
                    {t("user.profile.activeDateRange")}: {formatDate(item.currentPeriodEnd)}
                  </Text>
                </View>
              </View>

              <View className="border-b border-[#EEEEEE]" />

              <View className="px-2.5 py-5">
                <Text className="capitalize font-proximanova-bold text-xl text-primary dark:text-dark-primary text-center">
                  Billed through {item.provider || "Stripe"}
                </Text>
                <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary mt-3 px-8 text-center capitalize">
                  Status: {item.status} • {item.billingCycle}
                </Text>
              </View>

              <View className="border-b border-[#EEEEEE]" />

              <TouchableOpacity
                disabled={isCancelling}
                onPress={() => {
                  setCancelTarget(item);
                  setShowModal(true);
                }}
                className="my-5"
              >
                <Text className="font-proximanova-bold text-[#F34F4F] text-center">
                  {isCancelling ? t("user.profile.cancelling") : t("user.profile.cancelPlan")}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <View className="border px-3 rounded-2xl border-[#EEEEEE] mt-4">
            <SettingsCard
              click={() =>
                router.push("/screens/profile/settings/subscription/user-plan")
              }
              border={true}
              icon={
                <Feather
                  name="user"
                  className="border rounded-md"
                  size={24}
                  color="black"
                />
              }
              text={t("user.profile.userPlan")}
              subtitle={t("user.profile.mobile")}
              className="my-5"
              arrowIcon={
                <Entypo name="chevron-thin-right" size={20} color="#111111" />
              }
            />
          </View>

          <View className="border px-3 rounded-2xl border-[#EEEEEE] mt-2.5">
            <SettingsCard
              click={() =>
                router.push(
                  "/screens/profile/settings/subscription/business-plan"
                )
              }
              border={true}
              icon={
                <SimpleLineIcons name="briefcase" size={24} color="black" />
              }
              text={t("user.profile.businessPlan")}
              subtitle={t("user.profile.mobile")}
              className="my-5"
              arrowIcon={
                <Entypo name="chevron-thin-right" size={20} color="#111111" />
              }
            />
          </View>
        </View>

        <Text className="text-center text-secondary dark:text-dark-secondary text-sm">
          {t("user.profile.subscriptionAutoRenew")}
        </Text>
      </ScrollView>

      <ConfirmActionModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setCancelTarget(null);
        }}
        onConfirm={handleCancelSubscription}
        title={t("user.profile.cancelPlanTitle")}
        subtitle={t("user.profile.cancelPlanSubtitle")}
        expiryDate={formatDate(cancelTarget?.currentPeriodEnd)}
        icon={CancelImg}
        confirmLabel={isCancelling ? t("user.profile.cancelling") : t("user.profile.cancelPlan")}
        confirmColor="#F34F4F"
        loading={isCancelling}
      />
    </SafeAreaView>
  );
};

export default Subscription;

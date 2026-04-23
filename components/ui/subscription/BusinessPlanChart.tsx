import FreeIcon from "@/assets/images/free.svg";
import GrowthIcon from "@/assets/images/growth.svg";
import ProIcon from "@/assets/images/pro.svg";
import StarterIcon from "@/assets/images/starter.svg";
import { BusinessPlanItem } from "@/stores/subscriptionStore";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const iconByTier: Record<string, any> = {
  free: FreeIcon,
  starter: StarterIcon,
  growth: GrowthIcon,
  pro: ProIcon,
};

const fallbackPlans = [
  {
    id: "free",
    name: "Free",
    icon: FreeIcon,
    memberLimit: 10,
    features: [true, true, true, true, true, true, false],
    monthlyPrice: 0,
    yearlyBasePrice: 0,
    yearlyDiscountedPrice: 0,
    yearlyDiscountPercentage: 0,
    isFeatured: false,
    trialDays: 7,
  },
  {
    id: "starter",
    name: "Starter",
    icon: StarterIcon,
    memberLimit: 10,
    features: [false, true, true, false, true, true, false],
    monthlyPrice: 2900,
    yearlyBasePrice: 34800,
    yearlyDiscountedPrice: 28884,
    yearlyDiscountPercentage: 17,
    isFeatured: false,
    trialDays: 7,
  },
  {
    id: "growth",
    name: "Growth",
    icon: GrowthIcon,
    memberLimit: 25,
    features: [true, true, true, true, true, true, false],
    monthlyPrice: 7900,
    yearlyBasePrice: 94800,
    yearlyDiscountedPrice: 78684,
    yearlyDiscountPercentage: 17,
    isFeatured: false,
    trialDays: 7,
  },
  {
    id: "pro",
    name: "Pro",
    icon: ProIcon,
    memberLimit: 50,
    features: [true, true, true, true, true, true, true],
    monthlyPrice: 14900,
    yearlyBasePrice: 178800,
    yearlyDiscountedPrice: 148404,
    yearlyDiscountPercentage: 17,
    isFeatured: true,
    trialDays: 7,
  },
];

const BusinessPlanChart = ({
  businessPlans = [],
  initialTier,
  initialBillingCycle,
  onSelectionChange,
}: {
  businessPlans?: BusinessPlanItem[];
  initialTier?: string | null;
  initialBillingCycle?: "monthly" | "yearly" | null;
  onSelectionChange?: (selection: {
    planId: string;
    billingCycle: "monthly" | "yearly";
  }) => void;
}) => {
  const [selectedPlan, setSelectedPlan] = useState("free");
  const mounted = useRef(true);
  const [selectedPlanTime, setSelectedPlanTime] = useState<
    "monthly" | "yearly"
  >("yearly");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSelect = (planId: string) => {
    if (mounted.current) {
      setSelectedPlan(planId);
    }
  };

  const plans = useMemo(
    () =>
      businessPlans.length > 0
        ? [...businessPlans]
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((plan) => {
            const features = plan.businessFeatures || {};
            return {
              id: plan.id,
              name: plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1),
              icon: iconByTier[plan.tier] || ProIcon,
              memberLimit: Number(features.memberLimit || 0),
              features: [
                Boolean(features.scheduleReports),
                Boolean(features.premiumMark),
                Boolean(features.scheduleAI),
                Boolean(features.jobPostingBoost),
                Boolean(features.excelExport),
                Number(features.memberLimit || 0) > 0,
                Boolean(features.leaderboard),
              ],
              monthlyPrice: Number(plan.monthlyPrice || 0),
              yearlyBasePrice: Number(
                plan.yearlyBasePrice ?? Number(plan.monthlyPrice || 0) * 12
              ),
              yearlyDiscountedPrice: Number(
                plan.yearlyDiscountedPrice ??
                plan.yearlyBasePrice ??
                Number(plan.monthlyPrice || 0) * 12
              ),
              yearlyDiscountPercentage: Number(plan.yearlyDiscountPercentage || 0),
              isFeatured: Boolean(plan.isFeatured),
              trialDays: Number(plan.trialDays || 0),
            };
          })
        : fallbackPlans,
    [businessPlans]
  );

  useEffect(() => {
    if (!plans.length) return;
    const hasSelectedPlan = plans.some((plan) => plan.id === selectedPlan);
    if (hasSelectedPlan) return;
    const featured =
      plans.find((plan) => plan.isFeatured) || plans.find((plan) => plan.id !== "free");
    if (featured && mounted.current) setSelectedPlan(featured.id);
  }, [plans, selectedPlan]);

  useEffect(() => {
    if (!plans.length || !initialTier) return;
    const matchedPlan =
      plans.find(
        (plan) =>
          String(plan.name || "").toLowerCase() === String(initialTier).toLowerCase()
      ) || null;
    if (matchedPlan && mounted.current) {
      setSelectedPlan(matchedPlan.id);
    }
  }, [initialTier, plans]);

  useEffect(() => {
    if (!initialBillingCycle || !mounted.current) return;
    setSelectedPlanTime(initialBillingCycle);
  }, [initialBillingCycle]);

  const selectedPlanData =
    plans.find((plan) => plan.id === selectedPlan) || plans[0];
  const showBillingOptions =
    Number(selectedPlanData?.monthlyPrice || 0) > 0 &&
    String(selectedPlanData?.name || "").toLowerCase() !== "free";

  useEffect(() => {
    if (!selectedPlanData || !onSelectionChange) return;
    onSelectionChange({
      planId: selectedPlanData.id,
      billingCycle: selectedPlanTime,
    });
  }, [onSelectionChange, selectedPlanData, selectedPlanTime]);

  const formatDollarFromCents = (amountInCents: number) => {
    const dollars = amountInCents / 100;
    return Number.isInteger(dollars) ? `${dollars}` : dollars.toFixed(2);
  };

  return (
    <View>
      <View className="flex-row p-4">
        {/* feature list */}
        <View className="w-36 flex-1 mt-24">
          <Text className="text-sm font-proximanova-semibold text-primary dark:text-dark-primary mb-3.5">
            Member Limit
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary mb-3.5">
            Schedule reports
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary mb-3.5">
            Premium mark
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary mb-3.5">
            Easy scheduling by AI
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary mb-3.5">
            Increase in job posting
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary mb-3.5">
            Statistics export in excel
          </Text>
          <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary mb-3.5">
            More user capacity depending on plan
          </Text>
          <View className="flex-row items-center">
            <Text className="text-sm font-proximanova-regular text-primary dark:text-dark-primary">
              Leaderboard{" "}
            </Text>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="black"
            />
          </View>
        </View>

        {/* plans */}
        <View className="flex-row">
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              className={`w-14 pt-2 rounded-lg items-center ${selectedPlan === plan.id
                ? "border border-[#CFA873] bg-[#F7EDC0]"
                : "border border-[#EEEEEE] bg-white"
                }`}
              onPress={() => handleSelect(plan.id)}
            >
              <Image
                source={plan.icon}
                style={{
                  width: 26,
                  height: 26,
                  marginBottom: 8,
                }}
                contentFit="contain"
              />

              <Text className="text-center font-bold text-xs mb-3.5 px-1">
                {plan.name}
              </Text>

              {/* line */}
              <View className="border-[#11111130] border-b h-[1px] w-8 rounded-full mb-2.5" />

              <Text className="text-sm font-proximanova-semibold">
                {plan.memberLimit}
              </Text>

              {/* Features */}
              <View className="my-3 items-center">
                {plan.features.map((isEnabled, index) => (
                  <View key={index} className="mb-3">
                    <Text>{isEnabled ? "✓" : "-"}</Text>
                  </View>
                ))}
              </View>

              {/* Selection indicator */}
              <View className="mt-4 flex-row justify-center absolute -bottom-3 left-1/2 -translate-x-[50%]">
                {selectedPlan === plan.id ? (
                  <Ionicons
                    className="bg-white rounded-full"
                    name="checkmark-circle"
                    size={24}
                    color="#11293A"
                  />
                ) : (
                  <Ionicons
                    className="bg-white"
                    name="radio-button-off-sharp"
                    size={24}
                    color="#7A7A7A"
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* note */}
      <View className="mx-5 mt-5">
        {/* trial */}
        <View className="bg-[#E5F4FD] p-4 rounded-2xl">
          <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
            Try {selectedPlanData?.trialDays || 0} days for free Trial.
          </Text>
          <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
            Unlock all premium features for {selectedPlanData?.trialDays || 0} days.
          </Text>
        </View>

        {/* plans */}
        {showBillingOptions ? (
          <View className="mt-4">
            {/* Monthly Plan */}
            <TouchableOpacity
              onPress={() => setSelectedPlanTime("monthly")}
              className={`${selectedPlanTime === "monthly" && "bg-[#4fb1f333] border-[#4E57FF]"} border flex-row justify-between items-center p-4 rounded-2xl`}
            >
              <View className="flex-row items-center gap-3">
                {selectedPlanTime === "monthly" ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4E57FF" />
                ) : (
                  <Ionicons name="radio-button-off" size={24} color="black" />
                )}

                <View>
                  <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                    Monthly Plan
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                    {selectedPlanData?.memberLimit || 0} Member
                  </Text>
                </View>
              </View>
              <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                ${formatDollarFromCents(selectedPlanData?.monthlyPrice || 0)}
              </Text>
            </TouchableOpacity>

            {/* Annual Plan */}
            <TouchableOpacity
              onPress={() => setSelectedPlanTime("yearly")}
              className={`${selectedPlanTime === "yearly" && "border-[#4E57FF] bg-[#4fb1f333]"} flex-row justify-between items-center border p-4 mt-7 rounded-2xl`}
            >
              <View className="flex-row items-center gap-3">
                {selectedPlanTime === "yearly" ? (
                  <Ionicons name="checkmark-circle" size={24} color="#4E57FF" />
                ) : (
                  <Ionicons name="radio-button-off" size={24} color="black" />
                )}

                <View>
                  <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                    Annual Plan
                  </Text>
                  <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                    {selectedPlanData?.memberLimit || 0} Member
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-1.5">
                <View className="px-2 items-center justify-center bg-yellow-500 rounded-lg">
                  <Text className="font-proximanova-semibold text-sm">
                    {selectedPlanData?.yearlyDiscountPercentage || 0}% OFF
                  </Text>
                </View>
                <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                  <Text className="line-through font-proximanova-regular">
                    ${formatDollarFromCents(selectedPlanData?.yearlyBasePrice || 0)}
                  </Text>{" "}
                  ${formatDollarFromCents(selectedPlanData?.yearlyDiscountedPrice || 0)}
                </Text>
              </View>

              {selectedPlanData?.isFeatured ? (
                <View className="absolute -top-4 left-4 py-0.5 px-3 bg-[#4FB2F3] rounded-3xl">
                  <Text className="font-proximanova-semibold text-sm text-[#FFFFFF]">
                    Featured
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default BusinessPlanChart;

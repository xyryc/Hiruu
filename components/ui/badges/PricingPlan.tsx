import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import FreeIcon from "@/assets/images/subscription/free.svg";
import StarterIcon from "@/assets/images/subscription/starter.svg";
import GrowthIcon from "@/assets/images/subscription/growth.svg";
import ProIcon from "@/assets/images/subscription/pro.svg";

const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState("free");
  const mounted = useRef(true);
  const [selectedPlanTime, setSelectedPlanTime] = useState<
    "monthly" | "annual" | null
  >("annual");

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

  const plans = [
    {
      id: "free",
      name: "Free",
      icon: FreeIcon,
      memberLimit: 10,
      features: [true, true, true, true, true, true, false],
    },
    {
      id: "starter",
      name: "Starter",
      icon: StarterIcon,
      memberLimit: 10,
      features: [false, true, true, false, true, false, false],
    },
    {
      id: "growth",
      name: "Growth",
      icon: GrowthIcon,
      memberLimit: 25,
      features: [true, true, true, true, true, false, false],
    },
    {
      id: "pro",
      name: "Pro",
      icon: ProIcon,
      memberLimit: 50,
      features: [true, true, true, true, true, false, true],
    },
  ];

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
              className={`w-14 pt-2 rounded-lg items-center ${
                selectedPlan === plan.id
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
            Try 7 days for free Trial.
          </Text>
          <Text className="text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
            Unlock all premium features for 7 days.
          </Text>
        </View>

        {/* plans */}
        <View className="mt-4">
          {/* Monthly Plan */}
          <TouchableOpacity
            onPress={() =>
              setSelectedPlanTime(
                selectedPlanTime === "monthly" ? null : "monthly"
              )
            }
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
                  10 Member
                </Text>
              </View>
            </View>
            <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
              $14
            </Text>
          </TouchableOpacity>

          {/* Annual Plan */}
          <TouchableOpacity
            onPress={() =>
              setSelectedPlanTime(
                selectedPlanTime === "annual" ? null : "annual"
              )
            }
            className={`${selectedPlanTime === "annual" && "border-[#4E57FF] bg-[#4fb1f333]"} flex-row justify-between items-center border p-4 mt-7 rounded-2xl`}
          >
            <View className="flex-row items-center gap-3">
              {selectedPlanTime === "annual" ? (
                <Ionicons name="checkmark-circle" size={24} color="#4E57FF" />
              ) : (
                <Ionicons name="radio-button-off" size={24} color="black" />
              )}

              <View>
                <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                  Annual Plan
                </Text>
                <Text className="font-proximanova-semibold text-sm text-secondary dark:text-dark-secondary">
                  10 Member
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5">
              <View className="px-2 items-center justify-center bg-yellow-500 rounded-lg">
                <Text className="font-proximanova-semibold text-sm">
                  17% OFF
                </Text>
              </View>
              <Text className="font-proximanova-bold text-base text-primary dark:text-dark-primary">
                <Text className="line-through font-proximanova-regular">
                  $144
                </Text>{" "}
                $120
              </Text>
            </View>

            <View className="absolute -top-4 left-4 py-0.5 px-3 bg-[#4FB2F3] rounded-3xl">
              <Text className="font-proximanova-semibold text-sm text-[#FFFFFF]">
                Featured
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PricingPlans;

import businesses from "@/assets/data/businesses.json";
import ScreenHeader from "@/components/header/ScreenHeader";
import BusinessPlanChart from "@/components/ui/badges/PricingPlan";
import GradientButton from "@/components/ui/buttons/GradientButton";
import BusinessSelectionModal from "@/components/ui/modals/BusinessSelectionModal";
import { FontAwesome6, SimpleLineIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const BusinessPlan = () => {
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Get display content for header button
  const getDisplayContent = () => {
    if (selectedBusinesses.length === 0) {
      return { type: "all", content: "All" };
    } else if (selectedBusinesses.length === 1) {
      const selectedBusiness = businesses.find(
        (b) => b.id === selectedBusinesses[0]
      );
      return { type: "single", content: selectedBusiness };
    }
  };

  const displayContent = getDisplayContent();

  const insets = useSafeAreaInsets();
  // console.log(insets.top);

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      <ScreenHeader
        style={{ paddingTop: insets.top + 10 }}
        className="pb-6 bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl px-5"
        onPressBack={() => router.back()}
        title="Business Plan"
        titleClass="text-primary dark:text-dark-primary"
        iconColor={isDark ? "#fff" : "#111"}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 60,
        }}
      >
        <View className="mx-5">
          <View className="flex-row justify-between mt-4 items-center">
            <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary">
              Select your business
            </Text>

            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="bg-[#E5F4FD] flex-row items-center p-0.5 rounded-[26px]"
            >
              {displayContent?.type === "all" ? (
                <View className="pl-2.5 py-1.5">
                  <Text className="font-semibold text-sm text-primary">
                    All
                  </Text>
                </View>
              ) : (
                <Image
                  source={displayContent?.content?.imageUrl}
                  style={{ width: 30, height: 30, borderRadius: 999 }}
                  contentFit="cover"
                />
              )}
              <SimpleLineIcons
                className="p-1.5"
                name="arrow-down"
                size={12}
                color="#111111"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* line */}
        <View className="border-[#11111130] border-b h-[1px] w-[90%] rounded-full mb-2.5 mx-auto mt-3.5" />

        <BusinessPlanChart />
      </ScrollView>

      <View className="mx-5 mb-6 mt-4">
        {/* Subscription Text */}
        <Text className="text-center text-secondary dark:text-dark-secondary text-sm mb-4 capitalize">
          Subscription auto-renews until manually cancelled.
        </Text>

        {/* Subscribe Button */}
        <GradientButton
          title="Suscribe Now"
          icon={<FontAwesome6 name="crown" size={18} color="#FFFFFF" />}
        />
      </View>

      {/* modal */}
      <BusinessSelectionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        businesses={businesses}
        selectedBusinesses={selectedBusinesses}
        onSelectionChange={setSelectedBusinesses}
      />
    </SafeAreaView>
  );
};

export default BusinessPlan;

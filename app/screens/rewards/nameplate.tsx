import ScreenHeader from "@/components/header/ScreenHeader";
import DynamicNameplateCard from "@/components/ui/cards/DynamicNameplateCard";
import RedeemModal from "@/components/ui/modals/RedeemModal";
import { useRewardStore } from "@/stores/rewardStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useMemo, useState } from "react";
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
  const [isActive, setIsActive] = useState<TabType>("limited time");
  const [data, setData] = useState({
    listitle: "",
    list1: "",
    list2: "",
    list3: "",
  });

  const cosmeticsStoreItems = useRewardStore((state) => state.cosmeticsStoreItems);
  const cosmeticsStoreLoading = useRewardStore((state) => state.cosmeticsStoreLoading);
  const fetchCosmeticsStore = useRewardStore((state) => state.fetchCosmeticsStore);

  const highlightParam = useMemo(() => {
    if (isActive === "limited time") return "limited" as const;
    if (isActive === "featured") return "featured" as const;
    return "" as const;
  }, [isActive]);

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

  const modalHandle = (item: any, index: number) => {
    const tokenCost =
      typeof item?.coinPrice === "number" && Number.isFinite(item.coinPrice)
        ? item.coinPrice
        : 0;

    setModalVisible(true);
    setSelectedNameplateIndex(index);
    setData({
      listitle: "Gift Premium for a month:",
      list1:
        "Send 1 month of premium access to another user. They'll receive all premium benefits instantly",
      list2: `Token Cost: ${tokenCost} Tokens`,
      list3: "Current Token Balance: 540 Tokens",
    });
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
                <Text className="text-sm font-proximanova-semibold">540</Text>
              </View>
            </View>
          }
        />
        <View className="flex-row mx-5">
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className={`w-1/3 pb-2 ${
                isActive === tab ? "border-[#11293A] border-b-2" : "border-b-hairline"
              }`}
              onPress={() => setIsActive(tab)}
            >
              <Text
                className={`text-center ${
                  isActive === tab
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
              key={item.id}
              onPress={() => modalHandle(item, index)}
              className={index === 0 ? "mt-8" : "mt-5"}
            >
              <Text className="font-proximanova-semibold text-primary dark:text-dark-primary mb-2.5">
                {item?.name || "Nameplate"}
              </Text>

              <DynamicNameplateCard metadata={item?.metadata} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <RedeemModal
        namePlate={<DynamicNameplateCard metadata={cosmeticsStoreItems[selectedNameplateIndex]?.metadata} />}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
      />
    </SafeAreaView>
  );
};

export default Nameplate;

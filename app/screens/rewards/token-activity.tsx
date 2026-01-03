import ScreenHeader from "@/components/header/ScreenHeader";
import MonthPicker from "@/components/ui/inputs/MonthPicker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TokenActivity = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const topTabs = ["all", "earned", "spent"];
  const [isTabs, setIsTabs] = useState("all");
  const [reportMonth, setReportMonth] = useState<Date | null>(new Date());
  const handleReportMonthChange = (date: Date) => {
    setReportMonth(date);
    console.log("Report month selected:", date.toLocaleDateString());
  };
  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      {/* Header */}
      <ScreenHeader
        onPressBack={() => router.back()}
        className="px-5 pb-5 pt-2"
        title="Token Activity"
        titleClass="text-primary dark:text-dark-primary"
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
              <Text className="text-sm font-proximanova-semibold">540</Text>
            </View>
          </View>
        }
      />

      {/* tabs */}
      <View className="flex-row justify-between items-center mx-5">
        <View className="flex-row gap-2">
          {topTabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className={`px-2.5 py-2 rounded-full ${isTabs === tab ? "bg-[#4FB2F3]" : "bg-[#eeeeee]"}`}
            >
              <Text
                onPress={() => setIsTabs(tab)}
                className={`text-sm capitalize ${tab === isTabs ? "text-[#ffff] font-proximanova-bold" : "text-primary dark:text-dark-primary font-proximanova-semibold"} `}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <MonthPicker
          value={reportMonth}
          onDateChange={handleReportMonthChange}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* january 2 */}
        <View className="mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-4">
            January, 2025
          </Text>

          <View className="flex-row justify-between mt-3">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Complete 100% profile
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  2 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#3EBF5A]">
                +80
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Featured Listing Fee
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -800
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Gift 1 Month Premium to john
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -300
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>
        </View>

        <View className="mt-5 border-b-4 border-[#F5F5F5]" />
        {/*  December, 2024 */}
        <View className="mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-4">
            December, 2024
          </Text>
          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Featured Listing Fee
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -800
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Gift 1 Month Premium to john
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -300
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>
        </View>

        <View className="mt-5 border-b-4 border-[#F5F5F5]" />
        {/*  November, 2024 */}
        <View className="mx-5">
          <Text className="font-proximanova-semibold text-xl text-primary dark:text-dark-primary mt-4">
            November, 2024
          </Text>
          <View className="flex-row justify-between mt-3">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Complete 100% profile
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  2 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -800
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Featured Listing Fee
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -800
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Gift 1 Month Premium to john
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -300
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Featured Listing Fee
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -800
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>

          <View className="flex-row justify-between mt-5">
            <View className="flex-row gap-2.5 items-center">
              <Image
                source={require("@/assets/images/reward/profile.svg")}
                contentFit="contain"
                style={{ width: 40, height: 40 }}
              />
              <View>
                <Text className="font-proximanova-semibold text-primary dark:text-dark-primary">
                  Gift 1 Month Premium to john
                </Text>
                <Text className="font-proximanova-regular text-sm text-secondary dark:text-dark-secondary">
                  3 January
                </Text>
              </View>
            </View>
            <View className="flex-row gap-1.5 items-center">
              <Text className="font-proximanova-semibold text-lg text-[#F34F4F]">
                -300
              </Text>
              <Image
                source={require("@/assets/images/hiruu-coin.svg")}
                style={{
                  width: 22,
                  height: 22,
                }}
                contentFit="contain"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TokenActivity;

import ScreenHeader from "@/components/header/ScreenHeader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import RatingBanner from "@/components/ui/cards/RatingBanner";
import RatingCard from "@/components/ui/cards/RatingCard";
import RatingBar from "@/components/ui/inputs/RatingBar";
import RatingStarModal from "@/components/ui/modals/RatingStarModal";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Rating = () => {
  const [ratings] = useState([
    { label: "Pay On Time", value: 3.9, max: 5 },
    { label: "Work Environment", value: 3.5, max: 5 },
    { label: "Communication", value: 4.5, max: 5 },
  ]);
  const [isVisible, setIsVisible] = useState(false);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-dark-background"
      edges={["bottom", "left", "right", "top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* Header */}
        <ScreenHeader
          onPressBack={() => router.back()}
          className="px-5 pb-6 rounded-b-3xl mt-4 overflow-hidden"
          title="Rating"
          titleClass="text-primary "
          iconColor={isDark ? "#fff" : "#111111"}
        />

        <View>
          <RatingBanner />
        </View>

        {/* Ratings and star */}
        <View className=" mx-5 bg-[#E5F4FD] mt-8 rounded-2xl p-5 shadow-lg">
          {ratings.map((rating, index) => (
            <RatingBar
              key={index}
              label={rating.label}
              value={rating.value}
              max={rating.max}
            />
          ))}
        </View>
        <View className="mx-5">
          <RatingCard
            className="mt-8"
            name="Jessica R"
            time="2 Days ago"
            rating={5}
          />
          <RatingCard
            className="mt-8"
            name="Maria Gosh"
            time="4 Week ago"
            rating={4}
          />
          <RatingCard
            className="mt-8"
            name="Jessica R"
            time="1 Month ago"
            rating={3}
          />
          <RatingCard
            className="mt-8"
            name="Ethan Lert"
            time="4 Week ago"
            rating={5}
          />
          <RatingCard
            className="mt-8"
            name="Maria Gosh"
            time="1 Month ago"
            rating={4}
          />
        </View>

        <RatingStarModal
          visible={isVisible}
          onClose={() => setIsVisible(false)}
        />
      </ScrollView>
      <PrimaryButton
        title="Add Rating"
        className="mx-5"
        onPress={() => setIsVisible(true)}
      />
    </SafeAreaView>
  );
};

export default Rating;

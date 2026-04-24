import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RatingStar from "./RatingStar";

type RatingBannerProps = {
  averageRating: number;
  totalRatings?: number;
  onPress?: () => void;
};

const RatingBanner = ({ averageRating, totalRatings = 0, onPress }: RatingBannerProps) => {

  const safeAverageRating = Number.isFinite(averageRating) ? averageRating : 0;
  const formattedRating = Number.isFinite(averageRating)
    ? Number(averageRating.toFixed(1)).toString()
    : "0";
  const safeTotalRatings = Number.isFinite(totalRatings) ? Math.max(0, totalRatings) : 0;
  const ratingSummaryText =
    safeTotalRatings === 1
      ? "Rated by 1 user"
      : `Rated by ${safeTotalRatings} users`;

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        className="flex-row justify-center items-center"
      >
        <Image
          source={require("@/assets/images/rating-leaves.svg")}
          contentFit="contain"
          style={{ height: 84, width: 61, transform: [{ scaleX: -1 }] }}
        />
        <View>
          <Text className="text-center font-proximanova-semibold text-primary dark:text-dark-primary">
            Overall Rating
          </Text>
          <Text className="text-center font-proximanova-bold text-5xl text-primary dark:text-dark-primary">
            {formattedRating}
          </Text>
        </View>
        <Image
          source={require("@/assets/images/rating-leaves.svg")}
          contentFit="contain"
          style={{ height: 84, width: 61 }}
        />
      </TouchableOpacity>

      <RatingStar rating={safeAverageRating} />
      <Text className="text-center font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2">
        Based on overall rating
      </Text>
      <Text className="text-center font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-1">
        {ratingSummaryText}
      </Text>
    </View>
  );
};

export default RatingBanner;

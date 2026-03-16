import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RatingStar from "./RatingStar";

type RatingBannerProps = {
  averageRating: number;
  onPress?: () => void;
};

const RatingBanner = ({ averageRating, onPress }: RatingBannerProps) => {
  const formattedRating = Number.isFinite(averageRating)
    ? Number(averageRating.toFixed(1)).toString()
    : "0";

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        className="flex-row justify-center items-center"
      >
        <Image
          source={require("@/assets/images/profile/rating-leaves.svg")}
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
          source={require("@/assets/images/profile/rating-leaves.svg")}
          contentFit="contain"
          style={{ height: 84, width: 61 }}
        />
      </TouchableOpacity>

      <RatingStar rating={5} />
      <Text className="text-center font-proximanova-regular text-sm text-secondary dark:text-dark-secondary mt-2">
        Based on overall rating
      </Text>
    </View>
  );
};

export default RatingBanner;
